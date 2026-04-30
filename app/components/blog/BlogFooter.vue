<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
<footer class="blog-footer">
	<div class="footer-stamp text-creative">
		ARSENOVA.XYZ
	</div>
	<nav class="footer-nav">
		<div v-for="(group, groupIndex) in appConfig.footer.nav" :key="groupIndex">
			<hgroup class="text-creative" v-text="group.title" />
			<menu>
				<li v-for="(item, itemIndex) in group.items" :key="itemIndex">
					<UtilLink :to="item.url">
						<Icon :name="item.icon" />
						<span class="nav-text">{{ item.text }}</span>
					</UtilLink>
				</li>
			</menu>
		</div>
	</nav>
	<p v-html="appConfig.footer.copyright" />
</footer>
</template>

<style lang="scss" scoped>
.blog-footer {
	position: relative;
	margin: 3rem 1rem;
	padding-top: 1.25rem;
	font-size: 0.9em;
	color: var(--c-text-2);

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: min(18rem, 42%);
		border-top: 3px solid var(--c-primary);
	}

	.footer-stamp {
		margin: 0.5rem;
		font-size: clamp(1.6rem, 4vw, 2.25rem);
		line-height: 0.95;
		color: color-mix(in srgb, var(--c-text) 84%, var(--c-primary));
	}

	.footer-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 5vw clamp(2rem, 5%, 5vw);
		padding-block: 3rem;

		hgroup {
			margin: 0.5em;
		}

		a {
			display: flex;
			align-items: center;
			gap: 0.3em;
			width: fit-content;
			padding: 0.3em 0.5em;
			border-radius: 0.5em;
			font-size: 0.9em;
			transition: background-color 0.2s, color 0.1s;

			&:hover {
				background-color: var(--c-bg-soft);
				color: var(--c-text);
			}
		}
	}

	p {
		margin: 0.5em;
	}
}
</style>
