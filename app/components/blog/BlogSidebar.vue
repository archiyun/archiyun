<script setup lang="ts">
const appConfig = useAppConfig()
const layoutStore = useLayoutStore()
const searchStore = useSearchStore()

const { text } = useTextSelection()
const debouncedSelection = refDebounced(text)
</script>

<template>
<BlogMask
	:show="layoutStore.state === 'sidebar'"
	class="mobile-only"
	@click="layoutStore.close()"
/>

<!-- 不能用 Transition 实现弹出收起动画，因为半宽屏状态始终显示 -->
<aside id="blog-sidebar" :class="{ show: layoutStore.state === 'sidebar' }">
	<BlogHeader class="sidebar-header" to="/" />

	<nav class="sidebar-nav scrollcheck-y">
		<div class="search-btn sidebar-nav-item gradient-card" @click="layoutStore.toggle('search')">
			<Icon name="tabler:search" />
			<span class="nav-text">{{ debouncedSelection || searchStore.word || '搜索' }}</span>
			<Key class="keycut" code="K" cmd prevent @press="layoutStore.toggle('search')" />
		</div>

		<template v-for="(group, groupIndex) in appConfig.nav" :key="groupIndex">
			<h3 v-if="group.title">
				{{ group.title }}
			</h3>

			<menu>
				<li v-for="(item, itemIndex) in group.items" :key="itemIndex">
					<UtilLink :to="item.url" class="sidebar-nav-item">
						<Icon :name="item.icon" />
						<span class="nav-text">{{ item.text }}</span>
						<Icon v-if="isExtLink(item.url)" class="external-tip" name="tabler:arrow-up-right" />
					</UtilLink>
				</li>
			</menu>
		</template>
	</nav>

	<footer class="sidebar-footer">
		<BlogThemeToggle />
		<ZIconNavList :list="appConfig.footer.iconNav" />
		<p class="sidebar-copyright">
			© 2026 ARSENOVA<br>
			arsenova.xyz · CC BY-NC-SA
		</p>
	</footer>
</aside>
</template>

<style lang="scss" scoped>
#blog-sidebar {
	display: flex;
	flex-direction: column;
	gap: 1.1rem;
	padding: 1.5rem 1rem;
	border-right: 1px solid var(--c-border);
	background: var(--c-bg-1);
	color: var(--c-text-2);

	&:hover {
		color: currentcolor;
	}

	@media (max-width: $breakpoint-mobile) {
		position: fixed;
		inset-inline-start: 0;
		width: 320px;
		max-width: 100%;
		border-right: 1px solid var(--c-border);
		background-color: var(--ld-bg-blur);
		backdrop-filter: blur(16px);
		color: currentcolor;
		transform: var(--transform-start-far);
		transition: transform 0.2s;
		z-index: var(--z-index-popover);

		&.show {
			box-shadow: var(--box-shadow-1);
			transform: none;
		}
	}
}

.sidebar-nav {
	flex-grow: 1;
	padding: 0;
	font-family: var(--font-heading);
	font-size: var(--text-base);

	h3 {
		margin: 1.6em 0 0.8em 0.7em;
		font: inherit;
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--c-text-2);
	}

	li {
		margin: 0.2rem 0;
	}
}

.sidebar-nav-item {
	display: flex;
	align-items: center;
	gap: 0.75em;
	min-height: 2.85rem;
	padding: 0.62em 0.78em;
	border-radius: var(--radius);
	corner-shape: superellipse(1.2);
	font-weight: 650;
	color: var(--c-text-2);
	transition: background-color 0.2s, color 0.2s, transform 0.2s;

	&:hover {
		background-color: var(--c-bg-2);
		color: var(--c-text-1);
		transform: translateX(1px);
	}

	&.router-link-active {
		background-color: var(--ld-bg-active);
		color: var(--c-primary);
		transform: none;

		.dark & {
			background-color: color-mix(in srgb, var(--c-primary) 17%, var(--c-bg-2));
		}
	}

	> .iconify {
		font-size: 1.28em;
	}

	> .nav-text {
		flex-grow: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	> .external-tip {
		opacity: 0.5;
		font-size: 1em;
	}
}

.search-btn {
	opacity: 0.88;
	margin: 0.4rem 0 1rem;
	border: 1px solid var(--c-border);
	box-shadow: var(--box-shadow-1);
	background: var(--ld-bg-card);
	font-size: var(--text-sm);
	cursor: text;
	user-select: none;

	&:hover {
		opacity: 1;
		border-color: transparent;
		background-color: var(--ld-bg-card);
	}
}

.sidebar-footer {
	--gap: clamp(0.5rem, 3vh, 1rem);

	display: grid;
	gap: var(--gap);
	padding: 0;
	font-size: 0.8em;
	text-align: start;
	color: var(--c-text-2);
}

.sidebar-copyright {
	padding: 0 0.2rem;
	font-family: var(--font-monospace);
	font-size: 0.68rem;
	line-height: 1.6;
	color: var(--c-text-3);
}
</style>
