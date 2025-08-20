<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"
import { useDebounceFn } from "@vueuse/core"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Input from "@/components/ui/Input.vue"
import Popover from "@/components/ui/Popover.vue"
import Toggle from "@/components/ui/Toggle.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { abbreviate, formatBytes, sortArrayOfObjects, spaces, tia } from "@/services/utils"
import { buildLineChart, buildBarChart } from "@/services/utils/charts"

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

/** Chart settings */
const selectedPeriodIdx = ref(2)
const periods = ref([
	{
		title: "Last 24 hours",
		value: 24,
		timeframe: "hour",
	},
	{
		title: "Last 7 days",
		value: 7,
		timeframe: "day",
	},
	{
		title: "Last 31 days",
		value: 30,
		timeframe: "day",
	},
	{
		title: "Last 12 months",
		value: 12,
		timeframe: "month",
	},
])
const selectedPeriod = computed(() => periods.value[selectedPeriodIdx.value])
const chartView = ref("line")
const loadLastValue = ref(true)

const isOpen = ref(false)
const handleOpen = () => {
	isOpen.value = true
}
const handleClose = () => {
	isOpen.value = false
}

const handleChangeChartView = () => {
	if (chartView.value === "line") {
		chartView.value = "bar"
	} else {
		chartView.value = "line"
	}
}

const updateUserSettings = () => {
	settingsStore.chart = {
		...settingsStore.chart,
		view: chartView.value,
		loadLastValue: loadLastValue.value,
	}
}

/** Charts */
const chartWrapperEl = ref()
const sizeSeriesChartEl = ref()
const pfbSeriesChartEl = ref()
const feeSeriesChartEl = ref()
const tvlSeriesChartEl = ref()
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

/** Tooltip */
const showSeriesTooltip = ref(false)
const showPfbTooltip = ref(false)
const showFeeTooltip = ref(false)
const showTVLTooltip = ref(false)
const tooltipEl = ref()
const tooltipXOffset = ref(0)
const tooltipYOffset = ref(0)
const tooltipYDataOffset = ref(0)
const tooltipDynamicXPosition = ref(0)
const tooltipText = ref("")

const badgeEl = ref()
const badgeText = ref("")
const badgeOffset = ref(0)

const getXAxisLabels = (start, tvl = false) => {
	let res = ""

	let tf = selectedPeriod.value.timeframe
	let periodValue = selectedPeriod.value.value
	if (tvl && ["hour", "week"].includes(selectedPeriod.value.timeframe)) {
		tf = "day"
		periodValue = 30
	}

	switch (tf) {
		case "month":
			start
				? (res = DateTime.now()
						.minus({ months: periodValue - 1 })
						.toFormat("LLL y"))
				: (res = loadLastValue.value ? DateTime.now().toFormat("LLL") : DateTime.now().minus({ months: 1 }).toFormat("LLL"))
			break
		case "day":
			start
				? (res = DateTime.now()
						.minus({ days: periodValue - 1 })
						.toFormat("LLL dd"))
				: (res = loadLastValue.value ? "Today" : DateTime.now().minus({ days: 1 }).toFormat("LLL dd"))
			break
		default:
			start
				? (res = DateTime.now()
						.minus({ hours: periodValue - 1 })
						.set({ minutes: 0 })
						.toFormat("hh:mm a"))
				: (res = loadLastValue.value ? "Now" : DateTime.now().minus({ hours: 1 }).set({ minutes: 0 }).toFormat("hh:mm a"))
			break
	}

	return res
}

const getRollupsList = async () => {
	const data = await fetchRollups({
		limit: 30,
	})

	rollupsList.value = sortArrayOfObjects(data, "slug").filter((r) => r.id !== props.rollup.id)
}

const fetchData = async (rollup, metric, from, timeframe) => {
	const data = await fetchRollupSeries({
		id: rollup.id,
		name: metric,
		timeframe: timeframe ? timeframe : selectedPeriod.value.timeframe,
		from: from
			? from
			: parseInt(
					DateTime.now().minus({
						days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value : 0,
						hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value : 0,
						months: selectedPeriod.value.timeframe === "month" ? selectedPeriod.value.value : 0,
					}).ts / 1_000,
			  ),
	})

	return data
}
const getSizeSeries = async () => {
	sizeSeries.value = []

	const sizeSeriesRawData = await fetchData(props.rollup, "size")

	const sizeSeriesMap = {}
	sizeSeriesRawData.forEach((item) => {
		sizeSeriesMap[
			DateTime.fromISO(item.time).toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")
		] = item.value
	})

	for (let i = 1; i < selectedPeriod.value.value + 1; i++) {
		let dt
		if (selectedPeriod.value.timeframe === "month") {
			dt = DateTime.now()
				.startOf("month")
				.minus({
					months: selectedPeriod.value.timeframe === "month" ? selectedPeriod.value.value - i : 0,
				})
		} else {
			dt = DateTime.now().minus({
				days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value - i : 0,
				hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value - i : 0,
			})
		}
		sizeSeries.value.push({
			date: dt.toJSDate(),
			value:
				parseInt(
					sizeSeriesMap[dt.toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")],
				) || 0,
		})
	}
}

const getPfbSeries = async () => {
	pfbSeries.value = []

	const blobsSeriesRawData = await fetchData(props.rollup, "blobs_count")

	const blobsSeriesMap = {}
	blobsSeriesRawData.forEach((item) => {
		blobsSeriesMap[
			DateTime.fromISO(item.time).toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")
		] = item.value
	})

	for (let i = 1; i < selectedPeriod.value.value + 1; i++) {
		let dt
		if (selectedPeriod.value.timeframe === "month") {
			dt = DateTime.now()
				.startOf("month")
				.minus({
					months: selectedPeriod.value.timeframe === "month" ? selectedPeriod.value.value - i : 0,
				})
		} else {
			dt = DateTime.now().minus({
				days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value - i : 0,
				hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value - i : 0,
			})
		}
		pfbSeries.value.push({
			date: dt.toJSDate(),
			value:
				parseInt(
					blobsSeriesMap[dt.toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")],
				) || 0,
		})
	}
}

const getFeeSeries = async () => {
	feeSeries.value = []

	const feeSeriesRawData = await fetchData(props.rollup, "fee")

	const feeSeriesMap = {}
	feeSeriesRawData.forEach((item) => {
		feeSeriesMap[
			DateTime.fromISO(item.time).toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")
		] = item.value
	})

	for (let i = 1; i < selectedPeriod.value.value + 1; i++) {
		let dt
		if (selectedPeriod.value.timeframe === "month") {
			dt = DateTime.now()
				.startOf("month")
				.minus({
					months: selectedPeriod.value.timeframe === "month" ? selectedPeriod.value.value - i : 0,
				})
		} else {
			dt = DateTime.now().minus({
				days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value - i : 0,
				hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value - i : 0,
			})
		}
		feeSeries.value.push({
			date: dt.toJSDate(),
			value:
				parseInt(feeSeriesMap[dt.toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")]) ||
				0,
		})
	}
}

const getTVLSeries = async () => {
	tvlSeries.value = []
	if (!selectedTvlDataSource.value?.name) return

	isLoading.value = true
	let from = ""
	let tf = selectedPeriod.value.timeframe
	let periodValue = selectedPeriod.value.value
	if (["hour", "week"].includes(selectedPeriod.value.timeframe)) {
		from = parseInt(DateTime.now().minus({ days: 30 }).ts / 1_000)
		tf = "day"
		periodValue = 30
	}

	const tvlSeriesRawData = await fetchRollupTVL({
		dataSource: selectedTvlDataSource.value?.name,
		slug: props.rollup.slug,
		period: tf,
		from,
	})

	const tvlSeriesMap = {}
	tvlSeriesRawData.forEach((item) => {
		tvlSeriesMap[DateTime.fromISO(item.time).toFormat(["day", "month"].includes(tf) ? "y-LL-dd" : "y-LL-dd-HH")] = item.value
	})

	for (let i = 1; i < periodValue + 1; i++) {
		let dt
		if (tf === "month") {
			dt = DateTime.now()
				.startOf("month")
				.minus({
					months: tf === "month" ? periodValue - i : 0,
				})
		} else {
			dt = DateTime.now().minus({
				days: tf === "day" ? periodValue - i : 0,
				hours: tf === "hour" ? periodValue - i : 0,
			})
		}
		tvlSeries.value.push({
			date: dt.toJSDate(),
			value: parseFloat(tvlSeriesMap[dt.toFormat(["day", "month"].includes(tf) ? "y-LL-dd" : "y-LL-dd-HH")]) || 0,
		})
	}

	isLoading.value = false
}
const isTvlDataSourcePopoverOpen = ref(false)
const handleTvlDataSourcePopoverClose = () => {
	isTvlDataSourcePopoverOpen.value = false
}
const handleSelectTvlDataSource = (ds) => {
	selectedTvlDataSource.value = ds
	isTvlDataSourcePopoverOpen.value = false
}

const prepareComparisonData = async () => {
	isLoading.value = true

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

	isLoading.value = false
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

const buildRollupCharts = async (loadData = true) => {
	isLoading.value = true


	const tooltipConfig = {
		tooltipXOffset,
		tooltipYDataOffset,
		tooltipYOffset,
		tooltipText,
		tooltipDynamicXPosition,
		badgeText,
		badgeOffset,
		tooltipEl,
		badgeEl,
		selectedPeriod,
		loadLastValue,
	}

	if (loadData) {
		await getRollupsList()
		if (!selectedRollup.value) {
			selectedRollup.value = rollupsList.value[0]
		}

		comparisonBarWidth.value = comparisonChartEl.value.wrapper.getBoundingClientRect().width

		await getSizeSeries()
		await getPfbSeries()
		await getFeeSeries()
		await getTVLSeries()
	}

	if (chartView.value === "line") {
		buildLineChart(
			sizeSeriesChartEl.value.wrapper,
			loadLastValue.value ? sizeSeries.value : sizeSeries.value.slice(0, sizeSeries.value.length - 1),
			() => (showSeriesTooltip.value = true),
			() => (showSeriesTooltip.value = false),
			"size",
			tooltipConfig
		)
		buildLineChart(
			pfbSeriesChartEl.value.wrapper,
			loadLastValue.value ? pfbSeries.value : pfbSeries.value.slice(0, pfbSeries.value.length - 1),
			() => (showPfbTooltip.value = true),
			() => (showPfbTooltip.value = false),
			"pfb",
			tooltipConfig
		)
		buildLineChart(
			feeSeriesChartEl.value.wrapper,
			loadLastValue.value ? feeSeries.value : feeSeries.value.slice(0, feeSeries.value.length - 1),
			() => (showFeeTooltip.value = true),
			() => (showFeeTooltip.value = false),
			"fee",
			tooltipConfig
		)
		buildLineChart(
			tvlSeriesChartEl.value.wrapper,
			loadLastValue.value ? tvlSeries.value : tvlSeries.value.slice(0, tvlSeries.value.length - 1),
			() => (showTVLTooltip.value = true),
			() => (showTVLTooltip.value = false),
			"tvl",
			tooltipConfig
		)
	} else {
		buildBarChart(
			sizeSeriesChartEl.value.wrapper,
			loadLastValue.value ? sizeSeries.value : sizeSeries.value.slice(0, sizeSeries.value.length - 1),
			() => (showSeriesTooltip.value = true),
			() => (showSeriesTooltip.value = false),
			"size",
			tooltipConfig,
		)
		buildBarChart(
			pfbSeriesChartEl.value.wrapper,
			loadLastValue.value ? pfbSeries.value : pfbSeries.value.slice(0, pfbSeries.value.length - 1),
			() => (showPfbTooltip.value = true),
			() => (showPfbTooltip.value = false),
			"pfb",
			tooltipConfig,
		)
		buildBarChart(
			feeSeriesChartEl.value.wrapper,
			loadLastValue.value ? feeSeries.value : feeSeries.value.slice(0, feeSeries.value.length - 1),
			() => (showFeeTooltip.value = true),
			() => (showFeeTooltip.value = false),
			"fee",
			tooltipConfig,
		)
		buildBarChart(
			tvlSeriesChartEl.value.wrapper,
			loadLastValue.value ? tvlSeries.value : tvlSeries.value.slice(0, tvlSeries.value.length - 1),
			() => (showTVLTooltip.value = true),
			() => (showTVLTooltip.value = false),
			"tvl",
			tooltipConfig,
		)
	}

	await prepareComparisonData()

	isLoading.value = false
}

watch(
	() => selectedPeriodIdx.value,
	() => {
		comparisonData.value[0] = {}
		comparisonData.value[1] = {}
		buildRollupCharts()
	},
)

watch(
	() => [chartView.value, loadLastValue.value],
	() => {
		updateUserSettings()
		if (!isLoading.value) {
			buildRollupCharts(false)
		}
	},
)

watch(
	() => selectedRollup.value,
	() => {
		if (!isLoading.value) {
			comparisonData.value[1] = {}
			prepareComparisonData()
		}
	},
)

watch(
	() => selectedTvlDataSource.value,
	async () => {
		if (!isLoading.value) {
			await getTVLSeries()
			if (chartView.value === "line") {
				buildLineChart(
					tvlSeriesChartEl.value.wrapper,
					loadLastValue.value ? tvlSeries.value : tvlSeries.value.slice(0, tvlSeries.value.length - 1),
					() => (showTVLTooltip.value = true),
					() => (showTVLTooltip.value = false),
					"tvl",
				)
			} else {
				buildBarChart(
					tvlSeriesChartEl.value.wrapper,
					loadLastValue.value ? tvlSeries.value : tvlSeries.value.slice(0, tvlSeries.value.length - 1),
					() => (showTVLTooltip.value = true),
					() => (showTVLTooltip.value = false),
					"tvl",
				)
			}
		}
	},
)

const debouncedRedraw = useDebounceFn((e) => {
	buildRollupCharts()
}, 500)

onBeforeMount(() => {
	isLoading.value = true
	const settings = JSON.parse(localStorage.getItem("settings"))
	chartView.value = settings?.chart?.view || "bar"
	loadLastValue.value = settings?.chart?.view ? settings.chart.loadLastValue : true
})

onMounted(async () => {
	window.addEventListener("resize", debouncedRedraw)

	if (props.rollup["l2_beat"]) {
		tvlDataSources.value.push({ name: "l2beat", title: "L2Beat" })
	}
	if (props.rollup["defi_lama"]) {
		tvlDataSources.value.push({ name: "llama", title: "Defi Llama" })
	}
	selectedTvlDataSource.value = tvlDataSources.value[0]

	buildRollupCharts()
})

onBeforeUnmount(() => {
	window.removeEventListener("resize", debouncedRedraw)
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

		<Flex direction="column">
			<Flex justify="between" gap="32" :class="[$style.data, $style.top]">
				<Flex direction="column" gap="20" wide>
					<Text size="13" weight="600" color="primary">DA Usage</Text>

					<Flex ref="chartWrapperEl" direction="column" :class="$style.chart_wrapper">
						<Flex direction="column" justify="between" :class="[$style.axis, $style.y]">
							<Text
								v-if="sizeSeries.length"
								size="12"
								weight="600"
								color="tertiary"
								:style="{ opacity: Math.max(...sizeSeries.map((d) => d.value)) ? 1 : 0 }"
							>
								{{ formatBytes(Math.max(...sizeSeries.map((d) => d.value)), 0) }}
							</Text>
							<Skeleton v-else-if="!sizeSeries.length" w="32" h="12" />

							<Text
								v-if="sizeSeries.length"
								size="12"
								weight="600"
								color="tertiary"
								:style="{
									opacity:
										Math.round(Math.max(...sizeSeries.map((d) => d.value)) / 2) !==
										Math.max(...sizeSeries.map((d) => d.value))
											? 1
											: 0,
								}"
							>
								{{ formatBytes(Math.round(Math.max(...sizeSeries.map((d) => d.value)) / 2), 0) }}
							</Text>
							<Skeleton v-else-if="!sizeSeries.length" w="24" h="12" />

							<Text v-if="sizeSeries.length" size="12" weight="600" color="tertiary"> 0 </Text>
							<Skeleton v-else-if="!sizeSeries.length" w="16" h="12" />
						</Flex>

						<Flex :class="[$style.axis, $style.x]">
							<Flex align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{ getXAxisLabels(true) }}
								</Text>

								<Text size="12" weight="600" color="tertiary">
									{{ getXAxisLabels(false) }}
								</Text>
							</Flex>
						</Flex>

						<Transition name="fastfade">
							<div v-if="showSeriesTooltip" :class="$style.tooltip_wrapper">
								<div
									v-if="chartView === 'line'"
									:style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }"
									:class="$style.dot"
								/>
								<div
									v-if="chartView === 'line'"
									:style="{ transform: `translateX(${tooltipXOffset}px)` }"
									:class="$style.line"
								/>
								<div
									ref="badgeEl"
									:style="{ transform: `translateX(${tooltipXOffset - badgeOffset}px)` }"
									:class="$style.badge"
								>
									<Text size="12" weight="600" color="secondary">
										{{ badgeText }}
									</Text>
								</div>
								<Flex
									ref="tooltipEl"
									:style="{ transform: `translate(${tooltipDynamicXPosition}px, ${tooltipYDataOffset - 40}px)` }"
									direction="column"
									gap="8"
									:class="$style.tooltip"
								>
									<Flex align="center" gap="16">
										<Text size="12" weight="600" color="secondary">Usage</Text>
										<Text size="12" weight="600" color="primary"> {{ formatBytes(tooltipText) }} </Text>
									</Flex>
								</Flex>
							</div>
						</Transition>

						<Flex ref="sizeSeriesChartEl" :class="$style.chart" />
					</Flex>
				</Flex>

				<Flex direction="column" gap="20" wide>
					<Text size="13" weight="600" color="primary">Blobs Count</Text>

					<Flex direction="column" :class="$style.chart_wrapper">
						<Flex direction="column" justify="between" :class="[$style.axis, $style.y]">
							<Text
								v-if="pfbSeries.length"
								size="12"
								weight="600"
								color="tertiary"
								:style="{ opacity: Math.max(...pfbSeries.map((d) => d.value)) ? 1 : 0 }"
							>
								{{ abbreviate(Math.max(...pfbSeries.map((d) => d.value)), 0) }}
							</Text>
							<Skeleton v-else-if="!pfbSeries.length" w="32" h="12" />

							<Text
								v-if="pfbSeries.length"
								size="12"
								weight="600"
								color="tertiary"
								:style="{
									opacity:
										Math.round(Math.max(...pfbSeries.map((d) => d.value)) / 2) !=
										Math.max(...pfbSeries.map((d) => d.value))
											? 1
											: 0,
								}"
							>
								{{ abbreviate(Math.round(Math.max(...pfbSeries.map((d) => d.value)) / 2), 0) }}
							</Text>
							<Skeleton v-else-if="!pfbSeries.length" w="24" h="12" />

							<Text v-if="pfbSeries.length" size="12" weight="600" color="tertiary"> 0 </Text>
							<Skeleton v-else-if="!pfbSeries.length" w="16" h="12" />
						</Flex>

						<Flex :class="[$style.axis, $style.x]">
							<Flex align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{ getXAxisLabels(true) }}
								</Text>

								<Text size="12" weight="600" color="tertiary">
									{{ getXAxisLabels(false) }}
								</Text>
							</Flex>
						</Flex>

						<Transition name="fastfade">
							<div v-if="showPfbTooltip" :class="$style.tooltip_wrapper">
								<div
									v-if="chartView === 'line'"
									:style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }"
									:class="$style.dot"
								/>
								<div
									v-if="chartView === 'line'"
									:style="{ transform: `translateX(${tooltipXOffset}px)` }"
									:class="$style.line"
								/>
								<div
									ref="badgeEl"
									:style="{ transform: `translateX(${tooltipXOffset - badgeOffset}px)` }"
									:class="$style.badge"
								>
									<Text size="12" weight="600" color="secondary">
										{{ badgeText }}
									</Text>
								</div>
								<Flex
									ref="tooltipEl"
									:style="{ transform: `translate(${tooltipDynamicXPosition}px, ${tooltipYDataOffset - 40}px)` }"
									direction="column"
									gap="8"
									:class="$style.tooltip"
								>
									<Flex align="center" gap="16">
										<Text size="12" weight="600" color="secondary">Count</Text>
										<Text size="12" weight="600" color="primary"> {{ abbreviate(tooltipText) }} </Text>
									</Flex>
								</Flex>
							</div>
						</Transition>

						<Flex ref="pfbSeriesChartEl" :class="$style.chart" />
					</Flex>
				</Flex>
			</Flex>

			<Flex justify="between" gap="32" :class="$style.data">
				<Flex direction="column" gap="20" wide>
					<Text size="13" weight="600" color="primary">Fee Spent</Text>

					<Flex direction="column" :class="$style.chart_wrapper">
						<Flex direction="column" justify="between" :class="[$style.axis, $style.y]">
							<Text
								v-if="feeSeries.length"
								size="12"
								weight="600"
								color="tertiary"
								:style="{ opacity: Math.max(...feeSeries.map((d) => d.value)) ? 1 : 0 }"
							>
								{{
									tia(Math.max(...feeSeries.map((d) => d.value)), 0) > 1
										? tia(Math.max(...feeSeries.map((d) => d.value)), 0)
										: tia(Math.max(...feeSeries.map((d) => d.value)), 2)
								}}
								TIA
							</Text>
							<Skeleton v-else-if="!feeSeries.length" w="32" h="12" />

							<Text
								v-if="feeSeries.length"
								size="12"
								weight="600"
								color="tertiary"
								:style="{
									opacity:
										Math.round(Math.max(...feeSeries.map((d) => d.value)) / 2) !=
										Math.max(...feeSeries.map((d) => d.value))
											? 1
											: 0,
								}"
							>
								{{
									tia(Math.round(Math.max(...feeSeries.map((d) => d.value)) / 2), 0) > 1
										? tia(Math.round(Math.max(...feeSeries.map((d) => d.value)) / 2), 0)
										: tia(Math.round(Math.max(...feeSeries.map((d) => d.value)) / 2), 2)
								}}
								TIA
							</Text>
							<Skeleton v-else-if="!feeSeries.length" w="24" h="12" />

							<Text v-if="feeSeries.length" size="12" weight="600" color="tertiary"> 0 </Text>
							<Skeleton v-else-if="!feeSeries.length" w="16" h="12" />
						</Flex>

						<Flex :class="[$style.axis, $style.x]">
							<Flex align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{ getXAxisLabels(true) }}
								</Text>

								<Text size="12" weight="600" color="tertiary">
									{{ getXAxisLabels(false) }}
								</Text>
							</Flex>
						</Flex>

						<Transition name="fastfade">
							<div v-if="showFeeTooltip" :class="$style.tooltip_wrapper">
								<div
									v-if="chartView === 'line'"
									:style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }"
									:class="$style.dot"
								/>
								<div
									v-if="chartView === 'line'"
									:style="{ transform: `translateX(${tooltipXOffset}px)` }"
									:class="$style.line"
								/>
								<div
									ref="badgeEl"
									:style="{ transform: `translateX(${tooltipXOffset - badgeOffset}px)` }"
									:class="$style.badge"
								>
									<Text size="12" weight="600" color="secondary">
										{{ badgeText }}
									</Text>
								</div>
								<Flex
									ref="tooltipEl"
									:style="{ transform: `translate(${tooltipDynamicXPosition}px, ${tooltipYDataOffset - 40}px)` }"
									direction="column"
									gap="8"
									:class="$style.tooltip"
								>
									<Flex align="center" gap="16">
										<Text size="12" weight="600" color="secondary">Spent</Text>
										<Text size="12" weight="600" color="primary"> {{ tia(tooltipText) }} TIA</Text>
									</Flex>
								</Flex>
							</div>
						</Transition>

						<Flex ref="feeSeriesChartEl" :class="$style.chart" />
					</Flex>
				</Flex>

				<Flex direction="column" :gap="tvlSeries.length ? 12 : 20" wide>
					<Flex align="center" justify="between">
						<Flex align="center" gap="8">
							<Text size="13" weight="600" color="primary">TVL</Text>

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

					<Flex direction="column" :class="$style.chart_wrapper">
						<Flex direction="column" justify="between" :class="[$style.axis, $style.y]">
							<Text
								v-if="tvlSeries.length"
								size="12"
								weight="600"
								color="tertiary"
								:style="{ opacity: Math.max(...tvlSeries.map((d) => d.value)) ? 1 : 0 }"
							>
								{{
									Math.max(...tvlSeries.map((d) => d.value)) < 1_000_000
										? abbreviate(Math.max(...tvlSeries.map((d) => d.value)), 0)
										: abbreviate(Math.max(...tvlSeries.map((d) => d.value)))
								}}
								$
							</Text>
							<Skeleton v-else-if="!tvlSeries.length && isLoading" w="32" h="12" />

							<Text
								v-if="tvlSeries.length"
								size="12"
								weight="600"
								color="tertiary"
								:style="{
									opacity:
										Math.round(Math.max(...tvlSeries.map((d) => d.value)) / 2) !=
										Math.max(...tvlSeries.map((d) => d.value))
											? 1
											: 0,
								}"
							>
								{{
									Math.round(Math.max(...tvlSeries.map((d) => d.value)) / 2) < 1_000_000
										? abbreviate(Math.round(Math.max(...tvlSeries.map((d) => d.value)) / 2), 0)
										: abbreviate(Math.round(Math.max(...tvlSeries.map((d) => d.value)) / 2))
								}}
								$
							</Text>
							<Skeleton v-else-if="!tvlSeries.length && isLoading" w="24" h="12" />

							<Text v-if="tvlSeries.length" size="12" weight="600" color="tertiary"> 0 </Text>
							<Skeleton v-else-if="!tvlSeries.length && isLoading" w="16" h="12" />
						</Flex>

						<Flex :class="[$style.axis, $style.x]">
							<Flex align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{ getXAxisLabels(true, true) }}
								</Text>

								<Text size="12" weight="600" color="tertiary">
									{{ getXAxisLabels(false, true) }}
								</Text>
							</Flex>
						</Flex>

						<Transition name="fastfade">
							<div v-if="showTVLTooltip" :class="$style.tooltip_wrapper">
								<div
									v-if="chartView === 'line'"
									:style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }"
									:class="$style.dot"
								/>
								<div
									v-if="chartView === 'line'"
									:style="{ transform: `translateX(${tooltipXOffset}px)` }"
									:class="$style.line"
								/>
								<div
									ref="badgeEl"
									:style="{ transform: `translateX(${tooltipXOffset - badgeOffset}px)` }"
									:class="$style.badge"
								>
									<Text size="12" weight="600" color="secondary">
										{{ badgeText }}
									</Text>
								</div>
								<Flex
									ref="tooltipEl"
									:style="{ transform: `translate(${tooltipDynamicXPosition}px, ${tooltipYDataOffset - 40}px)` }"
									direction="column"
									gap="8"
									:class="$style.tooltip"
								>
									<Flex align="center" gap="16">
										<!-- <Text size="12" weight="600" color="secondary">Spent</Text> -->
										<Text size="12" weight="600" color="primary"> {{ abbreviate(tooltipText) }} $</Text>
									</Flex>
								</Flex>
							</div>
						</Transition>

						<Flex ref="tvlSeriesChartEl" :class="$style.chart" />
					</Flex>
				</Flex>
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
										background: 'var(--mint)',
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
										background: 'var(--mint)',
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
										background: 'var(--mint)',
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

<style module>
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
	background: var(--card-background);

	padding: 16px;
}

.top {
	border-radius: 4px 4px 0px 0px;
}

.bottom {
	border-radius: 0px 0px 8px 8px;
}

.chart_wrapper {
	position: relative;

	height: 180px;
}

.chart_wrapper_single {
	position: relative;

	width: 464px;
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
		left: 52px;
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

@media (max-width: 800px) {
	.data {
		flex-direction: column;
	}

	.chart_wrapper_single {
		max-width: 100%;
	}
}
</style>
