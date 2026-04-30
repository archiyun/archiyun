<script setup lang="ts">
const { presets, colorKey, setColor } = useThemeColor()
</script>

<template>
<div class="color-picker" role="group" aria-label="主题色">
	<button
		v-for="preset in presets"
		:key="preset.key"
		v-tip="preset.label"
		:aria-label="`主题色：${preset.label}`"
		:aria-pressed="colorKey === preset.key"
		:class="{ active: colorKey === preset.key }"
		:style="{ '--swatch': preset.swatch }"
		@click="setColor(preset.key)"
	/>
</div>
</template>

<style lang="scss" scoped>
.color-picker {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 0.5rem;
}

button {
	width: 1.25rem;
	height: 1.25rem;
	border-radius: 50%;
	background-color: var(--swatch);
	outline: 2px solid transparent;
	outline-offset: 2px;
	transition: transform 0.15s, outline-color 0.15s;

	&:hover {
		transform: scale(1.2);
	}

	&.active {
		outline-color: var(--swatch);
		transform: scale(1.15);
	}
}
</style>
