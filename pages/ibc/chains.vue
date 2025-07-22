<script setup>
/** API */
import { fetchIbcChainsStats } from "@/services/api/stats"

/** Components */
import ChainsTable from "@/components/modules/ibc/ChainsTable.vue"

useHead({
	title: `Celestia IBC Chains - Celenium`,
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/ibc/chains",
		},
	],
	meta: [
		{
			name: "description",
			content: "Explore Celestia IBC transfers, clients, connections, channels and other IBC activity.",
		},
		{
			property: "og:title",
			content: "Celestia IBC Chains - Celenium",
		},
		{
			property: "og:description",
			content: "Explore Celestia IBC transfers, clients, connections, channels and other IBC activity.",
		},
		{
			property: "og:url",
			content: "https://celenium.io/ibc/chains",
		},
		{
			property: "og:image",
			content: "/img/seo/ibc-networks.png",
		},
		{
			name: "twitter:title",
			content: "Celestia IBC Chains - Celenium",
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
			content: "https://celenium.io/img/seo/ibc-networks.png",
		},
	],
})

const allChains = ref([])
const showedChains = computed(() => allChains.value.slice((page.value - 1) * 10, page.value * 10))
const isLoading = ref(true)

/** Pagination */
const page = ref(1)
const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

const getChains = async () => {
	isLoading.value = true

	const { data } = await useAsyncData(`ibc-chains`, () => fetchIbcChainsStats({ limit: 100 }))
	allChains.value = data.value

	isLoading.value = false
}

await getChains()
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/ibc', name: `IBC` },
				{ link: '/ibc/chains', name: `Chains` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="ibc" size="16" color="secondary" />
					<Text size="13" weight="600" color="primary">IBC Chains</Text>
				</Flex>
			</Flex>

			<ChainsTable
				:chains="showedChains"
				:page
				:isLoading="isLoading"
				@onRefetch="getChains"
				@onPrevPage="handlePrev"
				@onNextPage="handleNext"
				@updatePage="(newPage) => (page = newPage)"
			/>
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

.header {
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
