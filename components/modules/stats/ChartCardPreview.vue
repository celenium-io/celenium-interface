<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Stats Components */
import DiffChip from "@/components/modules/stats/DiffChip.vue"

/** Services */
import { abbreviate, comma, formatBytes, roundTo, tia, truncateDecimalPart } from "@/services/utils"

/** API */
import { fetchSeries, fetchSeriesCumulative, fetchTVL, fetchTVS } from "@/services/api/stats"

const props = defineProps({
	series: {
		type: Object,
		required: true,
	},
	period: {
		type: Object,
		required: true,
	},
})

const currentData = ref([])
const prevData = ref([])
const currentTotal = ref(0)
const prevTotal = ref(0)
const dataLoaded = ref(false)
const diff = computed(() => {
	if (!dataLoaded.value) return undefined

	const res = prevTotal.value ? (currentTotal.value - prevTotal.value) / prevTotal.value : 1
	return (res * 100).toFixed(1)
})
const chartEl = ref()
const chartElPrev = ref()
const tooltipEl = ref()
const tooltip = ref({
	data: [],
	show: false,
})

const getSeries = async () => {
	let data = []
	let baseTime = DateTime.now().startOf("hour").plus({ seconds: 1 })
	let from = parseInt(
		baseTime.minus({
			days: props.period.timeframe === "day" ? props.period.value * 2 + 1 : 0,
			hours: props.period.timeframe === "hour" ? props.period.value * 2 + 1 : 0,
			months:
				props.period.timeframe === "month"
					? props.period.value * 2
					: props.period.timeframe === "year"
					? props.period.value * 24
					: 0,
		}).ts / 1_000,
	)
	let to = parseInt(
		baseTime.minus({
			days: props.period.timeframe === "day" ? 1 : 0,
			hours: props.period.timeframe === "hour" ? 1 : 0,
		}).ts / 1_000,
	)

	if (props.series.aggregate === "cumulative") {
		data = await fetchSeriesCumulative({
			name: props.series.name,
			period: "day",
			from: parseInt(
				baseTime.minus({
					days: 60,
				}).ts / 1_000,
			),
		})
	} else if (props.series.name === "tvs") {
		data = (
			await fetchTVS({
				period: props.period.timeframe,
				from: from,
				to: to,
			})
		).map((v) => {
			return { time: v.time, value: v.close }
		})
		.reverse()
	} else if (props.series.name === "tvl") {
		data = (
			await fetchTVL({
				slug: "celestia",
				period: props.period.timeframe,
				from: from,
				to: to,
			})
		).reverse()
	} else {
		data = (
			await fetchSeries({
				table: props.series.name,
				period: props.period.timeframe === "year" ? "month" : props.period.timeframe,
				from: from,
				to: to,
			})
		).reverse()
	}

	const parseData = (slice) =>
		slice.map((s) => ({
			date: DateTime.fromISO(s.time).toJSDate(),
			value: parseFloat(s.value),
		}))

	const dataLength = data.length
	let prev = []
	let current = []
	const periodLength = props.period.timeframe === "year" ? 12 : props.period.value
	const timeframe = props.period.timeframe

	if (props.series.aggregate === "cumulative") {
		current = parseData(data.slice(-30))
		prev = parseData(data.slice(0, dataLength - 30))
	} else {
		current = parseData(data.slice(-periodLength))
		prev = parseData(data.slice(0, dataLength - periodLength))

		if (prev.length < current.length) {
			const missing = current.length - prev.length
			const extra = current.slice(0, missing).map((d) => ({
				date: DateTime.fromJSDate(d.date)
					.minus({ [`${timeframe}s`]: periodLength })
					.toJSDate(),
				value: 0,
			}))

			prev = [...extra, ...prev]
		}
	}

	currentData.value = current
	prevData.value = prev

	if (props.series.name === "block_time") {
		prevData.value = prevData.value.map((el) => {
			return {
				...el,
				value: (el.value / 1_000).toFixed(2),
			}
		})
		currentData.value = currentData.value.map((el) => {
			return {
				...el,
				value: (el.value / 1_000).toFixed(2),
			}
		})
	}

	if (["tvs", "tvl"].includes(props.series.name)) {
		currentTotal.value = currentData.value[currentData.value.length - 1].value
		prevTotal.value = prevData.value[prevData.value.length - 1].value
	} else if (props.series.aggregate !== "cumulative") {
		currentTotal.value = currentData.value.reduce((sum, el) => {
			return sum + +el.value
		}, 0)

		prevTotal.value = prevData.value.reduce((sum, el) => {
			return sum + +el.value
		}, 0)
	} else {
		currentTotal.value = currentData.value.slice(-1)[0].value
		prevTotal.value = prevData.value.slice(-1)[0].value
	}

	if (props.series.aggregate === "avg") {
		prevTotal.value = prevTotal.value / prevData.value.length
		currentTotal.value = currentTotal.value / currentData.value.length
	}

	let pData = []
	prevData.value?.forEach((d, index) => {
		pData.push({
			date: currentData.value[index]?.date,
			realDate: d.date,
			value: d.value,
		})
	})
	prevData.value = pData

	dataLoaded.value = true
}

const buildChart = (chart, data, color) => {
	const { width, height } = chart.getBoundingClientRect()
	const marginTop = 8
	const marginRight = 12
	const marginBottom = 24
	const marginLeft = 12

	const MAX_VALUE = Math.max(Math.max(...prevData.value.map((s) => s.value)), Math.max(...currentData.value.map((s) => s.value)))
	const MIN_VALUE = Math.min(Math.min(...prevData.value.map((s) => s.value)), Math.min(...currentData.value.map((s) => s.value)))

	function formatDate(date) {
		if (props.period.timeframe === "hour" && props.series.aggregate !== "cumulative") {
			return DateTime.fromJSDate(date).toFormat("HH:mm, LLL dd")
		}

		return DateTime.fromJSDate(date).toFormat("LLL dd")
	}

	function formatValue(value) {
		switch (props.series.units) {
			case "bytes":
				return formatBytes(value)
			case "utia":
				if (props.series.name === "gas_price") {
					return `${truncateDecimalPart(value, 4)} UTIA`
				}

				return `${tia(value, 2)} TIA`
			case "seconds":
				return `${value}s`
			case "usd":
				return `${abbreviate(value)} $`
			default:
				return comma(value)
		}
	}

	/** Scale */
	const x = d3.scaleUtc(
		d3.extent(data, (d) => d.date),
		[marginLeft, width - marginRight],
	)
	const y = d3.scaleLinear([MIN_VALUE, MAX_VALUE], [height - marginBottom - 6, marginTop])
	const line = d3
		.line()
		.x((d) => x(d.date))
		.y((d) => y(d.value))
		.curve(d3.curveCatmullRom)

	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;")
		.style("-webkit-tap-highlight-color", "transparent")
		.on("pointerenter pointermove", onPointerMoved)
		.on("pointerleave", onPointerleft)
		.on("touchstart", (event) => event.preventDefault())

	// This allows to find the closest X index of the mouse:
	const bisect = d3.bisector(function (d) {
		return d.date
	}).center

	const cFocus = svg
		.append("g")
		.append("circle")
		.style("fill", "var(--brand)")
		.attr("r", 4)
		.style("opacity", 0)
		.style("transition", "all 0.2s ease")

	const pFocus = svg
		.append("g")
		.append("circle")
		.style("fill", "var(--txt-tertiary)")
		.attr("r", 4)
		.style("opacity", 0)
		.style("transition", "all 0.2s ease")

	const focusLine = svg
		.append("g")
		.append("line")
		.style("stroke-width", 2)
		.style("stroke", "var(--op-15)")
		.style("fill", "none")
		.style("opacity", 0)

	function onPointerMoved(event) {
		tooltip.value.show = true

		cFocus.style("opacity", 1)
		focusLine.style("opacity", 1)

		// Recover coordinate we need
		let idx = bisect(currentData.value, x.invert(d3.pointer(event)[0]))
		let selectedCData = currentData.value[idx]
		cFocus.attr("cx", x(selectedCData.date)).attr("cy", y(selectedCData.value))
		focusLine.attr("x1", x(selectedCData.date)).attr("y1", 0).attr("x2", x(selectedCData.date)).attr("y2", height)

		let tooltipWidth = tooltipEl.value?.wrapper ? tooltipEl.value?.wrapper?.getBoundingClientRect()?.width : 100
		let xPosition = x(selectedCData.date)
		tooltip.value.x = xPosition + tooltipWidth > width + 5 ? xPosition - tooltipWidth - 15 : xPosition + 15
		tooltip.value.y = Math.min(y(selectedCData.value), height - 100)

		tooltip.value.data[0] = {
			date: formatDate(selectedCData.date),
			value: formatValue(selectedCData.value),
			color: "var(--brand)",
		}
		tooltip.value.data.splice(1, 1)
		if (prevData.value.length) {
			let selectedPData = prevData.value[idx]

			pFocus.attr("cx", x(selectedPData.date)).attr("cy", y(selectedPData.value)).style("opacity", 1)

			tooltip.value.data[1] = {
				date: formatDate(selectedPData.realDate),
				value: formatValue(selectedPData.value),
				color: "var(--txt-tertiary)",
			}
		}
	}

	function onPointerleft() {
		tooltip.value.show = false
		cFocus.style("opacity", 0)
		pFocus.style("opacity", 0)
		focusLine.style("opacity", 0)
	}

	/** Default Horizontal Lines  */
	svg.append("path").attr("fill", "none").attr("stroke", "var(--op-5)").attr("stroke-width", 1).attr("d", `M${0},${0} L${width},${0}`)

	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-5)")
		.attr("stroke-width", 1)
		.attr("d", `M${0},${(height - marginBottom - 6) / 2} L${width},${(height - marginBottom - 6) / 2}`)

	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-5)")
		.attr("stroke-width", 1)
		.attr("d", `M${0},${height - marginBottom - 6} L${width},${height - marginBottom - 6}`)

	/** Chart Lines */
	const path = svg
		.append("path")
		.attr("fill", "none")
		.attr("stroke", color)
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(data.filter((item) => item.value !== null)))

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())

	const totalLength = path.node().getTotalLength()

	path.attr("stroke-dasharray", `${totalLength} ${totalLength}`)
		.attr("stroke-dashoffset", totalLength)
		.transition()
		.duration(1_000)
		.ease(d3.easeLinear)
		.attr("stroke-dashoffset", 0)
}

const drawChart = async () => {
	await getSeries()

	buildChart(chartEl.value.wrapper, currentData.value, "var(--brand)")
	buildChart(chartElPrev.value.wrapper, prevData.value, "var(--txt-tertiary)")
}

onMounted(async () => {
	await drawChart()
})

watch(
	() => props.period,
	async () => {
		await drawChart()
	},
)
</script>

<template>
	<Flex direction="column" justify="between" gap="16" wide :class="$style.wrapper">
		<NuxtLink :to="`/stats/${series.page}${series.aggregate ? '?aggregate=' + series.aggregate : ''}`" :class="[$style.header, !series.page && $style.disabled]">
			<Flex align="center" direction="column" gap="16" :class="$style.title">
				<Flex align="center" justify="between" wide>
					<Flex align="center" gap="10" justify="start">
						<Text size="14" weight="600" color="secondary"> {{ series.title }} </Text>
						<DiffChip :value="diff" :invert="series.name === 'block_time'" />
					</Flex>

					
					<Flex v-if="series.page" align="center">
						<Icon name="expand" size="16" color="tertiary" />
					</Flex>
				</Flex>

				<Flex v-if="series.units === 'seconds'" align="end" gap="10" justify="start" wide>
					<Text size="16" weight="600" color="primary"> {{ `~${roundTo(currentTotal)}s` }} </Text>
					<Text size="14" weight="600" color="tertiary">
						{{ `~${roundTo(prevTotal)}s previous ${period.title.replace("Last ", "")}` }}
					</Text>
				</Flex>
				<Flex v-else-if="series.units === 'utia'" align="end" gap="10" justify="start" wide>
					<Text size="16" weight="600" color="primary">
						{{ series.name === "gas_price" ? `${currentTotal.toFixed(4)} UTIA` : `${tia(currentTotal, 2)} TIA` }}
					</Text>
					<Text size="14" weight="600" color="tertiary">
						{{ series.name === "gas_price" ? `${prevTotal.toFixed(4)} UTIA` : `${tia(prevTotal, 2)} TIA` }}
					</Text>
				</Flex>
				<Flex v-else-if="series.units === 'usd'" align="end" gap="10" justify="start" wide>
					<Text size="16" weight="600" color="primary"> {{ `${abbreviate(currentTotal)} $` }} </Text>
					<Text size="14" weight="600" color="tertiary"> {{ `${abbreviate(prevTotal)} $` }} </Text>
				</Flex>
				<Flex v-else align="end" gap="10" justify="start" wide>
					<Text size="16" weight="600" color="primary">
						{{ series.units === "bytes" ? formatBytes(currentTotal) : comma(currentTotal) }}
					</Text>

					<Text v-if="series.aggregate === 'cumulative'" size="14" weight="600" color="tertiary">
						{{ `${formatBytes(prevTotal)} previous month` }}
					</Text>
					<Text v-else size="14" weight="600" color="tertiary">
						{{
							`${series.units === "bytes" ? formatBytes(prevTotal) : abbreviate(prevTotal)} previous ${period.title.replace(
								"Last ",
								"",
							)}`
						}}
					</Text>
				</Flex>
			</Flex>
		</NuxtLink>

		<Flex :class="$style.chart_wrapper">
			<Transition name="fastfade">
				<div v-if="tooltip.show" :class="$style.tooltip_wrapper">
					<Flex
						ref="tooltipEl"
						align="center"
						direction="column"
						:style="{ transform: `translate(${tooltip.x}px, ${tooltip.y}px)` }"
						gap="12"
						:class="$style.tooltip"
					>
						<Flex v-for="(d, index) in tooltip.data" align="start" direction="column" wide gap="8">
							<Flex align="center" justify="between" gap="12" wide>
								<Text size="12" weight="600" color="primary"> {{ d.value }} </Text>

								<Flex align="center" justify="end" gap="6">
									<Text size="12" weight="500" color="tertiary">
										{{ d.date }}
									</Text>

									<div
										:class="$style.legend"
										:style="{
											background: d.color,
										}"
									/>
								</Flex>
							</Flex>

							<div v-if="index !== tooltip.data.length - 1" :class="$style.horizontal_divider" />
						</Flex>
					</Flex>
				</div>
			</Transition>

			<Flex ref="chartElPrev" wide :class="$style.chart" />
			<Flex ref="chartEl" wide :class="$style.chart" />

			<Flex align="center" justify="between" :class="$style.axis">
				<Text v-if="series.aggregate === 'cumulative'" size="11" weight="600" color="tertiary">
					{{ DateTime.fromJSDate(currentData[0]?.date).toFormat("LLL dd") }}
				</Text>
				<Text v-else size="11" weight="600" color="tertiary">
					{{
						DateTime.now()
							.minus({
								days: period.timeframe === "day" ? period.value : 0,
								hours: period.timeframe === "hour" ? period.value : 0,
							})
							.toFormat("LLL dd")
					}}
				</Text>

				<Text size="11" weight="600" color="tertiary">
					{{
						DateTime.now()
							.minus({
								days: period.timeframe === "day" ? 1 : 0,
								hours: period.timeframe === "hour" ? 1 : 0,
							})
							.toFormat("LLL dd")
					}}
				</Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 280px;

	background: var(--card-background);
	border-radius: 12px;

	padding: 16px;
}

.header {
	cursor: pointer;

	.title {
		width: 100%;

		svg:last-of-type {
			transition: fill 0.3s ease;
		}
		
	}

	&:hover .title svg:last-of-type {
		fill: var(--txt-primary);
		transform: scale(1.1);
	}
}

.disabled {
	cursor: auto;
	pointer-events: none;
}

.chart_wrapper {
	position: relative;

	height: 180px;
}

.chart {
	height: 100%;
	position: absolute;

	overflow: hidden;

	& svg {
		overflow: visible;
	}
}

.axis {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
}

.tooltip_wrapper {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	& .tooltip {
		min-width: 100px;
		pointer-events: none;
		position: absolute;
		z-index: 10;

		background: var(--card-background);
		border-radius: 6px;
		box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

		padding: 10px;

		transition: all 0.2s ease;
	}

	& .legend {
		height: 8px;
		width: 8px;
		border-radius: 50%;
	}

	& .horizontal_divider {
		width: 100%;
		height: 1px;
		background: var(--op-5);
	}
}

@media (max-width: 1000px) {
	.wrapper {
		max-width: initial;
		width: 100%;
	}
}
</style>
