<script setup>
/** Components: Modules */
import RollupOverview from "@/components/modules/rollup/RollupOverview.vue"
import RollupCharts from "@/components/modules/rollup/RollupCharts.vue"

/** API */
import { fetchRollupBySlug } from "@/services/api/rollup"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const rollup = ref()
const { data: rawRollup } = await fetchRollupBySlug(route.params.slug)

if (!rawRollup.value) {
	router.push("/rollups")
} else {
	rollup.value = rawRollup.value
	cacheStore.current.rollup = rollup.value
}

defineOgImage({
	title: "Rollup",
	rollup: rollup.value,
	component: "RollupImage",
	cacheKey: `${rollup.value?.name}`,
})

useHead({
	title: `Rollup ${rollup.value?.name} - Celestia Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://celenium.io${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
		},
		{
			property: "og:title",
			content: `Rollup ${rollup.value?.name} - Celestia Explorer`,
		},
		{
			property: "og:description",
			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
		},
		{
			property: "og:url",
			content: `https://celenium.io${route.path}`,
		},
		{
			property: "og:image",
			content: `https://celenium.io${route.path}__og_image__/og.png`,
		},
		{
			name: "twitter:title",
			content: `Rollup ${rollup.value?.name} - Celestia Explorer`,
		},
		{
			name: "twitter:description",
			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})
</script>

<template>
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
			<Flex align="end" justify="between" :class="$style.breadcrumbs">
				<Breadcrumbs
					v-if="rollup"
					:items="[
						{ link: '/', name: 'Explore' },
						{ link: '/rollups', name: 'Rollups Leaderboard' },
						{ link: route.fullPath, name: rollup.name },
					]"
				/>

				<Button link="https://forms.gle/nimJyQJG4Lb4BTcG7" target="_blank" type="secondary" size="mini">
					<Icon name="rollup-plus" size="12" color="secondary" /> Rollup Registration
				</Button>
			</Flex>
			
			<RollupOverview v-if="rollup" :rollup="rollup" />
		</Flex>

		<RollupCharts v-if="rollup" :id="rollup.id" />
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 26px 24px 60px 24px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
