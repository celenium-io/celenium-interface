<script setup>
/** Components */
import TransfersTable from "@/components/modules/hyperlane/TransfersTable.vue"

/** API */
import { fetchHyperlaneTransfers } from "@/services/api/hyperlane"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Utils */
import { comma } from "@/services/utils"

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
const limit = 20
const isNextPageDisabled = computed(() => {
	return !transfers.value.length || transfers.value.length !== limit
})
const handleNext = () => {
	if (isNextPageDisabled.value) return
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
			offset: (page.value - 1) * limit,
			limit: limit,
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
		isLoading.value = true

		const data = await fetchHyperlaneTransfers({
			offset: (page.value - 1) * limit,
			limit: limit,
		})
		transfers.value = data

		isLoading.value = false
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

				<!-- Pagination -->
				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary"> Page {{ comma(page) }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="isNextPageDisabled">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<TransfersTable
				:transfers
				:isLoading="isLoading"
				@onRefetch="getTransfers"
			/>

			<!-- Pagination -->
			<Flex align="center" justify="end" gap="6" :class="$style.footer">
				<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
					<Icon name="arrow-left-stop" size="12" color="primary" />
				</Button>
				<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
					<Icon name="arrow-left" size="12" color="primary" />
				</Button>

				<Button type="secondary" size="mini" disabled>
					<Text size="12" weight="600" color="primary"> Page {{ comma(page) }} </Text>
				</Button>

				<Button @click="handleNext" type="secondary" size="mini" :disabled="isNextPageDisabled">
					<Icon name="arrow-right" size="12" color="primary" />
				</Button>
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

.header {
	height: 46px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 16px;
}

.footer {
	height: 46px;

	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	padding: 0 16px;
}


@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
