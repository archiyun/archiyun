<script setup lang="ts">
import type { ArticleProps } from '~/types/article'

const props = defineProps<{ useUpdated?: boolean } & ArticleProps>()

const appConfig = useAppConfig()

const showAllDate = isTimeDiffSignificant(props.date, props.updated)

const categoryLabel = computed(() => props.categories?.[0])
const categoryColor = computed(() => appConfig.article.categories[categoryLabel.value!]?.color || 'var(--c-primary)')
const categoryIcon = computed(() => getCategoryIcon(categoryLabel.value))
const moodTag = computed(() => props.tags?.[0] || (categoryLabel.value === '生活' ? 'mood' : 'focus'))
const readMinutes = computed(() => props.readingTime?.minutes ? Math.max(1, Math.ceil(props.readingTime.minutes)) : undefined)
</script>

<template>
<UtilLink class="article-card card upraise" :class="{ 'has-cover': image }">
	<article>
		<div v-if="categoryLabel || (updated && useUpdated)" class="article-topline">
			<span
				v-if="categoryLabel"
				class="article-category"
				:style="{ '--cg-color': categoryColor }"
			>
				<Icon :name="categoryIcon" />
				{{ categoryLabel }}
			</span>

			<span v-if="updated && useUpdated" class="article-updated-tip">
				<Icon name="tabler:clock-edit" />
				最近更新
			</span>
		</div>

		<h2 class="article-title text-creative">
			{{ title }}
		</h2>

		<p v-if="description" class="article-description">
			{{ description }}
		</p>

		<div class="article-footer">
			<div class="article-info">
				<UtilDate
					v-if="date && (showAllDate || !useUpdated)"
					:date
					icon="tabler:pencil-minus"
				/>

				<UtilDate
					v-if="updated && (showAllDate || useUpdated)"
					:class="{ 'use-updated': useUpdated }"
					:date="updated"
					icon="tabler:clock-edit"
				/>

				<span v-if="readingTime?.words" class="article-words">
					<Icon name="tabler:pilcrow" />
					{{ formatNumber(readingTime?.words) }}字
				</span>

				<span v-if="readMinutes" class="article-words">
					<Icon name="tabler:clock" />
					{{ readMinutes }}分钟
				</span>

				<span class="article-mood">
					<Icon name="tabler:sparkles" />
					{{ moodTag }}
				</span>
			</div>

			<div class="article-cta">
				继续阅读
				<Icon name="tabler:arrow-up-right" />
			</div>
		</div>
	</article>
	<NuxtImg v-if="image" class="article-cover" :src="image" :alt="title" />
</UtilLink>
</template>

<style lang="scss" scoped>
.article-card {
	container-type: inline-size;
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: 1rem;
	position: relative;
	overflow: hidden;
	margin: 1em 0;
	border: 1px solid var(--c-border);
	border-radius: 0.75rem;
	background: var(--ld-bg-card);
	color: var(--c-text);
	animation: float-in 0.2s var(--delay) backwards;

	&.has-cover {
		grid-template-columns: minmax(0, 1fr) clamp(12rem, 28%, 18rem);
	}

	> article {
		display: grid;
		align-content: start;
		gap: 0.85rem;
		padding: 1.15rem;
	}
}

.article-topline {
	display: flex;
	flex-wrap: wrap;
	gap: 0.6rem;
}

.article-info {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5em clamp(1em, 4%, 1.35em);
	font-size: 0.84rem;
	letter-spacing: 0.01em;
	color: var(--c-text-2);

	&:empty {
		display: none;
	}

	.use-updated {
		order: -1;
	}
}

.article-footer {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem 1rem;
	margin-top: 0.25rem;
}

.article-title {
	font-family: var(--font-heading);
	font-size: clamp(1.4rem, 2.5vw, 1.75rem);
	font-weight: 750;
	letter-spacing: 0;
	line-height: 1.22;
	color: var(--c-text);
}

.article-description {
	display: -webkit-box;
	overflow: hidden;
	font-size: 0.98rem;
	letter-spacing: 0.015em;
	-webkit-line-clamp: 2;
	line-height: 1.82;
	color: var(--c-text-2);
	-webkit-box-orient: vertical;
}

.article-category {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	width: fit-content;
	padding: 0.42rem 0.72rem;
	border: 1px solid color-mix(in srgb, var(--cg-color) 42%, transparent);
	border-radius: 0.35rem;
	background-color: color-mix(in srgb, var(--cg-color) 8%, var(--ld-bg-card));
	font-size: 0.8rem;
	font-weight: 600;
	color: var(--cg-color);
}

.article-updated-tip {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	padding: 0.42rem 0.72rem;
	border: 1px solid var(--c-border);
	border-radius: 0.35rem;
	background-color: var(--ld-bg-card);
	font-size: 0.8rem;
	font-weight: 600;
	color: var(--c-primary);
}

.article-mood {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	color: var(--c-primary);
}

.article-cta {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	margin-inline-start: auto;
	font-size: 0.86rem;
	font-weight: 600;
	color: var(--c-text-1);
}

.article-cover {
	width: 100%;
	height: 100%;
	min-height: 100%;
	transition: transform 0.35s, filter 0.35s;
	filter: saturate(1.05) contrast(1.02);
	object-fit: cover;

	.article-card:hover > & {
		transform: scale(1.03);
	}

	@container (max-width: #{$breakpoint-mobile}) {
		min-height: 14rem;
	}
}

@media (max-width: $breakpoint-mobile) {
	.article-card.has-cover {
		grid-template-columns: 1fr;
	}

	.article-cover {
		order: -1;
		aspect-ratio: 2.2;
	}
}
</style>
