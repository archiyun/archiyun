export interface ColorPreset {
	key: string
	label: string
	swatch: string
	light: {
		primary: string
		primarySoft: string
		bgActive: string
		bgSoft: string
	}
	dark: {
		primary: string
		primarySoft: string
		bgActive: string
		bgSoft: string
	}
}

export const COLOR_PRESETS: ColorPreset[] = [
	{
		key: 'red',
		label: '红',
		swatch: '#f38e8c',
		light: { primary: '#c94040', primarySoft: 'rgba(201,64,64,0.10)', bgActive: 'rgba(201,64,64,0.08)', bgSoft: 'rgba(201,64,64,0.08)' },
		dark: { primary: '#f38e8c', primarySoft: 'rgba(243,142,140,0.14)', bgActive: 'rgba(243,142,140,0.12)', bgSoft: 'rgba(243,142,140,0.10)' },
	},
	{
		key: 'blue',
		label: '蓝',
		swatch: '#74a4f0',
		light: { primary: '#2a5fd4', primarySoft: 'rgba(42,95,212,0.10)', bgActive: 'rgba(42,95,212,0.08)', bgSoft: 'rgba(42,95,212,0.08)' },
		dark: { primary: '#74a4f0', primarySoft: 'rgba(116,164,240,0.14)', bgActive: 'rgba(116,164,240,0.12)', bgSoft: 'rgba(116,164,240,0.10)' },
	},
	{
		key: 'green',
		label: '绿',
		swatch: '#66b99a',
		light: { primary: '#2a7a52', primarySoft: 'rgba(42,122,82,0.10)', bgActive: 'rgba(42,122,82,0.08)', bgSoft: 'rgba(42,122,82,0.08)' },
		dark: { primary: '#66b99a', primarySoft: 'rgba(102,185,154,0.14)', bgActive: 'rgba(102,185,154,0.12)', bgSoft: 'rgba(102,185,154,0.10)' },
	},
	{
		key: 'purple',
		label: '紫',
		swatch: '#b07fe8',
		light: { primary: '#7840b4', primarySoft: 'rgba(120,64,180,0.10)', bgActive: 'rgba(120,64,180,0.08)', bgSoft: 'rgba(120,64,180,0.08)' },
		dark: { primary: '#b07fe8', primarySoft: 'rgba(176,127,232,0.14)', bgActive: 'rgba(176,127,232,0.12)', bgSoft: 'rgba(176,127,232,0.10)' },
	},
	{
		key: 'orange',
		label: '橙',
		swatch: '#f0a16a',
		light: { primary: '#c4612a', primarySoft: 'rgba(196,97,42,0.10)', bgActive: 'rgba(196,97,42,0.08)', bgSoft: 'rgba(196,97,42,0.08)' },
		dark: { primary: '#f0a16a', primarySoft: 'rgba(240,161,106,0.14)', bgActive: 'rgba(240,161,106,0.12)', bgSoft: 'rgba(240,161,106,0.10)' },
	},
]

export function useThemeColor() {
	const colorKey = useCookie<string>('theme-color', { default: () => 'red', sameSite: 'lax' })

	const currentPreset = computed(
		() => COLOR_PRESETS.find(p => p.key === colorKey.value) ?? COLOR_PRESETS[0]!,
	)

	function applyColor(preset: ColorPreset, isDark: boolean) {
		if (!import.meta.client) return
		const colors = isDark ? preset.dark : preset.light
		const root = document.documentElement
		root.style.setProperty('--c-primary', colors.primary)
		root.style.setProperty('--c-primary-soft', colors.primarySoft)
		root.style.setProperty('--ld-bg-active', colors.bgActive)
		root.style.setProperty('--c-bg-soft', colors.bgSoft)
	}

	function applyCurrentColor(mode: string) {
		applyColor(currentPreset.value, mode === 'dark')
	}

	function setColor(key: string) {
		colorKey.value = key
	}

	return { presets: COLOR_PRESETS, colorKey, currentPreset, setColor, applyCurrentColor }
}
