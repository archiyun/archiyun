<script setup lang="ts">
useSeoMeta({ title: '我爱 C++ 和 Linux' })

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'comm-group'])

const { data: listRaw } = await useAsyncData('notes_posts', () => useArticleIndexOptions(), { default: () => [] })
const { listSorted } = useArticleSort(listRaw)
</script>

<template>
<BlogHeader class="mobile-only" to="/" tag="h1" />
<section class="channel-page">
	<menu class="channel-list">
		<PostArticle
			v-for="article, index in listSorted"
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
