<script setup lang="ts">
import { UtilLink } from '#components'

export interface ButtonProps {
	icon?: string
	text?: string
	to?: string
	desc?: string
	primary?: boolean
}
defineProps<ButtonProps>()
</script>

<template>
<component :is="to ? UtilLink : 'button'" :to class="button" :class="{ primary }">
	<div class="button-main">
		<Icon v-if="icon" :name="icon" />
		<slot>{{ text }}</slot>
	</div>
	<div v-if="desc" class="button-desc">
		{{ desc }}
	</div>
</component>
</template>

<style lang="scss" scoped>
.button {
	display: inline-block;
	padding: 0.56em 0.9em;
	border: 1px solid var(--c-border);
	border-radius: var(--radius);
	corner-shape: superellipse(1.2);
	box-shadow: var(--box-shadow-1);
	background-color: var(--ld-bg-card);
	font-family: var(--font-heading);
	font-weight: 650;
	line-height: 1.2;
	vertical-align: middle;
	color: var(--c-text-1);
	transition: transform 0.12s, border-color 0.2s, box-shadow 0.2s, background-color 0.2s, color 0.2s;
	cursor: pointer;

	&.primary {
		border-color: color-mix(in srgb, var(--c-primary) 72%, #000);
		box-shadow: var(--box-shadow-2), 0 2px 0 color-mix(in srgb, var(--c-primary) 55%, #000);
		background-color: var(--c-primary);
		color: var(--c-bg-1);
	}

	&:hover {
		border-color: color-mix(in srgb, var(--c-primary) 38%, var(--c-border));
		box-shadow: var(--box-shadow-2);
		background-color: var(--c-primary-soft);
		color: var(--c-primary);
		transform: translateY(-1px);
	}

	&.primary:hover {
		background-color: color-mix(in srgb, var(--c-primary) 92%, var(--c-text));
		color: var(--c-bg-1);
	}

	&:active {
		box-shadow: var(--box-shadow-1);
		transform: translateY(1px);
	}

	&:disabled {
		opacity: 0.58;
		box-shadow: none;
		background-color: var(--c-bg-2);
		color: var(--c-text-3);
		transform: none;
		cursor: not-allowed;
	}

	& + .button {
		margin-inline-start: 0.8em;
	}
}

.button-main {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.2em;
}

.button-desc {
	font-size: 0.75em;
	text-align: center;
	color: var(--c-text-2);
}
</style>
