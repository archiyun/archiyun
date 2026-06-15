---
title: KMP-(Knuth-Morris-Pratt)
description: KMP-(Knuth-Morris-Pratt)
date: 2026-04-29 13:29:48
updated: 2026-04-29 13:29:48
image: /images/posts/0003_kmp.png
categories: [技术]
tags: [C++, Algorithm]
series:
  name: 字符串算法
  slug: string-algorithms
  description: 从匹配、前缀函数到自动机，记录字符串问题里的回头路。
  order: 1
type: tech
aside: [toc, meta-aside-foo]
---

::meta-aside-track{title="point" card}

- 理解next数组的原理和求解
- 利用next数组加速匹配
::


## 引言

::poetry
---
title: 写在前面
author: Maksim
---
说实话，
KMP 我已经学过好几次了。

第一次接触时，
真的觉得好难啊——
但最终还是勉强记住了。

然而每次需要手写时，
还是会写着写着就懵。
::

::alert{type="info" title="这篇文章的目标"}
帮你**真正理解** KMP 的思想，并能够亲手实现出来。下次面试遇到，闭着眼也能写。 :badge[C++]{round} :badge[Java]{round}
::

---

## 问题描述

我们要解决的问题非常简单——

:quote[在一个字符串 `str` 里，找到 `match` 字符串最早出现的位置。如果找到了就返回索引，找不到就返回 -1。]

::alert{type="question" title="举个例子"}
- `str = "abcde"`{lang="cpp"}，`match = "cd"`{lang="cpp"} → 返回 **2**
- `str = "abcd"`{lang="cpp"}，`match = "de"`{lang="cpp"} → 返回 **-1**
::

本文要点如下：

::card-list
- KMP 算法是干什么的
- 先看 BF（Brute Force）暴力解法
- 认识 `next` 数组
  - `next` 数组的含义
  - 如何用它加速匹配
  - 为什么能加速（反证法）
- 如何快速求出 `next` 数组
- 完整代码实现（C++ & Java）
- 时空复杂度分析
::

> 全文主要采用 C++ 叙述，不影响 KMP 算法的掌握。Java 完整代码详见后文。

---

## KMP 是什么？

::timeline
{1977 年}

**Donald Knuth, Vaughan Pratt, James H. Morris** 三人提出了这个算法

{命名由来}

取三人姓氏首字母 → **K**nuth-**M**orris-**P**ratt

{核心用途}

字符串匹配 / 文本搜索，将暴力匹配的 $O(n \times m)$ 优化到 $O(n + m)$
::

---

## 先看看 BF 暴力解法 💥

KMP 的核心思想是**优化暴力匹配**，所以我们先来看看 BF 解法长什么样。

### 思路

::card-list
- 遍历 `str` 的所有可能起点（从 `0` 到 `n - m`）
- 对每个起点，依次匹配 `match` 的字符
- 如果成功匹配 `match.length()` 个字符 → 找到了
- 如果匹配到一半发现不对 → 换下一个起点继续
::

### 代码实现

```cpp [BF.cpp]
class Solution {
public:
    int strStr(string haystack, string needle) {
        int n = haystack.length(), m = needle.length();
        if (n < m) return -1;
        for (int i = 0; i <= n - m; i++) {
            int j;
            for (j = 0; j < m; j++) {
                if (haystack[i + j] != needle[j]) {
                    break;
                }
            }
            if (j == m) return i;
        }
        return -1;
    }
};
```

::alert{type="warning" title="BF 的死穴"}
时间复杂度 $O(n \times m)$。当出现下面这种情况时，会产生**大量的无效匹配**：

```
str   = aaaaaaaaaaaaaaaaaaaaab
match = aaab
```

每次匹配到末尾才发现不对，然后起点 +1，再来一遍——效率极低。
::

:quote[KMP 的本质，就是**复用已经匹配过的信息**，不走回头路。]

---

## 认识 `next` 数组 💡

KMP 的核心优化点就是 `next` 数组。但它到底是什么？别急，慢慢来。

::alert{type="info" title="next[i] 的定义"}
`next[i]` 表示：**`match[0:i]` 的前后缀的最大匹配长度**。

⚠️ 注意：前后缀**不能等于这个字符串本身**。
::

### 举个例子手算一下

假设 `match = "aabaabtabc"`，我们来计算 `next[6]`，也就是 `match[0:6] = "aabaab"` 的 `next` 值。

::folding{open title="📐 完整推导过程（左右指针扫描法）"}
我们要找 **前后缀匹配最长的部分**：前缀从开头开始，后缀从结尾往前看，且都不能包含整个 `aabaab`。

::tab
---
tabs: ["第 1 步", "第 2 步", "第 3 步 ✅", "第 4 步", "第 5 步", "终止"]
---
#tab1
```text
aabaab
l    r
前缀: a
后缀: b
❌ 不匹配，最大长度暂为 0
```

#tab2
```text
aabaab
 l  r
前缀: aa
后缀: ab
❌ 不匹配，最大长度暂为 0
```

#tab3
```text
aabaab
  lr
前缀: aab
后缀: aab
✅ 匹配！最大长度更新为 3
```

#tab4
```text
aabaab
  rl
前缀: aaba
后缀: baab
❌ 不匹配，保持 3
```

#tab5
```text
aabaab
 r  l
前缀: aabaa
后缀: abaab
❌ 不匹配，保持 3
```

#tab6
```text
aabaab
r    l
前后缀已经等于字符串本身，
不符合 next 的定义。

最终: next[6] = 3 🎉
```
::
::

::alert{title="结论"}
`next[i]` 让我们知道：**如果在位置 `i` 匹配失败，模式串该回退到哪里**。这样就能避免大量无效匹配，显著提高效率。
::

---

## 如何用 `next` 数组加速匹配

> 暂时不要考虑 `next` 数组怎么求，先理解它怎么用。

### 核心思想

::card-list
- 如果 `str[i] == match[j]`：匹配成功，`i++, j++`
- 如果 `str[i] != match[j]` 且 `j > 0`：跳到 `next[j]` 位置，避免重新匹配
- 如果 `str[i] != match[j]` 且 `j == 0`：没法跳了，`i++` 继续
::

### 代码实现

```cpp [kmp.cpp] icon=tabler:rocket
int kmp(const string& str, const string& match) {
    int n = str.length(), m = match.length();
    if (n < m) return -1;

    vector<int> next = next_array(match);

    int i = 0, j = 0;
    while (i < n && j < m) {
        if (str[i] == match[j]) {
            i++, j++;
        } else if (j > 0) {
            j = next[j];   // 匹配失败，回溯到 next[j]
        } else {
            i++;           // 没有可以回溯的地方，向前推进
        }
    }

    return (j == m) ? i - j : -1;
}
```

### 模拟跑一遍

::folding{open title="🎬 一个完整的匹配过程演示"}
看下面这个例子。`str` 和 `match` 在 `index = 13` 处第一次失配：

```text
index: 0 1 2 3 4 5 6 7 8 9 10 11 12 13
str  = a a b a a b c a a b a  a  b  a ...
match= a a b a a b c a a b a  a  b  t
next =-1 0 1 0 1 2 3 0 1 2 3  4  5  6
                                    ↑
                                  i, j
```

按 BF，下一步应该把起点从 `0` 挪到 `1`，重新比对——但这是浪费！

KMP 看到 `next[13] = 6`，意识到一件事：

> `match[0:6]` 与 `match[7:13]` 是完全相同的（这就是 `next` 的定义）。
>
> 而 `match[7:13]` 已经和 `str[7:13]` 匹配过了 → `match[0:6]` 自动等于 `str[7:13]`。

所以可以直接平移，把 `match` 的起点对齐到 `str` 的 7：

```text
index: 0 1 2 3 4 5 6 7 8 9 10 11 12 13
str  = a a b a a b c a a b a  a  b  a ...
match=               a a b a a b  c  a a b a a b t
                                    ↑
                                    i (j 跳到 6)
```

直接从 `j = 6` 处开始比对 `str[13]` 和 `match[6]`。`a != c`，再跳一次 `j = next[6] = 3`：

```text
index: 0 1 2 3 4 5 6 7 8 9 10 11 12 13
str  = a a b a a b c a a b a  a  b  a ...
match=                     a a b a  a  b  c a a b a a b t
                                    ↑
                                    i (j 跳到 3)
```

终于！`str[13] == match[3]`，匹配上了，继续推进。
::

---

### 为什么这样能加速？反证一下

::alert{type="question" title="灵魂拷问"}
凭什么可以直接跳过中间那些起点？万一从 `start + 1` 开始就能匹配上呢？
::

::folding{title="🧠 反证法：跳过的位置一定不会匹配成功"}
设 `next[j] = k`，则有 `match[0, k) == match[j-k, j)`。

```text
      start   x   start+k   end-k   end
        |     |     |         |      |
str  : -----------------------------l
match: -----------------------------y
next :-1 0----------------------- ---k
                                     ↑
                                   i, j
```

假设存在某个起点 `x ∈ [start+1, end-k)`，使得 `str[x : end]` 能匹配 `match[0 : end - x]`。

那么这意味着 `match[0 : end - x]` 是 `str[start : end]` 的一个后缀，长度 `end - x`。

由于 `str[start : end]` 已经匹配了 `match[0 : j]`，这等价于：`match[0 : end - x]` 是 `match[0 : j]` 的一个真后缀，且也是真前缀。

→ 这意味着 `next[j] >= end - x`。

但 `x ∈ [start+1, end-k)`，所以 `end - x > k`，即 `next[j] > k`，与 `next[j] = k` 矛盾！

∴ 不存在这样的 `x`。**`[start+1, end-k)` 之间的起点全部可以安全跳过。** ∎
::

::alert{type="info" title="一句话总结加速原理"}
1. `next` 数组**保证了** `[start, start+k)` 与 `[end-k, end)` 必然相等，无需重新比对。
2. **反证法证明了** `[start+1, end-k)` 之间的起点全是死路，可以放心跳过。
::

---

## 如何快速求 `next` 数组

求 `next` 数组的过程，本质上和上面"用 `next` 加速匹配"的思想**完全一样**——核心都是**跳转复用**。

### 已知 `next[0..i-1]`，求 `next[i]`

边界：`next[0] = -1, next[1] = 0`，这两个直接钦定。

#### 情形一：直接续上 ✨

```text
match = a b a t a b a s a b a t a b a s ?
next  = - - - - - - - - - - - - - - - 7 ?
                       ↑               ↑
                       7               i
```

已知 `next[i-1] = 7`，意味着 `match[i-1]` 之前的前后缀匹配长度是 7（`abataba`）。

只需要看 `match[i-1]` 与 `match[7]` 是否相等：
- 相等 → `next[i] = next[i-1] + 1 = 8`，皆大欢喜。

#### 情形二：跳一次再续上 🎯

```text
match = a b a t a b a s a b a t a b a t ?
next  = - - - - - - - - - - - - - - - 7 ?
            ↑          ↑               ↑
            3          7               i
```

这次 `match[i-1] = t`，与 `match[7] = s` 不相等。

直觉：`next[i]` 一定 **小于** `next[i-1]`。继续往前跳——`next[7] = 3`，看 `match[3]`。

如果 `match[3] == match[i-1]`，则 `next[i] = next[3] + 1 = 4`。

::folding{title="🤔 为什么这样跳是对的？"}
关键在于"前后缀的对应"：

- `next[i-1] = 7` 意味着 `match[0:7]` == `match[i-8:i-1]`
- `next[7] = 3` 意味着 `match[0:3]` == `match[4:7]`
- 由对应关系传递：`match[0:3]` 也等于 `match[i-4:i-1]`

所以只要 `match[3] == match[i-1]`，`abat` 就成了 `match[0:i]` 的一个新的最长公共前后缀。
::

#### 情形三：跳到头还不行 🛑

```text
match = a b a
next  = - 1 0 ?
              ↑
              i
```

`b` 字符 `next` 值为 0，跳到 0 下标处。`a != b`，已经无路可跳，直接确定 `next[i] = 0`。

### 代码实现

```cpp [next_array.cpp] icon=tabler:list-numbers
vector<int> next_array(const string& s, int n) {
    if (n == 1) return {-1};
    vector<int> next(n);
    next[0] = -1, next[1] = 0;
    for (int i = 2, pre = 0; i < n;) {
        if (s[i - 1] == s[pre])  next[i++] = ++pre;
        else if (pre > 0)        pre = next[pre];
        else                     next[i++] = 0;
    }
    return next;
}
```

### 代码逐行解释

::alert{type="info" title="变量含义"}
- `i`：当前要求解的下标，即正在求 `next[i]`
- `pre`：前一个用于比对的下标（情形一里的"7"，情形二跳转后的"3"）
::

三个分支对应三种情形：

::card-list
- **分支 1** `s[i-1] == s[pre]`：续上！`next[i++] = ++pre`
  - 前增 `pre`：`next[i] = pre + 1`
  - 后增 `i`：当前位置结算完毕，处理下一个
- **分支 2** `pre > 0`：跳一次！`pre = next[pre]`
  - `i` 不变，下一轮继续比对
- **分支 3** `pre == 0`：到头了！`next[i++] = 0`
::

::alert{type="warning" title="易错点"}
`next[i++] = ++pre` 中的**前增和后增**不能混淆：
- `++pre` 必须前增 → 因为 `next[i]` 要等于新的 `pre`
- `i++` 必须后增 → 因为当前轮次还要用 `i` 这个值
::

---

## 时空复杂度分析

### `next_array` 的时间复杂度推导

很多人疑惑：第二个分支 `pre = next[pre]` 不是回溯吗？会不会变成 $O(m^2)$？

::alert{type="question" title="均摊分析的小技巧"}
构造一个变量 $i - pre$，观察它在三个分支下如何变化：
::

::card-list
- **分支 1**：`i++, pre++` → `i - pre` **不变**
- **分支 2**：`i` 不变，`pre` 减小 → `i - pre` **增加**
- **分支 3**：`i++`, `pre` 不变 → `i - pre` **增加**
::

观察 $i + (i - pre)$：

| 分支 | $i$ | $i - pre$ | $i + (i - pre)$ |
| --- | :-: | :-: | :-: |
| 分支 1 | +1 | 0 | **+1** |
| 分支 2 | 0 | +(原 pre - next[pre]) | **+正数** |
| 分支 3 | +1 | 0 | **+1** |

→ $i + (i - pre)$ 是**严格递增**的，且上界为 $2m$。

所以循环总次数 $\le 2m$，**时间复杂度 $O(m)$**。✅

### 总复杂度

$$
\boxed{\text{时间复杂度} = O(n + m), \quad \text{空间复杂度} = O(m)}
$$

一般 `str` 长度远大于 `match`，即 $n \gg m$，所以可以近似为 **$O(n)$**。

---

## 完整代码实现

::tab{:tabs='["C++", "Java"]'}
#tab1
```cpp [kmp.cpp]
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int kmp(const string& str, const string& match);
vector<int> next_array(const string& s, int n);

int kmp(const string& str, const string& match) {
    int n = str.length(), m = match.length();
    vector<int> next = next_array(match, m);
    int i = 0, j = 0;
    while (i < n && j < m) {
        if (str[i] == match[j]) ++i, ++j;
        else if (j == 0) ++i;
        else j = next[j];
    }
    return j == m ? i - j : -1;
}

vector<int> next_array(const string& s, int n) {
    if (n == 1) return {-1};
    vector<int> next(n);
    next[0] = -1, next[1] = 0;
    for (int i = 2, pre = 0; i < n;) {
        if (s[i - 1] == s[pre]) next[i++] = ++pre;
        else if (pre > 0) pre = next[pre];
        else next[i++] = 0;
    }
    return next;
}

int main() {
    ios::sync_with_stdio(0);
    cin.tie(0);
    string str, match;
    getline(cin, str);
    getline(cin, match);
    int idx = kmp(str, match);
    if (idx == -1) {
        cout << "str 不存在子串 match" << '\n';
    } else {
        printf("str 第一次出现 match 串的下标: %d\n", idx);
    }
    return 0;
}
```

#tab2
```java [code01kmp.java]
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.IOException;

public class code01kmp {
    public static int[] DEFAULT_ARRAY = new int[]{-1, 0};

    public static int[] getNextArr(String s, int n) {
        if (n <= 2) {
            return DEFAULT_ARRAY;
        }
        int[] next = new int[n];
        next[0] = -1;
        next[1] = 0;
        for (int i = 2, pre = 0; i < n;) {
            if (s.charAt(i - 1) == s.charAt(pre)) next[i++] = ++pre;
            else if (pre > 0) pre = next[pre];
            else next[i++] = 0;
        }
        return next;
    }

    public static int KMP(String str, String match) {
        int n = str.length(), m = match.length();
        if (n < m) return -1;
        int[] next = getNextArr(match, m);
        int i, j;
        for (i = 0, j = 0; i < n && j < m;) {
            if (str.charAt(i) == match.charAt(j)) {
                i++;
                j++;
            } else if (j == 0) {
                ++i;
            } else {
                j = next[j];
            }
        }
        return j == m ? i - j : -1;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        PrintWriter out = new PrintWriter(new OutputStreamWriter(System.out));
        String str = in.readLine();
        String match = in.readLine();
        int idx = KMP(str, match);
        if (idx == -1) {
            out.println("str 不存在 match 子串");
        } else {
            out.printf("str 第一次出现 match 子串下标: %d \n", idx);
        }
        out.flush();
        out.close();
        in.close();
    }
}
```
::

---

## 总结 🎀

::alert{type="info" card title="三句话记住 KMP"}
#title
三句话记住 KMP

#default
1. **`next` 数组**记录了模式串每个位置的最长公共前后缀长度。
2. **匹配阶段**：失配时利用 `next` 跳转，已匹配的部分不再重比。
3. **预处理阶段**：求 `next` 本身也是用 `next` 加速，思想自洽。
::

::quote
最难的不是写出 KMP，而是理解为什么它是对的——理解了反证法那一步，KMP 就再也不会被忘记了。
::

---

## 结语

:blur[时隔一个月再次更新。]

怎么说呢？感觉自己爆更刻意写博客会写得很烂很水，偶尔写一次反倒挺不错的。

嗯，随缘更新吧——写一篇有质量的文章太难了，好难受。月更博主，加油读者朋友们。 :badge[共勉]{round}

希望这篇文章能帮助你理解 KMP 算法 💖 如有问题欢迎留言交流！

::meta-aside-foo{title="🌸 学习路径建议" card}
学完 KMP 之后可以继续看：

- **Z 函数**：另一种字符串匹配预处理
- **AC 自动机**：多模式串匹配（KMP + Trie）
- **后缀数组 / 后缀自动机**：更强大的字符串数据结构
::

```md wrap
KMP算法的原理和Coding思路
```
