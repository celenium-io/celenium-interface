<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"
import { useDebounceFn } from "@vueuse/core"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Popover from "@/components/ui/Popover.vue"
import Toggle from "@/components/ui/Toggle.vue"
import ChartOnEntityPage from "@/components/ui/ChartOnEntityPage.vue"
import Icon from "@/components/Icon.vue"
import Text from "@/components/Text.vue"
import Flex from "@/components/Flex.vue"

/** Services */
import { abbreviate, formatBytes } from "@/services/utils"
import { createDataMap, generateDateForPeriod, generateSeriesData, PERIODS as periods } from "@/services/utils/entityCharts"

/** API */
import { fetchNamespaceSeries } from "@/services/api/stats"

/** Store */
import { useSettingsStore } from "@/store/settings.store"
const settingsStore = useSettingsStore()

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
})

/** Chart settings */
const selectedPeriodIdx = ref(2)
const selectedPeriod = computed(() => periods[selectedPeriodIdx.value])
const chartView = ref("line")
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
		view: chartView.value,
		loadLastValue: loadLastValue.value,
	}
}

/** Data */
const isLoading = ref(false)
const sizeSeries = ref([])
const pfbSeries = ref([])

/** Series config */
const seriesConfig = [
	{ name: "size", metric: "size", series: sizeSeries },
	{ name: "pfb_count", metric: "pfb", series: pfbSeries },
]

const fetchData = async (metric) => {
	return await fetchNamespaceSeries({
		id: props.id,
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


const generateSeries = async (configs) => {
	isLoading.value = true

	await Promise.all(
		configs.map(async (config) => {
			const rawData = await fetchData(config.name)
			const dataMap = createDataMap(rawData, selectedPeriod.value.timeframe)
			generateSeriesData(selectedPeriod.value, dataMap, config.series)
		}),
	)

	isLoading.value = false
}

const handleChangeChartView = () => {
	if (chartView.value === "line") {
		chartView.value = "bar"
	} else {
		chartView.value = "line"
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
	() => [chartView.value, loadLastValue.value],
	() => {
		updateUserSettings()
	},
)

onBeforeMount(() => {
	isLoading.value = true
	const settings = JSON.parse(localStorage.getItem("settings"))
	chartView.value = settings?.chart?.view || "bar"
	loadLastValue.value = settings?.chart?.view ? settings.chart.loadLastValue : true
})

onMounted(async () => {
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
						<Icon name="settings" size="12" color="tertiary" />
					</Button>

					<template #content>
						<Flex direction="column" gap="12">
							<Flex align="center" justify="between" gap="6" :class="$style.setting_item">
								<Text size="12" color="secondary">Chart view</Text>

								<Flex
									@click="handleChangeChartView"
									align="center"
									gap="12"
									:class="$style.chart_selector"
									:style="{
										background: `linear-gradient(to ${
											chartView === 'line' ? 'right' : 'left'
										}, var(--op-5) 50%, transparent 50%)`,
									}"
								>
									<Icon
										name="line-chart"
										size="14"
										:style="{ fill: `${chartView === 'line' ? 'var(--mint)' : 'var(--txt-tertiary)'}` }"
									/>

									<Icon
										name="bar-chart"
										size="14"
										:style="{ fill: `${chartView === 'bar' ? 'var(--mint)' : 'var(--txt-tertiary)'}` }"
									/>
								</Flex>
							</Flex>

							<Flex align="center" justify="between" gap="6" :class="$style.setting_item">
								<Text size="12" :color="loadLastValue ? 'secondary' : 'tertiary'">Show last value</Text>
								<Toggle v-model="loadLastValue" color="var(--neutral-mint)" />
							</Flex>
						</Flex>
					</template>
				</Popover>
			</Flex>
		</Flex>

		<Flex justify="between" gap="32" :class="$style.data">
			<ChartOnEntityPage
				v-if="sizeSeries.length"
				:data="sizeSeries"
				metric="size"
				:chart-view="chartView"
				:load-last-value="loadLastValue"
				:selected-period="selectedPeriod"
				title="DA Usage"
				:y-axis-formatter="(val) => formatBytes(val, 0)"
				tooltip-label="Usage"
				:tooltip-value-formatter="formatBytes"
			/>

			<ChartOnEntityPage
				v-if="pfbSeries.length"
				:data="pfbSeries"
				metric="pfb"
				:chart-view="chartView"
				:load-last-value="loadLastValue"
				:selected-period="selectedPeriod"
				title="Pay For Blobs Count"
				:y-axis-formatter="abbreviate"
				tooltip-label="Count"
				:tooltip-value-formatter="abbreviate"
			/>
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

.chart_selector {
	padding: 4px 6px 4px 6px;
	box-shadow: inset 0 0 0 1px var(--op-10);
	border-radius: 5px;
	cursor: pointer;
	transition: all 1s ease-in-out;
}

.data {
	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

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
		box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

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
