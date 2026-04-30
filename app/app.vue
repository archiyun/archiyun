<template>
<NuxtLoadingIndicator />
<NuxtRouteAnnouncer :style="{ position: 'absolute' }" />
<BlogSkipToContent />
<BlogSidebar />
<div id="content">
	<main id="main-content">
		<NuxtPage />
		<BlogFooter />
	</main>
	<BlogAside />
</div>
<BlogPanel />
<BikariyaModals />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
#blog-root {
	display: flex;
	justify-content: center;
	gap: 1rem;
	position: relative;
	min-width: 0;
	padding: 1rem;
	isolation: isolate;

	&::before,
	&::after {
		content: none;
		position: fixed;
		border-radius: 50%;
		filter: blur(80px);
		pointer-events: none;
		z-index: -2;
	}

	&::before {
		top: -12rem;
		left: min(-6rem, -5vw);
		width: min(34rem, 40vw);
		height: min(34rem, 40vw);
		background:
			radial-gradient(circle at 30% 30%, hsl(356deg 90% 48% / 28%), transparent 58%),
			radial-gradient(circle at 65% 65%, hsl(39deg 80% 82% / 14%), transparent 62%);
	}

	&::after {
		right: min(-6rem, -5vw);
		bottom: -10rem;
		width: min(28rem, 32vw);
		height: min(28rem, 32vw);
		background: radial-gradient(circle, hsl(356deg 80% 45% / 18%), transparent 62%);
	}
}

body {
	background-color: var(--c-bg-1);
	-webkit-font-smoothing: antialiased;
	text-rendering: optimizelegibility;
}

#blog-sidebar, #blog-aside {
	flex: 0 0 280px; // 防止搜索框 grow
	position: sticky;
	top: 1rem;
	height: calc(100vh - 1rem);
	height: calc(100dvh - 1rem);
	min-width: 0; // 防止搜索框撑开页面
	scrollbar-width: thin;

	@media (max-width: $breakpoint-widescreen) {
		flex-shrink: 0.2;
	}
}

#content {
	display: flex;
	gap: 1rem;

	// 若设置的是 max-width，则内部 main 宽度为 fit-content，可能无法撑满
	// 此时即使设置 flex-grow，也会影响 #sidebar 无法正确 shrink
	width: min(calc(100vw - 2rem), #{$breakpoint-widescreen});
	min-width: 0; // 解决父级 flexbox 设置 justify-content: center 时溢出左侧消失的问题

	// 此处不建议给内容设置 padding
	> #main-content {
		flex-grow: 1; // 使较小宽度的内容占满
		position: relative;

		// overflow: hidden; // 会使一部分元素吸顶失效

		// 使内容正确计算宽度而不横向溢出
		// 也可设置 width: 0 或者 contain: inline-size（兼容性不佳）
		min-width: 0;
	}
}
</style>
