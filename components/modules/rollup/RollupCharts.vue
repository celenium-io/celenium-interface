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

/** Services */
import { abbreviate, formatBytes, sortArrayOfObjects, spaces, tia } from "@/services/utils"

/** API */
import { fetchRollupSeries } from "@/services/api/stats"
import { fetchRollups } from "@/services/api/rollup"

const props = defineProps({
	rollup: {
		type: Object,
		required: true,
	},
})

const selectedPeriodIdx = ref(0)
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

/** Charts */
const chartWrapperEl = ref()
const sizeSeriesChartEl = ref()
const pfbSeriesChartEl = ref()
const feeSeriesChartEl = ref()
const comparisonChartEl = ref()
const barWidth = ref(0)

/** Data */
const isLoading = ref(false)
const sizeSeries = ref([])
const pfbSeries = ref([])
const feeSeries = ref([])
const rollupsList = ref()
const comparisonData = ref([])
const selectedRollup = ref()

/** Tooltip */
const showSeriesTooltip = ref(false)
const showPfbTooltip = ref(false)
const showFeeTooltip = ref(false)
const showComparisonTooltip = ref(false)
const tooltipEl = ref()
const tooltipXOffset = ref(0)
const tooltipYOffset = ref(0)
const tooltipYDataOffset = ref(0)
const tooltipDynamicXPosition = ref(0)
const tooltipText = ref("")

const badgeEl = ref()
const badgeText = ref("")
const badgeOffset = ref(0)

const buildChart = (chartEl, data, onEnter, onLeave) => {
	const width = chartWrapperEl.value.wrapper.getBoundingClientRect().width
	const height = 180
	const marginTop = 0
	const marginRight = 0
	const marginBottom = 24
	const marginLeft = 40

	const MAX_VALUE = d3.max(data, (d) => d.value) ? d3.max(data, (d) => d.value) : 1

	/** Scale */
	const x = d3.scaleUtc(
		d3.extent(data, (d) => d.date),
		[marginLeft, width - marginRight],
	)
	const y = d3.scaleLinear([0, MAX_VALUE], [height - marginBottom - 6, marginTop])
	const line = d3
		.line()
		.x((d) => x(d.date))
		.y((d) => y(d.value))

	/** Tooltip */
	const bisect = d3.bisector((d) => d.date).center
	const onPointermoved = (event) => {
		onEnter()

		const idx = bisect(data, x.invert(d3.pointer(event)[0]))

		tooltipXOffset.value = x(data[idx].date)
		tooltipYDataOffset.value = y(data[idx].value)
		tooltipYOffset.value = event.layerY
		tooltipText.value = data[idx].value

		if (tooltipEl.value) {
			if (idx > parseInt(selectedPeriod.value.value / 2)) {
				tooltipDynamicXPosition.value = tooltipXOffset.value - tooltipEl.value.wrapper.getBoundingClientRect().width - 16
			} else {
				tooltipDynamicXPosition.value = tooltipXOffset.value + 16
			}
		}

		badgeText.value =
			selectedPeriod.value.timeframe === "month"
				? DateTime.fromJSDate(data[idx].date).toFormat("LLL")
				: selectedPeriod.value.timeframe === "day"
					? DateTime.fromJSDate(data[idx].date).toFormat("LLL dd")
					: DateTime.fromJSDate(data[idx].date).set({ minutes: 0 }).toFormat("hh:mm a")

		if (!badgeEl.value) return
		if (idx < 2) {
			badgeOffset.value = 0
		} else if (idx > selectedPeriod.value.value - 3) {
			badgeOffset.value = badgeEl.value.getBoundingClientRect().width
		} else {
			badgeOffset.value = badgeEl.value.getBoundingClientRect().width / 2
		}
	}
	const onPointerleft = () => {
		onLeave()
		badgeText.value = ""
	}

	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;  height: intrinsic;")
		.style("-webkit-tap-highlight-color", "transparent")
		.on("pointerenter pointermove", onPointermoved)
		.on("pointerleave", onPointerleft)
		.on("touchstart", (event) => event.preventDefault())

	/** Vertical Lines */
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-10)")
		.attr("stroke-width", 2)
		.attr("d", `M${marginLeft},${height - marginBottom + 2} L${marginLeft},${height - marginBottom - 5}`)
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-10)")
		.attr("stroke-width", 2)
		.attr("d", `M${width - 1},${height - marginBottom + 2} L${width - 1},${height - marginBottom - 5}`)

	/** Default Horizontal Line  */
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-10)")
		.attr("stroke-width", 2)
		.attr("d", `M${0},${height - marginBottom - 6} L${width},${height - marginBottom - 6}`)

	/** Chart Line */
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--brand)")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(data.slice(0, data.length - 1)))
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--brand)")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("stroke-dasharray", "8")
		.attr("d", line(data.slice(data.length - 2, data.length)))

	svg.append("circle")
		.attr("cx", x(data[data.length - 1].date))
		.attr("cy", y(data[data.length - 1].value))
		.attr("fill", "var(--brand)")
		.attr("r", 3)

	if (chartEl.children[0]) chartEl.children[0].remove()
	chartEl.append(svg.node())
}

const getRollupsList = async () => {
	const data = await fetchRollups({
		limit: 30,
	})

	rollupsList.value = sortArrayOfObjects(data, 'slug').filter(r => r.id !== props.rollup.id)
}

const fetchData = async (rollup, metric) => {
	const data = await fetchRollupSeries({
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

	return data
}
const getSizeSeries = async () => {
	sizeSeries.value = []

	const sizeSeriesRawData = await fetchData(props.rollup, 'size')

	const sizeSeriesMap = {}
	sizeSeriesRawData.forEach((item) => {
		sizeSeriesMap[DateTime.fromISO(item.time).toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")] = item.value
	})

	for (let i = 1; i < selectedPeriod.value.value + 1; i++) {
		let dt
		if (selectedPeriod.value.timeframe === "month") {
			dt = DateTime.now().startOf('month').minus({
				months: selectedPeriod.value.timeframe === "month" ? selectedPeriod.value.value - i : 0,
			})
		} else {
			dt = DateTime.now().minus({
				days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value - i : 0,
				hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value - i : 0,
			})
		}		sizeSeries.value.push({
			date: dt.toJSDate(),
			value: parseInt(sizeSeriesMap[dt.toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")]) || 0,
		})
	}
}

const getPfbSeries = async () => {
	pfbSeries.value = []

	const blobsSeriesRawData = await fetchData(props.rollup, 'blobs_count')

	const blobsSeriesMap = {}
	blobsSeriesRawData.forEach((item) => {
		blobsSeriesMap[DateTime.fromISO(item.time).toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")] = item.value
	})

	for (let i = 1; i < selectedPeriod.value.value + 1; i++) {
		let dt
		if (selectedPeriod.value.timeframe === "month") {
			dt = DateTime.now().startOf('month').minus({
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
			value: parseInt(blobsSeriesMap[dt.toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")]) || 0,
		})
	}
}

const getFeeSeries = async () => {
	feeSeries.value = []

	const feeSeriesRawData = await fetchData(props.rollup, 'fee')

	const feeSeriesMap = {}
	feeSeriesRawData.forEach((item) => {
		feeSeriesMap[DateTime.fromISO(item.time).toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")] = item.value
	})

	for (let i = 1; i < selectedPeriod.value.value + 1; i++) {
		let dt
		if (selectedPeriod.value.timeframe === "month") {
			dt = DateTime.now().startOf('month').minus({
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
			value: parseInt(feeSeriesMap[dt.toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")]) || 0,
		})
	}
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
		let feeData = await fetchData(selectedRollup.value, 'fee')
		let pfbData = await fetchData(selectedRollup.value, 'blobs_count')
		let sizeData = await fetchData(selectedRollup.value, 'size')
		
		comparisonData.value[1] = {
			fee: feeData.reduce((sum, el) => sum + +el.value, 0),
			pfb: pfbData.reduce((sum, el) => sum + +el.value, 0),
			size: sizeData.reduce((sum, el) => sum + +el.value, 0),
		}
	}

	let firstRollup = comparisonData.value[0]
	let secondRollup = comparisonData.value[1]
	Object.keys(firstRollup).forEach(el => {
		let sum = firstRollup[el] + secondRollup[el]
		firstRollup[el + '_graph'] = Math.max(Math.round(firstRollup[el] / sum * 100, 2), 1)
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

const buildRollupCharts = async () => {
	isLoading.value = true

	await getRollupsList()
	if (!selectedRollup.value) {
		selectedRollup.value = rollupsList.value[0]
	}

	barWidth.value = comparisonChartEl.value.wrapper.getBoundingClientRect().width

	await getSizeSeries()
	buildChart(
		sizeSeriesChartEl.value.wrapper,
		sizeSeries.value,
		() => (showSeriesTooltip.value = true),
		() => (showSeriesTooltip.value = false),
	)

	await getPfbSeries()
	buildChart(
		pfbSeriesChartEl.value.wrapper,
		pfbSeries.value,
		() => (showPfbTooltip.value = true),
		() => (showPfbTooltip.value = false),
	)

	await getFeeSeries()
	buildChart(
		feeSeriesChartEl.value.wrapper,
		feeSeries.value,
		() => (showFeeTooltip.value = true),
		() => (showFeeTooltip.value = false),
	)

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
	() => selectedRollup.value,
	() => {
		if (!isLoading.value) {
			comparisonData.value[1] = {}
			prepareComparisonData()
		}
	},
)

const debouncedRedraw = useDebounceFn((e) => {
	buildRollupCharts()
}, 500)

onMounted(async () => {
	window.addEventListener("resize", debouncedRedraw)

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
							<Flex v-if="selectedPeriod.timeframe === 'month'" align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{
										DateTime.now()
											.minus({ months: selectedPeriod.value - 1 })
											.toFormat("LLL y")
									}}
								</Text>

								<Text size="12" weight="600" color="tertiary">{{ DateTime.now().toFormat("LLL") }}</Text>
							</Flex>
							<Flex v-else-if="selectedPeriod.timeframe === 'day'" align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{
										DateTime.now()
											.minus({ days: selectedPeriod.value - 1 })
											.toFormat("LLL dd")
									}}
								</Text>

								<Text size="12" weight="600" color="tertiary">Today</Text>
							</Flex>
							<Flex v-else align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{ DateTime.now().minus({ hours: selectedPeriod.value }).set({ minutes: 0 }).toFormat("hh:mm a") }}
								</Text>

								<Text size="12" weight="600" color="tertiary">Now</Text>
							</Flex>
						</Flex>

						<Transition name="fastfade">
							<div v-if="showSeriesTooltip" :class="$style.tooltip_wrapper">
								<div
									:style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }"
									:class="$style.dot"
								/>
								<div :style="{ transform: `translateX(${tooltipXOffset}px)` }" :class="$style.line" />
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
										Math.round(Math.max(...pfbSeries.map((d) => d.value)) / 2) != Math.max(...pfbSeries.map((d) => d.value))
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
							<Flex v-if="selectedPeriod.timeframe === 'month'" align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{
										DateTime.now()
											.minus({ months: selectedPeriod.value - 1 })
											.toFormat("LLL y")
									}}
								</Text>

								<Text size="12" weight="600" color="tertiary">{{ DateTime.now().toFormat("LLL") }}</Text>
							</Flex>
							<Flex v-else-if="selectedPeriod.timeframe === 'day'" align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{
										DateTime.now()
											.minus({ days: selectedPeriod.value - 1 })
											.toFormat("LLL dd")
									}}
								</Text>

								<Text size="12" weight="600" color="tertiary">Today</Text>
							</Flex>
							<Flex v-else align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{ DateTime.now().minus({ hours: selectedPeriod.value }).set({ minutes: 0 }).toFormat("hh:mm a") }}
								</Text>

								<Text size="12" weight="600" color="tertiary">Now</Text>
							</Flex>
						</Flex>

						<Transition name="fastfade">
							<div v-if="showPfbTooltip" :class="$style.tooltip_wrapper">
								<div
									:style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }"
									:class="$style.dot"
								/>
								<div :style="{ transform: `translateX(${tooltipXOffset}px)` }" :class="$style.line" />
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

			<Flex justify="between" gap="32" :class="[$style.data, $style.bottom]">
				<Flex direction="column" gap="20" wide :style="{width: '464px'}">
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
								{{ tia(Math.max(...feeSeries.map((d) => d.value)), 0) > 1
									? tia(Math.max(...feeSeries.map((d) => d.value)), 0)
									: tia(Math.max(...feeSeries.map((d) => d.value)), 2) }} TIA
							</Text>
							<Skeleton v-else-if="!feeSeries.length" w="32" h="12" />

							<Text
								v-if="feeSeries.length"
								size="12"
								weight="600"
								color="tertiary"
								:style="{
									opacity:
										Math.round(Math.max(...feeSeries.map((d) => d.value)) / 2) != Math.max(...feeSeries.map((d) => d.value))
											? 1
											: 0,
								}"
							>
								{{ tia(Math.round(Math.max(...feeSeries.map((d) => d.value)) / 2), 0) > 1
									? tia(Math.round(Math.max(...feeSeries.map((d) => d.value)) / 2), 0)
									: tia(Math.round(Math.max(...feeSeries.map((d) => d.value)) / 2), 2) }} TIA
							</Text>
							<Skeleton v-else-if="!feeSeries.length" w="24" h="12" />

							<Text v-if="feeSeries.length" size="12" weight="600" color="tertiary"> 0 </Text>
							<Skeleton v-else-if="!feeSeries.length" w="16" h="12" />
						</Flex>

						<Flex :class="[$style.axis, $style.x]">
							<Flex v-if="selectedPeriod.timeframe === 'month'" align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{
										DateTime.now()
											.minus({ months: selectedPeriod.value - 1 })
											.toFormat("LLL y")
									}}
								</Text>

								<Text size="12" weight="600" color="tertiary">{{ DateTime.now().toFormat("LLL") }}</Text>
							</Flex>
							<Flex v-else-if="selectedPeriod.timeframe === 'day'" align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{
										DateTime.now()
											.minus({ days: selectedPeriod.value - 1 })
											.toFormat("LLL dd")
									}}
								</Text>

								<Text size="12" weight="600" color="tertiary">Today</Text>
							</Flex>
							<Flex v-else align="end" justify="between" wide>
								<Text size="12" weight="600" color="tertiary">
									{{ DateTime.now().minus({ hours: selectedPeriod.value }).set({ minutes: 0 }).toFormat("hh:mm a") }}
								</Text>

								<Text size="12" weight="600" color="tertiary">Now</Text>
							</Flex>
						</Flex>

						<Transition name="fastfade">
							<div v-if="showFeeTooltip" :class="$style.tooltip_wrapper">
								<div
									:style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }"
									:class="$style.dot"
								/>
								<div :style="{ transform: `translateX(${tooltipXOffset}px)` }" :class="$style.line" />
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

				<Flex ref="comparisonChartEl" direction="column" gap="12" :class="$style.chart_wrapper_single">
					<Flex align="center" justify="between">
						<Text size="13" weight="600" color="primary">Rollups Comparison</Text>

						<Popover :open="isRollupPopoverOpen" @on-close="handleRollupPopoverClose" width="250">
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
									<Text size="12" weight="500" color="secondary">Filter by Rollup</Text>

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
										<Flex v-else justify="center" :style="{paddingTop: '10px'}">
											<Text size="12" weight="500" color="tertiary">Nothing was found</Text>
										</Flex>
									</Flex>
								</Flex>
							</template>
						</Popover>
					</Flex>

					<Flex direction="column" gap="12">
						<Flex direction="column" gap="12">
							<Text size="13" weight="500" color="secondary">Size</Text>

							<Flex :style="`width: ${barWidth}px`">
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

							<Flex align="center" justify="between" :style="{marginTop: '-8px'}">
								<Text size="12" color="tertiary"> {{ formatBytes(comparisonData[0]?.size) }} </Text>

								<Text size="12" color="tertiary"> {{ formatBytes(comparisonData[1]?.size) }} </Text>
							</Flex>
						</Flex>

						<Flex direction="column" gap="12">
							<Text size="13" weight="500" color="secondary">Blobs</Text>

							<Flex :style="`width: ${barWidth}px`">
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

							<Flex align="center" justify="between" :style="{marginTop: '-8px'}">
								<Text size="12" color="tertiary"> {{ spaces(comparisonData[0]?.pfb) }} </Text>

								<Text size="12" color="tertiary"> {{ spaces(comparisonData[1]?.pfb) }} </Text>
							</Flex>
						</Flex>

						<Flex direction="column" gap="12">
							<Text size="13" weight="500" color="secondary">Fee</Text>

							<Flex :style="`width: ${barWidth}px`">
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

							<Flex align="center" justify="between" :style="{marginTop: '-8px'}">
								<Text size="12" color="tertiary"> {{ tia(comparisonData[0]?.fee) }} TIA </Text>

								<Text size="12" color="tertiary"> {{ tia(comparisonData[1]?.fee) }} TIA</Text>
							</Flex>
						</Flex>
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
	height: 180px;

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
