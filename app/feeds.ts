import type { FeedGroup } from '../app/types/feed'
import { myFeed } from '../blog.config'

export default [
	{
		name: '我的博客',
		entries: [
			myFeed,
		],
	},
] satisfies FeedGroup[]
