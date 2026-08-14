# 博客框架说明

本站前端基于 [XinghuisamaBlogs](https://github.com/heiehiehi/XinghuisamaBlogs)（Next.js）。

版权与许可以该项目及其 `LICENSE` 为准。本仓库中的 `XHBlogs/`、`my-blog-manager/`、`update.py` 等框架文件来源于上游，使用与再分发请遵守原作者许可。

## 目录结构

- `XHBlogs/` — 博客前端（部署此目录）
- `my-blog-manager/` — 本地后台控制台（Markdown 写作、草稿管理）
- `update.py` / `update.bat` — 框架无损更新器

## 快速开始

### 仅运行博客前端

```bash
cd XHBlogs
npm install
npm run dev
```

### 使用后台控制台

进入 `my-blog-manager` 目录，运行 `Start.bat`（Windows）或：

```bash
cd my-blog-manager
npm install
npm run dev
```

在控制台设置中配置 `XHBlogs` 的本地路径。

## 部署

将 `XHBlogs` 目录部署到 Vercel 或其他支持 Next.js 的平台。生产环境可用 PM2：

```bash
cd XHBlogs && npm run build
pm2 start ../ecosystem.config.cjs
```

## 文章

Markdown 文章位于 `XHBlogs/posts/`，frontmatter 格式：

```yaml
---
title: "文章标题"
date: "2026-01-30 02:00:00"
description: "摘要"
tags: ["标签1", "标签2"]
cover: "/images/posts/example.png"
---
```
