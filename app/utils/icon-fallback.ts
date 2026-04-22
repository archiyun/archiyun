const tablerFallbacks: Record<string, string> = {
	'alert-triangle': 'ri:alert-line',
	'align-right': 'ri:menu-fold-line',
	'archive': 'ri:archive-line',
	'arrow-back-up': 'ri:reply-line',
	'arrow-bar-to-up': 'ri:arrow-up-line',
	'arrow-left': 'ri:arrow-left-line',
	'arrow-right': 'ri:arrow-right-line',
	'arrow-up-right': 'ri:arrow-right-up-line',
	'bell-off': 'ri:notification-off-line',
	'bug': 'ri:bug-line',
	'check': 'ri:check-line',
	'chevron-left': 'ri:arrow-left-s-line',
	'chevron-right': 'ri:arrow-right-s-line',
	'chevrons-down': 'ri:arrow-down-s-line',
	'chevrons-up': 'ri:arrow-up-s-line',
	'clock-edit': 'ri:history-line',
	'code': 'ri:code-s-slash-line',
	'color-swatch': 'ri:palette-line',
	'copy': 'ri:file-copy-line',
	'device-desktop': 'ri:computer-line',
	'file-text': 'ri:file-text-line',
	'files': 'ri:article-line',
	'folder': 'ri:folder-line',
	'folder-open': 'ri:folder-open-line',
	'help-circle': 'ri:question-line',
	'home': 'ri:home-line',
	'info-circle': 'ri:information-line',
	'layout-sidebar': 'ri:sidebar-unfold-line',
	'layout-sidebar-filled': 'ri:sidebar-fold-line',
	'leaf': 'ri:plant-line',
	'link': 'ri:links-line',
	'mail': 'ri:mail-line',
	'message': 'ri:message-3-line',
	'message-2': 'ri:message-2-line',
	'message-dots': 'ri:chat-1-line',
	'moon': 'ri:moon-line',
	'mouse': 'ri:mouse-line',
	'note': 'ri:sticky-note-line',
	'pencil-minus': 'ri:edit-2-line',
	'pilcrow': 'ri:paragraph',
	'rss': 'ri:rss-line',
	'search': 'ri:search-line',
	'share': 'ri:share-line',
	'shield-lock': 'ri:shield-keyhole-line',
	'shield-star': 'ri:shield-star-line',
	'shield': 'ri:shield-line',
	'shield-lock-filled': 'ri:shield-keyhole-line',
	'sort-descending': 'ri:sort-desc',
	'sparkles': 'ri:sparkling-line',
	'sparkles-2': 'ri:sparkling-2-line',
	'stack-2': 'ri:stack-line',
	'star-filled': 'ri:star-fill',
	'sun': 'ri:sun-line',
	'text-wrap': 'ri:text-wrap',
	'text-wrap-disabled': 'ri:text-wrap',
	'writing-sign': 'ri:quill-pen-line',
	'x': 'ri:close-line',
}

const directFallbacks: Record<string, string> = {
	'devicon:cloudflare': 'simple-icons:cloudflare',
	'devicon:cloudflareworkers': 'simple-icons:cloudflare',
}

export function resolveIconName(name?: string) {
	if (!name)
		return ''

	if (name in directFallbacks)
		return directFallbacks[name]!

	if (name.startsWith('tabler:')) {
		const tablerName = name.slice('tabler:'.length)
		return tablerFallbacks[tablerName] || 'ri:apps-2-line'
	}

	return name
}
