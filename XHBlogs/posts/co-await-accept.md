---
title: "co_await listener.Accept() 背后的完整调用链"
date: "2026-07-26 00:00:00"
description: "剖析 CoroPact 中 co_await listener.Accept() 的完整生命周期：Task 懒启动、对称转移、AcceptAwaiter 与 io_uring 的交互、两层 continuation 链与对象所有权。"
tags: ["C++", "协程", "Coroutine", "io_uring", "co_await", "开发"]
---

- 真正存在的协程帧只有两个：`AcceptLoop` 与 `Accept()`
- `TaskAwaiter` 持有子帧句柄，通过对称转移直接进入 `Accept()`
- `AcceptAwaiter` 不是协程，只是嵌在 `Accept()` 帧内的 awaiter
- CQE 恢复的是 `Accept()` 子帧，`AcceptLoop` 由 final_suspend 恢复

## 引言

本篇介绍我的项目中 CoroPact `/examples/01_single_shot_echo.cc` 里

```cpp
auto accepted = co_await listener.Accept();
```

这一句到底隐藏的细节。

> 注：源码可能过时，但大致思路不变。

## `listener.Accept()` 的完整协程调用链

这是两个协程帧对称转移的过程。
先看整体结构：

```text
AcceptLoop coroutine frame
        │
        │ co_await listener.Accept()
        ▼
LUringListener::Accept() coroutine frame
        │
        │ co_await AcceptAwaiter
        ▼
io_uring operation
```

最重要的一点：

> `AcceptAwaiter` 不是第三个协程，它只是嵌在 `Accept()` 协程帧里的 awaiter / operation 对象。

因此真正存在的协程帧只有两个：

```text
1. AcceptLoop frame
2. LUringListener::Accept() frame
```

## 1. 调用 `listener.Accept()`

代码：

```cpp
auto accepted = co_await listener.Accept();
```

其中：

```cpp
coro::Task<base::Result<LUringStream>>
LUringListener::Accept() {
  co_return co_await AcceptAwaiter(*this);
}
```

`Accept()` 本身是一个协程函数。

调用 `listener.Accept()` 时，编译器大致会：

```text
创建 Accept() coroutine frame
↓
初始化 promise
↓
创建 Task 返回对象
↓
执行 initial_suspend()
↓
暂停 child coroutine
↓
返回 Task
```

原因在于当前 `Task` 的实现：

```cpp
auto initial_suspend() const noexcept {
  return std::suspend_always{};
}
```

这是一个 lazy task，懒汉式启动，因此在创建协程帧并初始化后默认挂起。

也就是说函数体内部还没有真正执行：

```cpp
co_return co_await AcceptAwaiter(*this);
```

## 2. 外层 `co_await Task`

那么外层的 `AcceptLoop` 怎么跳转到 `Accept` 的控制流？
核心在于理解 `co_await` —— [详见](https://arsenova.xyz/2026/co-await-expr)。

```cpp
auto accepted = co_await listener.Accept();
```

可以理解成以下心智模型（源文件在 `include/coropact/coro/task.h`）：

```cpp
auto task = listener.Accept();  // 创建协程帧

// 由于 await_transform 没有显式实现, 那么 task 本身就是 Awaitable

// task.h 重载了 operator co_await, 只允许接受右值, 见下文.
auto awaiter = std::move(task).operator co_await();  // 产生 Awaiter

// await_ready -> 判断是否该挂起
if (!awaiter.await_ready()) {

  // await_suspend -> 最终挂起前准备并判断是否最终挂起
  // task.h 内部实现是保存父协程帧的句柄, 然后跳到子帧的控制流
  auto next =
      awaiter.await_suspend(outer_coroutine_handle);

  // 对称转移
  transfer_to(next);
}

// 被调度器恢复或者手动恢复后, 从这里执行.
auto accepted = awaiter.await_resume();
```

重载 `co_await` 只允许接受右值，是防止重复 `co_await`：

```cpp
Task::operator co_await() &&
```

接管外部的 Task 句柄所有权：

```cpp
TaskAwaiter{Release()}
```

这发生一次很重要的所有权转移：

```text
Task temporary
      │
      │ Release()
      ▼
TaskAwaiter
      │
      ▼
child coroutine handle
```

目的：

> `TaskAwaiter` 持有 `Accept()` child frame 的 handle。

原来的临时 `Task` 不再负责销毁它。
而是走 `TaskAwaiter`：当子协程 `co_return` 后会跳到 `TaskAwaiter` 的 `await_resume`，交给它来释放。

## 3. TaskAwaiter 保存 continuation

`TaskAwaiter::await_suspend()`：

```cpp
Handle await_suspend(
    std::coroutine_handle<> caller) noexcept {
  handle_.promise().SetContinuation(caller);
  return handle_;
}
```

这里做了两件事。

**1. 保管父协程帧到子帧句柄指向 promise 对象的协程帧内部。**

> 强调：子帧句柄已经从外部接管到 `TaskAwaiter`。

```text
// 保存父协程帧
Accept() promise.continuation
    =
AcceptLoop handle
```

于是有：

```text
Accept() child frame
        │
        └── continuation → AcceptLoop frame
```

**2. 对称转移**

```cpp
return handle_;
```

返回：

```text
Accept() child coroutine handle
```

当 `await_suspend()` 返回一个 `coroutine_handle` 时，会发生：

```text
symmetric transfer (对称转移)
```

所以：

```text
AcceptLoop
   │
   │ suspend
   ▼
Accept()
```

不会先回到 `AcceptLoop` 再调度一次。
而是 C++ coroutine machinery 直接：

```text
outer → child
```

此时：

```text
AcceptLoop frame
├── suspended
└── TaskAwaiter
      └── owns Accept() handle

Accept() frame
└── continuation → AcceptLoop
```

## 4. `Accept()` 真正开始执行

现在 child 被对称转移恢复了，开始执行控制流：

```cpp
co_return co_await AcceptAwaiter(*this);
```

先别看 `co_return`，大致展开成：

```cpp
AcceptAwaiter awaiter{*this};

if (!awaiter.await_ready()) {
  bool suspended =
      awaiter.await_suspend(child_handle);

  if (suspended) {
    suspend_child();
  }
}

auto result = awaiter.await_resume();

co_return result;
```

这里要特别注意：

```text
AcceptAwaiter != coroutine frame
```

它只是 `Accept()` frame 内部的一个对象。
结构类似：

```text
Accept() coroutine frame
├── TaskPromise
├── continuation
│     └── AcceptLoop handle
├── AcceptAwaiter
│   ├── LUringOp
│   ├── listener*
│   ├── peer_addr
│   ├── peer_len
│   ├── ResumeWork
│   └── result/immediate
└── promise result storage
```

## 5. `AcceptAwaiter::await_suspend()`

进入：

```cpp
AcceptAwaiter::await_suspend(
    std::coroutine_handle<> continuation)
```

这里传进来的 `continuation` 不是最外层 `AcceptLoop`，
而是：

```text
Accept() child handle
```

因为当前真正执行 `co_await AcceptAwaiter` 的协程就是 `Accept()`。

所以：

```cpp
op.resume_work.SetHandle(continuation);
```

实际保存的是：

```text
ResumeWork
    │
    └── Accept() child handle
```

然后准备：

```cpp
io_uring_prep_accept(...)
```

得到一个：

```text
SQE
├── opcode = IORING_OP_ACCEPT
├── fd = listener fd
├── addr = peer_addr
├── addrlen = peer_len
└── user_data = LUringOp*
```

随后 `await_suspend(...)` 返回 `true`，于是：

```text
Accept() child frame
```

真正挂起。

此时：

```text
AcceptLoop frame
    suspended

Accept() frame
    suspended

AcceptAwaiter
    waiting for CQE

SQE
    pending
```

## 6. Event Loop 提交 SQE

之后执行：

```text
PollCompletions()
```

loop 将准备好的 SQE 提交：

```cpp
io_uring_submit()
```

此后内核接管 accept operation：

```text
SQE
 ↓
Kernel
 ↓
waiting connection
```

新连接到来后：

```text
Kernel performs accept
↓
CQE
```

CQE 大致包含：

```text
CQE.res
    = accepted fd

CQE.user_data
    = LUringOp*

CQE.flags
    = 0
```

## 7. `HandleCqe()` 找回 operation

Loop 收割 CQE：

```cpp
LUringLoop::HandleCqe(cqe)
```

通过：

```text
CQE.user_data
```

找回：

```text
LUringOp*
```

对于普通 single-shot Accept：

```cpp
op->Complete(cqe->res);
```

然后根据：

```text
LUringOpKind::kAcceptComplete
```

分发：

```text
HandleCqe
   ↓
DispatchAcceptComplete
   ↓
AcceptAwaiter::OnComplete
```

## 8. CQE 转换成 `LUringStream`

如果：

```text
cqe.res < 0
```

则转换成错误结果。

如果成功：

```text
cqe.res = accepted fd
```

则：

```cpp
MakeStream(
    listener->loop_,
    *op->result,
    peer_addr_,
    peer_len_);
```

最终：

```text
accepted fd
    ↓
MakeStream()
    ↓
LUringStream
    ↓
AcceptAwaiter::immediate_
```

也就是说：

> Kernel CQE 只是底层 completion event，真正给上层使用的 `Result<LUringStream>` 是由 `AcceptAwaiter::OnComplete()` 构造出来的。

与此同时：

```cpp
--listener->pending_accepts_;
```

## 9. CQE 首先恢复谁？

这是整条链最关键的一点。

completion 之后：

```cpp
ScheduleCompletion(&op->resume_work);
```

而 `op.resume_work` 之前保存的是：

```text
Accept() child handle
```

所以：

```text
CQE
 ↓
AcceptAwaiter::OnComplete
 ↓
ScheduleCompletion
 ↓
ready queue
 ↓
Accept() child
```

首先恢复的不是 `AcceptLoop`，
而是：

```text
LUringListener::Accept() child coroutine
```

## 10. `AcceptAwaiter::await_resume()`

Child 恢复之后，会从：

```cpp
co_await AcceptAwaiter
```

继续。

于是执行：

```cpp
AcceptResult await_resume() noexcept {
  return std::move(*immediate_);
}
```

所以：

```text
AcceptAwaiter::immediate_
        │
        ▼
Result<LUringStream>
```

返回给 `Accept()`。

然后：

```cpp
co_return result;
```

把结果存进：

```text
Accept() promise
```

即：

```text
Accept() promise.value
    = Result<LUringStream>
```

## 11. `Accept()` 结束

执行 `co_return` 后：

```text
Accept() body finished
↓
final_suspend()
```

它之前已经保存：

```text
continuation = AcceptLoop handle
```

所以 final awaiter 返回：

```text
AcceptLoop coroutine handle
```

于是发生第二次：

```text
symmetric transfer
```

方向：

```text
Accept() child
      │
      │ final_suspend
      ▼
AcceptLoop
```

## 12. 外层 `TaskAwaiter::await_resume()`

现在 `AcceptLoop` 从：

```cpp
co_await listener.Accept()
```

继续。

进入：

```cpp
TaskAwaiter::await_resume()
```

大致做：

```cpp
T value =
    completed.promise().TakeValue();

completed.destroy();

return value;
```

这里完成三件事情：

```text
1. 从 Accept() promise 取 Result
2. destroy Accept() child frame
3. 把 Result 返回给 AcceptLoop
```

最终：

```cpp
auto accepted =
    co_await listener.Accept();
```

完成赋值。

## 13. 完整时间线

```text
T0

AcceptLoop frame
running
```

```text
T1

listener.Accept()

→ create Accept() child frame
→ initial_suspend()
→ child suspended
→ return Task
```

```text
T2

AcceptLoop co_await Task

→ TaskAwaiter 接管 child handle
→ child.continuation = AcceptLoop
→ symmetric transfer
→ execute child
```

```text
T3

Accept() child

→ construct AcceptAwaiter
→ prepare SQE
→ ResumeWork = child handle
→ await_suspend() returns true
→ child suspended
```

```text
T4

Event Loop

→ io_uring_submit()
→ Kernel performs accept
→ CQE produced
```

```text
T5

HandleCqe()

→ LUringOp
→ AcceptAwaiter::OnComplete()
→ accepted fd → LUringStream
→ ScheduleCompletion(child)
```

```text
T6

Accept() child resumes

→ AcceptAwaiter::await_resume()
→ get Result<LUringStream>
→ co_return
→ result stored in promise
→ final_suspend()
→ symmetric transfer to AcceptLoop
```

```text
T7

AcceptLoop resumes

→ TaskAwaiter::await_resume()
→ TakeValue()
→ destroy child frame
→ accepted gets Result
→ continue business logic
```

## 14. 两条 continuation 链

这里其实有两层完全不同的 continuation。

**第一层：**

```text
Accept() child
        │
        │ Task continuation
        ▼
AcceptLoop
```

保存在：

```text
Accept() promise.continuation_
```

它解决的是：

> `Accept()` 完成之后，该回到哪个 caller？

**第二层：**

```text
io_uring operation
        │
        │ ResumeWork
        ▼
Accept() child
```

它解决的是：

> CQE 到来以后，应该恢复哪个正在等待 I/O 的 coroutine？

所以完整链是：

```text
Kernel CQE
   ↓
LUringOp
   ↓
ResumeWork
   ↓
Accept() frame
   ↓
final_suspend
   ↓
Task continuation
   ↓
AcceptLoop frame
```

这两层 continuation 千万不要混在一起。

## 15. 三个对象的所有权关系

在等待 I/O 时：

```text
AcceptLoop frame
│
└── TaskAwaiter
      │
      └── owns Accept() child handle

Accept() child frame
│
├── promise
│    └── continuation → AcceptLoop
│
└── AcceptAwaiter
     │
     └── LUringOp
          └── ResumeWork → Accept() handle
```

所以关系可以画成：

```text
AcceptLoop
    ▲
    │ Task continuation
    │
Accept() child
    ▲
    │ I/O continuation
    │
LUringOp
    ▲
    │ user_data
    │
CQE
```

## 16. 谁负责销毁谁

也值得单独记。

`AcceptAwaiter` 不是独立 frame，所以：

```text
Accept() frame destroyed
↓
AcceptAwaiter automatically destroyed
```

而 `Accept()` child frame 由 `TaskAwaiter` 持有 handle，最终：

```cpp
TaskAwaiter::await_resume()
```

执行：

```cpp
completed.destroy();
```

因此：

```text
Task temporary
    ↓ ownership transfer
TaskAwaiter
    ↓
Accept() frame
    ↓ await_resume
destroy()
```

## 17. 最核心的五句话

**第一：**

> `listener.Accept()` 调用时只创建 lazy `Task` 和 child frame，不立即执行 `Accept()` body。

**第二：**

> 外层 `co_await Task` 通过 symmetric transfer 直接进入 `Accept()` child coroutine。

**第三：**

> `AcceptAwaiter` 不是协程，它只是存储在 `Accept()` frame 内部的 awaiter / operation 状态。

**第四：**

> `io_uring` CQE 恢复的是 `Accept()` child frame，而不是直接恢复 `AcceptLoop`。

**第五：**

> `AcceptLoop` 最终是由 `Accept()` 完成后的 `final_suspend()` 通过 Task continuation 恢复。

整条链可以压缩成：

```text
AcceptLoop
   │
   │ co_await Task
   ▼
Accept()
   │
   │ co_await AcceptAwaiter
   ▼
io_uring
   │
   │ CQE
   ▼
Accept()
   │
   │ final_suspend
   ▼
AcceptLoop
```

而完整的恢复链：

```text
CQE
→ AcceptAwaiter::OnComplete
→ ResumeWork
→ resume Accept() child
→ AcceptAwaiter::await_resume()
→ Accept() co_return
→ final_suspend()
→ symmetric transfer
→ resume AcceptLoop
→ TaskAwaiter::await_resume()
→ destroy child frame
```

这就是 `listener.Accept()` 从业务协程一路走到 io_uring，再从 CQE 一路返回业务协程的完整生命周期。
