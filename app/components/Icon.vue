<script setup lang="ts">
import NuxtIcon from '@nuxt/icon/runtime/components/index.js'

defineOptions({
	inheritAttrs: false,
})

const props = withDefaults(defineProps<{
	name?: string
	mode?: string | null
	size?: number | string | null
	customize?: ((content: string, name: string, prefix: string, provider: string) => string) | boolean | null
}>(), {
	name: '',
	mode: null,
	size: null,
	customize: null,
})

const attrs = useAttrs()
const resolvedName = computed(() => resolveIconName(props.name))
</script>

<template>
<NuxtIcon
	v-if="resolvedName"
	v-bind="attrs"
	:name="resolvedName"
	:mode="mode"
	:size="size"
	:customize="customize"
>
	<slot />
</NuxtIcon>
</template>
