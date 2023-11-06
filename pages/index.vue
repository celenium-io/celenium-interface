<script setup>
import { DateTime } from "luxon"
/** Components */
import Widgets from "@/components/widgets/Widgets.vue"
import RecentNamespacesTable from "@/components/data/RecentNamespacesTable.vue"
import LatestPFBTable from "@/components/data/LatestPFBTable.vue"
import BlocksTimelineTable from "@/components/data/BlocksTimelineTable.vue"

/** API */
import { fetchBlocks } from "@/services/api/block"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

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

const { data: blocks } = await fetchBlocks({ limit: 15 })
appStore.latestBlocks = blocks.value
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Widgets :class="$style.widgets" />

		<Flex direction="column" gap="40" :class="$style.main">
			<Flex gap="20" :class="$style.small_tables">
				<RecentNamespacesTable />
				<LatestPFBTable />
			</Flex>

			<BlocksTimelineTable />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 0 24px;
	margin-bottom: 120px;
}

.widgets {
	margin-top: 40px;
}

.main {
	margin-top: 40px;
}

@media (max-width: 1100px) {
	.widgets {
		display: none;
	}
}

@media (max-width: 1024px) {
	.small_tables {
		flex-direction: column;
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
