<script setup lang="ts">
useSeoMeta({ title: 'Life' })

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-log', 'comm-group'])

const { data: listRaw } = await useAsyncData('life_posts', () => useArticleIndexOptions(), { default: () => [] })
const { listSorted } = useArticleSort(listRaw)
const lifeList = computed(() => listSorted.value.filter(item => item.categories?.some(name => ['生活', '杂谈'].includes(name))))
</script>

<template>
<BlogHeader class="mobile-only" to="/" tag="h1" />
<section class="channel-page">
	<header class="channel-hero">
		<span>CITY / MOOD / PERSONAL LOG</span>
		<h1 class="text-creative">
			Life
		</h1>
		<p>把日常、情绪、歌单和没整理成观点的片段也认真收好。</p>
	</header>

	<menu class="channel-list">
		<PostArticle
			v-for="article, index in lifeList"
			:key="article.path"
			v-bind="article"
			:to="article.path"
			:style="getFixedDelay(index * 0.04)"
		/>
	</menu>
</section>
</template>

<style lang="scss" scoped>
@use "~/assets/css/channel-page";
</style>
