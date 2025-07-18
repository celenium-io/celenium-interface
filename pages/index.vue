<script setup>
/** Components */
import Widgets from "@/components/widgets/Widgets.vue"
import RecentNamespacesTable from "@/components/data/RecentNamespacesTable.vue"
import LatestPFBTable from "@/components/data/LatestPFBTable.vue"
import BlocksTimelineTable from "@/components/data/BlocksTimeline/BlocksTimelineTable.vue"

/** Services */
import { parseRedirectQueryError } from "@/services/notifications"

/** Store */
import { useAppStore } from "@/store/app.store"
const appStore = useAppStore()

const route = useRoute()
const router = useRouter()

definePageMeta({
	layout: "default",
})

useHead({
	title: "Celenium - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/",
		},
	],
	meta: [
		{
			name: "description",
			content:
				"Celenium allows you to explore and search the Celestia blockchain for transactions, addresses, blocks, namespaces and blobs.",
		},
		{
			property: "og:title",
			content: "Celenium - Celestia Explorer",
		},
		{
			property: "og:description",
			content:
				"Celenium allows you to explore and search the Celestia blockchain for transactions, addresses, blocks, namespaces and blobs.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/`,
		},
		{
			property: "og:image",
			content: "/img/seo/main.png",
		},
		{
			name: "twitter:title",
			content: "Celenium - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content:
				"Celenium allows you to explore and search the Celestia blockchain for transactions, addresses, blocks, namespaces and blobs.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/main.png",
		},
	],
})

onBeforeMount(async () => {
	if (Object.keys(route.query).length && route.query.error) {
		parseRedirectQueryError(route.query)
		router.replace({ query: null })
	}
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Widgets :class="$style.widgets" />

		<Flex direction="column" gap="40" :class="$style.main">
			<div :class="$style.tables">
				<RecentNamespacesTable />
				<LatestPFBTable />
			</div>

			<BlocksTimelineTable v-if="appStore.lastHead && appStore.latestBlocks?.length" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 0 24px;
	margin-bottom: 24px;
}

.widgets {
	margin-top: 20px;
}

.main {
	max-width: 100%;

	margin-top: 40px;
}

.tables {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(486px, 1fr));
	gap: 20px;

	max-width: 100%;
}

@media (max-width: 1024px) {
	.tables {
		grid-template-columns: 100%;
	}
}

@media (max-width: 500px) {
	.widgets {
		margin-top: 24px;
	}

	.wrapper {
		padding: 0 12px;
	}
}
</style>
