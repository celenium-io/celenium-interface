<script setup>
/** Modules */
import GasPriceChart from "@/components/modules/gas/GasPriceChart.vue"
import GasEfficiencyChart from "@/components/modules/gas/GasEfficiencyChart.vue"

/** Services */
import { truncate } from "@/services/utils"

/** API */
import { fetchGasPrice } from "@/services/api/gas"

const route = useRoute()

const gasPrice = ref({})

onMounted(async () => {
	const data = await fetchGasPrice()
	gasPrice.value = data
})

useHead({
	title: `Celestia Gas Tracker - Celenium`,
	link: [
		{
			rel: "canonical",
			href: `https://celenium.io${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Gas Tracker for Celestia Blockchain. Gas price, efficiency, etc.`,
		},
		{
			property: "og:title",
			content: `Celestia Gas Tracker - Celenium`,
		},
		{
			property: "og:description",
			content: `Gas Tracker for Celestia Blockchain. Gas price, efficiency, etc.`,
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
			content: `Celestia Gas Tracker - Celenium`,
		},
		{
			name: "twitter:description",
			content: `Gas Tracker for Celestia Blockchain. Gas price, efficiency, etc.`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/gas', name: `Gas Tracker` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="gas" size="16" color="secondary" />
					<Text size="13" weight="600" color="primary">Gas Tracker</Text>
				</Flex>
			</Flex>

			<Flex gap="4" :class="$style.content">
				<Flex direction="column" justify="between" gap="20" :class="$style.left">
					<Flex justify="between" wide>
						<Flex direction="column" gap="8">
							<Flex align="center" gap="8">
								<Icon name="gas_fast" size="12" color="green" />
								<Text size="12" weight="600" color="secondary">Fast</Text>
							</Flex>

							<Flex align="center" gap="8">
								<Text v-if="gasPrice.fast" size="13" weight="600" color="primary">
									{{ truncate(gasPrice.fast) }} UTIA
								</Text>
								<Skeleton v-else w="50" h="13" />
								<CopyButton :text="gasPrice.fast" />
							</Flex>
						</Flex>

						<Flex direction="column" gap="8">
							<Flex align="center" gap="8">
								<Icon name="gas_median" size="12" color="yellow" />
								<Text size="12" weight="600" color="secondary">Median</Text>
							</Flex>

							<Flex align="center" gap="8">
								<Text v-if="gasPrice.fast" size="13" weight="600" color="primary">
									{{ truncate(gasPrice.median) }} UTIA
								</Text>
								<Skeleton v-else w="50" h="13" />
								<CopyButton :text="gasPrice.median" />
							</Flex>
						</Flex>

						<Flex direction="column" gap="8">
							<Flex align="center" gap="8">
								<Icon name="gas_slow" size="14" color="secondary" />
								<Text size="12" weight="600" color="secondary">Slow</Text>
							</Flex>

							<Flex align="center" gap="8">
								<Text v-if="gasPrice.fast" size="13" weight="600" color="primary">
									{{ truncate(gasPrice.slow) }} UTIA
								</Text>
								<Skeleton v-else w="50" h="13" />
								<CopyButton :text="gasPrice.slow" />
							</Flex>
						</Flex>
					</Flex>

					<Flex direction="column" gap="8" :class="$style.bottom">
						<Text size="12" weight="600" color="secondary"> Price is calculated on fee payments for the last 100 blocks </Text>
						<Text size="12" weight="500" color="tertiary" height="140">
							Each gas price level is the percentage of transactions in which gas price was set below a specified value
						</Text>
					</Flex>
				</Flex>

				<Flex direction="column" gap="4" :class="$style.charts">
					<div :class="$style.card">
						<GasPriceChart />
					</div>

					<div :class="$style.card">
						<GasEfficiencyChart />
					</div>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
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

.content {
	display: grid;
	grid-template-columns: 384px 1fr;
}

.left {
	min-width: 384px;

	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	padding: 16px;
}

.charts {
	width: 100%;
}

.card {
	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);

	padding: 16px;
}

.bottom {
	opacity: 0.6;

	border-top: 2px solid var(--op-5);

	padding-top: 12px;
}

@media (max-width: 800px) {
	.content {
		grid-template-columns: 1fr;
	}
}
</style>
