# Post Cover Convention

文章封面图统一放在这个目录下，并按年份分目录组织：

```text
public/images/posts/
├── 2026/
│   ├── example1.jpg
│   └── example2.jpg
```

约定如下：

1. 目录名使用文章年份，例如 `2026/`
2. 文件名使用文章 slug + `-cover`
3. 优先使用 `jpg`、`webp` 或 `png`
4. 推荐比例为 `2:1`
5. 图片里不要重复写文章标题

在文章 Front Matter 中这样引用：

```md
---
image: /images/posts/2026/xxx.jpg
---
```
