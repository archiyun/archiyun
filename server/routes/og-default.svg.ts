import blogConfig from '~~/blog.config'

function escapeXml(text: string) {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll('\'', '&apos;')
}

export default defineEventHandler((event) => {
	setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')

	const title = escapeXml(blogConfig.title)
	const subtitle = escapeXml(blogConfig.subtitle || blogConfig.description)
	const description = escapeXml(blogConfig.description)
	const site = escapeXml(new URL(blogConfig.url).hostname)

	return `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<linearGradient id="bg" x1="80" y1="60" x2="1080" y2="570" gradientUnits="userSpaceOnUse">
			<stop stop-color="#FFF8ED" />
			<stop offset="0.58" stop-color="#F4F8FB" />
			<stop offset="1" stop-color="#EEF5FA" />
		</linearGradient>
		<linearGradient id="line" x1="180" y1="130" x2="940" y2="520" gradientUnits="userSpaceOnUse">
			<stop stop-color="#0F7C9A" />
			<stop offset="1" stop-color="#FF8A3D" />
		</linearGradient>
		<filter id="blur" x="0" y="0" width="1200" height="630" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
			<feGaussianBlur stdDeviation="60" />
		</filter>
	</defs>
	<rect width="1200" height="630" rx="32" fill="url(#bg)" />
	<g filter="url(#blur)" opacity="0.45">
		<circle cx="183" cy="106" r="116" fill="#FFA36C" />
		<circle cx="1034" cy="532" r="144" fill="#2BA6C6" />
	</g>
	<rect x="54" y="54" width="1092" height="522" rx="30" fill="white" fill-opacity="0.72" stroke="#D9E4EA" stroke-width="2" />
	<rect x="96" y="102" width="156" height="34" rx="17" fill="#ECF5F8" />
	<text x="124" y="125" fill="#55717D" font-size="22" font-family="Inter, Noto Sans SC, sans-serif">Personal Blog</text>
	<text x="96" y="232" fill="#17313B" font-size="76" font-weight="700" font-family="Inter, Noto Sans SC, sans-serif">${title}</text>
	<text x="96" y="298" fill="#2B4A55" font-size="32" font-family="Inter, Noto Sans SC, sans-serif">${subtitle}</text>
	<text x="96" y="372" fill="#5A6F79" font-size="28" font-family="Inter, Noto Sans SC, sans-serif">${description}</text>
	<line x1="96" y1="438" x2="1104" y2="438" stroke="url(#line)" stroke-width="3" stroke-linecap="round" opacity="0.75" />
	<text x="96" y="504" fill="#0F7C9A" font-size="28" font-weight="600" font-family="Inter, Noto Sans SC, sans-serif">${site}</text>
	<text x="96" y="548" fill="#7A8F98" font-size="24" font-family="Inter, Noto Sans SC, sans-serif">${escapeXml(blogConfig.author.name)}</text>
</svg>`.trim()
})
