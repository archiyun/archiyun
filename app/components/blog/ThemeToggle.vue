<script setup lang="ts">
const appConfig = useAppConfig()
const colorMode = useColorMode()
</script>

<template>
<div class="theme-toggle">
	<button
		v-for="(themeData, themeName) in appConfig.themes"
		:key="themeName"
		v-tip="themeData.tip"
		:aria-label="themeData.tip"
		:class="{ active: colorMode.preference === themeName }"
		@click="colorMode.preference = themeName"
	>
		<Icon :name="themeData.icon" />
	</button>
</div>
</template>

<style lang="scss" scoped>
.theme-toggle {
	display: flex;
	gap: 2px;
	width: 100%;
	padding: 3px;
	border-radius: var(--radius);
	corner-shape: superellipse(1.2);
	background-color: var(--c-bg-2);

	> button {
		display: grid;
		flex: 1;
		place-items: center;
		padding: 0.42em 0;
		border-radius: calc(var(--radius) - 3px);
		color: var(--c-text-3);
		transition: color 0.2s, background-color 0.2s, box-shadow 0.2s;

		&:hover {
			color: var(--c-text-1);
		}

		&.active {
			box-shadow: var(--box-shadow-1);
			background-color: var(--ld-bg-card);
			color: var(--c-primary);
			cursor: auto;
		}
	}
}
</style>
