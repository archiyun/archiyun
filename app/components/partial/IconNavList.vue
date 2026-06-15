<script setup lang="ts">
import type { NavItem } from '~/types/nav'

defineProps<{
	list: NavItem[]
}>()
</script>

<template>
<menu>
	<UtilLink
		v-for="{ text, icon, url } in list"
		:key="text"
		v-tip="text"
		:to="url"
		:aria-label="text"
	>
		<Icon :name="icon" />
	</UtilLink>
</menu>
</template>

<style lang="scss" scoped>
menu {
	display: flex;
	gap: 0.35rem;

	a {
		padding: 0.42em;
		border-radius: var(--radius);
		corner-shape: superellipse(1.2);
		color: var(--c-text-3);
		transition: background-color 0.2s, color 0.2s;

		&:hover {
			background-color: var(--c-bg-soft);
			color: var(--c-primary);
		}

		.iconify {
			display: block;
		}
	}
}
</style>
