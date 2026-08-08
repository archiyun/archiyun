---
title: 二叉树遍历专题：递归与非递归
description: 老文章搬运 leetcode：二叉树先序/中序/后序遍历的递归与非递归写法，层序遍历的四种解法、ZigZag 遍历，以及最大宽度、最大深度、最小深度等经典练习题。
date: 2024-11-29
updated: 2024-11-29
categories: [开发]
tags: [Java, 二叉树, 力扣, LeetCode, 遍历, 算法]
type: tech
aside: [toc, meta-aside-track]
---

::meta-aside-track{title="本文重点" card}

- 先序/中序/后序：递归与非递归（栈模拟）写法
- 层序遍历：哈希表、按层处理、静态数组队列三种优化
- ZigZag 遍历：双端队列与静态数组双端队列
- 经典题：最大宽度、最大深度、最小深度
::

## 前言



本篇二叉树专题，读者应该具备一定的数据结构和算法能力。

> 1. 刷题网站：洛谷、leetcode、牛客网。网站链接自寻！
> 2. 参考：《程序员代码面试指南》& 代码随想录。每道题后我都会附带链接，代码会上传到 GitHub 上。
> 3. 基础部分简略（任意教材都能找到的内容，初学者都会的内容）；进阶部分有一定思考难度和 coding 挑战；拓展部分学得更加有深度。上难度的平衡树有序表（treap、splay、红黑树这些）基本不会涉及。
> 4. 编程语言：笔者热爱 **Java**，Java 为主，目前该模块并没有提供其它语言版本。——借助 **chatgpt** 转换成自己的语言吧！
> 5. **IDE：Intellij IDEA。主题：MonoKai pro；字体：Fira code light。**
> 6. 容器和算法技巧：栈、队列、哈希表、数组；递归、分治，对于部分可以使用动态规划的题也会提供解释。读者应当可以用数组手搓栈和队列结构。

**提示**：

- 题目通过 000~999 进行编号，不过网站暂未提供目录结构无法快速寻找相关题目（不好意思）🥲。
- 标题可以点击跳转页面。每道题都配有相关链接。函数题一般是 leetcode，acm 风格是牛客和洛谷的。处理输入输出的题的类里多数有 main 函数可以自行运行测试。
- 每道题都可以 ctrl + c、ctrl + v 提交。**注意：修改类名、函数名，不要提交无关的类。**
- 思考和 coding，而不是注重题量和速度哦。😘

## Coding[基础] 力扣经典三问：递归以及非递归版本三序遍历

### 001 [先序遍历-递归版](https://leetcode.cn/problems/binary-tree-preorder-traversal/description/)

**基础回顾：先序遍历（前序遍历）：对于树及其子树始终遵循 根 > 左 > 右 的优先级顺序。**

```java
// 辅助 preorderTraversalRec 的方法
private void f(TreeNode head, List<Integer> list){
    if(head != null){
        list.add(head.val);
        f(head.left, list);
        f(head.right, list);
    }
}
// 主方法, 修改函数名->preorderTraversal
public List<Integer> preorderTraversal(TreeNode head){
    List<Integer> list = new ArrayList<>();
    f(head, list);
    return list;
}
```

从递归来看，这道题可以理解为**根节点 + 左子树先序生成的列表 + 右子树先序生成的列表**。于是有了第二种更好看的递归写法。
由于这里列表相加，Java 中调用了 `addAll` 方法。

```java
/**
 * 修改函数名->preorderTraversal
 * 由于递归，函数体内部代码也要调整。
 */
public List<Integer> preorderTraversalRec1(TreeNode head){
    List<Integer> list = new ArrayList<>();
    if(head != null) {
        list.add(head.val);
        list.addAll(preorderTraversalRec1(head.left));
        list.addAll(preorderTraversalRec1(head.right));
    }
    return list;
}
```

### 002 [中序遍历-递归版](https://leetcode.cn/problems/binary-tree-inorder-traversal/description/)

**基础回顾：中序遍历：对于树及其子树始终遵循 左 > 根 > 右 的优先级顺序。**

```java
// 辅助 inorderTraversalRec 的方法
private void f2(TreeNode head, List<Integer> list){
    if(head != null){
        f2(head.left, list);
        list.add(head.val);
        f2(head.right, list);
    }
}
// 主方法  修改函数名->inorderTraversal
public List<Integer> inorderTraversalRec(TreeNode head){
    List<Integer> list = new ArrayList<>();
    f2(head, list);
    return list;
}
```

从递归来看，这道题可以理解为**左子树先序生成的列表 + 根节点 + 右子树先序生成的列表**，同先序遍历起仅仅挪动一下位置。

```java
/**
 * 修改函数名->inorderTraversal
 * 由于递归，函数体内部代码也要调整。
 */
public List<Integer> inorderTraversalRec1(TreeNode head){
    List<Integer> list = new ArrayList<>();
    if(head != null) {
        list.addAll(inorderTraversalRec1(head.left));
        list.add(head.val);
        list.addAll(inorderTraversalRec1(head.right));
    }
    return list;
}
```

### 003 [后序遍历-递归版](https://leetcode.cn/problems/binary-tree-postorder-traversal/description/)

**基础回顾：后序遍历：对于树及其子树始终遵循 左 > 右 > 根 的优先级顺序。**

```java
// 辅助方法
private void f3(TreeNode head, List<Integer> list){
    if(head != null){
        f3(head.left, list);
        f3(head.right, list);
        list.add(head.val);
    }
}
// 主方法  修改函数名->postorderTraversal
public List<Integer> postorderTraversalRec(TreeNode head){
    List<Integer> list = new ArrayList<>();
    f3(head, list);
    return list;
}
```

思想与上述一致，只是改变一下顺序。

```java
/**
 * 修改函数名->postorderTraversal
 * 由于递归，函数体内部代码也要调整。
 */
public List<Integer> postorderTraversalRec1(TreeNode head){
    List<Integer> list = new ArrayList<>();
    if(head != null){
        list.addAll(postorderTraversalRec1(head.left));
        list.addAll(postorderTraversalRec1(head.right));
        list.add(head.val);
    }
    return list;
}
```

### 004 [先序遍历-非递归](https://leetcode.cn/problems/binary-tree-preorder-traversal/description/)

所有递归的方法都可以改成迭代的形式，区别在于递归是通过系统栈的方式，系统栈中存储信息。而迭代是通过我们手动压栈的方式，一般的递归方法都可以用栈很好模拟实现，因为本质是一回事，不过函数栈隐藏了细节，一般来说递归更加直白易懂，而栈模拟的迭代方式有点"恶心"了。

先序的处理方式：

1. 处理根节点。
2. 尽可能深的处理左子树。
3. 左子树必须处理完后，再继续处理右子树。
4. 以上规则适用任意整棵树及其子树。

算法流程：

1. 申请一个栈（Java 内置栈或者全局静态数组手写栈），将当前树的根节点压入栈中。
2. 然后弹栈将弹出节点保存在变量 cur 中，**处理节点 cur**。**先压右子树再压左子树（节点存在就压栈！！）**。
3. 重复 2 的过程，直到栈空了，结束。

合理性：
左树优先右树，左树不处理完不能处理右树。
**先压右，再压左。栈的后进先出特性！左被优先处理，左树被处理又会带来新的左右节点（如果存在），那么循环这个过程。直到左树处理干净，然后处理右树（也是这套逻辑）。**

`代码`

```java
// 提交修改函数名 ->preorderTraversal
public List<Integer> preorderTraversalUnRec(TreeNode head) {
    List<Integer> list= new ArrayList<>();
    if(head != null){
        //申请一个栈
        Stack<TreeNode> stack = new Stack<>();
        //先压根节点
        stack.push(head);
        while(!stack.isEmpty()){
            //弹栈处理(加入列表)，这里复用变量head.
            head = stack.pop();
            list.add(head.val);

            //先压右子树（如果存在）
            if(head.right != null){
                stack.push(head.right);
            }
            //后压左子树（如果存在）
            if(head.left != null){
                stack.push(head.left);
            }
        }
    }
    //返回结果。
    return list;
}
```

### 005 [中序遍历-非递归](https://leetcode.cn/problems/binary-tree-inorder-traversal/description/)

如果没阅读，优先看 `004` 前面的几段话。

中序的处理方式：

1. 尽可能深的往左边界走，直到走尽（不能继续 `.left` 走了）。
2. 回退到上一个节点（这个节点没有左子树或者左子树被访问过了），那么处理这个根节点。然后尝试向右走。
3. 以上规则适用任意整棵树及其子树。

算法流程：

1. 申请一个栈（Java 内置栈或者全局静态数组手写栈），**cur 记录 head 节点，然后遍历开始**。
2. cur 沿着"左边界"路径一直走，收集节点到栈中。直到 cur 为 null。
3. 栈中弹出一个节点（cur 回退到上一个且没处理的节点），处理它。尝试往右走 `cur = cur.right`。
4. 重复 2 的过程，直到 cur 往右走为 null 并且不能通过栈找到上一个到达但未处理的节点。**人话：循环终止条件栈为空且 cur 也为空。**

`代码`：

```java
// 非递归中序版本: 提交修改函数名->inorderTraversal
public List<Integer> inorderTraversalUnRec(TreeNode head) {
    List<Integer> list = new ArrayList<>();
    if(head != null){
        //申请一个栈
       var stack = new Stack<TreeNode>();
       //cur: 遍历二叉树,初始化为head
       var cur = head;
       //循环条件 栈不为空或者cur不为null
       while(!stack.isEmpty() || cur != null){
           if(cur != null){
               //算法流程步骤2

               //压栈
               stack.push(cur);
               //继续往左走，不到尽头不回头。
               cur = cur.left;
           }
           else{
               //算法流程步骤3

               //弹栈
               cur = stack.pop();
               //处理（加入列表）
               list.add(cur.val);
               //尝试往右走。
               cur = cur.right;
           }
       }
    }
    return list;
}
```

### 006 [后序遍历-非递归](https://leetcode.cn/problems/binary-tree-postorder-traversal/description/)

如果没阅读，优先看 `004` 前面的几段话。

本题说明两种解法。

#### 解法一：双栈实现

解法一必须先了解 `004` 思路。

后序双栈实现分析：
先序遍历非递归实现，通过处理当前节点，然后先压右树后压左树。
借此，实现 *根 > 左 > 右* 的顺序。
对比后序遍历，*左 > 右 > 根* 的优先级。观察一下，发现根在最后，逆置一下，*根 > 右 > 左*。
！*根 > 右 > 左* 很好实现。只需要改造一下先序遍历的处理方式：
**先压左树后压右树**。怎么逆置呢？用一个栈！在处理的时候不处理而是收集起来，然后统一处理而且整体输出与输入完全逆序了。

算法流程：

1. 申请两个栈（Java 内置或者全局静态数组实现栈），一个栈 stack 同先序遍历一样（根节点入栈），另一个栈 collect 用收集代替处理这一步。
2. 弹栈将弹出节点保存在变量 cur 中，**将 cur 收集起来（cur 压入 collect）！** **先压左树后压右子树（如果存在）。**
3. 重复 2 的过程直到栈为空。
4. 输出收集栈 collect，按输出顺序处理。

```java
// 双栈迭代实现后序遍历 函数名->postorderTraversal
public List<Integer> postorderTraversalTwoStacks(TreeNode head) {
    List<Integer> list = new ArrayList<>();
    if(head != null) {
        //步骤1:申请两个栈, 一个常规栈stack 另一收集栈collect
       var stack = new Stack<TreeNode>();
       var collect = new Stack<TreeNode>();
       //步骤1：根节点入栈
        stack.push(head);

        //步骤3:循环步骤2，直到栈stack为空。
        while(!stack.isEmpty()){
            //步骤2:弹栈，复用head
            head = stack.pop();
            //步骤2: 收集栈收集节点(替代常规处理)
            collect.push(head);

            //步骤2:先压左子树后压右子树
            if(head.left != null){
                stack.push(head.left);
            }

            if(head.right != null){
                stack.push(head.right);
            }
        }

        //步骤4:逆序输出处理收集栈
        while(!collect.isEmpty()){
            list.add(collect.pop().val);
        }
    }
    //返回结果
    return list;
}
```

#### 解法二：单栈实现（优于解法一）🫡

能否少用一个栈呢？先序遍历、中序遍历都用一个栈，后序用两个栈是不是太没排面了。

我们采用问答式和"一个可重复利用的标志"来说明算法流程。
想象一下，张三当前在最初的家中（假设村落里邻里分布可以认为一种二叉树结构，张三家正好在村落的根节点处），张三是个路痴，他要按照后序遍历依次拜访他的邻居们最后回到自己的家中。现在我要帮助他找到正确的顺序。

张三提问：

> 1. 旁白：张三肯定不能直接上来回到他家中（因为后序遍历的特点）。
> 2. 张三：我该前往哪个节点拜访邻居呢？左或者右？为什么？
> 3. 我：如果你左节点有邻居存在的话，那么你应该优先前往左节点处。否则，应该去右节点处。
> 4. 张三：好的，我应该一直向左走。现在我走到最左的地方了。现在我拜访结束了。
> 5. 旁白：张三应该回退到上一个位置了。好在，张三用了记号（栈）记录了上一次的位置邻居家。现在，它可以顺利返回上一个位置了。
> 6. 张三：现在我不应该拜访这个邻居，我应该尝试拜访我的右邻居们。不对，按照"你"先前的说法（第 3 条对话），我应该继续拜访我的左邻居，但我已经拜访过了。
> 7. 我：好的，我得更正一下。如果你左节点有邻居存在的话且你没有访问过，你应该访问左节点。
> 8. 张三：如何知道访问过呢？
> 9. 我：做个标志（pre）就好了呀。甚至可以只做一个标志，你看，如果我把这个标志记录左节点，那么张三你不应该前往左节点。如果，这个标志记录右节点了，那么你同样不应该前往左节点。因为左比右先到。
> 10. 张三：我似乎好像明白怎么避免重复访问我的右节点邻居了。一方面，我得看右节点有无我的邻居们，还有我应该看是否标记了右节点。否则，我就应该前往右节点。
> 11. 我：对！你做了记号可以随时返回。又有了一个重复利用的标志避免了重复访问。

看了这段挺尴尬的对话。
张三做的记号就是栈，标志就是上次处理的节点。

算法流程：

1. 申请一个栈（Java 内置栈或者全局静态数组手写栈），将根节点压入栈中。声明一个 pre 节点记录上次处理的节点，初始化为 null。cur 从 head 出发。
2. 如果当前节点 cur 的左子树不为空，并且 pre 节点没有标记当前节点 cur 的左子树和右子树。那么前往左子树。
3. 如果 2 不成立，尝试前往右子树。如果右子树不为 null，且 pre 没有标记当前节点 cur 的右子树。那么前往右子树。
4. 若 3 不成立（2 也不成立），处理当前节点 cur。其后，pre 标记这个节点 `pre = cur`，然后弹栈回退到上一处。
5. 重复对 2、3、4 的判断。直到栈 stack 为空，结束。

> 可以这样理解，cur 处理的始终是"叶节点"，处理完 cur 就把 cur 从整颗树中删除了只不过是"伪删除"，pre 这个记录上一次到达的节点就充当了伪删除的作用。这里的"叶节点"是伪删除角度的视角。

`代码`

```java
// 单栈迭代实现后序遍历 函数名->postorderTraversal
public List<Integer> postorderTraversalOneStack(TreeNode head){
    List<Integer> list = new ArrayList<>();
    if(head != null){
        //步骤1:申请栈
        var stack = new Stack<TreeNode>();
        // 这里复用了head作为pre, 当head经历步骤4之后表示上次处理的节点，否则是整棵树的根节点。
        stack.push(head);
        TreeNode cur = head;
        //步骤5：循环判断步骤2,3,4->栈为空。
        while(!stack.isEmpty()){
            cur = stack.peek();
            //步骤2 条件判断: 左不为空，且左右都未访问过。进入左子树
            if(cur.left != null && head != cur.left && head != cur.right){
                stack.push(cur.left);
            }
            //步骤3 条件判断: 右不为空，且右节点未访问过。进入右子树
            else if(cur.right != null && head != cur.right){
                stack.push(cur.right);
            }
            else{
                //步骤4

                //处理当前节点
                list.add(cur.val);
                //标记上次处理的节点
                head = cur;
                //弹栈
                stack.pop();
            }
        }
    }
    return list;
}
```

### 007 001~006 时间复杂度总结和唠嗑

前面 6 道题（实则 3 道题 7 种写法）手搓完了吗？
无论是递归还是非递归：
时间复杂度：$O(n)$，因为要遍历所有的节点数。
空间复杂度：$O(h)$，h 是递归深度和栈的最大长度。后序遍历的解法一双栈实现空间复杂度：$O(n)$，额外多了一个收集栈要收集所有的节点数。

1. 有没有优化空间的算法？能做到 $O(1)$？
有！一种遍历二叉树的酷炫方法：Morris 遍历，它具有 $O(n)$ 的时间复杂度和 $O(1)$ 的空间复杂度。
该内容后续 0XX 序号处出现，属于拓展内容。在某些算法题上有奇效，同样是迭代写法但不用栈。

2. 了解二叉树遍历的递归非递归有什么意义？
理解函数栈和显示栈没什么区别，理解递归背后栈操作和树的层次操作。熟悉迭代和递归的转换，避免递归栈溢出的风险，特定场景可以用迭代代替递归获取更高的性能优势（某些数据结构也是内部用迭代代替递归）。锻炼 coding 能力，迭代往往比递归写法有难度，不如后者易懂。
熟练对容器数组、栈、队列这些结构的使用。

### 008 [层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

**重点掌握优化版的层序遍历处理方法。即解法 2。**

**基础回顾：层序遍历：先处理完当前层然后处理下一层。按层分优先级。**

其基本流程是：

1. 申请一个队列（因为队列的先进先出的特性符合层级优先的原则），根节点入队。
2. 出队，然后对该节点处理（打印），将左右子树的根节点入队（如果存在）。
3. 重复 2 直到队列为空。

```java
//广度优先遍历打印
public void levelOrder(TreeNode head){
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(head);
    if(!queue.isEmpty()){
        head = queue.poll();
        System.out.print(head.val + " ");
        if(head.left != null){
            queue.offer(head.left);
        }
        if(head.right != null){
            queue.offer(head.right);
        }
    }
}
```

`传统的写法，简单的广度优先遍历一下完事了。缺点：比如，尝试用传统的写法解决上面 008 链接的 OJ 题就不行。`
为什么？如果你看了一下，你会发现题目要求为每个节点分层，即明确知道哪些节点属于哪些层。

**现在介绍优化版的层序遍历。**

#### 解法一：哈希表

哈希表这个结构你应该熟悉（否则你应该跳过解法一或者去了解哈希表的知识），这里要运用 Java 中的 `HashMap`。

**使用哈希表关联每个节点和其所在层数。**

其基本思想是在传统广度优先遍历上改进：

1. 额外维护一张表的信息。初始哈希表绑定头节点和 0 层在一起。
2. `List<List<Integer>>`，你可以认为纵向是一个行向量数组，每次出队时要从表里获取该节点的层数信息。第一，注意当前层的行向量是否存在否则应该创建一个（`if (ans.size() == level)`）。第二，对左右节点入队要注意对表的更新，更新层数应该是下一层。

`代码`：

```java
/**
 * 此法用了哈希表，很拉跨。但建议熟悉一下coding写法。
 * 提交时把后缀1去掉。
 * <a href="https://leetcode.cn/problems/binary-tree-level-order-traversal/description/">...</a>
 * @param head root
 * @return the level order traversal of its nodes' values
 */
public List<List<Integer>> levelOrder1(TreeNode head) {
    List<List<Integer>> ans = new ArrayList<>();
    if(head != null){
        //申请一个队列
        Queue<TreeNode> queue = new LinkedList<>();
        //申请哈希表: key：节点指针->value：节点所在层数
        HashMap<TreeNode, Integer> levels = new HashMap<>();

        //初始对队列和哈希表处理
        queue.offer(head);
        levels.put(head, 0);

        while(!queue.isEmpty()) {
            //处理队列一个节点
            head = queue.poll();
            //获取当前层数
            int level = levels.get(head);
            //如果当前层数不存在，则创建。
            if (ans.size() == level) {
                ans.add(new ArrayList<>());
            }

            //将cur节点的值加入当前层的序列
            ans.get(level).add(head.val);

            //处理cur的左右两个节点（如果存在则入队），并记录在下一层的哈希表
            if (head.left != null) {
                queue.offer(head.left);
                levels.put(head.left, level + 1);
            }

            if (head.right != null) {
                queue.offer(head.right);
                levels.put(head.right, level + 1);
            }
        }
    }
    return ans;
}
```

**总结：此法多用了一个哈希表维护节点与所在层数的信息，空间有了额外开销。**

#### 解法 2：按层处理

可以不用容器处理，能用常数个变量解决的事情，额外用容器维护是对空间的多余浪费。

算法流程：

1. 申请队列（Java 内置 Queue，全局静态数组实现队列将在解法 3 中呈现），将头节点入队。
2. 获取当前层的节点数 `size = queue.size()`，内部循环处理完当前层的所有结点。
3. 内部循环逻辑，传统写法一致，左子树右子树入队（如果存在），每次循环就意味着处理了一个当前层结点，`size--`。重复到当前层结点处理完 `size == 0`。
4. 重复 2、3 过程，直至队列为空，结束。

`代码`：

```java
/**
 * 链接同上
 * 提交时将函数名->levelOrder
 * @param head root
 * @return the level order traversal of its nodes' values
 */
public List<List<Integer>> levelOrder2(TreeNode head){
    List<List<Integer>> ans = new ArrayList<>();
    if(head != null){
        //步骤1：申请队列，头节点入队。
        var queue = new LinkedList<TreeNode>();
        queue.offer(head);
        //步骤4:逻辑改为按层处理，外循环一次处理一层。
        while(!queue.isEmpty()){
            //步骤2:获得当前层处理的节点个数
            int size = queue.size();
            //创建该层的列表
            List<Integer> list = new ArrayList<>(size);

            //步骤3: 循环处理当前层的节点
            while(size-- > 0){
                //步骤3 出队, head复用
                head = queue.poll();
                list.add(head.val);

                //步骤3 左右子树入队（如果存在）
                if(head.left != null){
                    queue.offer(head.left);
                }

                if(head.right != null){
                    queue.offer(head.right);
                }
            }
            ans.add(list);
        }
    }
    return ans;
}
```

#### 解法 3：全局静态数组队列

请先看本题的解法 2。
具体步骤是用[静态数组充当队列](https://www.youtube.com/watch?v=2njEmxGatBE&list=PLvKfL6GtwDxwuyrpAJfU3HTnPZl4WnraE&index=14)，仅限算法题使用。

1. 本题数据量 [0, 2000]，这意味着如果一直入队最坏的情况就是数组容纳 2000 个数据，所以开一个 2000 的数组充当队列。
2. 设置静态字段 l、r。初始 `[l, r)`，`l == r` 时队列为空，队列长度为 `r - l`。
3. 其它步骤同解法 2，只是队列改成静态数组实现，贴近笔试和算法比赛的写法。

`代码`

```java
/**
 * 解法3：100%的速度。全局静态数组
 * 提交时函数名->levelOrder
 * 本题数据量[0,2000]，所以开一个2000的数组充当队列.
 * 需要了解数组实现队列。
 */
public static int MAX = 2000;//数据量增大就更新这个值
public static TreeNode[] queue = new TreeNode[MAX];
public static int l,r; //l==r时为空，[l,r)
private List<List<Integer>> ans = new ArrayList<>();
public List<List<Integer>> levelOrder3(TreeNode head){
    if(head != null){
        l = r = 0;//重置为0
        queue[r++] = head;
        while(l!=r){
            int size = r - l;
            ArrayList<Integer> list = new ArrayList<>(size);
            while(size-- > 0){
                TreeNode cur = queue[l++];
                list.add(cur.val);

                if(cur.left != null){
                    queue[r++] = cur.left;
                }

                if(cur.right != null){
                    queue[r++] = cur.right;
                }
            }
            ans.add(list);
        }
    }
    return ans;
}
```

#### 解法 4：力扣 100% 击败

对于某些"强迫症"患者，比如我。不到 100% 是不会罢休的。
采用"作弊"的手段：
用深度优先搜索即就是先序遍历的递归写法。常数项时间好一点。
虽然不是层序遍历的顺序，但最终建立的 `List<List<Integer>>` 的结果和层序遍历一致。

`大千世界，无奇不有。100% 达成（如果卷常数时间可能这种写法也做不到 100% 了）`

```java
private List<List<Integer>> ans =new ArrayList();

public List<List<Integer>> levelOrder(TreeNode root) {
    dfs(root,0);
    return ans;
}

public void dfs(TreeNode root,int depth){
    if(root==null)
        return ;
    if(depth == ans.size()){
        ans.add(new ArrayList());
    }
    ans.get(depth).add(root.val);
    dfs(root.left,depth+1);
    dfs(root.right,depth+1);
}
```

### 009 ZigZag 遍历

本题提供 4 种解法，首先你需要了解 `008 层序遍历` 的有关内容，否则很难看下去。
解法 1 最好想，解法 2 练 Coding（可以跳过）；
解法 3 和 4（必看）：双端队列和全局静态数组。

什么是 zigzag？

假设根节点所在层为 0（这里假设为 0 为了方便，根据实际选择为 0 或者 1）。

```text
    /**
     *          1
     *        /  \
     *       2    3
     *     /    /  \
     *    4    5    6
     *       /  \
     *      7    8
     * 每层输出:
     * level0 : 1
     * level1 : 3 2
     * level2 : 4 5 6
     * level3 : 8 7
     */
```

可以发现，偶数层跟层序遍历一致，奇数层跟层序遍历反过来了（如 1、3 层）。

#### 解法 1：层序遍历 + 逆序处理

1. 了解 `008 层序遍历` 的有关内容。这种解法可以帮助你复习层序遍历。
2. Java 了解一下 `Collections.reverse(List<?> list)`，这个静态方法可以实现列表逆序。知识点就这些，全是模板了。

`代码`

```java
//提交时修改函数名->zigzagLevelOrder
public List<List<Integer>> zigzagLevelOrder1(TreeNode head) {
    var ans = new ArrayList<List<Integer>>();
    if(head != null){
        LinkedList<TreeNode> queue = new LinkedList<>();
        queue.offer(head);
        while(!queue.isEmpty()){
            int size = queue.size();
            List<Integer> list = new ArrayList<Integer>();
            while(size-- > 0){
                head = queue.poll();
                list.add(head.val);

                if(head.left != null){
                    queue.offer(head.left);
                }

                if(head.right != null){
                    queue.offer(head.right);
                }
            }
            ans.add(list);
        }
        //根节点层为第0层, 对奇数层进行逆序
        for(int i=1;i<ans.size();i+=2){
            //Collections工具类有个reverse方法可以逆序列表
            Collections.reverse(ans.get(i));
        }
    }
    return ans;
}
```

#### 解法 2：ArrayList（可跳）

这种解法就是假设基本数据结构只会顺序表 `Java 中的 ArrayList`，数据结构新手，也不具有纯用数组玩的经验。
此法对于新手是个方法！对于老手可以练练 Coding。
这个方法坑点还有点多——了解这个可以帮助理解解法 3。

`算法流程：`

1. 申请两个 ArrayList，list1、list2。将根节点加入到 list1 中。
2. 如果 list2 为空，那么从左向右处理 list1 的节点。每个节点左右孩子的顺序（如果存在）加入 list2 中。
3. 如果 list1 为空，那么从右往左处理 list2 的节点，每个节点按照右孩子先进、左孩子后进（如果有）的顺序添加入 list1 中。
4. 交替进行 2、3。直到两个 ArrayList 都为空。

> 坑点：步骤 2 是从左往右的顺序，节点孩子还是左 > 右 的优先级。
> 步骤 3 是从右往左的顺序，节点孩子是右 > 左 的优先级。注意区别！这种顺序处理是为了保证 list1 与 list2 交替且能重复进行（不破坏下次的顺序）。

`代码`：

```java
// //提交时修改函数名->zigzagLevelOrder
public List<List<Integer>> zigzagLevelOrder2(TreeNode head) {
    var ans = new ArrayList<List<Integer>>();
    if (head != null) {
        //步骤一:申请两个list, 并初始处理list1
        ArrayList<TreeNode> list1 = new ArrayList<>();
        ArrayList<TreeNode> list2 = new ArrayList<>();
        list1.add(head);

        //步骤4: list1 与 list2总有一个为空。交替重复处理
        while (!list1.isEmpty() || !list2.isEmpty()) {
            int size;
            List<Integer> list = new ArrayList<>();
            if (list2.isEmpty()) {
                //步骤2:list2为空就处理list1, 从左往右的顺序
                //头删list1的节点并且将其孩子按左右顺序加入到list2。
                size = list1.size();

                while (size-- > 0) {
                    head = list1.removeFirst();
                    list.add(head.val);

                    if (head.left != null) {
                        list2.add(head.left);
                    }
                    if (head.right != null) {
                        list2.add(head.right);
                    }
                }
            } else {

                //步骤3:list1为空那么处理list2, 从左往右的顺序
                //尾删list1的节点并且将其孩子按右->左顺序加入到list1。
                size = list2.size();

                while (size-- > 0) {
                    head = list2.removeLast();
                    list.add(head.val);
                    if (head.right != null) {
                        list1.addFirst(head.right);
                    }

                    if (head.left != null) {
                        list1.addFirst(head.left);
                    }
                }
            }
            ans.add(list);
        }
    }
    return ans;
}
```

#### 解法 3：[双端队列](https://www.youtube.com/watch?v=tSnF6C03joI&list=PLvKfL6GtwDxwuyrpAJfU3HTnPZl4WnraE&index=16)（双向链表）

如果你感兴趣看了本题的解法 2，你可能会震惊怎么用 `ArrayList` 的头插头删操作（时间复杂度最坏情况是 $O(n)$）。
这种**频繁插入删除**的情况应该用链表吧。

正确的，头插头删尾插尾删**效率最高的结构 -> 链表**。
如果你用单链表实现过队列和栈，可能还听说过名为`双端队列`的数据结构。
数据结构都是基于数组或者链表实现的，双端队列本身就是一种抽象。
**双端队列：头插头删尾插尾删 $O(1)$。**
Java 中的双端队列是 `Deque` 接口，链式结构实现类是 `LinkedList` 双向链表，顺序结构实现类是 `ArrayDeque` 循环队列均可以充当双端队列。*另外，手写一个单链表充当双端队列（熟悉单链表实现过队列和栈，自然明白双端队列就是栈 + 队列的合体），数组充当双端队列（后面的解法 4（本题最优解））。*

`算法流程（大致同解法 2，不过插入删除速度更快）：`

1. 申请一个双端队列 `deque`（Java 中用 `LinkedList` 或者 `ArrayDeque`），根节点入队处理。初始化一个布尔变量 `reverse`。
2. reverse 为 false，从左往右处理。即左队头出队，并将其孩子按照 `左右` 顺序从右队头（左队尾）入队。执行完反转 reverse(true)，执行步骤 3。
3. reverse 为 true，从右往左处理。即右队头出队，并将其孩子按照 `右左` 顺序从右队头（左队尾）入队。执行完反转 reverse(false)，执行步骤 2。
4. 步骤 2、3 交替执行是通过 reverse 和反转实现，循环结束条件是双端队列为空。

`代码`

```java
// //提交时修改函数名->zigzagLevelOrder
public List<List<Integer>> zigzagLevelOrder3(TreeNode head){
    var ans = new ArrayList<List<Integer>>();
    if (head != null) {
        //申请一个双端队列，根节点从后入队
        Deque<TreeNode> deque = new LinkedList<>();
        deque.offerLast(head);
        // reverse:false -> 从左向右: deque
        // reverse:true -> 从右往左: deque
        boolean reverse = false;
        while(!deque.isEmpty()){
            int size = deque.size();
            List<Integer> list = new ArrayList<>();
            //步骤2: reverse为false，从左向右执行。
            if(!reverse){
                while(size-- > 0) {
                    //左队头出队
                    head = deque.pollFirst();
                    list.add(head.val);
                    //先左后右: 右队头入
                    if (head.left != null) {
                        deque.offerLast(head.left);
                    }
                    if (head.right != null) {
                        deque.offerLast(head.right);
                    }
                }
            }
            else{
                //步骤3: reverse为true，从右向左执行。
                while(size-- > 0) {
                    //右队头出队
                    head = deque.pollLast();
                    list.add(head.val);
                    //先右后左：左队头入
                    if (head.right != null) {
                        deque.offerFirst(head.right);
                    }
                    if (head.left != null) {
                        deque.offerFirst(head.left);
                    }
                }
            }
            ans.add(list);
            //步骤2，3交替执行，因此要反转reverse。!reverse即可。
            reverse = !reverse;
        }
    }
    return ans;
}
```

#### 解法 4：静态数组双端队列（本题最优解）

了解解法 4 需要本题解法 3 的算法流程和[固定数组实现双端队列](https://www.youtube.com/watch?v=tSnF6C03joI&list=PLvKfL6GtwDxwuyrpAJfU3HTnPZl4WnraE&index=16)。

`代码`：

```java
//leetcode修改数据量，仅修改一下MAX即可
public static int MAX = 2001;
//全局静态数组实现双端队列
public static TreeNode[] queue = new TreeNode[MAX];
public static int l,r;
//提交时修改函数名->zigzagLevelOrder
public List<List<Integer>> zigzagLevelOrder4(TreeNode head){
    List<List<Integer>> ans = new ArrayList<>();
    if(head != null){
        //重置l,r
        l = r = 0;
        boolean reverse = false;
        queue[r++] = head;
        while(l != r){
            int size = r - l;
            ArrayList<Integer> list = new ArrayList<>();

            //reverse == false. 左->右，i [l,r-1]顺序，j = 1。收集size个。
            //reverse == true. 右->左，i [r-1 -> l] , j = -1。收集size个。
            //上两步是对称过程，一个reverse加三目优雅解决。
            for(int i = reverse ? r - 1 : l, j = reverse ? -1 : 1, k = 0; k < size; i += j, k++){
                TreeNode cur = queue[i];
                list.add(cur.val);
            }

            for (int i = 0; i < size; i++) {
                TreeNode cur = queue[l++];
                if (cur.left != null) {
                    queue[r++] = cur.left;
                }
                if (cur.right != null) {
                    queue[r++] = cur.right;
                }
            }

            ans.add(list);
            //反转
            reverse = !reverse;
        }
    }
    return ans;
}
```

## Coding[基础 & 进阶] 二叉树经典题练习

### 010 [二叉树的最大宽度](https://leetcode.cn/problems/maximum-width-of-binary-tree/description/)

`前置知识：二叉树的顺序存储结构 + 008 优化版本的层序遍历 + 完全二叉树父节点孩子节点的下标关系。`

![二叉树宽度示例](https://i-blog.csdnimg.cn/direct/a8f7377d2c5b4f50b1f902b13445427c.png)

先说明什么是每层的宽度？
二叉树的宽度概念是基于层的。
从当前层的第一个非空节点到最后一个非空节点的距离（包括两个节点本身）。比如，如图第一层只有一个节点 `1`，宽度为 1；第二层节点 `3 -> 2`，宽度为 2。
第三层节点 5 -> 9，宽度不是 2，想象成完全二叉树，中间的空隙有 null 替代了，实际上应该是 `5 -> null -> null -> 9`，宽度为 4（从当前层的首个非空节点到最后一个非空节点）；同理，第 4 层应该是 `6 -> null -> null -> null -> null -> null -> 7`，尽管上一层位置可能是空节点了，但记住不成一个完全二叉树（用 null 补出来）。第四层宽度应该是 7。

那么最大宽度就是每层的宽度比较出最大值的结果。

好，现在你应该明白了，这里要做层序遍历（广度优先遍历）。
那么如何快速获取每层宽度？非要遍历空节点按照上面的规则算出来吗？
`答案是用不着，对每个节点包括空节点都按层从左往右从上到下进行编号就好了。`

还是以上图举例：

![二叉树宽度编号](https://i-blog.csdnimg.cn/direct/a802d5962f3e478eb702709e4be58d7a.png)

第四层宽度：编号为 13 的最后一个非空节点 - 编号为 7 的非空节点 + 1 就是该层的宽度。
有一种结构天然就适合编号，就是数组。这里就是用数组实现二叉树的表示，在数据结构`堆与优先级队列`中就是这种实现。

#### 唯一解法：数组 + 数组充当队列

算法流程：

1. 申请两个静态数组 `TreeNode` 节点数组和 `int[] iq` 编号数组。重置 l、r。根节点入队和入编号。
2. 处理当前层，获取当前层的长度，队列始终维持当前层最左右的非空节点，`iq[r - 1] - iq[l] + 1` 可以轻易得到当前层的宽度。
3. 继续处理当前层节点，依次出队并获取其编号，将其左右孩子入队（如果存在），同时更新其编号信息。
4. 重复 2、3 直到队列为空 `l == r`。

`代码`：

```java
//提交以下方法需注意
//如果测试数据量过大，需要修改MAX
//用每次处理的一层优化bfs就非常容易实现。
public static int MAX = 3001;
public static TreeNode[] nq = new TreeNode[MAX];
public static int[] iq = new int[MAX];
public static int l,r;
public static int widthOfBinaryTree(TreeNode head){
    if(head == null){
        return 0;
    }
    //ans初始为1.
    int ans = 1;
    //重置l,r, 防止被上一次污染数据
    l = r = 0;
    nq[r] = head;
    iq[r++] = 1;
    while(l != r){

        //获取当前队列长度
        int size = r - l;
        //更新 ans, 队列维持的都是非空节点。iq[r-1] - iq[l] + 1：当前层编号。
        ans = Math.max(ans, iq[r - 1] - iq[l] + 1);

        //循环对当前层进行处理
        //和优化版本的bfs大同小异，l也维持id的有效数据。
        while(size-- > 0){
            head = nq[l];
            int id = iq[l++];

            if(head.left != null){
                nq[r] = head.left;
                iq[r++] = id << 1;
            }
            if(head.right != null){
                nq[r] = head.right;
                iq[r++] = (id << 1) + 1;
            }
        }
    }
    return ans;
}
```

### 011 [二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/description/)

二叉树的最大深度就是它的高度。
从递归角度二叉树的最大的深度取决于**根节点的算一层深度 + 左右子树的最大深度**。对于子树也满足这条原则。

递归写法要处理基础条件：当递归到空节点时应该返回 0。

`代码`

```java
//二叉树的最大深度。
public static int maxDepth(TreeNode head){
    return head == null ? 0 : Math.max(maxDepth(head.left), maxDepth(head.right)) + 1;
}
```

### 012 [二叉树的最小深度](https://leetcode.cn/problems/minimum-depth-of-binary-tree/description/)

#### 解法 1：递归（深度优先遍历）

二叉树问题 遍历 + 递归 往往比较直观。

找到所有从根节点到达叶子节点的深度，依次比较出最小值。本题的深度是按照`节点数量`的标准。

`算法流程：`

1. 先讨论是否为空树，如为空树返回 0，否则执行步骤 2。
2. 讨论该节点是否为叶子节点，若满足返回 1，否则执行步骤 3。
3. 递归地计算并比较左右子树的最小深度。如果左子树或者右子树其中有一为空，那么不用比较。将最后剩下或者比较的结果 + 1。递归结束，最终结果就是整棵树的最小深度。

`代码`：

```java
//二叉树的最小深度。
//测试链接 : https://leetcode.cn/problems/minimum-depth-of-binary-tree/
//提交时修改函数名和内部递归函数名保持一致 -> minDepth1
public static int minDepth1(TreeNode head){
    if(head == null){
        //当前树为空树，直接返回
        return 0;
    }
    //如果是叶子节点，那么提供一层深度。
    if(head.left == null && head.right == null) {
        return 1;
    }
    //左子树的最小深度 初始为系统最大
    int lDepth = Integer.MAX_VALUE;
    //右子树的最小深度 初始为系统最大
    int rDepth = Integer.MAX_VALUE;

    //如果当前节点存在左子树，那么递归调用。
    if(head.left != null){
        lDepth = minDepth1(head.left);
    }
    //如果当前节点存在右子树，那么递归调用
    if(head.right != null){
        rDepth = minDepth1(head.right);
    }
    //结算以当前节点为根节点的最小深度。
    //比较左右子树的最小的深度出最小值 + 1。
    return Math.min(lDepth, rDepth) + 1;
}
```

#### 解法 2：优化版层序遍历（广度优先遍历）

前置知识：`008 层序遍历（优化版 bfs）`。

最小深度就是根节点到最近叶子节点之间的数量。
解法 1 的递归方法好比往深处找出每个节点依次比较出结果。
有无高效的解法？不用枚举所有叶子节点。
宽度优先遍历是按层遍历，那么当它找叶子节点很快。

`算法流程：`

1. 优化版本的 bfs + 对叶子节点的判断 + ans 记录当前层数（从一开始计数）。

这里以固定数组实现队列可以做到 100% 击败率。

```java
class Solution {
    //---------------------------解法2:二叉树的最小深度------------------
    //leetcode提交修改数据量记得更改
    //提交时修改函数名->minDepth
    public static int MAX = 10001;
    public static TreeNode[] queue = new TreeNode[MAX];
    public static int l,r;
    public static int minDepth2(TreeNode head){
        if(head == null) return 0;//空树

        l = r = 0;//重置l,r =>等价于清空队列
        queue[r++] = head;
        //初始只有根节点，所以为1
        int ans = 1;
        outerloop:
        while(l != r) {
            //获取数组大小
            int size = r - l;

            //优化版bfs，按层处理。
            while (size-- > 0) {
                head = queue[l++];
                //如果是叶子节点，由宽度优先遍历的特点，必定遇上了第一个叶节点，必定是最小的深度
                if (head.left == null && head.right == null) {
                    break outerloop;
                }
                //如果当前节点存在左子树，那么入队。
                if (head.left != null) {
                    queue[r++] = head.left;
                }
                //如果当前节点存在右子树，那么入队。
                if (head.right != null) {
                    queue[r++] = head.right;
                }
            }
            //处理完一层就++, 意味着最小深度不在那一层
            ans++;
        }

        //发现了第一个叶子节点，break 带标签跳出多层循环返回ans!!!
        return ans;
    }
}
```

## 结语

什么？你看完了。给你点赞...👍👍👍
