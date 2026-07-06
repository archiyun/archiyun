<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/akiba-miku/akiba-miku/main/public/assets/arsenova-mark.svg">
    <img src="https://raw.githubusercontent.com/akiba-miku/akiba-miku/main/public/assets/arsenova-mark.svg" width="120" alt="Arsenova">
  </picture>
</p>

<h1 align="center">ARSENOVA 的博客</h1>

<p align="center">
  <a href="https://arsenova.xyz">arsenova.xyz</a> ·
  <a href="https://github.com/akiba-miku">@akiba-miku</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-00DC82?logo=Nuxt.js&label=框架" alt="Nuxt">
  <img src="https://img.shields.io/badge/Nuxt%20Content-00DC82?logo=Nuxt.js&label=CMS" alt="Nuxt Content">
  <img src="https://img.shields.io/badge/Vercel-000000?logo=Vercel&label=部署" alt="Vercel">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=white&label=语言" alt="TypeScript">
  <img src="https://img.shields.io/badge/ESLint-4B32C3?logo=ESLint&label=代码风格" alt="ESLint">
  <img src="https://img.shields.io/badge/Stylelint-263238?logo=Stylelint&label=代码风格" alt="Stylelint">
</p>

<p align="center">
  一个基于 Nuxt Content 构建的个人博客。<br>
  展示、写作、折腾 —— 全栈自用主题。
</p>

---

## ✨ 特性

- **Nuxt Content** — Markdown / MDC 驱动的内容管理
- **双色模式** — 浅色/深色/跟随系统，CSS 变量全局换肤
- **全文搜索** — 基于 Minisearch 的离线全文搜索
- **Atom 订阅** — 内置 Atom Feed 生成
- **LaTeX 支持** — KaTeX 渲染数学公式
- **语法高亮** — Shiki 驱动的代码块（多主题）
- **图片画廊** — 配合封面图系统展示
- **SEO 友好** — Nuxt SEO 模块 + 结构化数据
- **SSG 部署** — 静态生成，支持 Vercel / Netlify / Cloudflare Pages

## 🚀 快速开始

```sh
pnpm i          # 安装依赖
pnpm dev        # 启动开发环境
pnpm new        # 创建新文章（交互式 CLI）
pnpm generate   # 构建静态站点
pnpm preview    # 预览构建产物
```

## 📁 目录结构

```sh
.
├── app                  # 前端 Vue 组件/配置
│   ├── app.config.ts    # 前端响应式配置
│   └── feeds.ts         # 友链列表
├── content              # 文章内容（Markdown）
│   ├── posts            # 正式文章
│   ├── previews         # 草稿
│   └── link.md          # 友链页说明
├── public
│   └── images/posts     # 文章封面图
├── blog.config.ts       # 博客公共配置
└── nuxt.config.ts       # Nuxt 构建配置
```

## 📜 版权声明

| 部分 | 许可 |
|------|------|
| **主题代码** | [MIT License](LICENSE) — 可自由使用、修改、分发 |
| **本站文章** | [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans) — 可分享演绎，但需署名、非商用、相同方式共享 |
| **图片素材** | 保留所有权利，除非另有说明 |

## 🔗 链接

- 博客: [arsenova.xyz](https://arsenova.xyz)
- GitHub: [@akiba-miku](https://github.com/akiba-miku)
