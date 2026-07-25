<script setup lang="ts">
import type { ArticleProps } from '~/types/article'
import { groupBy } from 'es-toolkit/array'

useSeoMeta({
	title: '系列',
	description: '按系列整理 ARSENOVA 的工程笔记、算法手账和长期项目。',
})

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech'])

const { data: listRaw } = await useAsyncData('series_posts', () => useArticleIndexOptions(), { default: () => [] })
const { listSorted } = useArticleSort(listRaw)

const seriesGroups = computed(() => {
	const withSeries = listSorted.value.filter(article => article.series?.name)
	return Object.entries(groupBy(withSeries, article => article.series!.slug || article.series!.name))
		.map(([slug, articles]) => ({
			slug,
			name: articles[0]!.series!.name,
			description: articles[0]!.series?.description,
			articles: [...articles].sort(compareSeriesArticle),
			words: articles.reduce((total, article) => total + (article.readingTime?.words ?? 0), 0),
			updated: articles.map(article => article.updated || article.date).filter(Boolean).sort().at(-1),
		}))
		.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''))
})

function compareSeriesArticle(a: ArticleProps, b: ArticleProps) {
	const orderA = a.series?.order ?? Number.POSITIVE_INFINITY
	const orderB = b.series?.order ?? Number.POSITIVE_INFINITY
	if (orderA !== orderB)
		return orderA - orderB
	return (a.date || '').localeCompare(b.date || '')
}
</script>

<template>
<BlogHeader class="mobile-only" to="/" tag="h1" />
<section class="series-page">
	<div v-if="seriesGroups.length" class="series-grid">
		<section
			v-for="group, groupIndex in seriesGroups"
			:key="group.slug"
			class="series-card card upraise gradient-card"
			:style="getFixedDelay(groupIndex * 0.05)"
		>
			<div class="series-topline">
				<span class="series-kicker">
					<Icon name="tabler:folders" />
					{{ group.articles.length }} 篇
				</span>
				<span>{{ formatNumber(group.words) }} 字</span>
			</div>

			<h2>{{ group.name }}</h2>
			<p v-if="group.description" class="series-description">
				{{ group.description }}
			</p>

			<menu class="series-list">
				<li v-for="article in group.articles" :key="article.path">
					<UtilLink :to="article.path">
						<span v-if="article.series?.order" class="series-order">
							{{ article.series.order.toString().padStart(2, '0') }}
						</span>
						<span class="series-title">{{ article.title }}</span>
						<Icon name="tabler:arrow-up-right" />
					</UtilLink>
				</li>
			</menu>
		</section>
	</div>

	<ZError
		v-else
		icon="tabler:folders-off"
		title="还没有系列"
		desc="给文章 frontmatter 添加 series 后，它们会自动出现在这里。"
	/>
</section>
</template>

<style lang="scss" scoped>
.series-page {
	max-width: var(--feed-max);
	margin: 0 auto;
	padding: 1rem;
}

.series-grid {
	display: grid;
	gap: 1rem;
}

.series-card {
	display: grid;
	gap: 0.85rem;
	padding: 1.1rem 1.25rem;
	animation: float-in 0.2s var(--delay) backwards;

	h2 {
		font-family: var(--font-heading);
		font-size: var(--text-xl);
		font-weight: var(--fw-creative);
		line-height: var(--lh-snug);
		color: var(--c-text);
	}
}

.series-topline {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.6rem;
	font-family: var(--font-monospace);
	font-size: var(--text-xs);
	color: var(--c-text-3);
}

.series-kicker {
	display: inline-flex;
	align-items: center;
	gap: 0.35em;
	color: var(--c-primary);
}

.series-description {
	max-width: 42rem;
	font-size: var(--text-base);
	line-height: var(--lh-snug);
	color: var(--c-text-2);
}

.series-list {
	display: grid;
	gap: 0.45rem;
	margin-top: 0.25rem;

	a {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.7rem;
		padding: 0.62rem 0.75rem;
		border-radius: var(--radius);
		corner-shape: superellipse(1.2);
		background: var(--c-bg-2);
		color: var(--c-text-2);
		transition: background-color 0.2s, color 0.2s, transform 0.2s;

		&:hover {
			background: var(--c-primary-soft);
			color: var(--c-primary);
			transform: translateX(2px);
		}
	}
}

.series-order {
	font-family: var(--font-monospace);
	font-size: var(--text-xs);
	color: var(--c-text-3);
}

.series-title {
	overflow: hidden;
	font-weight: 650;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>
