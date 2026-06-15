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
		<component :is="tag" class="header-title">
			<span
				v-for="(char, charIndex) in appConfig.title"
				:key="charIndex"
				class="split-char"
				:style="getFixedDelay((charIndex + 1) * .1)"
				v-text="char"
			/>
		</component>

		<div class="header-caption">
			{{ appConfig.header.caption }}
		</div>

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
	gap: 0.7em;
	position: relative;
	margin: clamp(1rem, 2rem, 5vh) 1rem 1rem;
	line-height: 1.2;
	color: var(--c-text);
	user-select: none;
}

.blog-logo {
	width: 2.8em;
	height: 2.8em;
	border: 1px solid var(--c-border);
	border-radius: var(--radius);
	box-shadow: var(--box-shadow-1);
	background: var(--ld-bg-card);
}

.blog-text {
	display: grid;
	gap: 0.08rem;
	min-width: 0;
}

.header-caption {
	font-family: var(--font-heading);
	font-size: 0.66rem;
	font-weight: 600;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: var(--c-text-3);
}

.header-title {
	font-family: var(--font-display);
	font-size: 1.16rem;
	font-synthesis: none;
	letter-spacing: 0.06em;
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
	font-size: 0.7rem;
	line-height: 1.45;
	color: var(--c-text-3);
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
