<script setup>
/** Components */
import TransfersTable from "@/components/modules/hyperlane/TransfersTable.vue"

/** API */
import { fetchHyperlaneTransfers } from "@/services/api/hyperlane"

useHead({
	title: `Celestia Hyperlane Transfers - Celenium`,
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/hyperlane/transfers",
		},
	],
	meta: [
		{
			name: "description",
			content: "Explore Celestia Hyperlane transfers - amount, address, counterparty, and more.",
		},
		{
			property: "og:title",
			content: "Celestia Hyperlane Transfers - Celenium",
		},
		{
			property: "og:description",
			content: "Explore Celestia Hyperlane transfers - amount, address, counterparty, and more.",
		},
		{
			property: "og:url",
			content: "https://celenium.io/hyperlane/transfers",
		},
		{
			property: "og:image",
			content: "/img/seo/hyperlane.png",
		},
		{
			name: "twitter:title",
			content: "Celestia Hyperlane Transfers - Celenium",
		},
		{
			name: "twitter:description",
			content: "Explore Celestia Hyperlane transfers - amount, address, counterparty, and more.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/hyperlane.png",
		},
	],
})

const transfers = ref([])
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

const getTransfers = async () => {
	isLoading.value = true

	const { data } = await useAsyncData(`hyperlane-transfers-${page.value}`, () =>
		fetchHyperlaneTransfers({
			offset: (page.value - 1) * 10,
			limit: 10,
		}),
	)
	transfers.value = data.value

	isLoading.value = false
}

await getTransfers()

/** Refetch transfers */
watch(
	() => page.value,
	async () => {
		const data = await fetchHyperlaneTransfers({
			offset: (page.value - 1) * 10,
			limit: 10,
		})
		transfers.value = data
	},
)
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/hyperlane', name: `Hyperlane` },
				{ link: '/hyperlane/transfers', name: `Transfers` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="arrow-narrow-up-right-circle" size="16" color="secondary" />
					<Text size="13" weight="600" color="primary">Hyperlane Transfers</Text>
				</Flex>
			</Flex>

			<TransfersTable
				:transfers
				:page
				:isLoading="isLoading"
				@onRefetch="getTransfers"
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
