---
title: Maglev 一致性哈希算法
description: 从背景到数论原理，深入 Maglev 哈希的查找表填充算法、双重散列的开放寻址本质、M 为质数的数学证明，以及与 ketama 的复杂度对比和工程实现。
date: 2026-06-07
updated: 2026-06-07
categories: [技术]
tags: [Maglev, 一致性哈希, 负载均衡, C++, ketama]
type: tech
aside: [toc, meta-aside-track]
---

::meta-aside-track{title="本文重点" card}

- Maglev 用固定大小质数查找表实现 O(1) 查询，均匀性构造保证而非概率
- 偏好序列本质是双重散列的探测序列，M 为质数保证遍历全表
- 代价是增删后端需整表重建，重映射比例高于 ketama 的 1/n
- Envoy 和 Katran(Facebook) 采用 Maglev 哈希
::

> **注**
>
> 1. 本文不是 Maglev 四层负载均衡器本身，而是其内部使用的一种一致性哈希算法，通常称为 Maglev Hash。
> 2. 本文默认哈希函数为 `MurmurHash64`。

本文沿「背景 → 算法核心 → 哈希表开放寻址 → 数论原理 → 算法实现 → 复杂度分析与 ketama 对比 → 参考附录」的主线展开。

## 背景

### Maglev

Google 在 2016 年发表了 _Maglev: A Fast and Reliable Software Network Load Balancer_。论文内部提出了一种一致性哈希算法的新实现方案，后被微服务网关 Envoy 与 Google 的 gRPC 采用为工业级方案。

### 回顾负载均衡

负载均衡算法有「族」的概念，其中之一叫做**映射粘性族**。它回答的是：同一个 key 怎么永远落入同一台机器。它宁愿牺牲一部分均衡性，来换取其它族没有的性质——粘性。

#### 为什么需要粘性

后端机器存储了某个客户端的热点缓存，客户端当然希望一直打到这台后端命中本地缓存，否则就是缓存 miss + 回源。又比如，会话状态保存在后端内存里，用户下一次落到同一台机器，登录状态才不会丢；如果落到其它机器，又要重新登录。

这种需求下，再追求均衡反而是破坏性的：把各个用户均匀分散，缓存命中率低、会话容易断。映射粘性族直接不追均衡，转而追求 `key -> upstream_peer` 的稳定映射。

#### 朴素的映射：IP 哈希

IP 哈希：请求的某个 key（比如客户端 IP），哈希一下，对后端数取模，`hash(key) % N`，落哪台就哪台。同一个 IP，只要后端数 N 不变，每次算出来都是同一台。粘性达成了，O(1)，无状态。

**致命问题：**

负载极度不均衡，高峰期用户量全打向同一机器，单机瞬间瘫痪。
取模对 N 极度敏感，N 一变化（增加机器或者机器宕机），缓存大量失效集体回源打崩数据库。

从公式上，`hash(key) % N`，N 一变，几乎所有 key 的归属同时变。3 台变 4 台，`hash % 3` 和 `hash % 4` 的结果对绝大多数 key 都不同——理论上只有约 1/N 的 key 还落在原位，其余全部重新洗牌。

缓存场景下这是灾难：加一台机器扩容，结果导致几乎全量缓存失效，根因就是哈希取模跟后端机器绑定太死。
一致性哈希就是来解开这个绑定。

> **注**
>
> IP 哈希现在已经退居幕后而不是彻底废弃。
> 在 L4 负载均衡中，系统拿不到上层的 `Cookie` 和 `Session`，只能看到 IP。当系统遭受大流量 DDoS 攻击时，安全网关在最外层用 IP Hash 将特定 IP 段的流量固定分流，进行行为审计和限流，避免污染其它干净的服务器。
> IP 哈希属于映射粘性族，一致性哈希具有固定映射和负载均衡的能力。

#### 朴素一致性哈希

一致性哈希需要将 `key` 与 `N` 解绑，思路就是建一个环。把哈希值空间（比如 0 ~ 2^31 - 1）首尾相接成一个圆。

把每个后端哈希映射到环上一点（比如 `hash(节点标识)`）；把每个 key 也哈希到环上一点。一个 key 属于哪个机器？顺时针遇到的第一个节点就是它的归属后端。

举一个例子，有三台后端 A B C：

```text
hash_ring:  0 ----A---- 0.33 ----B---- 0.66 ----C---- 1 
request1:    hash(key) = 0.4  -->  落在 B 的区间  -->  路由到 B
request2:    hash(key) = 0.6  -->  落在 B 的区间  -->  路由到 B
```

加一台机器，比如 D 插入到 AB 这个区间：

```text
hash_ring:  0 ----A---- 0.33 ----B---- 0.5 ----D---- 0.66 ----C---- 1 
request1:    hash(key) = 0.4  -->  保持在 B 区间  -->  路由到 B
request2:    hash(key) = 0.6  -->  变更到 C 区间  -->  路由到 C
```

只要中间新增的一段区间的所有节点划到新机器上。根本上全量更新到局部调整，这样缓存大量失效就变成局部缓存失效，这是可接受的扰动。

> 朴素一致性哈希的问题：分布不均匀。这正是 ketama 一致性哈希要解决的问题。

#### ketama 一致性哈希

哈希的均匀性有两个前提：良好的哈希函数和大量的输入。

朴素哈希环的毛病在于值域很大但输入很少，存在 A、B 离得近，C 离得远，于是 C 的前面一段区间全归 C 管。节点少的时候这种倾斜特别明显，重映射有保证但退化到了 IP 哈希的场景，均衡性和缓存又崩了。

方案是人为制造输入，用**虚拟节点**技术。即一台后端可以放 k 个虚拟节点，分别用 `hash(节点标识 + i)` 算出 k 个分散的位置。物理机器就是这哈希环上的 k 个虚拟节点。物理后端节点 A 就被分散在环里。

带权实现，通常用权重 × 每权重虚拟节点个数算出真实的虚拟节点个数。

> 好的哈希函数同样重要，通常用 `MurmurHash3` 分布均匀且雪崩性好。

#### 保障均衡性的方案

映射粘性族的 ketama 一致性哈希已经不错了，均衡性也有了。那为什么还有其它一致性哈希算法呢？

映射粘性族看的是**静态负载**不是**动态负载**。ketama 不关心真实的运行时负载，它在静态时把 key 均衡的分给后端。

ketama 的缺点在于概率。讨论一下最坏情况：虚拟节点 k 多少合适？k 小了随机分布不均匀，退化到朴素一致性哈希甚至 IP 哈希的场景。

具象化到算法实现上，ketama 的哈希环本质就是虚拟节点哈希值排序的数组，虚拟节点多了废内存，查找速度 $O(log(N \cdot k))$，加虚拟节点也拖累查找。

扰动的不可控：基于概率的保证，哈希落点不可控，重映射代价分布是随机和倾斜的。

> ketama：均匀性、内存/查找开销、增删扰动可控性——这些都被 k 的这个旋钮捆死了。
> 如果说 ketama 是概率派，那么 Maglev 就是构造派，后者是结构性的设计不依赖概率。
>
> 注：上面说明的 ketama 缺点并不表示一定劣于 Maglev，没有免费的午餐。两者的对比后文再说明。

## Maglev 算法思想

先简单说明 Maglev 的核心思路：其采用一个固定大小的查找表（lookup table），表的大小是质数 M（论文中为 65537）。
每个后端通过两个哈希函数计算一个**偏好序列**，然后所有后端按轮次依次填表。

```cpp
for backend i, compute:
  offset[i] = h1(id) mod M
  skip[i] = h2(id) mod (M - 1) + 1
```

每个后端都有 `offset` 表示它在查找表的初始位置，`skip` 表示它每次跳跃的步长（必须大于 0 且小于 M）。
然后是偏好序列的计算：

```cpp
backend i permutation:
  permutation[i][j] = (offset[i] + j * skip[i]) mod M
```

核心：填充算法

```cpp
// 伪代码实现，以 A B C 三个 backend 举例
func maglev_populate(backends, M):
  table <- [0] * M  // 初始化填充表
  filled <- 0       // 当前查找表填充的个数
  while filled < M :
    // 轮询 backends [A, B, C, A, B, C, ...] 依次填表
    for backend in backends:
      // 先找到第一个表没被占的偏好数位置
      do {
        // pos 为当前后端的偏好数
        pos = (backend.offset + backend.next * backend.skip) % M
        backend.next++;
      } while table[pos] != nil;
      table[pos] = backend.peer
      filled++
      if filled == M:
        break  // 整个表填完了。
  return table
```

看看均匀性，假设 M = 7，A B C：

- **服务器 A：** Offset = 3, Skip = 2
- **服务器 B：** Offset = 0, Skip = 3
- **服务器 C：** Offset = 5, Skip = 1

- **A 的偏好顺序：** `[3, 5, 0, 2, 4, 6, 1]`
- **B 的偏好顺序：** `[0, 3, 6, 2, 5, 1, 4]`
- **C 的偏好顺序：** `[5, 6, 0, 1, 2, 3, 4]`

顺序 A 占 3，B 占 0，C 占 5，无冲突。那么第一轮结束了，第二轮回到 A，A 发现 5 被 C 占了，去它的下一个 0，0 被 B 占了，再去下一个 2，拿到了；同理 B 发现 3 被 A 占了，去占下一个 6，拿到了；C 从 6 开始，6 刚被 B 占了，去 0 发现也被 B 占了，去占 1 拿到了，第二轮结束。
第三轮从 A 开始，A 从 4 开始拿到 4 了，此时查找表已经填完了，结束。

最终结果 `[0:B, 1:C, 2:A, 3:A, 4:A, 5:C, 6:B]`。

这个例子不太好但是能理解填充表的过程，当 M 过大时不会出现上述 AAA 连续填的情况，实现完美的均匀。
每个后端机器的分布数量至少都大于等于 M/N 的向下取整数。A、B、C 都大于等于 7/3 向下取整数 2，其中 A 由于轮班在前面且 M 必定是质数，所以 A 是 M/N 的向上取整数（这里是 3）。
总之，从算法角度，当 M 过大时每台后端机器是可以认为拥有 `M/N` 的均匀分布。

> M 为什么一定是质数？
> 这种填充法为什么保证不会漏表，比如有一个位置索引没有在任何后端节点的偏好序列上。
> 前文的 `offset`、`skip` 的设计原理？偏好序列的作用是？

## 偏好序列原理：哈希表开放寻址法

上述的查找表本质就是哈希表，查询过程哈希一下就可以 $O(1)$ 取后端节点了。

这源于哈希表的两种常见实现方式之一的**开放寻址法**，另一种常见是**链地址法**。
开放寻址有多种实现技术，比如线性探测、二次探测，这次涉及的是另外一种：**双重散列**。

双重散列定义：

$$
h(k,i) = (h_1(k) + i \cdot h_2(k)) \bmod m
$$

对比上文：`permutation[i][j] = (offset[i] + j * skip[i]) mod M`

- `offset = T[h_1(k)]` 决定探测的**起点**
- `skip = T[h_2(k)]` 决定探测的**步长**

这本质就是双重散列公式，偏好序列本质就是双重散列的探测序列。
Maglev 填表是同一件事的"集体版本"：每个后端预先计算下一个填表序列，没有冲突（其它后端没填这个位置）填表，否则继续探测。

为什么 `offset`、`skip` 不采用线性探测那样的固定步长 1？

开放寻址的经典坑：**聚集**。一个连续槽被占，顺序遍历查找表，一路往下滑，插入和查找都恶化了。双重散列把步长 step 交给 $h_2$ 哈希函数决定，不同后端步长各异，探测序列错开几乎不聚集。

> 事实上，$h_1$ 和 $h_2$ 可以采用同一哈希函数 + 不同种子，比如 $h_1$ 种子数为 0，$h_2$ 种子数为黄金分割数。`h1(id, 0)`、`h2(id, 0x9e3779b9U)`，哈希函数通常是 `MurmurHash3`。

上文的公式 `skip[i] = h2(id) mod (M - 1) + 1`，保证步长大于 0 且小于 M，它是不漏查找表能遍历全表的前提。
为什么 M 为质数一定不会漏表？见下文数学原理。

## 数学原理：欧几里得

M 是 7，A、B、C 的偏好序列在单周期 M 都完整覆盖了 [0, 6]。这是意外吗？还是数学的必然？

"不漏表"本质要求就是走 M 步，每步互不相同。满足这个已经满足 [0, m-1] 全覆盖。

用反证法：

假设走 X 步和走 Y 步同余：

$$
(\text{Offset} + x \times \text{Skip}) \equiv (\text{Offset} + y \times \text{Skip}) \pmod M
$$

消去 Offset 并移项，得到：

$$
(x - y) \times \text{Skip} \equiv 0 \pmod M
$$

如果成立，$(x - y) \times \text{Skip}$ 必须是 M 的整数倍。

M 有两种讨论：

**讨论一：假设 M 是质数**

那么它的约数只有 1 和它本身。

M 能整除 $(x - y) \times \text{Skip}$。

> 根据欧几里得引理（Euclid's Lemma）：如果一个质数能整除两个整数的乘积，那么这个质数至少能整除其中一个因数。

以下两个条件中必须有一个成立：

1. M 能整除 $(x - y)$，记作 $M \mid (x - y)$
2. M 能整除 $\text{Skip}$，记作 $M \mid \text{Skip}$

然而，已知：

- $(x - y)$ 的范围是 [1, M-1]，比 M 小。
- $\text{Skip}$ 的范围是 [1, M-1]，也比 M 小。

**一个质数绝对不可能整除任何比它自身小的正整数！**

因此，条件 1 和条件 2 统统不成立，从而产生了矛盾。这说明最初的假设（即同余碰撞）完全错误，不会发生。

**结论一（质数情况）：**
当 M 是质数时，服务器走 M 步的每一步余数都绝对互不相同。既然每步都不同，走完 M 步就必然完美覆盖 [0, M-1] 的所有位置。数学的必然。

**讨论二：假设 M 是合数**

如果 M 是合数，意味着它除了 1 和自身外，还可以分解为其他因数的乘积。我们设 $M = d_1 \times d_2$（其中 $d_1, d_2 > 1$，$d_1$ 和 $d_2$ 可能相同）。

因为 Maglev 的 $\text{Skip}$ 是由哈希函数随机生成的，如果某台服务器算出来的步长刚好是 $\text{Skip} = d_1$（或者 $d_1$ 的倍数）。

此时，当服务器跑了 $d_2$ 步时（因为 $d_2 < M$，这在 M 步之内必然会发生），相乘的结果：

$$
(x - y) \times \text{Skip} = d_2 \times d_1 = M
$$

这个乘积变成了 M 的 1 倍（M 的整数倍）！
同余方程 $(x - y) \times \text{Skip} \equiv 0 \pmod M$ 成立。服务器还没跑满 M 步，就已经踩到了之前踩过的格子，这意味着死循环，没到的格子永远不会到了也就漏掉了。

**结论二（合数情况）：**
当 M 是合数时，算法在跑满 M 步前就提早发生同余碰撞并陷入局部死循环，无法全覆盖，这就是"漏表"灾难。

> 唯一因子分解定理或欧几里得引理证明自行查阅。

## C++ 算法实现

接下来的代码是我实际项目中的 Maglev 实现，忽略其它细节比如 RCU、指纹验证。
这是从整个负载均衡算法完整代码中截取出的 Maglev，不能直接跑通，理解真实实现后自行改写即可。

Maglev 算法分为**建表**和**查询**。初次建表或者重建表（增加机器或者机器宕机），另一种是查表（哈希函数打桶）。

查找表：一个数组，由填充算法建立。另一字段是指纹验证技术的字符串（自行了解）。

```cpp
struct LookupTable {
  std::vector<std::shared_ptr<UpstreamPeer>> entries;
  std::string fingerprint;
};
```

后端游标：peer 表示真实的后端节点描述，offset 是起点，skip 表示步长，next 表示下一个所在偏好序列的下标。

```cpp
struct BackendCursor {
  std::shared_ptr<UpstreamPeer> peer;
  std::size_t offset;
  std::size_t skip;
  std::size_t next{0};
};
```

建表的代码，先看完整：

```cpp
std::shared_ptr<const LookupTable> BuildTable(
  const std::vector<std::shared_ptr<UpstreamPeer>>& peers,
  uint64_t now_ms) const {
  auto table = std::make_shared<LookupTable>();

  std::vector<BackendCursor> backends;
  table->fingerprint.reserve(peers.size() * 32);
  for (const auto& peer : peers) {
    if (!peer->AvailableAt(now_ms)) continue;

    table->fingerprint += peer->config().name;
    table->fingerprint += ':';
    table->fingerprint += std::to_string(peer->config().weight);
    table->fingerprint += ';';

    const int weight = std::max(peer->weight(), 1);
    for (int replica = 0; replica < weight; ++replica) {
      std::string id = peer->config().name;
      id += '#';
      id += std::to_string(replica);

      const uint64_t h1 = runtime::ds::MurmurHash64(id, 0);
      const uint64_t h2 = runtime::ds::MurmurHash64(id, 0x9e3779b9U);

      backends.push_back(BackendCursor{
        peer,
        static_cast<std::size_t>(h1 % table_size_),
        static_cast<std::size_t>((h2 % (table_size_ - 1)) + 1),
        0,
      });
    }
  }

  if (backends.empty()) {
    return table;
  }

  table->entries.assign(table_size_, nullptr);
  std::size_t filled = 0;
  while (filled < table_size_) {
    for (auto& backend : backends) {
      std::size_t pos = 0;
      do {
        pos = (backend.offset + backend.next * backend.skip) % table_size_;
        ++backend.next;
      } while (table->entries[pos] != nullptr);

      table->entries[pos] = backend.peer;
      if (++filled == table_size_) break;
    }
  }

  return table;
}
```

填表过程具象化：最外层循环的终止条件是查找表填满。内部分别是轮询后端机器，然后找到空位填表。

```cpp
table->entries.assign(table_size_, nullptr);
std::size_t filled = 0;
while (filled < table_size_) {
  for (auto& backend : backends) {
    std::size_t pos = 0;
    do {
      pos = (backend.offset + backend.next * backend.skip) % table_size_;
      ++backend.next;
    } while (table->entries[pos] != nullptr);

    table->entries[pos] = backend.peer;
    if (++filled == table_size_) break;
  }
}
```

查询过程：下游客户端请求到了，比如用客户端 IP 做键值算出哈希值，然后对查找表长度取模，找出固定的后端节点。

```cpp
static std::shared_ptr<UpstreamPeer> Lookup(const LookupTable& table, uint64_t hash) {
  if (table.entries.empty()) {
    return nullptr;
  }
  return table.entries[hash % table.entries.size()];
}
```

> 所以相当于手写一个多后端双重散列哈希表？
> 对，这也是笔者首次写开放寻址的哈希表。

## 复杂度分析

Maglev 不是全面碾压 ketama。负载均衡 ↔ 增删扰动。

**Maglev：**

1. 查找 $O(1)$，不必在环上二分
2. 均匀性更好，不依赖概率和虚拟节点数量，根因在设计理念
3. **代价在增删扰动：** 增加/删除后端需要整表重建，重映射的 key 比例高于 ketama 一致性哈希的 $1/n$

换言之，Maglev 用非最小扰动换近乎完美的均匀性。

| 维度 | ketama（环 + 虚拟节点） | Maglev（查找表） |
| --- | --- | --- |
| 查找复杂度 | $O(\log(n \cdot k))$，哈希环上二分查找 | **$O(1)$**，直接 `table[hash(key) % M]` |
| 构建复杂度 | $O(n \cdot k \cdot \log(n \cdot k))$，生成并排序虚拟节点 | $O(M \cdot \log M)$（实践中约 $O(M)$, $M \gg n$） |
| 均匀性 | 概率均匀，靠虚拟节点数 k 逼近，有可见偏差 | **构造均匀**，各后端槽数至多差一个，不依赖 k |
| 增删扰动 | **$\approx 1/n$ 的 key 重映射（理论最小）**，但落点不均、可能集中 | 远大于 $1/n$，整表重建；靠大 M 压低绝对量 |
| 空间 | $O(n \cdot k)$，k 默认 160（通常范围在 100～200 之间） | $O(M)$，M 通常取质数 65537 |
| 调参旋钮 | k（虚拟节点数）：牵动均匀性、内存、查找 | M（表大小）：主要影响扰动与精度 |

工业采用上，Envoy 提供 `maglev` 负载均衡策略，Katran（Facebook）使用 Maglev 哈希。

## 一致性哈希算法的方案选择

```text
映射粘性族（缓存亲和）
+-- 是 --> 后端频繁增删 / 最怕缓存失效？
|           +-- 是 --> 一致性哈希（虚拟节点）   # 扰动最小
|           +-- 否 --> Maglev               # 均匀+O(1)，代价是扰动大
+-- 否 --> 根据需求选择（静态族/动态族）...
```

## 代码完整实现

这里只贴了代码，仅供参考：

```cpp
// Maglev hashing: precomputed lookup table for stable O(1) hash selection.
//
// Unlike ketama, the hot path is a single table lookup:
//   MurmurHash64(key) % table_size -> peer
//
// The table is rebuilt only when the available peer fingerprint changes.
// This implementation supports weights by expanding each peer into "weight"
// logical Maglev backends.
class MaglevHashLB : public LoadBalancer {
public:
  static constexpr std::size_t kDefaultTableSize = 65537;
  static constexpr std::size_t kMinTableSize = 257;
  static constexpr std::size_t kMaxTableSize = 1048583;

  enum class HashOn : uint8_t {
    kClientIp,
    kUri,
    kUserId,
    kSessionId,
  };

  explicit MaglevHashLB(std::size_t table_size = kDefaultTableSize,
    std::string_view hash_on = "client_ip")
  : table_size_(NextPrime(std::clamp(table_size, kMinTableSize, kMaxTableSize))),
    hash_on_(ParseHashOn(hash_on)) {}

  std::shared_ptr<UpstreamPeer> Select(Upstream& upstream, const RequestContext ctx = {} ) override {
    const auto& peers = upstream.peers();
    const uint64_t now_ms = detail::SteadyClockMs();
    auto fp = ComputeFingerprint(peers, now_ms);
    if (fp.empty()) return nullptr;

    auto table = table_.load(std::memory_order_acquire);
    if (table && table->fingerprint == fp) {
      return Lookup(*table, runtime::ds::MurmurHash64(HashKey(ctx)));
    }

    std::lock_guard lk{rebuild_mutex_};
    table = table_.load(std::memory_order_acquire);
    if (!table || table->fingerprint != fp) {
      table = BuildTable(peers, now_ms);
      table_.store(table, std::memory_order_release);
    }
    return Lookup(*table, runtime::ds::MurmurHash64(HashKey(ctx)));
  }

private:
  struct LookupTable {
    std::vector<std::shared_ptr<UpstreamPeer>> entries;
    std::string fingerprint;
  };

  struct BackendCursor {
    std::shared_ptr<UpstreamPeer> peer;
    std::size_t offset;
    std::size_t skip;
    std::size_t next{0};
  };

  static std::string ComputeFingerprint(
    const std::vector<std::shared_ptr<UpstreamPeer>>& peers,
    uint64_t now_ms) {
    std::string fp;
    fp.reserve(peers.size() * 32);
    for (const auto& peer : peers) {
      if (!peer->AvailableAt(now_ms)) continue;
      fp += peer->config().name;
      fp += ':';
      fp += std::to_string(peer->config().weight);
      fp += ';';
    }
    return fp;
  }

  std::shared_ptr<const LookupTable> BuildTable(
    const std::vector<std::shared_ptr<UpstreamPeer>>& peers,
    uint64_t now_ms) const {
    auto table = std::make_shared<LookupTable>();

    std::vector<BackendCursor> backends;
    table->fingerprint.reserve(peers.size() * 32);
    for (const auto& peer : peers) {
      if (!peer->AvailableAt(now_ms)) continue;

      table->fingerprint += peer->config().name;
      table->fingerprint += ':';
      table->fingerprint += std::to_string(peer->config().weight);
      table->fingerprint += ';';

      const int weight = std::max(peer->weight(), 1);
      for (int replica = 0; replica < weight; ++replica) {
        std::string id = peer->config().name;
        id += '#';
        id += std::to_string(replica);

        const uint64_t h1 = runtime::ds::MurmurHash64(id, 0);
        const uint64_t h2 = runtime::ds::MurmurHash64(id, 0x9e3779b9U);

        backends.push_back(BackendCursor{
          peer,
          static_cast<std::size_t>(h1 % table_size_),
          static_cast<std::size_t>((h2 % (table_size_ - 1)) + 1),
          0,
        });
      }
    }

    if (backends.empty()) {
      return table;
    }

    table->entries.assign(table_size_, nullptr);
    std::size_t filled = 0;
    while (filled < table_size_) {
      for (auto& backend : backends) {
        std::size_t pos = 0;
        do {
          pos = (backend.offset + backend.next * backend.skip) % table_size_;
          ++backend.next;
        } while (table->entries[pos] != nullptr);

        table->entries[pos] = backend.peer;
        if (++filled == table_size_) break;
      }
    }

    return table;
  }

  static HashOn ParseHashOn(std::string_view s) {
    if (s == "uri") return HashOn::kUri;
    if (s == "user_id") return HashOn::kUserId;
    if (s == "session_id") return HashOn::kSessionId;
    return HashOn::kClientIp;
  }

  const std::string& HashKey(const RequestContext& ctx) const {
    static const std::string empty;
    switch (hash_on_) {
      case HashOn::kUri:
        if (!ctx.uri.empty()) return ctx.uri;
        break;
      case HashOn::kUserId:
        if (!ctx.user_id.empty()) return ctx.user_id;
        break;
      case HashOn::kSessionId:
        if (!ctx.session_id.empty()) return ctx.session_id;
        break;
      case HashOn::kClientIp:
        break;
    }
    return ctx.client_ip.empty() ? empty : ctx.client_ip;
  }

  static std::shared_ptr<UpstreamPeer> Lookup(const LookupTable& table, uint64_t hash) {
    if (table.entries.empty()) {
      return nullptr;
    }
    return table.entries[hash % table.entries.size()];
  }

  static bool IsPrime(std::size_t num) {
    if (num < 2) return false;
    if (num == 2 || num == 3) return true;
    if (num % 2 == 0 || num % 3 == 0) return false;
    for (std::size_t d = 5; d <= num / d; d += 6) {
      if (num % d == 0 || num % (d + 2) == 0) return false;
    }
    return true;
  }

  static std::size_t NextPrime(std::size_t num) {
    if (num <= 2) return 2;
    if (num % 2 == 0) num++;
    while (!IsPrime(num)) num += 2;
    return num;
  }

  std::size_t table_size_;
  HashOn hash_on_;
  std::atomic<std::shared_ptr<const LookupTable>> table_;
  std::mutex rebuild_mutex_;
};
```

## 参考文献

- Eisenbud et al., _Maglev: A Fast and Reliable Software Network Load Balancer_, NSDI 2016
- Karger et al., _Consistent Hashing and Random Trees_, STOC 1997
- Mirrokni, Thorup & Zadimoghaddam, _Consistent Hashing with Bounded Loads_, SODA 2018
- gRPC Load Balancing — grpc.io/blog/grpc-load-balancing/ (Accessed: 2026-06)
- Envoy Load Balancing — envoyproxy.io 文档, Upstream / Load Balancing (Accessed: 2026-06)

**教科书（算法导论第三版）**
- Cormen, Leiserson, Rivest & Stein, _Introduction to Algorithms_ (CLRS), 3rd/4th ed.
  - 第 11 章 Hash Tables, §11.4 Open Addressing（开放寻址、双重散列）——本文"偏好序列 = 双重散列探测序列"
  - 第 31 章 Number-Theoretic Algorithms, §31.1–31.2（模运算、GCD 与欧几里得算法）——本文"gcd(skip, M) = 1 保证遍历全表"

**延伸阅读（超出本文，同一领域）**

- Lamping & Veach, _A Fast, Minimal Memory, Consistent Hash Algorithm_ (Jump Hash), 2014
- Thaler & Ravishankar, _Rendezvous (HRW) Hashing_, 1998
- Mitzenmacher, _The Power of Two Choices in Randomized Load Balancing_, 1996
- Azar et al., _Balanced Allocations_, SIAM J. Comput. 1999
- Google SRE Book, Ch.20: Load Balancing in the Datacenter
