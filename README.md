# maksim 的博客

[![框架](https://img.shields.io/badge/框架-Nuxt-00DC82?logo=Nuxt.js)](https://nuxt.com/)
[![CMS](https://img.shields.io/badge/CMS-Nuxt%20Content-00DC82?logo=Nuxt.js)](https://content.nuxt.com/)
[![部署平台](https://img.shields.io/badge/部署平台-Vercel-000000?logo=Vercel)](https://vercel.com/)
[![代码风格](https://img.shields.io/badge/代码风格-ESLint-4B32C3?logo=ESLint)](https://eslint.org/)
[![代码风格](https://img.shields.io/badge/代码风格-Stylelint-263238?logo=Stylelint)](https://stylelint.io/)

基于 [Clarity](https://github.com/L33Z22L11/blog-v3) 主题构建的个人博客。

## 版权声明

本项目基于 [L33Z22L11/blog-v3](https://github.com/L33Z22L11/blog-v3) Fork 而来。

- **主题代码**：遵循原项目 [MIT License](LICENSE)，原作者为 [L33Z22L11](https://github.com/L33Z22L11)
- **原作者文章**：受 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans) 保护，本仓库已移除全部原作者文章，不做任何转载
- **本站文章**：由 maksim 原创，保留所有权利

## 快速开始

### 安装依赖

```sh
pnpm i
```

### 运行开发环境

```sh
pnpm dev
```

### 创建文章

```sh
pnpm new
```

### 构建生产环境

```sh
pnpm generate
pnpm preview
```

### 部署指南

支持 Vercel、Netlify、Cloudflare Pages、EdgeOne 等平台部署。采用静态（SSG）部署方式：

- 构建命令: `pnpm generate`
- 输出目录: `dist`
- 安装命令: `pnpm i`

> 不要选平台提供的"Nuxt"预设，否则会变成 SSR 模式。

## 目录结构

```sh
.
├── app                  # 前端
│   ├── app.config.ts    # 前端响应式配置★
│   └── feeds.ts         # 友链列表★
├── content              # 文章
│   ├── posts            # 正式文章
│   ├── previews         # 草稿
│   └── link.md          # 友链页说明
├── blog.config.ts       # 博客静态公共配置★
└── nuxt.config.ts       # Nuxt 配置
```
