<script setup lang="ts">
withDefaults(defineProps<{
	tag?: string
}>(), {
	tag: 'div',
})
const appConfig = useAppConfig()
</script>

<template>
<UtilLink class="blog-header">
	<NuxtImg
		:src="appConfig.header.logo"
		class="blog-logo round-cobblestone"
		:alt="appConfig.title"
	/>

	<div v-if="appConfig.header.showTitle" class="blog-text">
		<div class="header-caption">
			{{ appConfig.header.caption }}
		</div>

		<component :is="tag" class="header-title">
			<span
				v-for="(char, charIndex) in appConfig.title"
				:key="charIndex"
				class="split-char"
				:style="getFixedDelay((charIndex + 1) * .1)"
				v-text="char"
			/>
		</component>

		<div class="header-subtitle">
			{{ appConfig.header.subtitle }}
		</div>
	</div>
</UtilLink>
</template>

<style lang="scss" scoped>
.blog-header {
	contain: layout;
	display: flex;
	align-items: center;
	gap: 0.8em;
	position: relative;
	margin: clamp(1rem, 2rem, 5vh) 1rem min(1rem, 5vh);
	padding-inline-start: 0.85rem;
	line-height: 1.4;
	color: var(--c-text);
	user-select: none;

	&::before {
		content: "";
		position: absolute;
		top: 0.15rem;
		bottom: 0.15rem;
		left: 0;
		width: 3px;
		background: linear-gradient(var(--c-primary), transparent 82%);
	}
}

.blog-logo {
	width: 3.25em;
	height: 3.25em;
	border: 1px solid var(--c-border);
	border-radius: 0.65rem;
	box-shadow: var(--box-shadow-1), var(--box-shadow-3);
	background: var(--ld-bg-card);
}

.blog-text {
	display: grid;
	gap: 0.05rem;
}

.header-caption {
	font-size: 0.66rem;
	font-weight: 800;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: var(--c-primary);
}

.header-title {
	font-family: AlimamaFangYuanTi, "Noto Sans SC", sans-serif;
	font-size: 1.5em;
	font-synthesis: none;
	font-variation-settings: "wght" 600, "BEVL" 100;

	> .split-char {
		animation: 3.14s infinite alternate vf-weight, 2.72s infinite alternate vf-bevel;
		animation-delay: var(--delay);
		animation-play-state: paused;
	}
}

.header-subtitle {
	opacity: 0.72;
	max-width: 18rem;
	font-size: 0.76em;
}

@keyframes vf-weight {
	0% { font-weight: 600; }
	38.2% { font-weight: 300; }
	100% { font-weight: 900; }
}

@keyframes vf-bevel {
	from { font-variation-settings: "BEVL" 100; }
	to { font-variation-settings: "BEVL" 1; }
}

.blog-header:hover {
	.split-char {
		animation-play-state: running;
	}
}
</style>
