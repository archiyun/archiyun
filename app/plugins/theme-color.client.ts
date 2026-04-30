export default defineNuxtPlugin({
	name: 'theme-color',
	parallel: true,
	setup(nuxtApp) {
		nuxtApp.hook('app:mounted', () => {
			const { applyCurrentColor, currentPreset, colorKey } = useThemeColor()
			const colorMode = useColorMode()

			applyCurrentColor(colorMode.value)

			watch(() => colorMode.value, mode => applyCurrentColor(mode))
			watch(colorKey, () => applyCurrentColor(colorMode.value))
			watch(currentPreset, () => applyCurrentColor(colorMode.value))
		})
	},
})
