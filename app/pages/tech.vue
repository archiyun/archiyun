<script setup lang="ts">
useSeoMeta({ title: 'Tech' })

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-tech', 'blog-stats'])

const { data: listRaw } = await useAsyncData('tech_posts', () => useArticleIndexOptions(), { default: () => [] })
const { listSorted } = useArticleSort(listRaw)
const techList = computed(() => listSorted.value.filter(item => item.categories?.some(name => ['技术', '开发', '安全'].includes(name))))
</script>

<template>
<BlogHeader class="mobile-only" to="/" tag="h1" />
<section class="channel-page">
	<header class="channel-hero">
		<span>RUNTIME / SYSTEM / CODE</span>
		<h1 class="text-creative">
			Tech
		</h1>
		<p>工程实践、算法记录、系统阅读和那些跑起来之后才懂的细节。</p>
	</header>

	<menu class="channel-list">
		<PostArticle
			v-for="article, index in techList"
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
