---
title: high-concurrency-runtime:调度层设计
description: high-concurrency-runtime调度层设计
date: 2026-04-24 00:10:39
updated: 2026-04-24 00:10:39
image:
categories: [技术]
tags: [C++, Net, Scheduler]
---

### 前言

为HTTP server增加一个调度层， 以下是我根据自写网络库和HTTP层的基础。

### 调度层的本质

调度层 = 任务管理 + 执行控制

核心作用 接受任务->排队等待->分配线程执行->控制生命周期(超时/取消/重试)

原先的问题，`HTTP Server`直接调用上层的处理器Handler, 尝试写一个分支决定是否启用调度器模式。 通过把Handler继续封装成Task, 然后统一交给调度器扔给不同的线程。
尝试不同的调度算法和提供更多机制。

### 整体架构

```cpp
┌─────────────────────────────────────┐
│ runtime_http │
│ HttpServer → SetScheduler() │
│ │ │
│ └──► Scheduler(新增) │
└─────────────┬───────────────────────┘
│ depends on
┌─────────────▼───────────────────────┐
│ runtime_task │
│ Scheduler → ThreadPool (已有) │
│ Task (新增) │
└─────────────┬───────────────────────┘
│ depends on
┌─────────────▼───────────────────────┐
│ runtime_foundation │
└─────────────────────────────────────┘
```

流程， HTTP请求到达 Router找到Handler, 将Handler封装成一个Task， 提交给调度器， 调度器扔到线程池， 将结果封装成响应报文打回去。

### Task

`Handler`封装一个任务Task， 下面注释表示字段的含义。
为每个任务提供一个唯一标识， 这里是int自增， 用原子计数器作为标识。

```cpp
  Func func_; // 真正执行任务的回调
  int id_; // Task唯一标识
  int priority_{0}; // 优先级， 为更多调度算法提供扩展性。
  runtime::time::Timestamp deadline_{}; // 超时截止， 用来设定限时任务
  std::atomic<bool> cancelled_{false}; // 取消标识， 任务应该可以主动取消。

  static std::atomic<int> id_counter_; // 原子计数器
```

抛开设置和获取的成员函数， 最有价值的是Run方法。
以下是成员函数，构造函数的声明。

```cpp
  explicit Task(Func f);

  // std::atomic is not movable, so Task defines a custom move constructor.
  Task(Task&& other) noexcept
      : func_(std::move(other.func_)),
        id_(other.id_),
        priority_(other.priority_),
        deadline_(other.deadline_),
        cancelled_(other.cancelled_.load()) {}

  int Id() const { return id_; }
  int Priority() const { return priority_; }
  void SetPriority(int p) { priority_ = p; }

  runtime::time::Timestamp Deadline() const { return deadline_; }
  void SetDeadline(runtime::time::Timestamp t) { deadline_ = t; }

  bool Cancelled() const { return cancelled_.load(); }
  void Cancel() { cancelled_.store(true); }

  void Run();
```

`Run`方法实现逻辑，很简单。
检查任务是否取消， 检查任务是否超时，执行回调`func_`

```cpp
std::atomic<int> Task::id_counter_{0};

Task::Task(Func f)
    : func_(f),
      id_(id_counter_++) {}

void Task::Run() {
    if (cancelled_) return;
    if (deadline_.Valid() && runtime::time::Timestamp::Now() > deadline_) return;
    func_();
}
```

### Scheduler

调度控制层， 包裹`ThreadPool`, 两者职责分离。
调度层做限流， 设定任务队列的最大数量， 超过最大数量就丢弃。

```cpp
Submit(Task)
   ├── pending >= max_queue_size →  throw（限流）
   ├── pending++
   ├── pool_.enqueue(lambda)
         ├── pending--
             Task::Run()
```

设计理念:
调度层

```cpp
// Scheduler adds queue limits and task bookkeeping on top of ThreadPool.
class Scheduler : public runtime::base::NonCopyable {
public:
  // worker_count == 0 uses hardware concurrency.
  // max_queue_size == 0 means the queue is unbounded.
  explicit Scheduler(std::size_t worker_count = 0,
                     std::size_t max_queue_size = 0);

  void Submit(Task task);

  template <typename Func>
  void Submit(Func&& f) {
    Submit(Task(std::forward<Func>(f)));
  }

  std::size_t PendingCount() const { return pending_.load(); }

private:
  ThreadPool pool_;
  std::size_t max_queue_size_{0};
  std::atomic<std::size_t> pending_{0};
};
```

### HTTP层改动

```cpp
OnMessage() 收到完整请求
    └── router_.Match()
            ├── 无 scheduler_ → 原有同步调用（行为不变）
            └── 有 scheduler_ → 封装为 Task 提交
                    └── 工作线程执行 handler(req, resp)
                            └── conn->Send()   ← 已是线程安全
                                conn->Shutdown() ← 已是线程安全

```

```md wrap
<!-- 你可以在此处书写大纲，并在上方完成文章 -->
```
