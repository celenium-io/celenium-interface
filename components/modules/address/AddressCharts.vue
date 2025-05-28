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

/** Services */
import { abbreviate, tia } from "@/services/utils"

/** API */
import { fetchAddressSeries } from "@/services/api/stats"

/** Store */
import { useSettingsStore } from "@/store/settings"
const settingsStore = useSettingsStore()

const props = defineProps({
	hash: {
		type: String,
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
const chartWrapperEl = useTemplateRef("chartWrapperEl")
const txSeriesChartEl = useTemplateRef("txSeriesChartEl")
const feeSeriesChartEl = useTemplateRef("feeSeriesChartEl")

/** Data */
const isLoading = ref(false)
const txSeries = ref([])
const feeSeries = ref([])

/** Tooltip */
const showTxTooltip = ref(false)
const showFeeTooltip = ref(false)
const tooltipEl = ref()
const tooltipXOffset = ref(0)
const tooltipYOffset = ref(0)
const tooltipYDataOffset = ref(0)
const tooltipDynamicXPosition = ref(0)
const tooltipText = ref("")

const badgeEl = ref()
const badgeText = ref("")
const badgeOffset = ref(0)

const buildLineChart = (chartEl, data, onEnter, onLeave, metric) => {
	const width = chartWrapperEl.value.wrapper.getBoundingClientRect().width
	const height = 180
	const marginTop = 0
	const marginRight = 0
	const marginBottom = 24
	const marginLeft = 52

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

		let tf = selectedPeriod.value.timeframe
		if (metric === "tvl" && ["hour", "week"].includes(selectedPeriod.value.timeframe)) {
			tf = "day"
		}
		badgeText.value =
			tf === "month"
				? DateTime.fromJSDate(data[idx].date).toFormat("LLL")
				: tf === "day"
				? DateTime.fromJSDate(data[idx].date).toFormat("LLL dd")
				: DateTime.fromJSDate(data[idx].date).set({ minutes: 0 }).toFormat("hh:mm a")

		if (!badgeEl.value) return
		const badgeWidth = badgeEl.value.getBoundingClientRect().width
		if (tooltipXOffset.value - marginLeft < badgeWidth / 2) {
			badgeOffset.value = 0
		} else if (badgeWidth + tooltipXOffset.value > width) {
			badgeOffset.value = Math.abs(width - (badgeWidth + tooltipXOffset.value)) + (data.length - 1 - idx) * 2
		} else {
			badgeOffset.value = badgeWidth / 2
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
	let path1 = null
	let path2 = null
	path1 = svg
		.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--brand)")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(loadLastValue.value ? data.slice(0, data.length - 1) : data))

	if (loadLastValue.value) {
		// Create pattern
		const defs = svg.append("defs")
		const pattern = defs
			.append("pattern")
			.attr("id", "dashedPattern")
			.attr("width", 8)
			.attr("height", 2)
			.attr("patternUnits", "userSpaceOnUse")
		pattern.append("rect").attr("width", 4).attr("height", 2).attr("fill", "var(--brand)")
		pattern.append("rect").attr("x", 8).attr("width", 4).attr("height", 2).attr("fill", "transparent")

		// Last dash segment
		path2 = svg
			.append("path")
			.attr("fill", "none")
			.attr("stroke", "url(#dashedPattern)")
			.attr("stroke-width", 2)
			.attr("stroke-linecap", "round")
			.attr("stroke-linejoin", "round")
			.attr("d", line(data.slice(data.length - 2, data.length)))
	}

	const totalDuration = 1_000
	const path1Duration = loadLastValue.value ? (totalDuration / data.length) * (data.length - 1) : totalDuration
	const path1Length = path1.node().getTotalLength()

	path1
		.attr("stroke-dasharray", path1Length)
		.attr("stroke-dashoffset", path1Length)
		.transition()
		.duration(path1Duration)
		.ease(d3.easeLinear)
		.attr("stroke-dashoffset", 0)

	if (loadLastValue.value) {
		const path2Duration = totalDuration / data.length
		const path2Length = path2.node().getTotalLength() + 1

		path2
			.attr("stroke-dasharray", path2Length)
			.attr("stroke-dashoffset", path2Length)
			.transition()
			.duration(path2Duration)
			.ease(d3.easeLinear)
			.delay(path1Duration)
			.attr("stroke-dashoffset", 0)
	}

	const point = svg
		.append("circle")
		.attr("cx", x(data[data.length - 1].date))
		.attr("cy", y(data[data.length - 1].value))
		.attr("fill", "var(--brand)")
		.attr("r", 3)
		.attr("opacity", 0)

	point.transition().delay(totalDuration).duration(200).attr("opacity", 1)

	if (chartEl.children[0]) chartEl.children[0].remove()
	chartEl.append(svg.node())
}

const buildBarChart = (chartEl, data, onEnter, onLeave, metric) => {
	const width = chartWrapperEl.value.wrapper.getBoundingClientRect().width
	const height = 180
	const marginTop = 0
	const marginRight = 2
	const marginBottom = 24
	const marginLeft = 52

	const barWidth = Math.max(Math.round((width - marginLeft - marginRight) / data.length - (data.length > 7 ? 4 : 8)), 4)

	const MAX_VALUE = d3.max(data, (d) => d.value) ? d3.max(data, (d) => d.value) : 1

	/** Scale */
	const x = d3.scaleUtc(
		d3.extent(data, (d) => d.date),
		[marginLeft, width - marginRight - barWidth],
	)
	const y = d3.scaleLinear([0, MAX_VALUE], [height - marginBottom, marginTop])

	/** Tooltip */
	const bisect = d3.bisector((d) => d.date).center
	const onPointermoved = (event) => {
		onEnter()

		const idx = bisect(data, x.invert(d3.pointer(event)[0] - barWidth / 2))

		const elements = document.querySelectorAll(`[metric="${metric}"]`)
		elements.forEach((el) => {
			if (+el.getAttribute("data-index") === idx) {
				el.style.filter = "brightness(1.2)"
			} else {
				el.style.filter = "brightness(0.6)"
			}
		})

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

		let tf = selectedPeriod.value.timeframe
		if (metric === "tvl" && ["hour", "week"].includes(selectedPeriod.value.timeframe)) {
			tf = "day"
		}
		badgeText.value =
			tf === "month"
				? DateTime.fromJSDate(data[idx].date).toFormat("LLL")
				: tf === "day"
				? DateTime.fromJSDate(data[idx].date).toFormat("LLL dd")
				: DateTime.fromJSDate(data[idx].date).set({ minutes: 0 }).toFormat("hh:mm a")

		if (!badgeEl.value) return
		const badgeWidth = badgeEl.value.getBoundingClientRect().width
		if (tooltipXOffset.value - marginLeft < badgeWidth / 2) {
			badgeOffset.value = 0
		} else if (badgeWidth + tooltipXOffset.value > width) {
			badgeOffset.value = Math.abs(width - (badgeWidth + tooltipXOffset.value)) + (data.length - 1 - idx) * 2
		} else {
			badgeOffset.value = (badgeWidth - barWidth) / 2
		}
	}
	const onPointerleft = () => {
		onLeave()

		const elements = document.querySelectorAll("[data-index]")
		elements.forEach((el) => {
			el.style.filter = ""
		})
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

	/** Chart Bars */
	svg.append("defs")
		.append("pattern")
		.attr("id", "diagonal-stripe")
		.attr("width", 6)
		.attr("height", 6)
		.attr("patternUnits", "userSpaceOnUse")
		.attr("patternTransform", "rotate(45)")
		.append("rect")
		.attr("width", 2)
		.attr("height", 6)
		.attr("transform", "translate(0,0)")
		.attr("fill", "var(--brand)")

	svg.append("g")
		.selectAll("g")
		.data(data)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("data-index", (d, i) => i)
		.attr("metric", metric)
		.attr("x", (d) => x(new Date(d.date)))
		.attr("y", (d) => y(d.value))
		.attr("width", barWidth)
		.attr("fill", (d, i) => (loadLastValue.value && i === data.length - 1 ? `url(#diagonal-stripe)` : "var(--brand)"))
		.transition()
		.duration(1_000)
		.attr("height", (d) => Math.max(height - marginBottom - 6 - y(d.value), 0))

	if (chartEl.children[0]) chartEl.children[0].remove()
	chartEl.append(svg.node())
}

const fetchData = async (metric) => {
	const data = await fetchAddressSeries({
		hash: props.hash,
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
const getTxSeries = async () => {
	txSeries.value = []

	const txSeriesRawData = await fetchData("tx_count")

	const txSeriesMap = {}
	txSeriesRawData.forEach((item) => {
		txSeriesMap[
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
		txSeries.value.push({
			date: dt.toJSDate(),
			value:
				parseInt(txSeriesMap[dt.toFormat(["day", "month"].includes(selectedPeriod.value.timeframe) ? "y-LL-dd" : "y-LL-dd-HH")]) ||
				0,
		})
	}
}

const getFeeSeries = async () => {
	feeSeries.value = []

	const feeSeriesRawData = await fetchData("fee")

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

const buildCharts = async (loadData = true) => {
	isLoading.value = true
	if (loadData) {
		await getTxSeries()
		await getFeeSeries()
	}

	if (chartView.value === "line") {
		buildLineChart(
			txSeriesChartEl.value.wrapper,
			loadLastValue.value ? txSeries.value : txSeries.value.slice(0, txSeries.value.length - 1),
			() => (showTxTooltip.value = true),
			() => (showTxTooltip.value = false),
		)
		buildLineChart(
			feeSeriesChartEl.value.wrapper,
			loadLastValue.value ? feeSeries.value : feeSeries.value.slice(0, feeSeries.value.length - 1),
			() => (showFeeTooltip.value = true),
			() => (showFeeTooltip.value = false),
		)
	} else {
		buildBarChart(
			txSeriesChartEl.value.wrapper,
			loadLastValue.value ? txSeries.value : txSeries.value.slice(0, txSeries.value.length - 1),
			() => (showTxTooltip.value = true),
			() => (showTxTooltip.value = false),
			"tx_count",
		)
		buildBarChart(
			feeSeriesChartEl.value.wrapper,
			loadLastValue.value ? feeSeries.value : feeSeries.value.slice(0, feeSeries.value.length - 1),
			() => (showFeeTooltip.value = true),
			() => (showFeeTooltip.value = false),
			"fee",
		)
	}

	isLoading.value = false
}

watch(
	() => selectedPeriodIdx.value,
	() => {
		buildCharts()
	},
)

watch(
	() => [chartView.value, loadLastValue.value],
	() => {
		updateUserSettings()
		if (!isLoading.value) {
			buildCharts(false)
		}
	},
)

const debouncedRedraw = useDebounceFn((e) => {
	buildCharts()
}, 500)

onBeforeMount(() => {
	isLoading.value = true
	const settings = JSON.parse(localStorage.getItem("settings"))
	chartView.value = settings?.chart?.view || "bar"
	loadLastValue.value = settings?.chart?.view ? settings.chart.loadLastValue : true
})

onMounted(async () => {
	window.addEventListener("resize", debouncedRedraw)

	buildCharts()
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
					<Text size="13" weight="600" color="primary">Txs</Text>

					<Flex ref="chartWrapperEl" direction="column" :class="$style.chart_wrapper">
						<Flex direction="column" justify="between" :class="[$style.axis, $style.y]">
							<Text
								v-if="txSeries.length"
								size="12"
								weight="600"
								color="tertiary"
								:style="{ opacity: Math.max(...txSeries.map((d) => d.value)) ? 1 : 0 }"
							>
								{{ abbreviate(Math.max(...txSeries.map((d) => d.value)), 0) }}
							</Text>
							<Skeleton v-else-if="!txSeries.length" w="32" h="12" />

							<Text
								v-if="txSeries.length"
								size="12"
								weight="600"
								color="tertiary"
								:style="{
									opacity:
										Math.round(Math.max(...txSeries.map((d) => d.value)) / 2) !==
										Math.max(...txSeries.map((d) => d.value))
											? 1
											: 0,
								}"
							>
								{{ abbreviate(Math.round(Math.max(...txSeries.map((d) => d.value)) / 2), 0) }}
							</Text>
							<Skeleton v-else-if="!txSeries.length" w="24" h="12" />

							<Text v-if="txSeries.length" size="12" weight="600" color="tertiary"> 0 </Text>
							<Skeleton v-else-if="!txSeries.length" w="16" h="12" />
						</Flex>

						<Flex :class="[$style.axis, $style.x]">
							<Flex align="end" justify="between" wide>
								<Text v-if="selectedPeriod.timeframe === 'day'" size="12" weight="600" color="tertiary">
									{{
										DateTime.now()
											.minus({ days: selectedPeriod.value - 1 })
											.toFormat("LLL dd")
									}}
								</Text>
								<Text v-else size="12" weight="600" color="tertiary">
									{{ DateTime.now().minus({ hours: selectedPeriod.value }).set({ minutes: 0 }).toFormat("hh:mm a") }}
								</Text>

								<Text size="12" weight="600" color="tertiary">{{
									selectedPeriod.timeframe === "day" ? "Today" : "Now"
								}}</Text>
							</Flex>
						</Flex>

						<Transition name="fastfade">
							<div v-if="showTxTooltip" :class="$style.tooltip_wrapper">
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
										<Text size="12" weight="600" color="secondary">Txs</Text>
										<Text size="12" weight="600" color="primary"> {{ tooltipText }} </Text>
									</Flex>
								</Flex>
							</div>
						</Transition>

						<Flex ref="txSeriesChartEl" :class="$style.chart" />
					</Flex>
				</Flex>

				<Flex direction="column" gap="20" wide>
					<Text size="13" weight="600" color="primary">Fee Spent</Text>

					<Flex direction="column" :class="$style.chart_wrapper_single">
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
								<Text v-if="selectedPeriod.timeframe === 'day'" size="12" weight="600" color="tertiary">
									{{
										DateTime.now()
											.minus({ days: selectedPeriod.value - 1 })
											.toFormat("LLL dd")
									}}
								</Text>
								<Text v-else size="12" weight="600" color="tertiary">
									{{ DateTime.now().minus({ hours: selectedPeriod.value }).set({ minutes: 0 }).toFormat("hh:mm a") }}
								</Text>

								<Text size="12" weight="600" color="tertiary">{{
									selectedPeriod.timeframe === "day" ? "Today" : "Now"
								}}</Text>
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

	max-width: 464px;

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

	.chart_wrapper_single {
		max-width: 100%;
	}
}
</style>
