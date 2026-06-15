<script setup lang="ts">
import type { ArticleProps } from '~/types/article'

defineOptions({ inheritAttrs: false })
const props = defineProps<ArticleProps>()

const router = useRouter()
const appConfig = useAppConfig()

const coverFilter = computed(() => props.meta?.coverFilter || (props.meta?.coverDim && 'brightness(0.75)') || undefined)
const categoryLabel = computed(() => props.categories?.[0])
const categoryIcon = computed(() => getCategoryIcon(categoryLabel.value))

const shareText = `【${appConfig.title}】${props.title}\n\n${
	props.description ? `${props.description}\n\n` : ''}${
	new URL(props.path!, appConfig.url).href}`

const { copy, copied } = useCopy(shareText)

function goBack() {
	if (import.meta.client && window.history.length > 1) {
		router.back()
		return
	}

	router.push('/')
}
</script>

<template>
<div class="post-header" :class="{ 'has-cover': image }">
	<div class="post-actions">
		<ZButton icon="tabler:arrow-left" text="返回" @click="goBack" />
	</div>

	<div class="post-nav">
		<div class="operations">
			<Icon v-show="false" name="tabler:check" />
			<ZButton
				:icon="copied ? 'tabler:check' : 'tabler:share'"
				text="文字分享"
				@click="copy()"
			/>
		</div>

		<div v-if="!meta?.hideInfo" class="post-info">
			<UtilDate
				v-if="date"
				v-tip
				class="post-meta-item"
				:tip-transform="d => `创建于${d}`"
				:date
				icon="tabler:pencil-minus"
			/>

			<UtilDate
				v-if="updated && isTimeDiffSignificant(date, updated, 1)"
				v-tip
				class="post-meta-item"
				:tip-transform="d => `修改于${d}`"
				:date="updated"
				icon="tabler:clock-edit"
			/>

			<span v-if="categoryLabel" class="post-meta-item post-category">
				<Icon :name="categoryIcon" />
				{{ categoryLabel }}
			</span>

			<span class="post-meta-item">
				<Icon name="tabler:pilcrow" />
				{{ formatNumber(readingTime?.words) }} 字
			</span>
		</div>
	</div>

	<h1 class="post-title" :class="getPostTypeClassName(type)">
		{{ title }}
	</h1>

	<Pic v-if="image" class="post-cover" :src="image" :alt="title" :filter="coverFilter" />
</div>
</template>

<style lang="scss" scoped>
.post-header {
	display: grid;
	gap: 0.9rem;
	max-width: var(--content-max);
	margin: 2rem auto 0;
	padding: 0 var(--gutter);
	color: var(--c-text);

	@media (max-width: $breakpoint-mobile) {
		margin-top: 1rem;
		padding: 0 1rem;
	}

	&:hover .operations,
	&:focus-within .operations {
		opacity: 1;
	}

	&.has-cover {
		transition: font-size 0.2s;
	}
}

.post-actions {
	display: flex;
	align-items: center;
}

.operations {
	opacity: 0;
	margin-inline-start: auto;
	color: var(--c-text-1);
	transition: opacity 0.2s;
	z-index: 1;
}

.post-cover {
	contain: paint;
	overflow: hidden;
	width: 100%;
	aspect-ratio: 16 / 9;
	margin-top: 0.25rem;
	border: 1px solid var(--c-border);
	border-radius: var(--radius);
	corner-shape: superellipse(1.2);
	box-shadow: var(--box-shadow-1);
	background: var(--c-bg-3);

	> :deep(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

.post-title {
	font-family: var(--font-heading);
	font-size: clamp(2rem, 5vw, var(--text-2xl));
	font-weight: var(--fw-creative);
	letter-spacing: 0.012em;
	line-height: var(--lh-tight);
	text-wrap: balance;
	z-index: 1;

	&.text-story {
		font-family: var(--font-serif);
		font-weight: 600;
		line-height: 1.28;
	}
}

.post-nav {
	display: flex;
	align-items: flex-start;
	gap: 1rem;
	font-family: var(--font-heading);
	font-size: var(--text-sm);

	.post-info {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55em 0.7em;
		line-height: 1.5;
		color: var(--c-text-3);

		:deep(.post-meta-item),
		span.post-meta-item {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			padding: 0.2em 0.6em;
			border-radius: var(--radius-pill);
			background: var(--c-bg-2);
			font-weight: 600;
		}

		.post-category {
			background: var(--c-primary-soft);
			color: var(--c-primary);
		}
	}
}
</style>
