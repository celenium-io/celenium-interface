<script setup>
/** Components: Modules */
import RollupOverview from "@/components/modules/rollup/RollupOverview.vue"
// import RollupCharts from "@/components/modules/rollup/RollupCharts.vue"

/** API */
import { fetchRollupByID } from "@/services/api/rollup"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const rollup = ref()
// const { data: rawRollup } = await fetchRollupByID(route.params.id)

rollup.value = {
	"id": 1,
	"name": "Astria",
	"description": "The easiest way to deploy decentralized rollups.",
	"website": "https://www.astria.org/",
	"twitter": "https://twitter.com/celenium_io",
	"logo": "https://uploads-ssl.webflow.com/5c3a510a91db03828e568da1/5c3a6a8d081733b82d6394a2_Logo%205%20Copy%205.svg",
	"blobs_count": 11020,
	"size": 891019774,
	"last_message_time": "2024-01-25T00:00:00Z"
}
cacheStore.current.rollup = rollup.value
// if (!rawRollup.value) {
// 	router.push("/")
// } else {
// 	rollup.value = rawRollup.value[0]
// 	cacheStore.current.rollup = rollup.value
// }

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
			<Breadcrumbs
				v-if="rollup"
				:items="[
					{ link: '/', name: 'Explore' },
					{ link: '/rollups', name: 'Rollups' },
					{ link: route.fullPath, name: rollup.name },
				]"
			/>

			<RollupOverview v-if="rollup" :rollup="rollup" />
		</Flex>

		<!-- <RollupCharts v-if="rollup" :id="rollup.id" /> -->
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
