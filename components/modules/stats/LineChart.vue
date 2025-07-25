<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Services */
import { abbreviate, comma, formatBytes, tia, truncateDecimalPart } from "@/services/utils"

const props = defineProps({
	series: {
		type: Object,
		required: true,
	},
	disableTooltip: {
		type: Boolean,
		default: false,
	},
})

// TO DO: Fetch data if series.currentData is null
const currentData = computed(() => {
	return { data: props.series.currentData }
})

const chartEl = ref()
const tooltip = ref({
	data: [],
	show: false,
})

const buildChart = (chart, cData, onEnter, onLeave) => {
	const { width, height } = chart.getBoundingClientRect()

	const marginTop = 6
	const marginRight = 12
	const marginBottom = 24
	const marginLeft = 36
	const marginAxisX = 20

	const MIN_VALUE = d3.min(cData.data?.map((s) => s.value))
	const MAX_VALUE = d3.max(cData.data?.map((s) => s.value))

	/** Scales */
	const x = d3.scaleUtc(
		d3.extent(cData.data, (d) => d.date),
		[marginLeft, width - marginRight],
	)

	const y = d3.scaleLinear([MIN_VALUE, MAX_VALUE], [height - marginBottom, marginTop])
	const line = d3
		.line()
		.x((d) => x(d.date))
		.y((d) => y(d.value))
		.curve(d3.curveCatmullRom)

	function formatDate(date) {
		if (props.series?.timeframe?.timeframe === "hour") {
			return DateTime.fromJSDate(date).toFormat("HH:mm, LLL dd, yyyy")
		}

		return DateTime.fromJSDate(date).toFormat("LLL dd, yyyy")
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
				return `${truncateDecimalPart(value / 1_000, 3)}s`
			case "usd":
				return `${abbreviate(value)} $`
			default:
				return comma(value)
		}
	}

	function formatScaleValue(value) {
		if (props.series.units) {
			return formatValue(value)
		}

		return abbreviate(value)
	}

	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;")
		.attr("id", "chart")
		.style("-webkit-tap-highlight-color", "transparent")
		.on("pointerenter pointermove", onPointerMoved)
		.on("pointerleave", onPointerleft)
		.on("touchstart", (event) => event.preventDefault())

	/** Add axes */
	svg.append("g")
		.attr("transform", "translate(0," + (height - marginAxisX) + ")")
		.attr("color", "var(--op-20)")
		.call(
			d3
				.axisBottom(x)
				.ticks(Math.min(cData.data.length, 6))
				.tickFormat(d3.timeFormat(["hour", "day"].includes(props.series.timeframe.timeframe) ? "%b %d" : "%b")),
		)
		.selectAll(".tick line")
		.filter(function (d) {
			return d === 0
		})
		.remove()

	svg.append("g")
		.attr("transform", `translate(0,0)`)
		.attr("color", "var(--op-20)")
		.call(d3.axisRight(y).ticks(4).tickSize(width).tickFormat(formatScaleValue))
		.call((g) => g.select(".domain").remove())
		.call((g) => g.selectAll(".tick line").attr("stroke-opacity", 0.7).attr("stroke-dasharray", "10, 10"))
		.call((g) => g.selectAll(".tick text").attr("x", 4).attr("dy", -4))

	// This allows to find the closest X index of the mouse:
	const bisect = d3.bisector(function (d) {
		return d.date
	}).center

	const cFocus = svg
		.append("g")
		.append("circle")
		.style("fill", cData.color)
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
		onEnter()
		cFocus.style("opacity", 1)
		focusLine.style("opacity", 1)

		// Recover coordinate we need
		let idx = bisect(cData.data, x.invert(d3.pointer(event)[0]))
		let selectedCData = cData.data[idx]
		cFocus.attr("cx", x(selectedCData.date)).attr("cy", y(selectedCData.value))
		focusLine
			.attr("x1", x(selectedCData.date))
			.attr("y1", 0)
			.attr("x2", x(selectedCData.date))
			.attr("y2", height - marginAxisX)

		let xPosition = x(selectedCData.date)
		tooltip.value.x = xPosition > width - 200 ? xPosition - 215 : xPosition + 15
		tooltip.value.y = Math.min(y(selectedCData.value), height - 100)

		tooltip.value.data[0] = {
			date: formatDate(selectedCData.date),
			value: formatValue(selectedCData.value),
			color: cData.color,
		}
		tooltip.value.data.splice(1, 1)
	}

	function onPointerleft() {
		onLeave()
		cFocus.style("opacity", 0)
		focusLine.style("opacity", 0)
	}

	/** Chart Lines */
	const cPath = svg
		.append("path")
		.attr("fill", "none")
		.attr("stroke", cData.color)
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(cData.data.filter((item) => item.value !== null)))

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())

	const cTotalLength = cPath.node().getTotalLength()

	cPath
		.attr("stroke-dasharray", `${cTotalLength} ${cTotalLength}`)
		.attr("stroke-dashoffset", cTotalLength)
		.transition()
		.duration(1_000)
		.ease(d3.easeLinear)
		.attr("stroke-dashoffset", 0)
}

const drawChart = () => {
	currentData.value.color = "var(--brand)"
	buildChart(
		chartEl.value.wrapper,
		currentData.value,
		() => (tooltip.value.show = true),
		() => (tooltip.value.show = false),
	)
}

watch(
	() => [currentData.value],
	() => {
		if (chartEl?.value?.wrapper) {
			drawChart()
		}
	},
)

onMounted(() => {
	if (chartEl?.value?.wrapper) {
		drawChart()
	}
})
</script>

<template>
	<Flex direction="column" justify="between" gap="16" wide :class="$style.wrapper">
		<Flex :class="$style.chart_wrapper">
			<Transition name="fastfade">
				<div v-if="tooltip.show" :class="$style.tooltip_wrapper">
					<Flex
						align="center"
						direction="column"
						:style="{ transform: `translate(${tooltip.x}px, ${tooltip.y - 40}px)` }"
						gap="12"
						:class="$style.tooltip"
					>
						<Flex v-for="(d, index) in tooltip.data" align="center" direction="column" wide gap="12">
							<Flex align="center" justify="between" wide gap="12">
								<Flex align="center" direction="column" gap="10">
									<Flex align="center" justify="start" wide>
										<Text size="12" weight="600" color="primary"> {{ d.value }} </Text>
									</Flex>

									<Flex align="center" justify="start" wide>
										<Text size="12" weight="500" color="tertiary"> {{ d.date }} </Text>
									</Flex>
								</Flex>

								<div
									:class="$style.legend"
									:style="{
										background: d.color,
									}"
								/>
							</Flex>

							<div v-if="index !== tooltip.data.length - 1" :class="$style.horizontal_divider" />
						</Flex>
					</Flex>
				</div>
			</Transition>

			<Flex ref="chartEl" wide :class="$style.chart" />
		</Flex>
	</Flex>
</template>

<style module lang="scss">
.wrapper {
	height: 800px;

	border-radius: 12px;

	padding: 16px;
}

.chart_wrapper {
	position: relative;

	height: 800px;
}

.chart {
	height: 100%;
	position: absolute;

	overflow: hidden;

	& svg {
		overflow: visible;
	}
}

.tooltip_wrapper {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	& .tooltip {
		min-width: 200px;
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
		height: 34px;
		width: 3px;
		border-radius: 8px;
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
