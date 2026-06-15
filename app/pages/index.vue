<script setup lang="ts">
const appConfig = useAppConfig()
useSeoMeta({
	description: appConfig.description,
})

const layoutStore = useLayoutStore()
layoutStore.setAside([])
const searchStore = useSearchStore()

const { data: listRaw } = await useAsyncData('index_posts', () => useArticleIndexOptions(), { default: () => [] })
const { listSorted, isAscending, sortOrder } = useArticleSort(listRaw, { bindDirectionQuery: 'asc', bindOrderQuery: 'sort' })
const { category, categories, listCategorized } = useCategory(listSorted, { bindQuery: 'category' })
const { page, totalPages, listPaged } = usePagination(listCategorized, { bindQuery: 'page' })

watch(category, () => {
	page.value = 1
})

useSeoMeta({ title: () => (page.value > 1 ? `第${page.value}页` : '') })

const homeMode = computed(() => page.value === 1 && !category.value)
const featuredNotes = computed(() => listSorted.value.slice(0, 5))
const featuredArticle = computed(() => homeMode.value ? featuredNotes.value.find(article => article.image) ?? featuredNotes.value[0] : undefined)
const displayList = computed(() => homeMode.value && featuredArticle.value
	? listPaged.value.filter(article => article.path !== featuredArticle.value?.path)
	: listPaged.value)
const heroCategories = computed(() => categories.value.filter((item): item is string => Boolean(item)).slice(0, 5))

function applyCategory(item?: string) {
	category.value = item
	page.value = 1
}
</script>

<template>
<BlogHeader class="mobile-only" to="/" tag="h1" />

<UtilHydrateSafe>
	<div class="post-list" :class="{ 'is-home': homeMode }">
		<section v-if="homeMode" class="home-hero">
			<h1 class="home-title">
				愿你穿过长夜万里，<span>归来仍有风声与星河。</span>
			</h1>
			<p class="home-description">
				{{ appConfig.description }}
				<em>—— 私人传输 _</em>
			</p>

			<div class="home-tools">
				<button class="home-search" type="button" @click="layoutStore.toggle('search')">
					<Icon name="tabler:search" />
					<span>{{ searchStore.word || '搜索文章…' }}</span>
				</button>

				<div v-if="heroCategories.length" class="home-categories" aria-label="文章分类">
					<button
						v-for="item in heroCategories"
						:key="item"
						type="button"
						class="category-chip"
						:class="{ active: category === item }"
						@click="applyCategory(item)"
					>
						<Icon :name="getCategoryIcon(item)" />
						{{ item }}
					</button>
				</div>
			</div>
		</section>

		<section v-if="homeMode && featuredArticle" class="featured-section">
			<div class="section-label">
				<Icon name="tabler:flame" />
				<span>精选</span>
			</div>

			<UtilLink class="featured-card gradient-card" :to="featuredArticle.path">
				<div v-if="featuredArticle.image" class="featured-cover">
					<NuxtImg
						class="featured-img"
						:src="featuredArticle.image"
						:alt="featuredArticle.title"
					/>
				</div>

				<div class="featured-body" :class="{ 'no-img': !featuredArticle.image }">
					<div class="featured-meta">
						<span v-if="featuredArticle.categories?.[0]" class="category-chip static">
							<Icon :name="getCategoryIcon(featuredArticle.categories[0])" />
							{{ featuredArticle.categories[0] }}
						</span>
						<UtilDate v-if="featuredArticle.date" :date="featuredArticle.date" icon="tabler:calendar" />
						<span v-if="featuredArticle.readingTime?.minutes">
							<Icon name="tabler:clock" />
							{{ Math.max(1, Math.ceil(featuredArticle.readingTime.minutes)) }}分钟
						</span>
					</div>
					<h2 class="featured-title">
						{{ featuredArticle.title }}
					</h2>
					<p v-if="featuredArticle.description" class="featured-description">
						{{ featuredArticle.description }}
					</p>
				</div>
			</UtilLink>
		</section>

		<PostOrderToggle
			v-model:is-ascending="isAscending"
			v-model:sort-order="sortOrder"
			v-model:category="category"
			class="feed-controls"
			:categories
		>
			<ZSecret>
				<UtilLink
					to="/preview"
					class="preview-entrance"
				>
					<Icon name="tabler:shield-lock" />
					查看预览文章
				</UtilLink>
			</ZSecret>
		</PostOrderToggle>

		<div class="section-label recent-label">
			<Icon name="tabler:notes" />
			<span>{{ homeMode ? '最近更新' : category || '文章列表' }}</span>
		</div>

		<TransitionGroup tag="menu" class="proper-height" name="float-in">
			<PostArticle
				v-for="article, index in displayList"
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
.post-list {
	max-width: var(--feed-max);
	margin: 0 auto;
	padding: 2.5rem var(--gutter) 4rem;

	@media (max-width: $breakpoint-mobile) {
		padding: 1rem;
	}
}

.home-hero {
	margin-bottom: 2.25rem;
	animation: float-in 0.28s both;
}

.home-title {
	max-width: 48rem;
	font-family: var(--font-display);
	font-size: clamp(2.1rem, 6vw, var(--text-3xl));
	font-weight: 400;
	letter-spacing: 0.03em;
	line-height: 1.12;
	color: var(--c-text);

	span {
		color: var(--c-primary);
	}
}

.home-description {
	max-width: 36rem;
	margin-top: 0.75rem;
	font-size: var(--text-md);
	line-height: var(--lh-snug);
	color: var(--c-text-2);

	em {
		display: inline-block;
		margin-inline-start: 0.25em;
		font-family: var(--font-monospace);
		font-style: normal;
		color: var(--c-text-3);
	}
}

.home-tools {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.75rem;
	margin-top: 1.5rem;
}

.home-search {
	display: inline-flex;
	align-items: center;
	gap: 0.55em;
	width: min(100%, 280px);
	padding: 0.64em 0.78em;
	border: 1px solid var(--c-border);
	border-radius: var(--radius);
	corner-shape: superellipse(1.2);
	box-shadow: var(--box-shadow-1);
	background: var(--ld-bg-card);
	font-size: var(--text-sm);
	text-align: start;
	color: var(--c-text-3);
	transition: border-color 0.2s, color 0.2s, box-shadow 0.2s;

	&:hover {
		border-color: var(--c-primary);
		box-shadow: var(--box-shadow-2);
		color: var(--c-text-1);
	}
}

.home-categories {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.featured-section {
	margin-bottom: 2.25rem;
}

.section-label {
	display: flex;
	align-items: center;
	gap: 0.6em;
	margin: 0 0 1rem;
	font-family: var(--font-heading);
	font-size: var(--text-sm);
	font-weight: 700;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: var(--c-text-3);
}

.recent-label {
	margin-top: 1.35rem;
}

.featured-card {
	display: block;
	overflow: hidden;
	border: 1px solid var(--c-border);
	border-radius: var(--radius);
	corner-shape: superellipse(1.2);
	box-shadow: var(--box-shadow-1);
	background: var(--ld-bg-card);
	transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;

	&:hover {
		box-shadow: var(--box-shadow-2);
		transform: translateY(-2px);

		.featured-img {
			transform: scale(1.04);
		}
	}
}

.featured-cover {
	overflow: hidden;
	aspect-ratio: 16 / 9;
	background: var(--c-bg-3);
}

.featured-img {
	width: 100%;
	height: 100%;
	transition: transform 0.4s var(--ease-to-full);
	object-fit: contain;
}

.featured-body {
	display: grid;
	gap: 0.6em;
	padding: 1.1rem 1.25rem 1.25rem;

	&.no-img {
		padding-top: 1.25rem;
	}
}

.featured-meta {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.8em;
	font-family: var(--font-heading);
	font-size: var(--text-sm);
	color: var(--c-text-3);

	span {
		display: inline-flex;
		align-items: center;
		gap: 0.35em;
	}
}

.featured-title {
	font-family: var(--font-heading);
	font-size: var(--text-lg);
	font-weight: var(--fw-creative);
	line-height: var(--lh-snug);
	color: var(--c-text);
}

.featured-description {
	display: -webkit-box;
	overflow: hidden;
	font-size: var(--text-base);
	-webkit-line-clamp: 2;
	line-height: var(--lh-snug);
	color: var(--c-text-2);
	-webkit-box-orient: vertical;
}

.category-chip {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	width: fit-content;
	padding: 0.36rem 0.66rem;
	border: 1px solid var(--c-border);
	border-radius: 999px;
	background: var(--ld-bg-card);
	font-family: var(--font-heading);
	font-size: var(--text-sm);
	font-weight: 600;
	color: var(--c-text-2);
	transition: border-color 0.2s, background-color 0.2s, color 0.2s;

	&:hover,
	&.active,
	&.static {
		border-color: color-mix(in srgb, var(--c-primary) 42%, transparent);
		background: var(--c-primary-soft);
		color: var(--c-primary);
	}
}

.feed-controls {
	margin-bottom: 1rem;
}

.proper-height {
	display: grid;
	align-content: start;
	gap: 1rem;
}

.float-in-leave-to {
	position: absolute;
}

@media (max-width: $breakpoint-mobile) {
	.home-title {
		font-size: 2rem;
	}

	.home-description em {
		display: block;
		margin: 0.45rem 0 0;
	}
}
</style>
