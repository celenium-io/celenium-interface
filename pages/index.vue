<script setup>
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
	title: "Celenium - Celestia Blockchain Explorer",
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
				"Celenium allows you to explore and search the Celestia blockchain for transactions, addresses, blocks, namespaces, blobs.",
		},
		{
			property: "og:title",
			content: "Celestia Blockchain Explorer",
		},
		{
			property: "og:description",
			content:
				"Celenium allows you to explore and search the Celestia blockchain for transactions, addresses, blocks, namespaces, blobs.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/`,
		},
		{
			name: "twitter:title",
			content: "Celestia Blockchain Explorer",
		},
		{
			name: "twitter:description",
			content:
				"Celenium allows you to explore and search the Celestia blockchain for transactions, addresses, blocks, namespaces, blobs.",
		},
	],
})

const { data: blocks } = await fetchBlocks({ limit: 15 })
appStore.latestBlocks = blocks.value
</script>

<template>
	<Flex justify="center" wide :class="$style.wrapper">
		<Flex direction="column" wide :class="$style.container">
			<Flex direction="column" gap="20" :class="$style.main">
				<SearchBar />

				<Widgets :class="$style.widgets" />
			</Flex>

			<Flex direction="column" gap="40">
				<Flex gap="20" :class="$style.small_tables">
					<RecentNamespacesTable />
					<LatestPFBTable />
				</Flex>

				<BlocksTimelineTable />
			</Flex>
		</Flex>

		<div :class="$style.bg" />
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;
}

.container {
	max-width: calc(var(--base-width) + 48px);

	padding: 0 24px;
	margin-bottom: 120px;
}

.main {
	padding: 60px 0;
}

.bg {
	position: absolute;
	top: 28px;
	left: 40px;
	right: 40px;
	height: 400px;
	z-index: -1;

	background-image: radial-gradient(circle at 2px 2px, var(--op-5) 2px, transparent 0);
	background-size: 48px 48px;
}

@media (max-width: 1100px) {
	.widgets {
		display: none;
	}
}

@media (max-width: 900px) {
	.small_tables {
		flex-direction: column;
	}
}

@media (max-width: 500px) {
	.main {
		padding-top: 32px;
	}

	.container {
		padding: 0 12px;
	}
}
</style>
