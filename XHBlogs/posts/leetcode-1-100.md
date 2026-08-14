---
title: "Leetcode 1 - 100"
date: "2026-04-22 22:44:05"
description: "目前在刷 Leetcode 1 - 100，这里按题号记录思路、模板和一点做题时的直觉。"
tags: ["C++", "LeetCode", "算法", "技术"]
---

- 只写 C++
- 先记思路，再贴代码
- 先把 1 - 100 刷顺

::quote[先写题，再写清楚思路]

## 这页怎么记

- 语言只写 C++
- 每题只保留当前最顺手的一种做法
- 尽量记住触发这个做法的关键词，而不是死背代码

现在这页更像一本持续追加的题解手账。不是追求一题多解，也不是为了把每道题讲成教程，而是把当下最顺的思路钉下来，下次回来看一眼就能重新进入状态。

## 1. 两数之和

[题目链接](https://leetcode.cn/problems/two-sum/description/)  
关键词：哈希表 / 一次遍历 / 边走边查

这题的核心其实很直接：在遍历到当前位置 `j` 时，判断前面是否已经出现过 `target - nums[j]`。如果出现过，就说明答案已经形成；如果没有，就把当前值和下标记进哈希表，继续往后找。

也就是说，哈希表里存的是“我前面见过什么”，而不是“我现在要配谁”。这一点会自然导出正确的遍历顺序：必须先查，再存。因为题目要找的是两个不同位置的数，如果先把当前位置塞进去，就有机会把自己和自己错误配对。

因此这一题真正需要记住的，不是“要用哈希表”，而是“把查找历史信息这件事压进一次遍历里”。

通常不是哈希表本身，而是顺序。先查后存，才能保证找到的是前面已经出现过的那个数。

**复杂度**

- 时间 `O(n)`
- 空间 `O(n)`

```cpp [two-sum.cpp]
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        int n = nums.size();
        for (int j = 0; j < n; j++) {
            if (mp.count(target - nums[j])) {
                return {mp[target - nums[j]], j};
            }
            mp[nums[j]] = j;
        }
        return {};
    }
};
```

## 2. 两数相加

[题目链接](https://leetcode.cn/problems/add-two-numbers/description/)  
关键词：链表 / 模拟 / 虚拟头结点 / 进位

这题本质上就是把小学竖式加法搬到链表上。每一轮从 `l1`、`l2` 各取一位，再加上上一轮留下来的进位 `carry`，得到当前位的结果和下一轮的进位。

所以整个过程的关键不在于链表有多复杂，而在于状态是否维护完整。这里需要一路往后带着三个信息：当前结果链表接到哪里、当前两条输入链表走到哪里、当前还有没有进位。

一旦你接受这是一个“带状态的逐位模拟”问题，虚拟头结点就几乎是自然选择。它负责把结果链表的拼接过程变得稳定，不需要在每次新建节点时反复判断头结点是否为空。

最后循环条件也很重要：不是只要 `l1` 或 `l2` 没走完才继续，而是只要 `l1`、`l2`、`carry` 三者之一还没清空，循环就不能结束。

最容易漏的是最后一位进位。比如 `5 + 5` 这种情况，链表都走完了，但 `carry` 还没处理完，必须再补一个节点。

**复杂度**

- 时间 `O(max(m, n))`
- 空间 `O(max(m, n))`

```cpp [add-two-numbers.cpp]
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode dummy;
        ListNode* cur = &dummy;
        int carry = 0;
        while (l1 || l2 || carry) {
            int sum = carry;
            sum += l1 ? l1->val : 0;
            sum += l2 ? l2->val : 0;
            cur->next = new ListNode(sum % 10);
            cur = cur->next;
            carry = sum / 10;
            l1 = l1 ? l1->next : nullptr;
            l2 = l2 ? l2->next : nullptr;
        }
        return dummy.next;
    }
};
```

## 3. 无重复字符的最长子串

[题目链接](https://leetcode.cn/problems/longest-substring-without-repeating-characters/description/)  
关键词：滑动窗口 / 哈希表 / 左端点推进

这题的本质是维护一个始终“不含重复字符”的窗口。右端点 `r` 不断向右扩张，而左端点 `l` 只在窗口失去合法性的时候向前跳。

关键在于，左端点不是一点一点地挪，而是可以直接跳到重复字符上一次出现位置的下一位。因为一旦知道 `s[r]` 之前出现在哪里，那么在那个位置之前的所有起点都不可能让当前窗口重新合法，继续慢慢试没有意义。

于是问题就变成了两件事：用数组或哈希表记录每个字符最近一次出现的位置，以及在字符重复时，立刻把 `l` 更新到合法位置。

这一题很适合拿来理解滑动窗口里“窗口移动不是匀速”的感觉。右端点每次都前进一步，但左端点有时不动，有时直接跨一大段。

不是判断有没有重复，而是当重复发生时，左端点要跳到 `上一次出现位置 + 1`，并且这个位置还必须在当前窗口内部。

**复杂度**

- 时间 `O(n)`
- 空间 `O(字符集大小)`，这里按 ASCII 记

```cpp [longest-substring-without-repeating-characters.cpp]
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> mp(128, -1);
        int n = s.size();
        int ans = 0;
        for (int l = 0, r = 0; r < n; r++) {
            if (mp[s[r]] >= l) {
                l = mp[s[r]] + 1;
            }
            mp[s[r]] = r;
            ans = max(ans, r - l + 1);
        }
        return ans;
    }
};
```

## 4. 寻找两个正序数组的中位数

[题目链接](https://leetcode.cn/problems/median-of-two-sorted-arrays/description/)  
关键词：二分 / 划分数组 / 中位数

这题第一次看很唬人，但想通之后核心就一句话：在两个有序数组里，找到一对划分点 `i` 和 `j`，让左边总数等于右边，或者只多一个。

于是就有公式：

```text
i + j = (m + n + 1) / 2
```

有了这个式子，只要二分其中一个数组的划分点 `i`，另一个数组的 `j` 就跟着确定了。接下来要检查的是划分是否合法，也就是：

- `A[i - 1] <= B[j]`
- `B[j - 1] <= A[i]`

一旦这两个条件成立，说明中位数已经被我们夹在划分线附近了。剩下只是根据总长度奇偶，决定取左边最大值，还是左右中间值的平均数。

不是公式本身，而是边界。`i == 0`、`i == m`、`j == 0`、`j == n` 这些情况一定要单独兜住，不然二分很容易在数组边缘炸掉。

**复杂度**

- 时间 `O(log(min(m, n)))`
- 空间 `O(1)`

```cpp [median-of-two-sorted-arrays.cpp]
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) {
            return findMedianSortedArrays(nums2, nums1);
        }
        int m = nums1.size(), n = nums2.size();
        int l = 0, r = m;
        while (l <= r) {
            int i = l + ((r - l) >> 1);
            int j = (m + n + 1) / 2 - i;

            int a1 = i == 0 ? INT_MIN : nums1[i - 1];
            int a2 = i == m ? INT_MAX : nums1[i];
            int b1 = j == 0 ? INT_MIN : nums2[j - 1];
            int b2 = j == n ? INT_MAX : nums2[j];

            if (a1 <= b2 && b1 <= a2) {
                if ((m + n) % 2 == 0) {
                    return (max(a1, b1) + min(a2, b2)) / 2.0;
                } else {
                    return max(a1, b1) * 1.0;
                }
            } else if (a1 > b2) {
                r = i - 1;
            } else {
                l = i + 1;
            }
        }
        return 0.0;
    }
};
```

## 5. 最长回文子串

[题目链接](https://leetcode.cn/problems/longest-palindromic-substring/description/)  
关键词：中心扩展 / 奇偶讨论 / 回文半径

这题最顺手的做法是中心扩展。因为回文串的定义本身就带着对称性，所以不如直接枚举“回文中心”，再向两边扩展。

不过这里要同时考虑两种中心：

- 奇数长度回文，以 `(i, i)` 为中心
- 偶数长度回文，以 `(i, i + 1)` 为中心

对每个位置都分别做这两次扩展，就能得到以该位置为轴的最长回文长度。然后从中取更大的那个，用它去更新全局答案。

这一题真正需要记住的不是“回文怎么判”，而是扩展结束之后，如何从中心位置和回文长度反推出子串起点。这里用的是：

```text
start = i - (len - 1) / 2
```

其中 `len` 是当前中心能扩出的最长回文长度。这个式子同时兼容奇偶两种情况，所以写起来比较顺。

因为循环退出时，`l` 和 `r` 已经各自多走了一步，最后那一轮比较失败了，所以真实回文长度要把这多出来的两格扣掉。

**复杂度**

- 时间 `O(n^2)`
- 空间 `O(1)`

```cpp [longest-palindromic-substring.cpp]
class Solution {
public:
    int expand(const string& s, int l, int r) {
        int n = s.size();
        while (l >= 0 && r < n && s[l] == s[r]) {
            l--;
            r++;
        }
        return r - l - 1;
    }

    string longestPalindrome(string s) {
        int n = s.size();
        int start = 0, maxLen = 0;
        for (int i = 0; i < n; i++) {
            int len1 = expand(s, i, i);
            int len2 = expand(s, i, i + 1);
            int len = max(len1, len2);
            if (len > maxLen) {
                maxLen = len;
                start = i - (len - 1) / 2;
            }
        }
        return s.substr(start, maxLen);
    }
};
```

## 6. Z字形变换

[题目链接](https://leetcode.cn/problems/zigzag-conversion/description/)  
关键词：模拟 / 方向切换 / 按行收集

这题第一眼容易被题目里的“Z 字形”三个字吓住，但它本质上不是数学题，而是一个纯模拟问题。只要你接受“字符是按行来回走”的过程，后面就只是把过程还原出来。

比如 `PAYPALISHIRING` 在 `numRows = 3` 时，字符会在三行之间这样来回移动：

```text
P   A   H   N
A P L S I I G
Y   I   R

PAHNAPLSIIGYIR
```

如果把每个字符所在的行号单独写出来，就会发现它其实是在 `0 -> 1 -> 2 -> 1 -> 0` 之间循环折返。于是最直接的做法就是：

- 准备 `numRows` 个字符串
- 维护当前字符应该落在哪一行
- 维护当前方向是向下还是向上

每读到一个字符，就把它放进当前行；当走到最顶行或最底行时，切换方向。等所有字符都处理完，再把每一行按顺序拼接起来，就是最终答案。

这题真正值得记住的是“方向切换发生在边界”，而不是去死记某个下标规律。

当 `numRows <= 1` 时只有一行，或者当 `numRows >= s.size()` 时还没来得及折返就已经放完了，顺序都不会变化。

**复杂度**

- 时间 `O(n)`
- 空间 `O(n)`

```cpp [zigzag-conversion.cpp]
class Solution {
public:
    string convert(string s, int numRows) {
        int& n = numRows;
        if (n <= 1 || n >= s.size()) return s;
        vector<string> rows(n);
        int row = 0;
        int dir = -1;
        for (char c : s) {
            rows[row] += c;
            if (row == 0 || row == n - 1) dir = -dir;
            row += dir;
        }
        string ans;
        for (auto& line : rows) {
            ans += move(line);
        }
        return ans;
    }
};
```

## 9. 回文数

[题目链接](https://leetcode.cn/problems/palindrome-number/description/)  
关键词：反转一半 / 边界过滤 / 整数回文

这题如果把整数整个反转出来，再去和原数比较，思路当然能走通，但很容易碰到溢出问题。比如接近 `INT_MAX` 的数字，一旦完整反转，结果就可能超界。

更顺手的办法是只反转一半数字。因为回文的左右两侧本来就是镜像关系，只要把后半段反转出来，再和前半段比较就够了。

这个思路要先做一轮边界过滤：

- 负数不可能是回文
- 末位是 `0` 但本身又不是 `0` 的数也不可能是回文，因为整数最高位不能是前导零

之后就不断把原数的末位搬到 `rev` 上，直到原数前半段长度不再大于反转后的后半段。最后分奇偶讨论：

- 偶数位时，前后两半应该完全相等
- 奇数位时，反转出来的那一半会多带一个中间位，所以比较 `x == rev / 10`

这题真正漂亮的地方就在于，它把“完整反转”这个危险动作缩成了“只反转一半”。

因为我们只需要把后半段反转出来。一旦 `rev` 的位数追上甚至超过 `x`，说明一半已经处理完了，再继续就不是“反转一半”了。

**复杂度**

- 时间 `O(log10(x))`
- 空间 `O(1)`

```cpp [palindrome-number.cpp]
class Solution {
public:
    bool isPalindrome(int x) {
        if (x == 0) return true;
        if (x < 0 || x % 10 == 0) return false;
        int rev = 0;
        while (x > rev) {
            rev = rev * 10 + x % 10;
            x /= 10;
        }
        return x == rev || x == rev / 10;
    }
};
```

## 15. 三数之和

[题目链接](https://leetcode.cn/problems/3sum/description/)  
关键词：排序 / 双指针 / 去重 / 固定一个数

这题的标准思路是先排序，再固定第一个数 `nums[i]`，把后面的区间当成一个两数之和问题来做。因为数组已经有序，所以剩下两个数可以用双指针从两端往中间逼近。

核心不只是“双指针”，而是“排序之后去重会变得很自然”：

- `i` 和前一个位置相同，就跳过，避免重复枚举第一位
- 找到一组答案后，`l` 和 `r` 也都要跨过重复值，避免重复收集答案

这题真正要记住的是：排序把“去重”和“调指针”这两件事同时变简单了。

因为不排序的话，你很难一边移动指针一边判断该往哪边走，也很难优雅地去重。排序是这题的结构前提。

**复杂度**

- 时间 `O(n^2)`
- 空间 `O(1)`，不算答案

```cpp [three-sum.cpp]
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        int n = nums.size();
        if (n < 3) return {};
        sort(nums.begin(), nums.end());
        vector<vector<int>> ans;
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            for (int l = i + 1, r = n - 1; l < r;) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum == 0) {
                    ans.push_back({nums[i], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++, r--;
                } else if (sum > 0) {
                    r--;
                } else {
                    l++;
                }
            }
        }
        return ans;
    }
};
```

## 16. 最接近的三数之和

[题目链接](https://leetcode.cn/problems/3sum-closest/description/)  
关键词：排序 / 双指针 / 维护最优答案

这题和三数之和的骨架几乎一样，也是先排序，再固定第一个数，然后用双指针去找后面两个数。不同点在于，这题不是找“刚好等于某个值”的所有组合，而是维护一个“当前最接近 target 的答案”。

所以每次算出 `sum` 之后，都要先检查它和 `target` 的距离是不是更小。如果更小，就更新答案。之后再根据 `sum` 和 `target` 的大小关系去移动指针：

- `sum > target`，右指针左移
- `sum < target`，左指针右移
- `sum == target`，可以直接返回，因为已经不可能比它更接近了

这题的重点不是去重，而是“每次移动指针前先更新当前最优值”。

因为只有排序后，双指针移动才有方向感。你才能根据当前和偏大还是偏小，决定该动左边还是右边。

**复杂度**

- 时间 `O(n^2)`
- 空间 `O(1)`

```cpp [three-sum-closest.cpp]
class Solution {
public:
    int threeSumClosest(vector<int>& nums, int target) {
        int n = nums.size();
        sort(nums.begin(), nums.end());
        int ans = nums[0] + nums[1] + nums[2];
        for (int i = 0; i < n - 2; i++) {
            for (int l = i + 1, r = n - 1; l < r;) {
                int sum = nums[i] + nums[l] + nums[r];
                if (abs(sum - target) < abs(ans - target)) {
                    ans = sum;
                }
                if (sum == target) {
                    return ans;
                } else if (sum > target) {
                    r--;
                } else {
                    l++;
                }
            }
        }
        return ans;
    }
};
```

## 17. 电话号码的字母组合

[题目链接](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/description/)  
关键词：回溯 / 递归 / 路径构造

这题很适合拿来建立对回溯的第一印象。输入是一个数字串，比如 `"23"`，其中：

- `2 -> abc`
- `3 -> def`

也就是说，每一位数字都提供一组选项，而我们要枚举所有可能的拼接结果。这个结构天然就是一棵搜索树：当前位置选一个字符，递归处理下一位；回到上一层后撤销这次选择，再试另一个字符。

所以这题真正的模型是“路径枚举”：

- `path` 记录当前已经选了什么
- `i` 表示当前处理到第几位数字
- 当 `i == digits.size()` 时，说明一条完整路径已经形成，可以收进答案

这是最典型的“进入分支 -> 做选择 -> 递归 -> 撤销选择”。

因为我们要的是全部组合，而不是某个最优值。每一位数字都会分出多条独立分支，这更像遍历搜索树，而不是复用子问题答案。

**复杂度**

- 时间 `O(3^n * n)` 到 `O(4^n * n)`，取决于数字里有多少个 `7` 和 `9`
- 空间 `O(n)`，不算答案

```cpp [letter-combinations-of-a-phone-number.cpp]
class Solution {
public:
    vector<string> mp = {
        "", "", "abc", "def", "ghi", "jkl",
        "mno", "pqrs", "tuv", "wxyz"
    };
    vector<string> ans;
    string path;

    void dfs(const string& digits, int i) {
        if (i == digits.size()) {
            ans.push_back(path);
            return;
        }
        for (char c : mp[digits[i] - '0']) {
            path.push_back(c);
            dfs(digits, i + 1);
            path.pop_back();
        }
    }

    vector<string> letterCombinations(string digits) {
        if (digits.empty()) return {};
        dfs(digits, 0);
        return ans;
    }
};
```

## 28. 找出字符串中第一个匹配项的下标

[题目链接](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/description/)  
关键词：KMP / next 数组 / 模式串匹配

这题当然可以用暴力匹配，但它更像是一个练 KMP 的入口题。KMP 的关键点不在于“记住代码”，而在于理解为什么失配之后不用把模式串整个退回去。

核心思想是：模式串自己身上也有重复结构。失配时，可以利用 `next` 数组，把模式串直接跳到“仍然可能匹配”的位置，而不是从头开始。

所以整套过程分成两步：

- 先根据模式串 `needle` 构造 `next` 数组
- 再用 `next` 数组加速匹配主串 `haystack`

这题最值得记住的是：求 `next` 和做匹配，本质上都是“当前位置失配后，看看还能退到哪里继续比较”。

通常不是主匹配过程，而是 `next` 数组的定义和下标细节。只要把 `next[j]` 表示的含义想清楚，后面代码会顺很多。

**复杂度**

- 时间 `O(m + n)`
- 空间 `O(n)`

```cpp [find-the-index-of-the-first-occurrence-in-a-string.cpp]
class Solution {
public:
    int strStr(string haystack, string needle) {
        int m = haystack.size(), n = needle.size();
        if (n == 0) return 0;
        vector<int> next(n, 0);
        next[0] = -1;
        for (int j = 2, cn = 0; j < n;) {
            if (needle[j - 1] == needle[cn]) {
                next[j++] = ++cn;
            } else if (cn > 0) {
                cn = next[cn];
            } else {
                j++;
            }
        }
        int i = 0, j = 0;
        while (i < m && j < n) {
            if (haystack[i] == needle[j]) {
                i++, j++;
            } else if (j > 0) {
                j = next[j];
            } else {
                i++;
            }
        }
        return j == n ? i - j : -1;
    }
};
```

## 31. 下一个排列

[题目链接](https://leetcode.cn/problems/next-permutation/description/)  
关键词：找规律 / 从右往左 / 交换 + 反转

这题最适合先拿一个例子看规律。比如：

```text
1 2 3 4
1 2 4 3
1 3 2 4
1 3 4 2
```

从 `1 2 4 3` 到 `1 3 2 4`，本质上发生了两件事：

- 从右往左找到第一个“还能变大一点”的位置
- 把这个位置换成右边刚好比它大的那个数，再把后缀重置成最小顺序

具体做法是：

- 从右往左找第一个满足 `nums[i] < nums[i + 1]` 的位置 `i`
- 再从右往左找第一个大于 `nums[i]` 的位置 `j`
- 交换 `nums[i]` 和 `nums[j]`
- 最后反转 `i + 1` 之后的区间

如果第一步根本找不到这样的 `i`，说明整个数组已经是降序，那么它的下一个排列就是最小排列，也就是整段反转。

因为从右往左找到断点时，右侧本来就是降序的。交换之后，只要把这段降序后缀反转成升序，它就是最小的合法后缀。

**复杂度**

- 时间 `O(n)`
- 空间 `O(1)`

```cpp [next-permutation.cpp]
class Solution {
public:
    void nextPermutation(vector<int>& nums) {
        int n = nums.size();
        int i = n - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) {
            i--;
        }
        if (i >= 0) {
            int j = n - 1;
            while (j >= 0 && nums[j] <= nums[i]) {
                j--;
            }
            swap(nums[i], nums[j]);
        }
        reverse(nums.begin() + i + 1, nums.end());
    }
};
```

## 32. 最长有效括号

[题目链接](https://leetcode.cn/problems/longest-valid-parentheses/description/)  
关键词：一维动态规划 / 括号匹配 / 向左追溯

这题很容易想到暴力枚举所有子串，但更顺的写法是一维动态规划。定义 `dp[i]` 表示“以 `s[i]` 结尾的最长有效括号长度”。

这个定义有两个好处：

- 如果 `s[i] == '('`，那它不可能作为合法括号串结尾，`dp[i] = 0`
- 如果 `s[i] == ')'`，就去看它能不能和前面的某个 `'('` 配对

关键位置是：

```text
p = i - dp[i - 1] - 1
```

这里 `dp[i - 1]` 代表前面已经配好的那一段长度，所以 `p` 就是“当前这个右括号理论上要去找的那个左括号”。如果 `p >= 0` 且 `s[p] == '('`，那就说明当前位置又能新配出一对，并且还可能和 `p - 1` 之前的有效括号串接起来。

这题真正漂亮的地方在于：它不是直接匹配括号，而是借助前一个状态，把需要回看的位置一步算出来。

因为这样当前状态只依赖左边已经算好的结果，转移会非常自然。否则你会很难确定该从哪里往前接。

**复杂度**

- 时间 `O(n)`
- 空间 `O(n)`

```cpp [longest-valid-parentheses.cpp]
class Solution {
public:
    int longestValidParentheses(string s) {
        int n = s.size();
        if (n == 0) return 0;
        vector<int> dp(n, 0);
        int ans = 0;
        for (int i = 1; i < n; i++) {
            if (s[i] == '(') continue;
            int p = i - dp[i - 1] - 1;
            if (p >= 0 && s[p] == '(') {
                dp[i] = dp[i - 1] + 2 + (p > 0 ? dp[p - 1] : 0);
                ans = max(ans, dp[i]);
            }
        }
        return ans;
    }
};
```

## 43. 接雨水

[题目链接](https://leetcode.cn/problems/trapping-rain-water/description/)  
关键词：双指针 / 左右最大值 / 按较短板结算

这题是双指针的经典题。

`0` 和 `n - 1` 位置本身接不了雨水，真正能结算的是中间位置。某个位置能接多少雨水，取决于它左边最高柱子和右边最高柱子里更矮的那个：

```text
min(leftMax, rightMax) - height[i]
```

可以用前后缀数组做，也可以用单调栈做，但双指针是这里更顺手的写法。维护两个指针 `l`、`r` 和两边的最高值 `leftMax`、`rightMax`：

- 如果 `leftMax <= rightMax`，说明当前位置 `l` 的水量已经能确定，直接结算并右移
- 反过来就结算 `r`

也就是说，这题真正要记住的是“谁矮先算谁”。

总之我的体感排序是：双指针 > 单调栈 / 双数组前后缀 > 暴力。

**复杂度**

- 时间 `O(n)`
- 空间 `O(1)`

```cpp [trapping-rain-water.cpp]
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        int l = 1, r = n - 1;
        int leftMax = height[0], rightMax = height[n - 1];
        int ans = 0;
        while (l <= r) {
            if (leftMax <= rightMax) {
                leftMax = max(leftMax, height[l]);
                ans += leftMax - height[l];
                l++;
            } else {
                rightMax = max(rightMax, height[r]);
                ans += rightMax - height[r];
                r--;
            }
        }
        return ans;
    }
};
```

## 78. 子集

[题目链接](https://leetcode.cn/problems/subsets/description/)  
关键词：回溯 / 选或不选 / 二叉决策树

子集问题是回溯里最基础的一类。对每个位置来说，本质上只有两个选择：

- 选当前元素
- 不选当前元素

所以整棵搜索树天然就是一棵二叉树。走到叶子节点时，当前路径 `path` 就代表一个完整子集，可以收进答案。

这题最适合拿来理解“回溯不一定是在排列组合里乱跳，它也可以只是很朴素地做二叉决策”。

因为这套写法把“每个位置选还是不选”都当成必须做完的决策。只有当所有位置都处理完，当前路径才对应一个完整子集。

**复杂度**

- 时间 `O(2^n * n)`
- 空间 `O(n)`，不算答案

```cpp [subsets.cpp]
class Solution {
public:
    vector<vector<int>> ans;
    vector<int> path;

    void dfs(vector<int>& nums, int i) {
        if (i == nums.size()) {
            ans.push_back(path);
            return;
        }
        path.push_back(nums[i]);
        dfs(nums, i + 1);
        path.pop_back();
        dfs(nums, i + 1);
    }

    vector<vector<int>> subsets(vector<int>& nums) {
        dfs(nums, 0);
        return ans;
    }
};
```

## 90. 子集II

[题目链接](https://leetcode.cn/problems/subsets-ii/description/)  
关键词：回溯 / 排序去重 / 枚举下一个选谁

这题和 78. 子集 很像，但多了一个“数组里允许重复元素”的条件，所以重点从“怎么枚举”变成了“怎么避免重复答案”。

更顺手的写法不是“选或不选”，而是“当前层从哪个位置开始，枚举下一个选谁”。在这种视角下：

- 搜索树上的每个节点都代表一个合法子集
- 所以进入 `dfs` 的一开始就可以收集当前路径
- 排序之后，如果同一层里遇到相同元素，就跳过后面的重复值

因为我们只想跳过“同一层的重复选择”，不能把不同层里本来合法的相同数字也一起跳掉。

**复杂度**

- 时间 `O(2^n * n)`
- 空间 `O(n)`，不算答案

```cpp [subsets-ii.cpp]
class Solution {
public:
    vector<vector<int>> ans;
    vector<int> path;

    void dfs(vector<int>& nums, int start) {
        ans.push_back(path);
        for (int i = start; i < nums.size(); i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;
            path.push_back(nums[i]);
            dfs(nums, i + 1);
            path.pop_back();
        }
    }

    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        dfs(nums, 0);
        return ans;
    }
};
```

## 93. 复原IP地址

[题目链接](https://leetcode.cn/problems/restore-ip-addresses/description/)  
关键词：回溯 / 分段枚举 / 合法性检查

这题本质上是在字符串里切三刀，把它分成四段。每一段都必须满足 IPv4 的要求：

- 长度在 `1 ~ 3`
- 数值在 `0 ~ 255`
- 不能有前导零，比如 `"01"` 不合法

所以最自然的做法就是回溯：每次从当前位置切出 `1 ~ 3` 个字符，判断这一段是否合法；如果合法，就加入路径并继续处理下一段。等收集到 4 段且刚好把字符串用完时，就得到一个合法答案。

这题很适合练“回溯不是瞎搜，而是边搜边剪枝”。只要当前段不合法，就立刻停，不必继续往下递归。

最值钱的剪枝通常是前导零和大于 255。因为这两类一旦出现，继续往下扩已经没有意义了。

**复杂度**

- 时间 `O(3^4)`
- 空间 `O(4)`，不算答案

```cpp [restore_ip_address.cpp]
class Solution {
public:
    vector<string> ans;
    vector<string> path;
    vector<string> restoreIpAddresses(string s) {
        if(s.size() < 4 || s.size() > 12) return {};
        dfs(s, 0);
        return ans;
    }
    void dfs(const string& s,int i) {
        if(path.size() == 4) {
            if(s.size() == i) {
                ans.push_back(path[0]+"."+path[1]+"."+path[2]+"."+path[3]);
            }
            return;
        }
        for(int len=1;len<=3;len++) {
            if(i+len > s.size()) break; // 越界了
            string seg = s.substr(i, len);
            if(seg.size() > 1 && seg[0] == '0') continue; // 前导0
            int num = 0;
            for(int j=0;j<seg.size();j++) {
                num = num * 10 + (seg[j] - '0');
            }
            if (num > 255) continue; // 超过范围了

            path.push_back(seg);
            dfs(s, i+len);
            path.pop_back();
        }
    }
};
```

## 暂时写到这里

这一页现在还是边刷边记的状态，先把最常写的题和最顺手的解法沉淀下来。后面继续往下补时，我会尽量把每题都整理成同一套节奏。

```md wrap
谢谢 Leetcode。写题的时候像机器，整理的时候才发现自己到底会了没有。
```
