<script setup lang="ts">
const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-log', 'comm-group'])

useSeoMeta({
	title: 'About',
	description: '存档处',
})

const sections = [
	{
		title: '我是谁',
		body: '这里是 ARSENOVA。一个写代码的人，也是不太愿意把自己只压缩成技术标签的人。这个站不是简历，也不是项目陈列柜，更像一个可以慢慢翻的精神空间。',
	},
	{
		title: '我在学什么',
		body: '学习写作，学习编程，写一个高性能服务器， 学习算法， 学习分布式系统， 学习英语',
	},
	{
		title: '我喜欢什么',
		body: '音乐、咖啡、深夜、城市、带一点锋利感的视觉系统，还有那些无法被 TODO list 完全收纳的生活片段。',
	},
	{
		title: '这个站记录什么',
		body: '这里会有技术笔记、读书和题解，也会有情绪、歌单、城市观察，以及一些暂时没有结论的想法。技术和生活不会被切开，它们会一起留在这里。',
	},
]
</script>

<template>
<BlogHeader class="mobile-only" to="/" tag="h1" />

<section class="about-page">
	<header class="about-hero">
		<p class="about-kicker">
			ABOUT ARSENOVA
		</p>
		<h1 class="text-creative">
			一个人的精神空间，不是简历站。
		</h1>
		<p class="about-intro">
			写代码，也记录生活、情绪、音乐、城市和一些没说出口的想法。
		</p>
	</header>

	<div class="about-grid">
		<article v-for="section in sections" :key="section.title" class="about-card">
			<span>{{ section.title }}</span>
			<h2 class="text-creative">
				{{ section.title }}
			</h2>
			<p>
				{{ section.body }}
			</p>
		</article>
	</div>
	<div class="about-signoff">
		<div class="line" />
		<p>Code, Life, Notes & Night Thoughts</p>
	</div>
</section>
</template>

<style lang="scss" scoped>
.about-page {
	display: grid;
	gap: 1rem;
	margin: 1rem;
}

.about-hero {
	display: grid;
	gap: 0.9rem;
	position: relative;
	overflow: hidden;
	padding: clamp(1.3rem, 3vw, 2.4rem);
	border: 1px solid var(--c-border);
	border-radius: 0.8rem;
	box-shadow: var(--box-shadow-1);
	background: var(--ld-bg-card);
	color: var(--c-text);

	&::after {
		content: "";
		position: absolute;
		right: -2rem;
		bottom: 1.4rem;
		width: 11rem;
		border-top: 3px solid var(--c-primary);
		transform: rotate(-24deg);
	}

	h1 {
		max-width: 10ch;
		font-size: clamp(2.8rem, 9vw, 5.5rem);
		line-height: 0.92;
	}
}

.about-kicker {
	font: 800 0.78rem/1 var(--font-monospace);
	letter-spacing: 0.16em;
	color: var(--c-primary);
}

.about-intro {
	max-width: 42rem;
	line-height: 1.9;
	color: var(--c-text-2);
}

.about-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem;
}

.about-card {
	display: grid;
	gap: 0.65rem;
	padding: 1rem;
	border: 1px solid var(--c-border);
	border-radius: 0.75rem;
	background: var(--ld-bg-card);

	span {
		font: 800 0.74rem/1 var(--font-monospace);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--c-primary);
	}

	h2 {
		font-size: clamp(1.45rem, 3vw, 2rem);
		line-height: 1;
		color: var(--c-text);
	}

	p {
		line-height: 1.85;
		color: var(--c-text-2);
	}
}

.about-signoff {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.25rem 0.1rem 0;
	color: var(--c-text-2);

	.line {
		width: 4rem;
		border-top: 3px solid var(--c-primary);
	}
}

@media (max-width: $breakpoint-mobile) {
	.about-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: $breakpoint-phone) {
	.about-page {
		margin: 0.75rem;
	}
}
</style>
