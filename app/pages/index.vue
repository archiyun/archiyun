<script setup lang="ts">
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

const homeMode = computed(() => page.value === 1 && !category.value)
const featuredNotes = computed(() => listSorted.value.slice(0, 5))
</script>

<template>
<BlogHeader class="mobile-only" to="/" tag="h1" />

<UtilHydrateSafe>
	<div class="post-list">
		<section v-if="homeMode && featuredNotes.length" class="featured-section">
			<div class="featured-label">
				<span>精选</span>
				<h2>近期文章</h2>
			</div>
			<div class="featured-row scrollcheck-x">
				<UtilLink
					v-for="article in featuredNotes"
					:key="article.path"
					:to="article.path"
					class="featured-card"
				>
					<NuxtImg
						v-if="article.image"
						class="featured-img"
						:src="article.image"
						:alt="article.title"
					/>
					<div class="featured-body" :class="{ 'no-img': !article.image }">
						<span v-if="article.categories?.[0]" class="featured-cat">
							{{ article.categories[0] }}
						</span>
						<strong class="featured-title">{{ article.title }}</strong>
						<UtilDate v-if="article.date" class="featured-date" :date="article.date" />
					</div>
				</UtilLink>
			</div>
		</section>

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
.post-list {
	margin: 1rem;
}

.featured-section {
	margin-bottom: 0.5rem;
}

.featured-label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.75rem;

	span {
		padding: 0.15rem 0.55rem;
		border-radius: 0.25rem;
		background: var(--c-primary-soft);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--c-primary);
	}

	h2 {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--c-text-2);
	}
}

.featured-row {
	display: flex;
	gap: 0.75rem;
	padding-bottom: 0.5rem;
}

.featured-card {
	flex: 0 0 200px;
	display: grid;
	grid-template-rows: auto 1fr;
	overflow: hidden;
	border: 1px solid var(--c-border);
	border-radius: 0.5rem;
	background: var(--ld-bg-card);
	box-shadow: var(--box-shadow-1);
	transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;

	&:hover {
		transform: translateY(-2px);
		border-color: var(--c-primary);
		box-shadow: var(--box-shadow-2);
	}
}

.featured-img {
	width: 100%;
	aspect-ratio: 16 / 9;
	object-fit: cover;
}

.featured-body {
	display: grid;
	gap: 0.25rem;
	padding: 0.65rem 0.75rem;

	&.no-img {
		padding-top: 0.85rem;
	}
}

.featured-cat {
	font-size: 0.68rem;
	font-weight: 700;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--c-primary);
}

.featured-title {
	font-size: 0.88rem;
	font-weight: 600;
	line-height: 1.4;
	color: var(--c-text);
	display: -webkit-box;
	overflow: hidden;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
}

.featured-date {
	font-size: 0.74rem;
	color: var(--c-text-3);
	margin-top: 0.1rem;
}

.float-in-leave-to {
	position: absolute;
}
</style>
