<script setup>
/** API */
import { fetchIbcChainsStats, fetchIbcSummary } from "@/services/api/stats"

/** Components */
import NotableStats from "@/components/modules/ibc/NotableStats.vue"
import IBCGraph from "@/components/modules/ibc/IBCGraph.vue"
import LatestTransfersTable from "@/components/modules/ibc/LatestTransfersTable.vue"
import LargestChainsTable from "@/components/modules/ibc/LargestChainsTable.vue"

useHead({
	title: `Celestia IBC - Celenium`,
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/ibc",
		},
	],
	meta: [
		{
			name: "description",
			content: "Explore Celestia IBC transfers, clients, connections, channels and other IBC activity.",
		},
		{
			property: "og:title",
			content: "Celestia IBC - Celenium",
		},
		{
			property: "og:description",
			content: "Explore Celestia IBC transfers, clients, connections, channels and other IBC activity.",
		},
		{
			property: "og:url",
			content: "https://celenium.io/ibc",
		},
		{
			property: "og:image",
			content: "/img/seo/ibc.png",
		},
		{
			name: "twitter:title",
			content: "Celestia IBC - Celenium",
		},
		{
			name: "twitter:description",
			content: "Explore Celestia IBC transfers, clients, connections, channels and other IBC activity.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/ibc.png",
		},
	],
})

const { data: ibcData } = await useAsyncData("ibc-data", async () => {
	const [rawChainsStats, rawSummary] = await Promise.all([fetchIbcChainsStats({ limit: 100 }), fetchIbcSummary()])
	return { rawChainsStats, rawSummary }
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/ibc', name: `IBC` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex direction="column" gap="24">
			<NotableStats :ibcData />

			<IBCGraph :chains="ibcData.rawChainsStats" />

			<Flex gap="24" :class="$style.tables">
				<LatestTransfersTable />
				<LargestChainsTable :chainsStats="ibcData.rawChainsStats" />
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

@media (max-width: 1020px) {
	.tables {
		flex-direction: column;
	}
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
