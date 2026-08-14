---
title: "从 Nginx 内存池到 C++ 实现"
date: "2026-05-24 00:00:00"
description: "不逐行剖析 Nginx 源码，而是在读懂之后，用 C++ 复刻其 Arena / Bump 内存池：首块内嵌、failed 启发式、大小对象分路径，以及 placement-new 与自定义 Deleter。"
tags: ["C++", "Nginx", "内存池", "Arena", "Bump allocation", "开发"]
---

- 小对象走 bump arena：只进不退，整体 Reset
- 大对象绕开 arena：单独 malloc / Free
- 首块内嵌 `Pool` 本体，后续 chunk 只内嵌轻量 `ChunkHeader`
- `Create` + placement-new + 自定义 `Deleter`，RAII 接管销毁

本篇不是逐行剖析 Nginx 源码的学习笔记——网上这类文章已经很多。这里记录的是我读懂源码之后，对应的 C++ 实现思路。

实现之后，我把它接入了 C++17 的 `std::pmr::memory_resource`，作为底层内存分配源，用来优化项目里的 HTTP 路由解析。（这部分本篇不讲。）

> 虽然不逐行解析 Nginx 内存池源码，但设计思想、以及 C++ 在编码层面与 C 的差异，会在行文中对照说明。

## 核心内存管理概念

概念部分稍显枯燥，但要理解 Nginx 内存池的设计，这是绕不开的前置。核心是两个：**Bump allocation** 与 **Arena allocator**。

它们解决的是同一类问题——小对象频繁分配带来的开销。前提是这批对象**生命周期一致**，可以整体一次性释放。

### Arena allocator

传统分配（如 `malloc`）每次都向操作系统要内存，频繁申请会带来内存碎片和性能损耗。

Arena 分配则相反：提前向系统要一块足够大的内存（即 Arena），之后所有小对象都在这块「场地」内部划分，不再陷入内核。

### Bump allocation

Bump allocation 译作「指针碰撞」，是一种靠指针移动来分配内存的技术，通常配合 Arena 使用。

先拿到一块大内存，再用几个指针描述它的状态：`start` 记录起始位置，`end` 记录结束位置，`last` 指向当前尚未分配的位置。需要分配时，不做任何复杂查找，直接把 `last` 指针向后 **「推」（Bump）** 一段，划出请求的大小并返回。

这种方式很适合堆上频繁产生的临时对象。比如 C++ 里的 `std::string`，小字符串的频繁分配与释放可能会占据一部分 CPU 热点。

代价也很直接：**无法单独释放某个对象**。回收只能整体进行——析构内存后令 `last = start`，达到重置效果。指针只能前向移动或整体重置，没有中间状态。

## Nginx 内存池结构

动手写 C++ 版本之前，得先看懂 Nginx 自身的结构设计。它的内存池结构体内部嵌套了多条链表。

```c
// typedef struct ngx_pool_s ngx_pool_t in <ngx_core.h>

struct ngx_pool_s {
  ngx_pool_data_t d;
  size_t max; // 4095
  ngx_pool_t *current;
  ngx_chain_t *chain;
  ngx_pool_large_t *large;
  ngx_pool_cleanup_t *cleanup;
  ngx_log_t *log;
};
```

实际编写时，我删掉了 `chain` 和 `log` 两个字段：前者服务于 I/O buffer，后者是调试日志，都与内存池的核心机制无关。

```c
struct ngx_pool_s {
  ngx_pool_data_t d;
  size_t max; // 4095
  ngx_pool_t *current;
  ngx_pool_large_t *large;
  ngx_pool_cleanup_t *cleanup;
};
```

`large` 和 `cleanup` 留到后文，这里先把它们都当作普通链表看待，从 `ngx_pool_data_t d` 入手。

### `ngx_pool_data_t`

Nginx 小内存的基本单位，我称之为 `chunk`，而 `ngx_pool_data_t` 正是用来描述一个 `chunk` 的。

```c
typedef struct {
  u_char *last;
  u_char *end;
  ngx_pool_t *next;
  ngx_uint_t failed;
} ngx_pool_data_t;
```

举个例子。假设堆上分配了一个 `chunk`，大小为 `chunk_size`，由一个 `ngx_pool_data_t d` 来描述：

```text
     ----------------------
     |已分配   | 未用空间    |
     ----------------------
              ^           ^
d->last = ----|           |
                          |
d->end  = ----------------|
d->next = 指向下一个 chunk
d.failed = 失败次数（详见下文代码）
```

这就是 Arena 与 Bump 的图解：通过 bump `last` 指针快速为小对象划出地址，`end` 标记边界、用于越界检查。

这里有两个值得澄清的点。

**第一，`ngx_pool_data_t d` 在栈上还是堆上？需要用户手动申请吗？**

不需要用户申请，交由内存池自己处理，放在堆上。

**第二，`ngx_pool_data_t d` 与 `chunk` 是分开存储的吗？**

这是 Nginx 设计的一个理解关键：结构体本身**内嵌**进 `chunk`。原本的 `chunk_size`，会在最前面取出 `sizeof(ngx_pool_data_t)` 的空间存放它自己。也就是说，前 `sizeof(ngx_pool_data_t)` 字节是描述信息本身，后面 `chunk_size - sizeof(ngx_pool_data_t)` 才是真正能分给对象的可用空间（暂不考虑内存对齐）。

```text
       -------------------------|
       |                        ^
     ----------------------------------------
     |last|end|next|failed|已分配| 未用空间    |
     ----------------------------------------
            |                                ^
            ---------------------------------|
```

内嵌式结构的好处是省了一次 `malloc`，代价则是占用了一部分 `chunk` 的可用内存。

以上讨论适用于**第二块及之后**的 `chunk`。首块是特殊的，下一节单独说明。

### `ngx_pool_t`

前面的结构代码已经表明，`ngx_pool_t` 本身就包含一个 `ngx_pool_data_t`。沿用 `ngx_pool_data_t` 的内嵌思路，Nginx 把首块 `chunk` 直接嵌进了内存池本体。

```text
// first chunk
      -----------------------|
      |                     d.last
     -------------------------------------
     |d|max|current|...|已分配| 未用空间    |
     -------------------------------------
            |                            d.end
            ------------------------------|
```

所以首块与其余 chunk 的区别就在于内嵌内容不同：首块内嵌的是内存池本体 `ngx_pool_t`，第二块及之后内嵌的则是更轻量的 `ngx_pool_data_t`。

更准确地说，首块和其余每个 chunk（连同各自内嵌的结构体）的**整体 `size` 是相同的**，但真正可用于分配的 `chunk_size` 不同，因为内嵌结构体的开销不一样：

- 首块：`chunk_size = size - sizeof(ngx_pool_t);`
- 其余：`chunk_size = size - sizeof(ngx_pool_data_t);`

理清了内嵌关系，再回头看 `ngx_pool_t` 的各个字段：

```c
typedef struct ngx_pool_s {
  ngx_pool_data_t d;
  size_t max; // 4095
  ngx_pool_t *current;
  ngx_pool_large_t *large;
  ngx_pool_cleanup_t *cleanup;
} ngx_pool_t;
```

`d` 是内存池本体内嵌的那个 `ngx_pool_data_t`，它内部的 `next` 指针把后续所有 chunk 串成一条单链表——这是整个池子的骨架。

`max` 表示每个 chunk（含内嵌结构体）的 `size`，`4095` 是单个 chunk 的上限。这个值同时也是小内存与大内存分配的分水岭：超过 `max` 的请求会走单独的大内存路径。

`current` 指向当前「有效」的 chunk——所谓有效，是指它内部还有足够空间分配对象。它需要配合 `ngx_pool_data_t` 里的 `failed` 一起理解：当某个 chunk 的 `failed` 累计超过阈值，说明它已经反复装不下新请求了，`current` 便跳过它指向下一块；若后续没有可用块，就触发新 chunk 的分配。这样做的意义在于，分配时不必每次都从头遍历那些大概率已经填满的旧块。

`large` 用于大内存分配，`cleanup` 用于资源清理，二者都是后文的主题。

光看描述很懵，看代码会对这些概念有更清晰的认识。

## C++ 实现

我对 Nginx 源码进行了一次 C++ 重写：删减了一部分，但架构几乎一样。

如果你读懂下面的代码，那么读 Nginx 内存池源码自然水到渠成；反过来，如果你读过源码且有一定 C++ 基础，这就是一份项目上能用的 C++ 翻版 Nginx 内存池。

### 头文件

先展示代码，然后下文挑重点说。其余靠注释自行理解——把下文代码喂给 Claude Code 也是一个好办法。

```cpp
class Pool : public runtime::base::NonCopyable {
public:
  inline static constexpr std::size_t kDefaultChunkSize = 1 << 12;
  inline static constexpr std::size_t kMaxSmallAlloc = kDefaultChunkSize - 1;
  inline static constexpr std::size_t kFailedThreshold = 1 << 2;
  inline static constexpr std::size_t kMinChunkSize = 1 << 7;

  struct Deleter {
    void operator()(Pool* p) const noexcept;
  };

  using Ptr = std::unique_ptr<Pool, Deleter>;

  // Pool must be placement-new'ed at the beginning of its own arena memory,
  // so stack allocation and direct new are intentionally disallowed.
  static Ptr Create(std::size_t chunk_size = kDefaultChunkSize);

  // size <= max_ uses the bump arena fast path.
  // Larger allocations bypass the arena and use the large-allocation path.
  void* Allocate(std::size_t size);
  void* AllocateAligned(std::size_t size, std::size_t align);
  void* AllocateUnaligned(std::size_t size);
  void* Callocate(std::size_t size);

  // Only valid for large allocations.
  // Small allocations are reclaimed by Reset() or Pool destruction.
  void Free(void* p) noexcept;

  // Does not execute cleanup handlers.
  // Releases large allocations and rewinds all chunk bump pointers.
  void Reset() noexcept;

  // handler(data) is executed in LIFO order during Pool destruction.
  // Returned data memory is allocated from the arena itself.
  void* RegisterCleanup(void (*handler)(void*), std::size_t data_size);

  std::size_t ChunkCount() const noexcept;
  std::size_t LargeCount() const noexcept;
  std::size_t ByteUsed() const noexcept;

private:
  struct ChunkHeader {
    std::byte* last;
    std::byte* end;
    ChunkHeader* next;
    std::uint32_t failed;
  };

  struct LargeNode {
    void* alloc;
    LargeNode* next;
  };

  struct CleanupNode {
    void (*handler)(void*);
    void* data;
    CleanupNode* next;
  };

  explicit Pool(std::size_t chunk_size) noexcept;
  ~Pool() = default;

  void DestroyArena() noexcept;
  void* AllocateSmall(std::size_t size, std::size_t alignment);
  void* AllocateLarge(std::size_t size);
  ChunkHeader* AllocateChunk();

  // reinterpret_cast<ChunkHeader*>(this) == &d_
  ChunkHeader d_;
  std::size_t max_;
  ChunkHeader* current_;
  LargeNode* large_;
  CleanupNode* cleanup_;
};
```

下面挑四个真正影响设计的点说明，其余靠注释自解释。

**一、`Create` 工厂 + placement-new：Pool 住在自己的 arena 里**

这是整个类最反直觉、也最关键的设计。`Pool` 的构造函数是 `private` 的，唯一入口是静态的 `Create`。原因在于：`Pool` 对象本身并不独立存在于某处，它就**坐落在它所管理的那块 arena 内存的开头**。

理解的要点是：C++ 申请原始字节与构造对象可视为两步。`::operator new` 对应 C 中的 `malloc`；`placement-new` 构造对象。

对照 Nginx，首块 chunk 内嵌的是 `ngx_pool_t` 本体——C++ 版要复现这一点，就必须先 `::operator new` 出整块 arena，再用 placement-new 把 `Pool` 构造在这块内存的起始地址上。

正因如此，栈分配和普通 `new` 都被刻意禁止：如果 `Pool` 被分配在别处，它的 `this` 就不再是 arena 的起点，`d_.last = this + sizeof(Pool)` 这套地址推算会整个失效。

**二、`Ptr` 与自定义 `Deleter`：析构路径不能交给默认行为**

为什么要定义删除器 `Deleter`，而不是直接 `delete`？

因为 `Pool` 是 placement-new 出来的，它的销毁就不能走 `delete`——`delete` 会同时调析构和 `::operator delete`，但 placement-new 的对象内存不归它管。所以这里用 `std::unique_ptr<Pool, Deleter>` 包装，`Deleter` 里手动编排了正确的三步：先 `DestroyArena()` 清理资源与后续 chunk，再显式调 `~Pool()`，最后才 `::operator delete` 释放首块 arena。

这套逻辑钉进 `Deleter`，使用者只需持有一个 `Ptr`，RAII 自动兜底，无需自己做内存管理。

**三、`ChunkHeader` 取代 `ngx_pool_data_t`，并复用 `this == &d_`**

`d_` 是 `ChunkHeader` 类型，且它是类的**第一个**数据成员，因此 `reinterpret_cast<ChunkHeader*>(this) == &d_` 成立。这让首块在遍历时可以和其余 chunk 一视同仁地当作 `ChunkHeader` 处理，省去为首块单独写一套逻辑。`failed` 字段从 Nginx 的 `ngx_uint_t` 收窄成了 `std::uint32_t`——计数器不需要 64 位，顺便压一点结构体体积。

**四、三类节点分离：small / large / cleanup 各走各的链**

`LargeNode` 和 `CleanupNode` 被拆成独立的小结构体，分别串成两条链表，与 bump arena 的主链彻底解耦。这对应 Nginx 里 `large` 与 `cleanup` 各自成链的设计：大内存被单独 `Free`，清理回调需要按后进先出（LIFO）触发。

侵入式链表结构的一个特征是所有权平行分离。`LargeNode` 和 `CleanupNode` 二者的生命周期语义都和「只进不退」的 bump 主链不同，混在一起会互相掣肘。

### 源文件

源文件里 `Create` / `Deleter` / 构造函数对应的就是头文件讲过的「placement-new 三步走」，具体逻辑自行阅读。统计函数（`ChunkCount` / `LargeCount` / `ByteUsed`）和 `Reset` 都是直白的链表遍历与计数操作，看代码即可。

真正值得展开的是两条分配路径：小对象走快路径分配，读文件（大内存）走大内存路径单独 `malloc`。

**`AllocateSmall`：bump fast-path 的核心**

```cpp
void* Pool::AllocateSmall(std::size_t size, std::size_t align) {
  for (ChunkHeader* c = current_; /* void */; c = c->next) {
    std::byte* aligned = AlignPtr(c->last, align);
    if (aligned <= c->end &&
        static_cast<std::size_t>(c->end - aligned) >= size) {
      c->last = aligned + size;
      return aligned;
    }
    if (c->next == nullptr) break;
  }

  // No existing chunk has enough space. Allocate a new chunk.
  ChunkHeader* fresh = AllocateChunk();
  std::byte* aligned = AlignPtr(fresh->last, align);
  void* result = aligned;
  fresh->last = aligned + size;

  // nginx-style heuristic:
  // increment failed counters for skipped chunks and
  // gradually advance current_ toward newer chunks.
  ChunkHeader* walk = current_;
  for (; walk->next != nullptr; walk = walk->next) {
    if (walk->failed++ >= kFailedThreshold) {
      current_ = walk->next;
    }
  }
  walk->next = fresh;
  return result;
}
```

快路径就是前半段的循环：从 `current_` 出发，对每个 chunk 先把 `last` 按 `align` 对齐，再做一次边界检查——对齐后的地址不越过 `end`、且剩余空间够 `size`，就把 `last` 向后推并返回。整个过程没有查找、没有空闲链表，这正是 bump allocation 快的根源。

慢路径在所有现有 chunk 都装不下时触发：分配一块新 chunk，从它身上划出内存。

**有意为之的实现选择**，和 Nginx 原版略有不同。Nginx 是在分配前遍历的过程中递增 `failed`；我是在新 chunk 分配完成后，单独走一遍 `walk` 循环来递增沿途 chunk 的 `failed`，并在超过 `kFailedThreshold` 时把 `current_` 往后挪。语义上效果一致——某个 chunk 反复装不下，就挪动 `current_` 到有效的位置，后续分配从更新的块起步——只是我把「计数」与「快路径判断」拆开了，快路径循环保持纯粹，只管分配。

**`AllocateLarge`：越过 arena 的大内存路径**

```cpp
void* Pool::AllocateLarge(std::size_t size) {
  void* alloc = ::operator new(size);

  std::size_t probe = 0;
  for (LargeNode* l = large_; l != nullptr; l = l->next) {
    if (l->alloc == nullptr) {
      l->alloc = alloc;
      return alloc;
    }
    if (++probe >= kLargeSlotSearch) break;
  }

  auto* node = static_cast<LargeNode*>(
      AllocateSmall(sizeof(LargeNode), alignof(LargeNode)));
  node->alloc = alloc;
  node->next = large_;
  large_ = node;
  return alloc;
}
```

超过 `max_` 的请求直接 `::operator new`，绕过 bump arena——arena 是为小对象的密集分配设计的，大块内存塞进去会浪费可用空间，也破坏整体一次性释放的前提（大内存需要能被 `Free` 单独回收）。

两个细节值得一提。其一，新分配的指针不是无脑挂链：先探测链表前 `kLargeSlotSearch` 个节点，如果有被 `Free` 置空（`alloc == nullptr`）的槽位就直接复用，省一次 `LargeNode` 分配。其二，`LargeNode` 这个节点本身只有十几字节，让它也从 bump arena 里划出来——管理结构借住在它所管理对象的对立路径上，「能省一次分配就省一次」。

至于 `Free`，它只对大内存有效：遍历 `large_` 链找到匹配指针，`::operator delete` 后把槽位置空（留给上面的复用逻辑）。小对象不支持单独释放——这是 bump allocation 的固有代价，前文已经说过。

## 小结

到这里，一个翻版 Nginx 内存池的 C++ 实现就完整了：

**小对象只进不退、批量重置；大对象单独管理、单独释放。**

如上所说，我删减了 Nginx 内存池的一部分，另外的差异是语言层面的设计思路：工厂模式、全堆分配、`unique_ptr` + 自定义 `Deleter` 接管销毁路径、RAII 封装无需手动管理内存、`std::byte` 与显式内存对齐。

这种内存池适用于游戏引擎和编译器生成语法树——这些我只停留在描述上。但我可以肯定，它在 HTTP 路由解析和网关路由协议改写上非常高效。这也是我最初学习并优化它的原因。

另外，把它接入 C++17 的 `std::pmr::memory_resource`——它能作为标准的 `memory_resource` 暴露出去，`std::pmr::string`、`std::pmr::vector` 这些容器就能直接以它为分配源。C++ 也提供 Nginx 风格的分配源，感兴趣可自行了解。

## 参考附录

- [Arena 和 Bump](https://en.wikipedia.org/wiki/Region-based_memory_management)
- [C 语言 Arena 起源论文 — By D R.H](https://wangziqi2013.github.io/paper/2021/08/22/fast-allocation-and-dealloaction.html)
- [Nginx 内存池源码](https://github.com/nginx/nginx/blob/master/src/core/ngx_palloc.h)
- [Apache 内存池源码](https://github.com/apache/apr/blob/trunk/memory/unix/apr_pools.c)
