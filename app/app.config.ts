import type { Nav, NavItem } from '~/types/nav'
import { Temporal } from 'temporal-polyfill'
import blogConfig from '~~/blog.config'

// 图标查询：https://yesicon.app/ph?s=bold
// 图标插件：https://marketplace.visualstudio.com/items?itemName=antfu.iconify

// @keep-sorted
export default defineAppConfig({
	// 将 blog.config 中的配置项复制到 appConfig，方便调用
	...blogConfig,

	component: {
		alert: {
			/** 默认使用卡片风格还是扁平风格 */
			defaultStyle: 'card' as 'card' | 'flat',
		},

		codeblock: {
			/** 代码块触发折叠的行数 */
			triggerRows: 32,
			/** 代码块折叠后的行数 */
			collapsedRows: 16,
			/** 启用代码块缩进导航会关闭空格渲染 */
			enableIndentGuide: true,
			/** 代码块缩进导航(Indent Guige)竖线匹配空格数 */
			indent: 4,
			/** tab渲染宽度 */
			tabSize: 3,
		},

		/** 文章开头摘要 */
		excerpt: {
			animation: true,
			caret: '_',
		},

		/** 精选文章 Slide */
		slide: {
			/** 适合封面图无字时启用 */
			showTitle: true,
		},

		stats: {
			/** 归档页面每年标题对应的年龄 */
			birthYear: 2004,
			/** blog-stats widget 的预置文本 */
			wordCount: '0',
		},
	},

	// @keep-sorted
	footer: {
		/** 页脚版权信息，支持 <br> 换行等 HTML 标签 */
		copyright: `© ${Temporal.Now.plainDateISO().year.toString()} ${blogConfig.author.name} · arsenova.xyz`,
		/** 侧边栏底部图标导航 */
		iconNav: [
			{ icon: 'tabler:brand-github', text: 'GitHub', url: 'https://github.com/arsenova' },
			{ icon: 'tabler:rss', text: 'Atom订阅', url: '/atom.xml' },
		] satisfies NavItem[],
		/** 页脚站点地图 */
		nav: [
			{
				title: '探索',
				items: [
					{ icon: 'tabler:notes', text: 'Notes', url: '/notes' },
					{ icon: 'tabler:cpu-2', text: 'Tech', url: '/tech' },
					{ icon: 'tabler:moon-stars', text: 'Life', url: '/life' },
					{ icon: 'tabler:rss', text: 'Atom订阅', url: '/atom.xml' },
				],
			},
			{
				title: '社交',
				items: [
					{ icon: 'tabler:mail', text: blogConfig.author.email, url: `mailto:${blogConfig.author.email}` },
					{ icon: 'tabler:world', text: 'arsenova.xyz', url: blogConfig.url },
				],
			},
			{
				title: '信息',
				items: [
					{ icon: 'tabler:license', text: blogConfig.copyright.abbr, url: blogConfig.copyright.url },
				],
			},
		] satisfies Nav,
	},

	/** 左侧栏顶部 Logo */
	header: {
		logo: blogConfig.author.avatar,
		/** 展示标题文本，否则展示纯 Logo */
		showTitle: true,
		caption: '私人传输',
		subtitle: blogConfig.subtitle,
	},

	/** 友链页面 */
	link: {
		/** 无订阅源展示静音图标 */
		remindNoFeed: true,
		/** 友链分组内随机排序 */
		randomInGroup: true,
	},

	/** 左侧栏导航 */
	nav: [
		{
			title: '',
			items: [
				{ icon: 'tabler:home', text: '主页', url: '/' },
				{ icon: 'tabler:notes', text: '文章', url: '/notes' },
				{ icon: 'tabler:cpu-2', text: '技术', url: '/tech' },
				{ icon: 'tabler:moon-stars', text: '生活', url: '/life' },
				{ icon: 'tabler:archive', text: '归档', url: '/archive' },
				{ icon: 'tabler:user-circle', text: '关于', url: '/about' },
			],
		},
	] satisfies Nav,

	pagination: {
		perPage: 10,
		/** 默认排序方式，需要是 this.article.order 中的键名 */
		sortOrder: 'date' as keyof typeof blogConfig.article.order,
		/** 允许（普通/预览/归档）文章列表正序，开启后排序方式左侧图标可切换顺序 */
		allowAscending: false,
	},

	themes: {
		light: {
			icon: 'tabler:sun',
			tip: '浅色模式',
		},
		system: {
			icon: 'tabler:device-desktop',
			tip: '跟随系统',
		},
		dark: {
			icon: 'tabler:moon',
			tip: '深色模式',
		},
	},
})
