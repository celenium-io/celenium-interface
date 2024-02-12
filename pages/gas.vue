<script setup>
/** Modules */
import GasPriceChart from "@/components/modules/gas/GasPriceChart.vue"
import GasPriceHeatmap from "@/components/modules/gas/GasPriceHeatmap.vue"
import GasEfficiencyChart from "@/components/modules/gas/GasEfficiencyChart.vue"
import GasFeeCalculator from "@/components/modules/gas/GasFeeCalculator.vue"

/** UI */
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Button from "@/components/ui/Button.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const route = useRoute()

const gasPrice = computed(() => appStore.gas)

const visualizations = ref([
	{
		title: "Line Chart",
		value: "line",
	},
	{
		title: "Heatmap",
		value: "heatmap",
	},
])
const selectedVisualization = ref(visualizations.value[0].value)

const selectedPeriodIdx = ref(0)
const periods = ref([
	{
		title: "24 hours",
		value: 24,
		timeframe: "hour",
	},
	{
		title: "31 days",
		value: 30,
		timeframe: "day",
	},
])
const selectedPeriod = computed(() => periods.value[selectedPeriodIdx.value])

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
					<GasFeeCalculator />

					<Flex direction="column" gap="8" :class="$style.bottom">
						<Flex align="center" gap="12">
							<Flex align="center" gap="6">
								<Icon name="gas_fast" size="12" color="secondary" />
								<Text size="12" weight="600" color="secondary"> Fast <Text color="primary">99%</Text></Text>
							</Flex>
							<Flex align="center" gap="6">
								<Icon name="gas_median" size="12" color="secondary" />
								<Text size="12" weight="600" color="secondary"> Median <Text color="primary">50%</Text></Text>
							</Flex>
							<Flex align="center" gap="6">
								<Icon name="gas_slow" size="12" color="secondary" />
								<Text size="12" weight="600" color="secondary"> Slow <Text color="primary">10%</Text></Text>
							</Flex>
						</Flex>

						<Text size="12" weight="600" color="tertiary" height="140">
							Price is calculated on fee payments for the last <Text color="secondary">100</Text> blocks. Each gas price level
							is the percentage of transactions in which gas price was set below a specified value
						</Text>
					</Flex>
				</Flex>

				<Flex direction="column" gap="4" :class="$style.charts">
					<Flex direction="column" gap="16" :class="$style.card">
						<Flex align="start" justify="between">
							<Flex align="center" gap="6">
								<Icon name="chart" size="13" color="primary" />
								<Text size="13" weight="600" color="primary">Average Gas Price</Text>
							</Flex>

							<Flex align="center" gap="8">
								<Dropdown>
									<Button size="mini" type="secondary">
										<Icon name="chart" size="12" color="primary" />
										<Text color="primary" style="text-transform: capitalize">{{ selectedVisualization }}</Text>
										<Icon name="chevron" size="12" color="secondary" />
									</Button>

									<template #popup>
										<DropdownItem
											v-for="visualization in visualizations"
											@click="selectedVisualization = visualization.value"
										>
											<Flex align="center" gap="8">
												<Icon
													:name="visualization.value === selectedVisualization ? 'check' : ''"
													size="12"
													color="secondary"
												/>
												{{ visualization.title }}
											</Flex>
										</DropdownItem>
									</template>
								</Dropdown>

								<Dropdown :disabled="selectedVisualization === 'heatmap'">
									<Button size="mini" type="secondary" :disabled="selectedVisualization === 'heatmap'">
										{{ selectedPeriod.title }}
										<Icon name="chevron" size="12" color="secondary" />
									</Button>

									<template #popup>
										<DropdownItem v-for="(period, idx) in periods" @click="selectedPeriodIdx = idx">
											<Flex align="center" gap="8">
												<Icon :name="idx === selectedPeriodIdx ? 'check' : ''" size="12" color="secondary" />
												{{ period.title }}
											</Flex>
										</DropdownItem>
									</template>
								</Dropdown>
							</Flex>
						</Flex>

						<GasPriceChart v-if="selectedVisualization === 'line'" :selectedPeriod="selectedPeriod" />
						<GasPriceHeatmap v-else-if="selectedVisualization === 'heatmap'" :selectedPeriod="periods[0]" />
					</Flex>

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
	max-width: 384px;

	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	padding: 16px;
}

.charts {
	width: 100%;
	min-width: 0;
}

.card {
	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);

	padding: 16px;
}

.bottom {
	opacity: 0.6;

	padding-top: 12px;
}

@media (max-width: 800px) {
	.content {
		grid-template-columns: 1fr;
	}

	.left {
		min-width: initial;
		max-width: initial;
	}
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
