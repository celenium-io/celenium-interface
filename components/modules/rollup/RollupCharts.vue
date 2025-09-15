<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Input from "@/components/ui/Input.vue"
import Popover from "@/components/ui/Popover.vue"
import Toggle from "@/components/ui/Toggle.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import ChartOnEntityPage from "~/components/shared/ChartOnEntityPage.vue"
import Icon from "@/components/Icon.vue"
import Text from "@/components/Text.vue"
import Flex from "@/components/Flex.vue"

/** Services */
import { abbreviate, formatBytes, hexToRgba, sortArrayOfObjects, spaces, tia } from "@/services/utils"
import { getFormatKey, createDataMap, generateDateForPeriod, generateSeriesData, PERIODS as periods } from "@/services/utils/entityCharts"

/** API */
import { fetchRollupSeries } from "@/services/api/stats"
import { fetchRollups, fetchRollupTVL } from "@/services/api/rollup"

/** Store */
import { useSettingsStore } from "@/store/settings.store"
const settingsStore = useSettingsStore()

const props = defineProps({
	rollup: {
		type: Object,
		required: true,
	},
})

const rollupColor = computed(() => hexToRgba(props.rollup.color, 1))

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

/** Charts */
const comparisonChartEl = ref()
const comparisonBarWidth = ref(0)

/** Data */
const isLoading = ref(false)
const sizeSeries = ref([])
const pfbSeries = ref([])
const feeSeries = ref([])
const tvlSeries = ref([])
const tvlDataSources = ref([])
const selectedTvlDataSource = ref()
const rollupsList = ref()
const comparisonData = ref([])
const selectedRollup = ref()

const seriesConfig = [
	{
		name: "size",
		metric: "size",
		series: sizeSeries,
		title: "DA Usage",
		tooltipLabel: "Usage",
		yAxisFormatter: (value) => formatBytes(value, 0),
		tooltipValueFormatter: formatBytes,
		unit: null,
	},
	{
		name: "blobs_count",
		metric: "pfb",
		series: pfbSeries,
		title: "Blobs Count",
		tooltipLabel: "Count",
		yAxisFormatter: (value) => abbreviate(value, 0),
		tooltipValueFormatter: abbreviate,
		unit: null,
	},
	{
		name: "fee",
		metric: "fee",
		series: feeSeries,
		title: "Fee spent",
		tooltipLabel: "Spent",
		yAxisFormatter: (val) => `${tia(val, 1)} TIA`,
		tooltipValueFormatter: (val) => `${tia(val)} TIA`,
	},
	{
		name: "tvl",
		metric: "tvl",
		series: tvlSeries,
		title: "TVL",
		tooltipLabel: "TVL",
		yAxisFormatter: abbreviate,
		tooltipValueFormatter: abbreviate,
		unit: "$",
	},
]

const sizeConfig = computed(() => seriesConfig.find((config) => config.metric === "size"))

const pfbConfig = computed(() => seriesConfig.find((config) => config.metric === "pfb"))

const feeConfig = computed(() => seriesConfig.find((config) => config.metric === "fee"))

const tvlConfig = computed(() => seriesConfig.find((config) => config.metric === "tvl"))

const getRollupsList = async () => {
	const data = await fetchRollups({
		limit: 30,
	})

	rollupsList.value = sortArrayOfObjects(data, "slug").filter((r) => r.id !== props.rollup.id)
}

const fetchTVLData = async () => {
	if (!selectedTvlDataSource.value) return []

	let from = ""
	let tf = selectedPeriod.value.timeframe
	let periodValue = selectedPeriod.value.value

	if (["hour", "week"].includes(tf)) {
		from = parseInt(DateTime.now().minus({ days: 30 }).ts / 1_000)
		tf = "day"
		periodValue = 30
	}

	return await fetchRollupTVL({
		dataSource: selectedTvlDataSource.value?.name,
		slug: props.rollup.slug,
		period: tf,
		from,
	})
}

const fetchData = async (rollup, metric) => {
	return await fetchRollupSeries({
		id: rollup.id,
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
	await Promise.all(
		configs.map(async (config) => {
			const rawData = await fetchData(props.rollup, config.name)
			const dataMap = createDataMap(rawData, selectedPeriod.value.timeframe)

			generateSeriesData(selectedPeriod.value, dataMap, config.series)
		}),
	)
}

const generateTVLSeriesData = (period, dataMap, series) => {
	series.value = []

	let tf = period.timeframe
	let periodValue = period.value

	if (["hour", "week"].includes(period.timeframe)) {
		tf = "day"
		periodValue = 30
	}

	for (let i = 1; i < periodValue + 1; i++) {
		const dt = generateDateForPeriod({ timeframe: tf, value: periodValue }, i)
		const formatKey = getFormatKey(tf)
		const key = dt.toFormat(formatKey)

		series.value.push({
			date: dt.toJSDate(),
			value: parseFloat(dataMap[key]) || 0,
		})
	}
}

const generateTVLSeries = async (configs) => {
	await Promise.all(
		configs.map(async (config) => {
			const rawData = await fetchTVLData()
			const dataMap = createDataMap(rawData, selectedPeriod.value.timeframe)

			generateTVLSeriesData(selectedPeriod.value, dataMap, config.series)
		}),
	)
}

const isTvlDataSourcePopoverOpen = ref(false)

const handleTvlDataSourcePopoverClose = () => {
	isTvlDataSourcePopoverOpen.value = false
}

const handleSelectTvlDataSource = (ds) => {
	selectedTvlDataSource.value = ds
	isTvlDataSourcePopoverOpen.value = false
}

const prepareComparisonData = async (fetchFunction) => {
	comparisonData.value[1] = {}

	comparisonBarWidth.value = comparisonChartEl.value.wrapper.getBoundingClientRect().width
	await getRollupsList()
	if (!selectedRollup.value) {
		selectedRollup.value = rollupsList.value[0]
	}

	if (!comparisonData.value[0]?.fee) {
		comparisonData.value[0] = {
			fee: feeSeries.value.reduce((sum, el) => sum + el.value, 0),
			pfb: pfbSeries.value.reduce((sum, el) => sum + el.value, 0),
			size: sizeSeries.value.reduce((sum, el) => sum + el.value, 0),
		}
	}

	if (!comparisonData.value[1]?.fee) {
		let feeData = await fetchData(selectedRollup.value, "fee")
		let pfbData = await fetchData(selectedRollup.value, "blobs_count")
		let sizeData = await fetchData(selectedRollup.value, "size")

		comparisonData.value[1] = {
			fee: feeData.reduce((sum, el) => sum + +el.value, 0),
			pfb: pfbData.reduce((sum, el) => sum + +el.value, 0),
			size: sizeData.reduce((sum, el) => sum + +el.value, 0),
		}
	}

	let firstRollup = comparisonData.value[0]
	let secondRollup = comparisonData.value[1]

	Object.keys(firstRollup).forEach((el) => {
		let sum = firstRollup[el] + secondRollup[el]
		firstRollup[el + "_graph"] = Math.max(Math.round((firstRollup[el] / sum) * 100, 2), 1)
	})
}

const isRollupPopoverOpen = ref(false)
const searchTerm = ref("")
const handleRollupPopoverClose = () => {
	isRollupPopoverOpen.value = false
	searchTerm.value = ""
}
const handleSelectRollup = (rollup) => {
	selectedRollup.value = rollup
	isRollupPopoverOpen.value = false
}
const filteredRollupsList = computed(() => {
	if (!searchTerm.value) return rollupsList.value

	return rollupsList.value.filter((r) => r.name.toLowerCase().includes(searchTerm.value.trim().toLowerCase()))
})

const handleChangeChartView = () => {
	if (chartView.value === "line") {
		chartView.value = "bar"
	} else {
		chartView.value = "line"
	}
}

const fetchAllData = async () => {
	isLoading.value = true

	comparisonData.value[0] = {}
	comparisonData.value[1] = {}

	await generateSeries(seriesConfig.filter((el) => el.metric !== "tvl"))
	await generateTVLSeries(seriesConfig.filter((el) => el.metric === "tvl"))
	await prepareComparisonData(fetchRollupSeries)

	isLoading.value = false
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

watch(
	() => selectedRollup.value,
	() => {
		if (!isLoading.value) {
			comparisonData.value[1] = {}
			prepareComparisonData(fetchRollupSeries)
		}
	},
)

watch(
	() => selectedTvlDataSource.value,
	async (newDataSource, oldDataSource) => {
		isLoading.value = true

		if (oldDataSource && newDataSource?.name !== oldDataSource?.name) {
			await generateTVLSeries([seriesConfig.find((el) => el.metric === "tvl")])
		}

		isLoading.value = false
	},
	{ deep: true },
)

onBeforeMount(() => {
	isLoading.value = true
	const settings = JSON.parse(localStorage.getItem("settings"))
	chartView.value = settings?.chart?.view || "bar"
	loadLastValue.value = settings?.chart?.view ? settings.chart.loadLastValue : true
})

onMounted(async () => {
	if (props.rollup["l2_beat"]) {
		tvlDataSources.value.push({ name: "l2beat", title: "L2Beat" })
	}
	if (props.rollup["defi_lama"]) {
		tvlDataSources.value.push({ name: "llama", title: "Defi Llama" })
	}
	selectedTvlDataSource.value = tvlDataSources.value[0]

	await fetchAllData()
})
</script>

<template>
	<Flex direction="column" gap="4">
		<!-- Header -->
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="chart" size="14" color="primary" />
				<Text as="h1" size="13" weight="600" color="primary">Analytics</Text>
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

		<Flex direction="column">
			<Flex justify="between" gap="32" :class="[$style.data, $style.top]">
				<ChartOnEntityPage
					v-if="sizeSeries.length"
					:series-config="sizeConfig"
					:chart-view="chartView"
					:color="rollupColor"
					:load-last-value="loadLastValue"
					:selected-period="selectedPeriod"
					:isLoading="isLoading"
				/>

				<ChartOnEntityPage
					v-if="pfbSeries.length"
					:series-config="pfbConfig"
					:chart-view="chartView"
					:color="rollupColor"
					:load-last-value="loadLastValue"
					:selected-period="selectedPeriod"
					:isLoading="isLoading"
				/>
			</Flex>

			<Flex justify="between" gap="32" :class="$style.data">
				<ChartOnEntityPage
					v-if="feeSeries.length"
					:series-config="feeConfig"
					:chart-view="chartView"
					:color="rollupColor"
					:load-last-value="loadLastValue"
					:selected-period="selectedPeriod"
					:isLoading="isLoading"
				/>

				<ChartOnEntityPage
					v-if="tvlSeries.length"
					:series-config="tvlConfig"
					:chart-view="chartView"
					:color="rollupColor"
					:load-last-value="loadLastValue"
					:selected-period="selectedPeriod"
					:isLoading="isLoading"
				>
					<template #header-content>
						<Flex align="center" gap="8">
							<Text v-if="tvlSeries.length" size="13" weight="600" color="brand">
								{{
									`${abbreviate(
										tvlSeries[tvlSeries.length - 1].value
											? tvlSeries[tvlSeries.length - 1].value
											: tvlSeries[tvlSeries.length - 2].value,
										2,
									)} USD`
								}}
							</Text>

							<Tooltip v-if="tvlSeries.length" position="end">
								<Icon name="info" size="13" color="tertiary" />

								<template #content>
									<Flex align="center" :style="{ width: '160px' }">
										<Text size="12" color="secondary" :style="{ lineHeight: '1.2' }">
											Grouping by day or month is only available for this chart.
										</Text>
									</Flex>
								</template>
							</Tooltip>
						</Flex>
					</template>
					<template #header-actions>
						<Flex align="center" gap="8">
							<Popover
								v-if="selectedTvlDataSource"
								:open="isTvlDataSourcePopoverOpen"
								@on-close="handleTvlDataSourcePopoverClose"
								side="right"
								width="180"
							>
								<Flex
									@click="isTvlDataSourcePopoverOpen = true"
									align="center"
									justify="between"
									gap="12"
									:class="[$style.popover_header, isTvlDataSourcePopoverOpen && $style.popover_header_active]"
								>
									<Flex align="center" gap="8">
										<Icon :name="selectedTvlDataSource?.name" size="13" color="brand" />

										<Text size="13" color="primary"> {{ selectedTvlDataSource?.title }} </Text>
									</Flex>

									<Icon
										name="chevron"
										size="14"
										color="secondary"
										:style="{
											transform: `rotate(${isTvlDataSourcePopoverOpen ? '180' : '0'}deg)`,
											transition: 'all 0.25s ease',
										}"
									/>
								</Flex>

								<template #content>
									<Flex direction="column" justify="center" gap="12">
										<Text size="12" weight="600" color="secondary">Select TVL Data Source</Text>

										<Flex direction="column" gap="4" :class="$style.popover_list">
											<Flex
												v-for="ds in tvlDataSources"
												@click="handleSelectTvlDataSource(ds)"
												align="center"
												justify="between"
												gap="4"
												:class="$style.popover_list_item"
											>
												<Flex align="center" gap="8">
													<Icon :name="ds.name" size="13" color="secondary" />

													<Text size="12" color="primary"> {{ ds.title }} </Text>
												</Flex>

												<Icon v-if="selectedTvlDataSource.name === ds.name" name="check" size="14" color="brand" />
											</Flex>
										</Flex>
									</Flex>
								</template>
							</Popover>
						</Flex>
					</template>
				</ChartOnEntityPage>
			</Flex>
			<Flex justify="between" gap="32" :class="[$style.data, $style.bottom]">
				<Flex ref="comparisonChartEl" direction="column" gap="12" :style="{ minHeight: '207px' }">
					<Flex align="center" justify="between">
						<Text size="13" weight="600" color="primary">Rollups Comparison</Text>

						<Popover :open="isRollupPopoverOpen" @on-close="handleRollupPopoverClose" side="right" width="250">
							<Flex
								@click="isRollupPopoverOpen = true"
								align="center"
								justify="between"
								gap="12"
								:class="[$style.popover_header, isRollupPopoverOpen && $style.popover_header_active]"
							>
								<Flex align="center" gap="8">
									<div :class="$style.avatar_container">
										<img :src="selectedRollup?.logo" :class="$style.avatar_image" />
									</div>

									<Text size="13" color="primary"> {{ selectedRollup?.name }} </Text>
								</Flex>

								<Icon
									name="chevron"
									size="14"
									color="secondary"
									:style="{ transform: `rotate(${isRollupPopoverOpen ? '180' : '0'}deg)`, transition: 'all 0.25s ease' }"
								/>
							</Flex>

							<template #content>
								<Flex direction="column" justify="center" gap="12">
									<Text size="12" weight="600" color="secondary">Filter by Rollup</Text>

									<Input v-model="searchTerm" size="small" placeholder="Search" autofocus />

									<Flex direction="column" gap="4" :class="$style.popover_list">
										<template v-if="filteredRollupsList.length">
											<Flex
												v-for="r in filteredRollupsList"
												@click="handleSelectRollup(r)"
												align="center"
												justify="between"
												gap="4"
												:class="$style.popover_list_item"
											>
												<Flex align="center" gap="6">
													<div :class="$style.avatar_container">
														<img :src="r.logo" :class="$style.avatar_image" />
													</div>

													<Text size="12" color="primary"> {{ r.name }} </Text>
												</Flex>

												<Icon v-if="selectedRollup.slug === r.slug" name="check" size="14" color="brand" />
											</Flex>
										</template>
										<Flex v-else justify="center" :style="{ paddingTop: '10px' }">
											<Text size="12" weight="500" color="tertiary">Nothing was found</Text>
										</Flex>
									</Flex>
								</Flex>
							</template>
						</Popover>
					</Flex>

					<Flex v-if="comparisonData[0]?.size_graph" direction="column" gap="12" :class="$style.chart_wrapper_single">
						<Flex direction="column" gap="12">
							<Text size="13" weight="500" color="secondary">Size</Text>

							<Flex :style="`width: ${comparisonBarWidth}px`">
								<div
									:class="$style.graph_bar"
									:style="{
										width: `${comparisonData[0]?.size_graph}%`,
										background: rollupColor,
										marginRight: '4px',
									}"
								></div>
								<div
									:class="$style.graph_bar"
									:style="{
										width: `${100 - comparisonData[0]?.size_graph}%`,
										background: 'var(--op-20)',
									}"
								></div>
							</Flex>

							<Flex align="center" justify="between" :style="{ marginTop: '-8px' }">
								<Text size="12" color="tertiary"> {{ formatBytes(comparisonData[0]?.size) }} </Text>

								<Text size="12" color="tertiary"> {{ formatBytes(comparisonData[1]?.size) }} </Text>
							</Flex>
						</Flex>

						<Flex direction="column" gap="12">
							<Text size="13" weight="500" color="secondary">Blobs</Text>

							<Flex :style="`width: ${comparisonBarWidth}px`">
								<div
									:class="$style.graph_bar"
									:style="{
										width: `${comparisonData[0]?.pfb_graph}%`,
										background: rollupColor,
										marginRight: '4px',
									}"
								></div>
								<div
									:class="$style.graph_bar"
									:style="{
										width: `${100 - comparisonData[0]?.pfb_graph}%`,
										background: 'var(--op-20)',
									}"
								></div>
							</Flex>

							<Flex align="center" justify="between" :style="{ marginTop: '-8px' }">
								<Text size="12" color="tertiary"> {{ spaces(comparisonData[0]?.pfb) }} </Text>

								<Text size="12" color="tertiary"> {{ spaces(comparisonData[1]?.pfb) }} </Text>
							</Flex>
						</Flex>

						<Flex direction="column" gap="12">
							<Text size="13" weight="500" color="secondary">Fee</Text>

							<Flex :style="`width: ${comparisonBarWidth}px`">
								<div
									:class="$style.graph_bar"
									:style="{
										width: `${comparisonData[0]?.fee_graph}%`,
										background: rollupColor,
										marginRight: '4px',
									}"
								></div>
								<div
									:class="$style.graph_bar"
									:style="{
										width: `${100 - comparisonData[0]?.fee_graph}%`,
										background: 'var(--op-20)',
									}"
								></div>
							</Flex>

							<Flex align="center" justify="between" :style="{ marginTop: '-8px' }">
								<Text size="12" color="tertiary"> {{ tia(comparisonData[0]?.fee) }} TIA </Text>

								<Text size="12" color="tertiary"> {{ tia(comparisonData[1]?.fee) }} TIA</Text>
							</Flex>
						</Flex>
					</Flex>
					<Flex
						v-else
						align="center"
						justify="center"
						direction="column"
						gap="4"
						:class="$style.chart_wrapper_single"
						:style="{ height: '100%', paddingBottom: '24px' }"
					>
						<Text size="12" color="secondary" weight="600">No data for comparison</Text>
						<Text size="12" color="tertiary">Try to select a different rollup or period</Text>
					</Flex>
				</Flex>
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

.chart_selector {
	padding: 4px 6px 4px 6px;
	box-shadow: inset 0 0 0 1px var(--op-10);
	border-radius: 5px;
	cursor: pointer;
	transition: all 1s ease-in-out;
}

.chart_wrapper {
	position: relative;

	height: 180px;
}

.chart_wrapper_single {
	position: relative;

	width: 464px;
}

.graph_bar {
	height: 4px;

	border-radius: 2px;

	margin-bottom: 4px;

	transition: all 0.5s ease;
}

.popover_header {
	cursor: pointer;

	padding: 4px 6px;
	box-shadow: 0 0 0 1px var(--op-10);
	border-radius: 6px;

	&:hover {
		box-shadow: 0 0 0 1px var(--op-20);
	}
}

.popover_header_active {
	box-shadow: 0 0 0 1px var(--op-20);
}

.popover_list {
	max-height: 180px;

	overflow-y: auto;
	overflow-x: hidden;
	overscroll-behavior: contain;
}

.popover_list_item {
	padding: 8px 6px;
	border-radius: 2px;

	cursor: pointer;

	&:hover {
		background-color: var(--op-5);
	}
}
.avatar_container {
	position: relative;
	width: 16px;
	height: 16px;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.data {
	background: var(--card-background);
	padding: 16px;
}

.top {
	border-radius: 4px 4px 0px 0px;
}

.bottom {
	border-radius: 0px 0px 8px 8px;
}

@media (max-width: 800px) {
	.data {
		flex-direction: column;
	}

	.chart_wrapper_single {
		max-width: 100%;
	}
}
</style>
