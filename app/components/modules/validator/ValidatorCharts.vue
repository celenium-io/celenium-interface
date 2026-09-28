<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "~/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "~/components/ui/Dropdown/index.js"
import Popover from "~/components/ui/Popover.vue"
import Toggle from "~/components/ui/Toggle.vue"
import Tooltip from "~/components/ui/Tooltip.vue"
import Picker from "~/components/ui/Picker.vue"

/** Components */
import ChartOnEntityPage from "~/components/shared/ChartOnEntityPage.vue"

/** Services */
import { abbreviate, roundTo, tia } from "~/services/utils/index.js"
import { createDataMap, generateSeriesData, PERIODS as periods } from "~/services/utils/entityCharts.js"

/** API */
import { fetchStakingSeries } from "~/services/api/stats.js"
import { fetchValidatorsMetrics, fetchValidatorMetrics } from "~/services/api/validator.js"

/** Store */
import { useSettingsStore } from "~/store/settings.store.js"
const settingsStore = useSettingsStore()

const props = defineProps({
	validator: {
		type: Object,
		required: true,
	},
})

/** Chart settings */
const selectedPeriodIdx = ref(2)
const selectedPeriod = computed(() => periods[selectedPeriodIdx.value])

const chartTypes = ["line", "bar"]
const selectedChartType = ref(chartTypes[0])

const loadLastValue = ref(true)

const isOpen = ref(false)
const handleOpen = () => {
	isOpen.value = true
}
const handleClose = () => {
	isOpen.value = false
}

const updateUserSettings = () => {
	settingsStore.chart = {
		...settingsStore.chart,
		view: selectedChartType.value,
		loadLastValue: loadLastValue.value,
	}
}

/** Data */
const isLoading = ref(false)
const metricsSeries = ref([])
const flowSeries = ref([])
const cumulativeFlowSeries = ref([])
const delegationsSeries = ref([])
const delegationsCountSeries = ref([])
const unbondingsSeries = ref([])
const unbondingsCountSeries = ref([])

/** Series config */
const seriesConfig = [
	{
		name: "cumulative_flow",
		metric: "cumulative_flow",
		series: cumulativeFlowSeries,
		title: "Cumulative Stake",
		tooltipLabel: "TIA",
		yAxisFormatter: (v) => abbreviate(tia(v)),
		tooltipValueFormatter: (v) => abbreviate(tia(v)),
		unit: null,
	},
	{
		name: "flow",
		metric: "flow",
		series: flowSeries,
		title: "Stake Flow",
		tooltipLabel: "TIA",
		yAxisFormatter: (v) => abbreviate(tia(v)),
		tooltipValueFormatter: (v) => abbreviate(tia(v)),
		unit: null,
	},
	{
		name: "delegations",
		metric: "delegations",
		series: delegationsSeries,
		title: "Delegations",
		tooltipLabel: "Amount",
		yAxisFormatter: (v) => abbreviate(tia(v, 2)),
		tooltipValueFormatter: (v) => abbreviate(tia(v, 2)),
		unit: "TIA",
	},
	{
		name: "delegations_count",
		metric: "delegations_count",
		series: delegationsCountSeries,
		title: "Delegations Count",
		tooltipLabel: "Count",
		yAxisFormatter: abbreviate,
		tooltipValueFormatter: (v) => v,
		unit: null,
	},
	{
		name: "unbondings",
		metric: "unbondings",
		series: unbondingsSeries,
		title: "Unbondings",
		tooltipLabel: "Amount",
		yAxisFormatter: (v) => abbreviate(tia(v, 2)),
		tooltipValueFormatter: (v) => abbreviate(tia(v, 2)),
		unit: "TIA",
	},
	{
		name: "unbondings_count",
		metric: "unbondings_count",
		series: unbondingsCountSeries,
		title: "Unbondings Count",
		tooltipLabel: "Count",
		yAxisFormatter: abbreviate,
		tooltipValueFormatter: (v) => v,
		unit: null,
	},
]

const cumulativeFlowConfig = computed(() => seriesConfig.find((config) => config.metric === "cumulative_flow"))
const delegationsConfig = computed(() => seriesConfig.find((config) => config.metric === "delegations"))
const delegationsCountConfig = computed(() => seriesConfig.find((config) => config.metric === "delegations_count"))
const unbondingsConfig = computed(() => seriesConfig.find((config) => config.metric === "unbondings"))
const unbondingsCountConfig = computed(() => seriesConfig.find((config) => config.metric === "unbondings_count"))

const fetchData = async (metric) => {
	return await fetchStakingSeries({
		id: props.validator.id,
		name: metric,
		timeframe: selectedPeriod.value.timeframe,
		from: parseInt(
			DateTime.now().minus({
				days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value : 0,
				hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value : 0,
				months: selectedPeriod.value.timeframe === "month" ? selectedPeriod.value.value : 0,
			}).ts / 1_000,
		),
	})
}

const fetchMetrics = async () => {
	const { data: allMetrics } = await fetchValidatorsMetrics()
	const { data: validatorMetrics } = await fetchValidatorMetrics(props.validator.id)

	if (allMetrics.value && validatorMetrics.value) {
		let _allMetrics = {}
		let _validatorMetrics = {}

		Object.entries(allMetrics.value).forEach(([key, value]) => {
			const _key = key.replace("_metric", "")
			_allMetrics[_key] = roundTo(value * 100, 2)
			_validatorMetrics[_key] = roundTo(validatorMetrics.value[key] * 100, 2)
		})

		metricsSeries.value = [_allMetrics, _validatorMetrics]
	}
}

const generateSeries = async (configs) => {
	isLoading.value = true

	try {
		await fetchMetrics()

		await Promise.all(
			configs.map(async (config) => {
				const rawData = await fetchData(config.name)
				const dataMap = createDataMap(rawData, selectedPeriod.value.timeframe)
				generateSeriesData(selectedPeriod.value, dataMap, config.series)
			}),
		)
	} finally {
		isLoading.value = false
	}
}

const fetchAllData = async () => {
	await generateSeries(seriesConfig)
}

watch(
	() => selectedPeriodIdx.value,
	() => fetchAllData(),
)

watch(
	() => [selectedChartType.value, loadLastValue.value],
	() => {
		updateUserSettings()
	},
)

onBeforeMount(async () => {
	isLoading.value = true

	const settings = JSON.parse(localStorage.getItem("settings"))

	selectedChartType.value = settings?.chart?.view || "bar"
	loadLastValue.value = settings?.chart?.view ? settings.chart.loadLastValue : true

	await fetchAllData()
})
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="chart" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Analytics</Text>
			</Flex>

			<Flex align="center" gap="6">
				<Dropdown>
					<Button size="mini" type="secondary">
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

				<Popover :open="isOpen" @on-close="handleClose" width="200" side="right">
					<Button @click="handleOpen" type="secondary" size="mini">
						<Icon name="settings" size="12" color="secondary" />
					</Button>

					<template #content>
						<Flex direction="column" gap="16">
							<Flex align="center" justify="between" gap="8" :class="$style.setting_item">
								<Text size="12" weight="600" color="secondary">Chart Type</Text>

								<Flex>
									<Picker v-model="selectedChartType" :options="chartTypes" />
								</Flex>
							</Flex>

							<Flex align="center" justify="between" gap="6" :class="$style.setting_item">
								<Text size="12" weight="600" :color="loadLastValue ? 'secondary' : 'tertiary'">Show Last Value</Text>
								<Toggle v-model="loadLastValue" color="var(--neutral-mint)" />
							</Flex>
						</Flex>
					</template>
				</Popover>
			</Flex>
		</Flex>

		<Flex direction="column" :class="$style.data_wrapper">
			<Flex :class="$style.data">
				<ChartOnEntityPage
					:series-config="cumulativeFlowConfig"
					:chart-view="selectedChartType"
					:load-last-value="loadLastValue"
					:selected-period="selectedPeriod"
					:isLoading="isLoading"
				/>
			</Flex>

			<Flex justify="between" gap="32" :class="$style.data">
				<ChartOnEntityPage
					:series-config="delegationsConfig"
					:chart-view="selectedChartType"
					:load-last-value="loadLastValue"
					:selected-period="selectedPeriod"
					:isLoading="isLoading"
				/>

				<ChartOnEntityPage
					:series-config="delegationsCountConfig"
					:chart-view="selectedChartType"
					:load-last-value="loadLastValue"
					:selected-period="selectedPeriod"
					:isLoading="isLoading"
				/>
			</Flex>

			<Flex justify="between" gap="32" :class="$style.data">
				<ChartOnEntityPage
					:series-config="unbondingsConfig"
					:chart-view="selectedChartType"
					:load-last-value="loadLastValue"
					:selected-period="selectedPeriod"
					:isLoading="isLoading"
				>
					<template #header-content>
						<Tooltip position="start">
							<Icon name="info" size="13" color="tertiary" />

							<template #content>
								<Flex align="center" :style="{ width: '250px' }">
									<Text size="12" color="secondary" :style="{ lineHeight: '1.2' }">
										This chart show completed unbondings. Unbonding takes 21 days, so all unbondings will appear here
										only after that period.
									</Text>
								</Flex>
							</template>
						</Tooltip>
					</template>
				</ChartOnEntityPage>

				<ChartOnEntityPage
					:series-config="unbondingsCountConfig"
					:chart-view="selectedChartType"
					:load-last-value="loadLastValue"
					:selected-period="selectedPeriod"
					:isLoading="isLoading"
				>
					<template #header-content>
						<Tooltip position="start">
							<Icon name="info" size="13" color="tertiary" />

							<template #content>
								<Flex align="center" :style="{ width: '250px' }">
									<Text size="12" color="secondary" :style="{ lineHeight: '1.2' }">
										This chart show completed unbondings. Unbonding takes 21 days, so all unbondings will appear here
										only after that period.
									</Text>
								</Flex>
							</template>
						</Tooltip>
					</template>
				</ChartOnEntityPage>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module lang="scss">
.header {
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
}

.setting_item {
	min-height: 24px;
}

.data_wrapper {
	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);
}

.data {
	padding: 16px;
}

.chart_wrapper {
	position: relative;

	height: 180px;
}

.chart {
	position: absolute;

	& svg {
		overflow: visible;
	}
}

.axis {
	position: absolute;
	top: 0;
	right: 0;

	&.x {
		bottom: 6px;
		left: 40px;
	}

	&.y {
		bottom: 34px;
		left: 0;
	}
}

.tooltip_wrapper {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	& .dot {
		width: 6px;
		height: 6px;
		border-radius: 50px;
		background: var(--brand);

		box-shadow: 0 0 0 4px var(--dark-mint);

		transition: all 0.15s ease;
	}

	& .line {
		position: absolute;
		top: 0;
		bottom: 32px;

		border-left: 1px dashed var(--op-10);

		transition: all 0.15s ease;
	}

	& .badge {
		position: absolute;
		bottom: 4px;

		background: var(--card-background);

		transition: all 0.15s ease;
	}

	& .tooltip {
		pointer-events: none;
		position: absolute;
		z-index: 10;

		background: var(--card-background);
		border-radius: 6px;
		box-shadow:
			inset 0 0 0 1px var(--op-5),
			0 14px 34px rgba(0, 0, 0, 15%),
			0 4px 14px rgba(0, 0, 0, 5%);

		padding: 8px;

		transition: all 0.2s ease;
	}
}

@media (max-width: 800px) {
	.data {
		flex-direction: column;
	}
}
</style>
