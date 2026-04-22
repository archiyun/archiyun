<script setup lang="ts">
import { orderBy } from 'es-toolkit/array'

const appConfig = useAppConfig()
useSeoMeta({
	description: appConfig.description,
})

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'comm-group'])

const { data: listRaw } = await useAsyncData('index_posts', () => useArticleIndexOptions(), { default: () => [] })
const { listSorted, isAscending, sortOrder } = useArticleSort(listRaw, { bindDirectionQuery: 'asc', bindOrderQuery: 'sort' })
const { category, categories, listCategorized } = useCategory(listSorted, { bindQuery: 'category' })
const { page, totalPages, listPaged } = usePagination(listCategorized, { bindQuery: 'page' })

watch(category, () => {
	page.value = 1
})

useSeoMeta({ title: () => (page.value > 1 ? `第${page.value}页` : '') })

const listRecommended = computed(() => orderBy(
	listRaw.value.filter(item => item.recommend !== null),
	['recommend', 'date'],
	['desc'],
))

const latestArticle = computed(() => listSorted.value[0])
const featuredArticle = computed(() => listRecommended.value[0] || latestArticle.value)
const totalWords = computed(() => listRaw.value.reduce((sum, item) => sum + (item.readingTime?.words || 0), 0))
const topCategories = computed(() => Object.entries(listRaw.value.reduce<Record<string, number>>((acc, item) => {
	for (const categoryName of item.categories || []) {
		if (!categoryName)
			continue
		acc[categoryName] = (acc[categoryName] || 0) + 1
	}
	return acc
}, {}))
	.sort((a, b) => b[1] - a[1])
	.slice(0, 3))
</script>

<template>
<BlogHeader class="mobile-only" to="/" tag="h1" />

<UtilHydrateSafe>
	<section v-if="page === 1 && !category" class="home-hero gradient-card">
		<div class="hero-copy">
			<div class="hero-kicker">
				<Icon name="tabler:writing-sign" />
				个人博客
			</div>

			<h1 class="hero-title text-creative">
				{{ appConfig.title }}
			</h1>

			<p class="hero-subtitle">
				{{ appConfig.header.subtitle }}
			</p>

			<p class="hero-description">
				{{ appConfig.description }}
			</p>

			<div class="hero-actions">
				<UtilLink v-if="featuredArticle" :to="featuredArticle.path" class="hero-button primary">
					<Icon name="tabler:sparkles" />
					{{ listRecommended.length ? '从精选开始' : '阅读最新文章' }}
				</UtilLink>

				<UtilLink to="/archive" class="hero-button secondary">
					<Icon name="tabler:stack-2" />
					浏览归档
				</UtilLink>
			</div>

			<menu v-if="topCategories.length" class="hero-topics">
				<li v-for="[categoryName, count] in topCategories" :key="categoryName">
					<Icon :name="getCategoryIcon(categoryName)" />
					<span>{{ categoryName }}</span>
					<small>{{ count }} 篇</small>
				</li>
			</menu>

			<div class="hero-stats">
				<div class="hero-stat">
					<strong>{{ listRaw.length }}</strong>
					<span>文章</span>
				</div>

				<div class="hero-stat">
					<strong>{{ formatNumber(totalWords) }}</strong>
					<span>累计字数</span>
				</div>

				<div v-if="latestArticle?.date || latestArticle?.updated" class="hero-stat">
					<strong>
						<UtilDate :date="latestArticle?.updated || latestArticle?.date" relative nospace />
					</strong>
					<span>最近更新</span>
				</div>
			</div>
		</div>

		<UtilLink v-if="featuredArticle" :to="featuredArticle.path" class="hero-feature card upraise">
			<NuxtImg
				v-if="featuredArticle.image"
				class="hero-feature-image"
				:src="featuredArticle.image"
				:alt="featuredArticle.title"
			/>

			<div class="hero-feature-body">
				<div class="hero-feature-label">
					<Icon :name="listRecommended.length ? 'tabler:star-filled' : 'tabler:clock-edit'" />
					{{ listRecommended.length ? '编辑推荐' : '最近发布' }}
				</div>

				<h2 class="hero-feature-title text-creative">
					{{ featuredArticle.title }}
				</h2>

				<p class="hero-feature-description">
					{{ featuredArticle.description || appConfig.description }}
				</p>

				<div class="hero-feature-meta">
					<UtilDate v-if="featuredArticle.date" :date="featuredArticle.updated || featuredArticle.date" />
					<span v-if="featuredArticle.categories?.[0]" class="hero-feature-category">
						<Icon :name="getCategoryIcon(featuredArticle.categories[0])" />
						{{ featuredArticle.categories[0] }}
					</span>
				</div>
			</div>
		</UtilLink>
	</section>

	<PostSlide v-if="listRecommended.length && page === 1 && !category" :list="listRecommended" />

	<div class="post-list">
		<PostOrderToggle
			v-model:is-ascending="isAscending"
			v-model:sort-order="sortOrder"
			v-model:category="category"
			:categories
		>
			<ZSecret>
				<UtilLink to="/preview" class="preview-entrance">
					<Icon name="tabler:shield-lock" />
					查看预览文章
				</UtilLink>
			</ZSecret>
		</PostOrderToggle>

		<TransitionGroup tag="menu" class="proper-height" name="float-in">
			<PostArticle
				v-for="article, index in listPaged"
				:key="article.path"
				v-bind="article"
				:to="article.path"
				:use-updated="sortOrder === 'updated'"
				:style="getFixedDelay(index * 0.05)"
			/>
		</TransitionGroup>

		<ZPagination v-model="page" sticky avoid :total-pages="totalPages" />
	</div>
</UtilHydrateSafe>
</template>

<style lang="scss" scoped>
.home-hero {
	display: grid;
	grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.9fr);
	gap: 1.25rem;
	position: relative;
	overflow: hidden;
	margin: 1rem;
	padding: clamp(1.25rem, 2vw, 2rem);

	&::after {
		content: "";
		position: absolute;
		top: -4rem;
		right: 18%;
		width: 14rem;
		height: 14rem;
		border-radius: 50%;
		background: radial-gradient(circle, hsl(24deg 100% 70% / 20%), transparent 65%);
		filter: blur(8px);
		pointer-events: none;
	}
}

.hero-copy {
	display: grid;
	align-content: start;
	gap: 1rem;
	position: relative;
	z-index: 1;
}

.hero-kicker {
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
	width: fit-content;
	padding: 0.45rem 0.8rem;
	border: 1px solid var(--c-border);
	border-radius: 999px;
	background-color: var(--c-bg-a50);
	font-size: 0.82rem;
	color: var(--c-text-2);
	backdrop-filter: blur(12px);
}

.hero-title {
	font-size: clamp(2.4rem, 6vw, 4.4rem);
	line-height: 0.95;
	letter-spacing: -0.04em;
	color: var(--c-text);
}

.hero-subtitle {
	font-size: clamp(1.05rem, 1.5vw, 1.3rem);
	color: var(--c-text-1);
}

.hero-description {
	max-width: 34rem;
	font-size: 1rem;
	line-height: 1.8;
	color: var(--c-text-2);
}

.hero-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.hero-button {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.85rem 1.1rem;
	border-radius: 999px;
	border: 1px solid var(--c-border);
	background-color: var(--c-bg-a50);
	font-weight: 600;
	transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
	backdrop-filter: blur(12px);

	&:hover {
		box-shadow: var(--box-shadow-2);
		transform: translateY(-1px);
	}

	&.primary {
		border-color: transparent;
		background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
		color: white;
	}
}

.hero-topics {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;

	> li {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.75rem;
		border-radius: 999px;
		background-color: var(--c-bg-soft);
		color: var(--c-text-1);

		> small {
			opacity: 0.7;
			font-size: 0.76rem;
		}
	}
}

.hero-stats {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.75rem;
	max-width: 40rem;
}

.hero-stat {
	display: grid;
	gap: 0.25rem;
	padding: 0.9rem 1rem;
	border: 1px solid var(--c-border);
	border-radius: 1rem;
	background-color: var(--c-bg-a50);
	backdrop-filter: blur(12px);

	> strong {
		font-size: 1.05rem;
		color: var(--c-text);
	}

	> span {
		font-size: 0.8rem;
		color: var(--c-text-2);
	}
}

.hero-feature {
	display: grid;
	overflow: hidden;
	align-self: stretch;
	min-height: 100%;
	border: 1px solid var(--c-border);
	background:
		linear-gradient(180deg, transparent, var(--c-bg-a80)),
		var(--ld-bg-card);
}

.hero-feature-image {
	width: 100%;
	height: min(18rem, 38vh);
	object-fit: cover;
}

.hero-feature-body {
	display: grid;
	gap: 0.9rem;
	padding: 1.15rem;
}

.hero-feature-label {
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
	width: fit-content;
	padding: 0.35rem 0.65rem;
	border-radius: 999px;
	background-color: var(--c-primary-soft);
	font-size: 0.82rem;
	color: var(--c-primary);
}

.hero-feature-title {
	font-size: clamp(1.4rem, 2vw, 2rem);
	line-height: 1.1;
	color: var(--c-text);
}

.hero-feature-description {
	line-height: 1.75;
	color: var(--c-text-2);
}

.hero-feature-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem 1rem;
	font-size: 0.88rem;
	color: var(--c-text-2);
}

.hero-feature-category {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	color: var(--c-text-1);
}

.post-list {
	margin: 1rem;
}

.float-in-leave-to {
	position: absolute;
}

@media (max-width: $breakpoint-mobile) {
	.home-hero {
		grid-template-columns: 1fr;
	}

	.hero-stats {
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
	}
}

@media (max-width: $breakpoint-phone) {
	.home-hero {
		padding: 1rem;
	}

	.hero-title {
		font-size: 2.5rem;
	}

	.hero-actions,
	.hero-topics {
		display: grid;
	}

	.hero-button {
		justify-content: center;
	}
}
</style>
