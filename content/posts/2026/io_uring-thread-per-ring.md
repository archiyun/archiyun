---
title: "io_uring 网络库多线程模型：为什么默认选择 Thread-per-Ring"
description: "面向高并发网络库的 io_uring 多线程设计：线程安全边界、Thread-per-Ring + SO_REUSEPORT、连接所有权、停机 drain 与生产环境避坑。"
date: 2026-07-04
updated: 2026-07-05
categories: [技术]
tags: [Linux, io_uring, liburing, network, concurrency]
type: tech
aside: [toc, meta-aside-track]
---

::meta-aside-track{title="本文重点" card}

- 默认模型：Thread-per-Ring + SO_REUSEPORT
- 核心边界：ring、连接、buffer 都归属同一个 worker
- 生产要点：停机 drain、取消引用计数、容器 seccomp
::

前几篇文章里，我们已经看过 `io_uring` 的基本用法，也写过一个简单的 `echo_server.cc`。接下来的问题是：如果要把它放进真实网络库，应该怎么设计多线程模型？

一个自然的答案是沿用 Reactor 世界里的 one loop per thread。换到 `io_uring` 之后，它也可以继续成立，只是 event loop 驱动的对象从 epoll 变成了 ring。

单线程模型简洁、可靠，也最容易写对。但它天然只能把 I/O 完成事件、协议解析、序列化、压缩、加密等用户态逻辑放在一个核上。连接数和 CPU 逻辑一上来，吞吐和尾延迟很快就会碰到上限。

所以网络库迟早会面对多线程问题。

`io_uring` 的 SQ/CQ 是用户态和内核态共享的环形缓冲区，这让它很适合批量提交和批量收割。但“共享内存友好”不等于“多个线程可以随便碰”。如果多个线程同时推进 SQ tail 或 CQ head，竞态会直接回到用户态代码里。

本文只讨论网络库里最常见、也最值得优先选择的模型：

> 每个工作线程一个 `io_uring` ring，再用 `SO_REUSEPORT` 做连接分流。

也就是 Thread-per-Ring + SO_REUSEPORT。

## 1. 结论先行

如果你在写高并发 TCP 网络库，默认答案通常不是“让很多线程共享一个 ring”，而是：

> 每个 worker 拥有自己的 listener、ring、连接上下文和 buffer。

换句话说，把单线程 event loop 横向复制 N 份。

::alert{type="info" title="把结论压缩成三句话"}

第一，`io_uring` 没有消灭多线程同步问题。单个 ring 最稳妥的组织方式，仍然是固定提交者和固定收割者。

第二，网络服务默认优先选 Thread-per-Ring + SO_REUSEPORT。它的优势不是玄学，而是所有权简单、锁竞争少、连接亲和性强。

第三，SQPOLL、CPU 亲和性、NUMA、批量提交都是性能优化手段，不是替代所有权设计和生命周期管理的捷径。
::

如果后续配合 C++20 协程封装，Thread-per-Ring 还可以写出很清晰的同步风格业务代码。但模型本身不依赖协程，先把所有权边界设计对更重要。

## 2. 单线程 io_uring 的瓶颈

单线程 `io_uring` event loop 常见瓶颈主要有三类。

第一类是 CPU 处理。`io_uring` 可以异步提交 I/O，但 CQE 回来之后，协议解析、业务逻辑、buffer 拷贝、压缩和加密仍然发生在用户态线程里。这个线程一旦被 CPU 逻辑吃满，新的完成事件就算已经到了 CQ，也无法及时处理。

第二类是 cache 压力。所有连接状态、buffer、定时器、统计信息都集中在一个核上更新，连接数上升后，cache miss 和尾延迟抖动会越来越明显。

第三类是错误的阻塞调用。严格来说，不是“一个慢 I/O 阻塞所有 CQE”，而是“一个慢的同步处理逻辑、CPU 逻辑或误用的阻塞调用拖住了 event loop”。`io_uring` 负责把完成事件投递回来，但后续怎么处理，仍然取决于用户态线程。

所以，多线程不是为了让 ring 变复杂，而是为了把连接和计算负载分摊到多个核上。

## 3. io_uring 的线程安全边界

从单个 ring 的用户态视角看，可以把 SQ/CQ 理解成两条队列：

- SQ：用户态生产 SQE，内核消费 SQE
- CQ：内核生产 CQE，用户态消费 CQE

在“单生产者 + 单消费者”的情况下，liburing 和内核通过共享 ring buffer、head/tail 指针和内存屏障协作，可以把热路径做得很轻。

但这不等于多个用户线程可以同时操作同一个 ring。

```c
// 危险示意：两个线程同时获取 SQE
struct io_uring_sqe *sqe = io_uring_get_sqe(&ring);
```

`io_uring_get_sqe()` 会修改 SQ 侧的用户态状态。多个线程同时调用，就可能争用同一个 ring 游标。CQ 侧也类似，多个线程同时 `io_uring_cqe_seen()`，也会同时推进 CQ head。

工程上更稳的经验规则是：

| 操作 | 共享同一 ring 时是否需要同步 | 原因 |
| --- | --- | --- |
| `io_uring_get_sqe()` | 需要 | 获取 SQE 会推进 SQ 状态 |
| `io_uring_submit()` | 需要 | 会 flush SQ，并可能进入内核 |
| `io_uring_wait_cqe()` | 需要 | 多消费者会争 CQE |
| `io_uring_peek_cqe()` | 需要 | 多消费者会争同一批完成事件 |
| `io_uring_cqe_seen()` | 需要 | 会推进 CQ head |
| `io_uring_prep_*()` | 通常不需要 | 只写已经独占拿到的 SQE |

因此，网络库里最舒服的设计不是“共享 ring 然后到处加锁”，而是从模型上避免共享：

```text
worker 0 -> ring 0 -> conn set 0
worker 1 -> ring 1 -> conn set 1
worker 2 -> ring 2 -> conn set 2
worker 3 -> ring 3 -> conn set 3
```

每个连接只属于一个 worker。这个 worker 负责该连接上的 read、write、timeout、close 和 buffer 生命周期。

## 4. 为什么选择 Thread-per-Ring + SO_REUSEPORT

Thread-per-Ring 的核心思想很简单：

> 每个工作线程创建自己的 `io_uring` 实例，线程之间不共享 I/O 热路径。

可以把它理解成把单线程 event loop 复制 N 份。每个 worker 都有自己的：

::card-list
- listener socket
- `io_uring` ring
- 连接上下文
- buffer 管理
- inflight 计数
- 本地统计
::

新连接怎么分给不同线程？用 `SO_REUSEPORT`。

多个 socket 设置 `SO_REUSEPORT` 后，可以绑定到同一个 `IP:Port`。Linux 会把新连接分发到 reuseport group 中的某个 listener。默认分发不保证业务意义上的绝对均匀；如果需要自定义选择逻辑，可以用 `BPF_PROG_TYPE_SK_REUSEPORT` 改写 socket selection。

```c
int server_fd = socket(AF_INET, SOCK_STREAM, 0);

int opt = 1;
setsockopt(server_fd, SOL_SOCKET, SO_REUSEPORT, &opt, sizeof(opt));
setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

bind(server_fd, (struct sockaddr *)&addr, sizeof(addr));
listen(server_fd, BACKLOG);
```

这个模型的好处很直接：

1. I/O 热路径无全局锁。每个 worker 只操作自己的 ring。
2. 连接有天然亲和性。一个连接被某个 worker accept 后，后续 read/write 通常都在同一个线程处理。
3. 生命周期更好管理。连接上下文、buffer、定时器、取消请求都归属于同一个 worker，不容易出现“线程 A 提交，线程 B 释放”的问题。
4. 扩展方式直观。要利用更多核心，就增加 worker 数量；要定位问题，就看对应 worker 的连接集合和统计。

缺点也明确：

1. 每个线程都有独立 ring，内存开销更高。
2. `SO_REUSEPORT` 不是完美负载均衡。如果连接数很少，或者不同连接处理耗时差异很大，线程间负载可能不均匀。
3. 跨连接协作需要额外消息层，比如广播、房间、全局限流、共享缓存。

但对网络库来说，这些缺点通常都比“共享 ring + 全局大锁”更容易接受。

## 5. 初始化 ring 时的几个 flag

如果已经决定使用 Thread-per-Ring，可以考虑在初始化 ring 时表达这个所有权模型。

```c
struct io_uring_params params = {0};

#ifdef IORING_SETUP_SINGLE_ISSUER
params.flags |= IORING_SETUP_SINGLE_ISSUER;
#endif

int ret = io_uring_queue_init_params(RING_SIZE, &ring, &params);
```

`IORING_SETUP_SINGLE_ISSUER` 会告诉内核这个 ring 只有一个 task/thread 提交请求。这个 flag 从 Linux 6.0 起可用；如果违反单提交者约束，请求可能失败。它适合 Thread-per-Ring，不适合多个用户线程同时提交同一个 ring 的模型。

如果每个 worker 都创建自己的 ring，还可以评估 `IORING_SETUP_ATTACH_WQ`。它可以让多个 ring 共享已有 ring 的 async worker backend，避免每个 ring 都拥有完全独立的 worker pool。

这里容易写错：`IORING_SETUP_ATTACH_WQ` 不能只 OR 一个 flag，还要设置 `params.wq_fd`。

```c
struct io_uring_params params = {0};

params.flags |= IORING_SETUP_ATTACH_WQ;
params.wq_fd = base_ring_fd;

int ret = io_uring_queue_init_params(RING_SIZE, &ring, &params);
```

`IORING_SETUP_SQPOLL` 则要单独看。它可以减少提交路径上的系统调用，但不是线程安全方案。多个线程同时 `io_uring_get_sqe()` 仍然需要同步。另外，SQPOLL 的权限要求和行为与内核版本有关，生产环境需要以目标内核为准。

::alert{type="warning" title="不要混淆这几个 flag"}

`SINGLE_ISSUER` 是所有权约束，`ATTACH_WQ` 是 worker pool 资源复用，`SQPOLL` 是提交路径优化。它们解决的不是同一个问题。
::

## 6. 多线程 Echo Server 的结构

用 Thread-per-Ring 写多线程 Echo Server，整体结构应该非常清楚：

```text
main()
 ├── 解析 worker 数量
 ├── 创建 N 个 worker thread
 └── join 所有 worker

worker_thread(thread_id)
 ├── 创建 listener socket
 ├── 设置 SO_REUSEPORT
 ├── bind + listen
 ├── 初始化自己的 io_uring
 └── 进入 event loop

event_loop()
 ├── ACCEPT -> 提交 READ，并重新 arm ACCEPT
 ├── READ   -> 提交 WRITE
 ├── WRITE  -> 继续提交 READ
 └── shutdown -> drain inflight completions
```

重点不是代码有多炫，而是所有权边界必须清楚：

```c
struct worker_ctx {
  int thread_id;
  int server_fd;
  struct io_uring ring;
  atomic_int inflight;
};
```

这个 `worker_ctx` 表达了一个重要事实：

> 这个 worker 拥有自己的 listener、ring 和在途请求计数。

主线程只负责拉起 worker，不碰 I/O 路径。否则后期很容易出现“主线程顺手 submit 一个请求”“某个管理线程顺手 close 一个 fd”这类所有权污染。

## 7. 停机时要 drain，而不是直接 break

很多教学示例在收到退出信号后会直接跳出 event loop。这个写法简单，但放到真实网络库里很容易出生命周期问题。

更稳的停机流程是：

1. 关闭 listener，停止接受新连接
2. 停止派生新的 read/write
3. 继续收割已有 CQE
4. 等 inflight 归零
5. 退出 ring，释放资源

可以把 event loop 写成两个阶段：

```text
running:
  wait CQE
  process CQE
  submit new operations

shutting down:
  close listener
  stop creating new operations
  keep reaping CQEs
  exit when inflight == 0
```

不要以为提交一个 `IORING_OP_NOP` 当 sentinel，就能证明前面的 I/O 都完成了。CQE 的完成顺序不能被这样简化。对网络库来说，显式维护 inflight 计数更稳。

## 8. Buffer 所有权和取消竞态

多线程 `io_uring` 最容易出问题的地方不是 submit，而是生命周期。

核心规则只有一句：

> 谁提交，谁保证 buffer 和上下文在 CQE 返回前仍然有效。

危险示意：

```c
// Thread A
io_uring_prep_write(sqe, fd, shared_buf, len, 0);
io_uring_submit(ring);

// Thread B：CQE 返回前修改或释放 shared_buf
memcpy(shared_buf, new_data, new_len);
free(shared_buf);
```

如果 buffer 可能跨线程传递，就必须有明确的 ownership 协议：

- 每个连接的 buffer 归属对应 worker
- 跨线程只传消息，不直接传裸指针
- 请求上下文用引用计数或延迟回收
- CQE 返回前不释放 `user_data` 指向的对象

取消也一样危险。

`IORING_OP_ASYNC_CANCEL` 不是“提交 cancel 之后对象就能释放”。取消请求自己也会产生 CQE。目标请求可能已经完成、正在取消、找不到，或者原始 CQE 已经被别的路径消费。

真正危险的不是某个 errno，而是：

```text
线程 A 以为取消成功，可以释放 ctx
线程 B 同时收到了原始请求的 CQE，也准备释放 ctx
```

更稳的做法是：

- 提交原始请求时增加引用
- 收到原始 CQE 时释放引用
- 提交 cancel 时也要跟踪 cancel CQE
- 所有路径都结束后再真正释放上下文

## 9. CPU 亲和性、NUMA 和 false sharing

这些属于优化层，不是第一版必须做的东西。顺序应该是：

1. 先写对所有权
2. 再写对生命周期
3. 再做压测
4. 最后再谈绑核、NUMA、SQPOLL

CPU 亲和性可以减少线程迁移，但不要直接把 `thread_id` 等价成物理核编号。开启 SMT/超线程时，相邻 CPU 编号可能落在同一个物理核。压测前至少看一下：

```sh
lscpu --extended
```

统计信息也要避免 false sharing。每个线程频繁更新的计数器最好独占 cache line：

```c
struct thread_stats {
  uint64_t accepts;
  uint64_t reads;
  uint64_t writes;
  uint64_t errors;
  uint64_t bytes_in;
  uint64_t bytes_out;
} __attribute__((aligned(64)));
```

原子变量只能保证正确性，不保证性能。如果多个线程频繁修改同一条 cache line，cache line bouncing 一样会把性能打下来。

## 10. 压测时不要测错对象

如果示例是 TCP echo server，就不要用 wrk 或 ab 这类 HTTP 工具硬测。更合适的是 tcpkali 或 sockperf。

```sh
# 服务端：4 个 worker
taskset -c 0-3 ./05-mt-echo-server 4

# 客户端：绑到另一组 CPU
taskset -c 4-7 tcpkali -c 1000 -T 60s -m "PING\n" 127.0.0.1:8000
```

压测时至少记录这些信息：

- `uname -r`
- `lscpu`
- `numactl --hardware`

建议结果写成 CSV，方便后续对比：

```csv
date,kernel,cpu_model,threads,connections,duration_s,rps,p50_us,p99_us,errors,notes
2026-07-04,6.8.0,i7-12700K,4,1000,60,152340,82,310,0,"baseline"
```

注意事项：

- 预热 5-10 秒
- 每轮至少 30 秒
- 至少跑 3 轮取中位数
- 客户端不要和服务端抢同一组 CPU
- 不要把 turbo、CPU governor、容器限额造成的波动当成优化效果

## 11. 容器环境里的坑

容器里跑 `io_uring` 要特别注意 seccomp。Docker 默认 seccomp profile 会阻止 `io_uring_setup`、`io_uring_enter`、`io_uring_register` 这些 syscall。开发环境里可以临时用 `--security-opt seccomp=unconfined` 验证问题，但生产环境更推荐维护最小化的自定义 seccomp profile。

```sh
docker run --security-opt seccomp=unconfined ...
```

另外还要注意：

- cgroup CPU quota 会影响合理线程数
- PID limit 可能影响 `io_uring` worker 创建
- 容器里的 CPU 拓扑不一定等于宿主机物理拓扑
- SQPOLL 可能同时受 seccomp、cpuset、调度策略影响

如果 `io_uring_queue_init_params()` 在容器里失败，不要第一时间怀疑代码。先查内核版本、seccomp、capability、cgroup 和容器运行时配置。

## 12. 最终选型建议

对网络库来说，推荐流程可以很简单：

```text
需要多线程吗？
├── 单核没打满，业务也不会阻塞 event loop
│   └── 先用单线程
└── 需要利用多核
    ├── 高并发 TCP 服务
    │   └── Thread-per-Ring + SO_REUSEPORT
    ├── 有跨连接协作
    │   └── Thread-per-Ring + 消息队列
    └── 极低延迟提交路径
        └── 再评估 SQPOLL、CPU affinity、NUMA
```

把本文压缩成一份 checklist：

::card-list
- 一个 worker 一个 ring
- 一个连接归属一个 worker
- 一个 buffer 在 CQE 返回前不能释放
- 跨线程只传消息，不共享 I/O 热路径
- 停机时 drain inflight，不要直接 break
- `SO_REUSEPORT` 只负责连接分流，不负责业务负载均衡
- `SINGLE_ISSUER` 是单提交者约束，不是装饰性 flag
- `ATTACH_WQ` 要配 `params.wq_fd`
- `SQPOLL` 是提交路径优化，不是线程安全方案
- 容器里先查 seccomp，再怀疑代码
::

网络库最怕的不是性能一开始不够极限，而是所有权边界模糊。Thread-per-Ring + SO_REUSEPORT 的价值就在这里：它把连接、ring、buffer、CQE 处理都固定在同一个 worker 里。只要这个边界守住，后面再做协程封装、定时器、连接池、取消、优雅停机，系统都更容易写对。

## 参考资料

- [io_uring_setup(2), Linux manual page](https://man7.org/linux/man-pages/man2/io_uring_setup.2.html)
- [io_uring_sqpoll(7), Linux manual page](https://man7.org/linux/man-pages/man7/io_uring_sqpoll.7.html)
- [io_uring_setup_flags(7), Linux manual page](https://man7.org/linux/man-pages/man7/io_uring_setup_flags.7.html)
- [socket(7), Linux manual page](https://man7.org/linux/man-pages/man7/socket.7.html)
- [BPF_PROG_TYPE_SK_REUSEPORT, eBPF Docs](https://docs.ebpf.io/linux/program-type/BPF_PROG_TYPE_SK_REUSEPORT/)
- [Seccomp security profiles for Docker, Docker Docs](https://docs.docker.com/engine/security/seccomp/)
