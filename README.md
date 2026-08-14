<p align="center">
  <img src="https://github.com/archiyun.png" alt="Arsenova" width="120">
</p>

<h2 align="center">Hi, I'm Arsenova.</h2>

<p align="center"> Building things, breaking things, figuring out why. </p>

I write C++ and Go, use Linux, and spend an unreasonable amount of time debugging things I built myself.

Currently building CoroPact.

Make it work. Make it clear. Then make it fast.

<p align="center"> <a href="https://arsenova.xyz">arsenova.xyz</a> </p>

---

# Arsenova Blog

基于 [XinghuisamaBlogs](https://github.com/heiehiehi/XinghuisamaBlogs)（Next.js + 毛玻璃风格）的个人博客。

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
---
```
