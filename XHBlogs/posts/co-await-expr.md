---
title: "你真的懂 `co_await expr;` 吗？"
date: "2026-07-25 00:00:00"
description: "深入理解 co_await 在编译器内部的机制：await_transform、Awaitable 与 Awaiter、await_ready、await_suspend 三种返回值、await_resume 的调用流程。"
tags: ["C++", "协程", "Coroutine", "co_await", "开发"]
---

- `co_await expr` 经过 await_transform → Awaitable → Awaiter 三层转换
- `await_ready()` 返回 `true` 时跳过挂起，走快速路径
- `await_suspend()` 有三种返回值：`void`、`bool`、`std::coroutine_handle<>`
- 恢复时仅调用 `await_resume()`，不会重新执行 `await_ready/suspend`

你真的懂 `co_await expr;` 吗？这个背后做了什么？

从协程 1 执行 `co_await expr;` 跳到协程 2 的中间到底做了什么？
本篇介绍 `co_await` 在编译器内部的黑魔法。

> 注意：这是形象的比喻，而非编译器处理协程时内部真实的工作。

## 完整流程

`co_await expr;`

```text
expr
  ↓ await_transform
Awaitable
  ↓ operator co_await
Awaiter
  ↓ await_ready 是否需要挂起
需要挂起
  ↓ await_suspend 挂起前的准备
转移控制权
  ↓ 外部事件恢复
await_resume
  ↓
result
```

## 第一步：await_transform

协程内部按照标准必然有一个 `promise_type`，
协程创建会有一个该类型的对象 `promise`。

在 `co_await expr;`

编译器首先大致处理成：

```cpp
auto&& awaitable = promise.await_transform(expr);
```

`await_transform` 方法要产生一个 `Awaitable` 对象，稍后会说明什么是 `Awaitable`。

但是实现 `promise_type` 内部不显示定义 `await_transform` 也是可以的。
如果不定义，相当于第一步：

```cpp
auto&& awaitable = expr;
```

`await_transform` 的目的在于改变 `co_await` 的含义，
比如：

```cpp
struct Promise {
  auto await_transform(std::chrono::milliseconds time) {
    return SleepOperations{time};
  }
};
```

那么协程可以写成（形象化的比喻）：

```cpp
co_await 100ms; // → promise.await_transform(100ms);
```

实际等待的是 `SleepOperations{100ms}`。

## 2. Awaitable 和 Awaiter

Awaitable 和 Awaiter 并不是标准库的实现标准，这是介绍的形象化名词。

`Awaitable` 是一个可以产生 `Awaiter` 的对象。
它依次通过以下方式尝试获取 Awaiter 对象，直到获取成功或者其本身不是 `Awaitable` 编译失败。

核心之一是用 `co_await` 运算符 `operator co_await`。

第一种：

```cpp
auto&& awaiter = awaitable.operator co_await();
```

前提是成员版本且这个类本身重载了 `co_await`。

或者通过 ADL 找非成员版本：
第二种：

```cpp
auto&& awaiter = operator co_await(awaitable);
```

比如 `co_await` 有 static 实现，它会找非成员版本。
同样支持重载，但是引发歧义会导致编译失败。

> 标准规定并非第一种匹配后就不去找 ADL 版本，而是会枚举所有 `co_await` 选出最佳函数。

第三种：
如果找不到可用的 `operator co_await` 或者完全没有显示重载，那么把 `Awaitable` 本身作为 `Awaiter`。

```cpp
auto&& awaiter = awaitable;
```

---

`Awaiter` 是什么？
本质是实现这三个固定函数名（C++标准）的对象：

```
awaiter.await_ready();
awaiter.await_suspend(handle);
awaiter.await_resume();
```

通过 `awaitable` 生成 `awaiter` 之后，编译器会实体化它，把它作为左值使用。
下文会介绍这三个函数的含义以及讨论函数签名的多样性。

## 3. 调用 `await_ready()`

`Awaiter` 内部实现：

```cpp
struct Awaiter {
  bool await_ready() noexcept {
    return false; // or true
  }
};
```

它的签名默认写成这样即可，无参数，返回类型只需要能转换成 `bool`，不强制写成 `bool`。

```cpp
bool ready = bool(awaiter.await_ready());
```

返回 `true`
说明操作已经完成，不需要挂起：
比如在网络读场景，发现缓冲区已经有数据了，就不用挂起当前协程。
这样它会直接跳到 `await_resume()` 这一步。

```cpp
auto result = awaiter.await_resume();
```

例如：

```cpp
struct ReadyAwaiter {
  bool await_ready() noexcept {
    return true;
  }

  void await_suspend(std::coroutine_handle<>) noexcept {
    // 不会执行，跳过。
  }

  int await_resume() noexcept {
    return 42;
  }
};
```

执行：

```cpp
int n = co_await ReadyAwaiter{};

// 等价于

int n = 42;
```

返回 `false`：
说明不能走快速通道，进入挂起流程。

## 4. 当前协程被视为已挂起 `await_suspend`

编译器会先构造当前协程的句柄：

```cpp
std::coroutine_handle<Promise> handle =
  std::coroutine_handle<Promise>::from_promise(promise);
```

后调用：

```cpp
awaiter.await_suspend(handle);
```

`handle` 是已挂起的协程句柄。
> 注意在执行完 `await_ready()`，执行 `await_suspend()` 前，当前协程就已经被视为已挂起。

因此这个句柄可以被保存到 I/O 操作中，比如：

```cpp
void await_suspend(std::coroutine_handle<> handle) noexcept {
  operation_.continuation = handle;
  loop_.Submit(&operation_);
}
```

这样调度器等完成操作时可以手动恢复：

```cpp
operation_.continuation.resume(); // 协程恢复运行。
```

## 5. await_suspend() 的三种返回值

`await_suspend` 的参数固定为 `std::coroutine_handle`，表示已挂起协程。
实际编码时必须写出，协程挂起时由编译器自动传参。

讨论三种返回值：

### 返回 `void`

```cpp
void await_suspend(std::coroutine_handle<> handle);
```

表示：**当前协程已挂起**。

例如：

```cpp
void await_suspend(std::coroutine_handle<> handle) {
  operation_.continuation = handle;
  SubmitIo(operation_);
}
```

`await_suspend()` 返回后，控制流回到恢复当前协程的地方，比如调度器或者父协程。

### 返回 `bool`

```cpp
bool await_suspend(std::coroutine_handle<> handle);
```

表示：
- `true` → 保持挂起
- `false` → 不再挂起，当前协程继续执行

例如：

```cpp
bool await_suspend(std::coroutine_handle<> handle) {
  // 尝试快速路径
  if (TryCompleteImmediately()) {
    return false; // → await_resume()
  }

  continuation_ = handle;
  SubmitIo();
  return true;
}
```

`bool` 类型的 `await_suspend` 表示当前协程最终要不要保持挂起。

### 返回 `std::coroutine_handle`

```cpp
std::coroutine_handle<> await_suspend(
    std::coroutine_handle<> current);
```

表示：**挂起当前协程，并立即恢复返回的那个协程**。

例如对称转移场景：父协程等待子协程：

```cpp
std::coroutine_handle<> await_suspend(
  std::coroutine_handle<> parent) noexcept {
  child.promise().continuation = parent;
  return child;
}

// 流程
// 父协程 co_await child
// 父协程挂起，子协程保存父协程的句柄。
// 父协程直接切换到子协程。
```

这避免手动写 `child.resume()`，防止产生不断嵌套的恢复调用栈。
因此叫做**对称转移**。

总之，这三种返回类型以及各自的控制流语义都是语言规定，按实际需求选择。

## 6. 恢复时调用 `await_resume()`

协程 1 已经挂起了。
假设有一个 I/O 完成的场景：

```cpp
continuation.resume();
```

协程不会重新执行 `await_ready()`、`await_suspend()`，
而是直接从等待点继续，调用：

```cpp
awaiter.await_resume();
```

例如：

```cpp
std::expected<std::size_t, std::error_code> await_resume() noexcept {
  return operation_.result;
}
```

`co_await expr;` 这个表达式的最终的类型和值就是 `await_resume()` 这个表达式。
于是：

```cpp
auto result = co_await stream.ReadSome(buffer);

// result 的结果来自 await_resume()
```

如果是 `void` 那么没有结果，如果返回 `T&`，那么结果就是左值引用。

## 伪代码演示

这不是某个编译器的展开代码，只能作为理解的心智模型：

```cpp
// 执行 co_await expr;

// 先获取 Awaitable 对象
auto&& awaitable = promise.has_await_transform
                    ? promise.await_transform(expr)
                    : expr;

// 根据 Awaitable 对象获取 Awaiter
auto&& awaiter = /* 通过重载决议找到 awaiter.operator co_await
                    or operator co_await(awaitable)
                    or awaitable */; // awaitable 本身作为 awaiter

// awaiter 本身必须实现 await_ready, await_suspend, await_resume
if (!bool(awaiter.await_ready())) {
  // 进入这里，协程已经被视为挂起

  auto handle = std::coroutine_handle<Promise>::from_promise(promise);

  // 根据 await_suspend(handle) 返回结果推导类型
  using SuspendResult =
    decltype(awaiter.await_suspend(handle));

  if constexpr (std::same_as<SuspendResult, void>) {
    awaiter.await_suspend(handle);
    // 返回当前协程的调用者或恢复者。
    suspend_current_coroutine();
  } else if constexpr (std::same_as<SuspendResult, bool>) {
    if (awaiter.await_suspend(handle)) {
      suspend_current_coroutine();
    }
    // 返回 false：当前协程立即继续。
  } else {
    auto next = awaiter.await_suspend(handle);
    // 对称转移，恢复 next。
    next.resume();
    suspend_current_coroutine();
  }
}
// await_ready() 为 true，或者协程后来被恢复。
auto result = awaiter.await_resume();
```

完。
