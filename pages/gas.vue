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
				<Flex :class="$style.left">
					<Flex justify="between" wide>
						<Flex direction="column" gap="8">
							<Text size="12" weight="600" color="secondary">Fast</Text>

							<Flex align="center" gap="8">
								<Icon name="gas_fast" size="14" color="green" />
								<Text v-if="gasPrice.fast" size="13" weight="600" color="primary"> {{ truncate(gasPrice.fast) }} TIA </Text>
								<Skeleton v-else w="50" h="13" />
							</Flex>
						</Flex>

						<Flex direction="column" gap="8">
							<Text size="12" weight="600" color="secondary">Median</Text>

							<Flex align="center" gap="8">
								<Icon name="gas_median" size="14" color="yellow" />
								<Text v-if="gasPrice.fast" size="13" weight="600" color="primary">
									{{ truncate(gasPrice.median) }} TIA
								</Text>
								<Skeleton v-else w="50" h="13" />
							</Flex>
						</Flex>

						<Flex direction="column" gap="8">
							<Text size="12" weight="600" color="secondary">Slow</Text>

							<Flex align="center" gap="8">
								<Icon name="gas_slow" size="14" color="secondary" />
								<Text v-if="gasPrice.fast" size="13" weight="600" color="primary"> {{ truncate(gasPrice.slow) }} TIA </Text>
								<Skeleton v-else w="50" h="13" />
							</Flex>
						</Flex>
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

@media (max-width: 800px) {
	.content {
		grid-template-columns: 1fr;
	}
}
</style>
