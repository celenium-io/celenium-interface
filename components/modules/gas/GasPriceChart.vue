<script setup>
/** Vendor */
import { DateTime } from "luxon"
import * as d3 from "d3"
import { useDebounceFn } from "@vueuse/core"

/** Services */
import { truncate } from "@/services/utils"

/** API */
import { fetchGasPriceSeries } from "@/services/api/gas"

/** Chart El */
const chartWrapperEl = ref()
const gasPriceChartEl = ref()

/** Data */
const gasPriceSeries = ref([])

/** Tooltip */
const showTooltip = ref(false)
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
			if (idx > 12) {
				tooltipDynamicXPosition.value = tooltipXOffset.value - tooltipEl.value.wrapper.getBoundingClientRect().width - 16
			} else {
				tooltipDynamicXPosition.value = tooltipXOffset.value + 16
			}
		}

		badgeText.value = DateTime.fromJSDate(data[idx].date).toFormat("hh:mm a")

		if (!badgeEl.value) return
		if (idx === 0) {
			badgeOffset.value = 0
		} else if (idx === 23) {
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
		.attr("style", "max-width: 100%;")
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
		.attr("stroke", "var(--green)")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(data.slice(0, 23)))
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--green)")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("stroke-dasharray", "4")
		.attr("d", line(data.slice(22, 24)))

	svg.append("circle")
		.attr("cx", x(data[data.length - 1].date))
		.attr("cy", y(data[data.length - 1].value))
		.attr("fill", "var(--green)")
		.attr("r", 3)

	if (chartEl.children[0]) chartEl.children[0].remove()
	chartEl.append(svg.node())
}

const getGasPriceSeries = async () => {
	const sizeSeriesRawData = await fetchGasPriceSeries({
		timeframe: "hour",
		from: parseInt(DateTime.now().minus({ hours: 26 }).ts / 1_000),
		to: parseInt(DateTime.now().ts / 1_000),
	})

	const gasPriceSeriesMap = {}
	sizeSeriesRawData.forEach((item) => {
		gasPriceSeriesMap[DateTime.fromISO(item.time).toFormat("dd-HH")] = item.value
	})

	for (let i = 0; i < 24; i++) {
		const dt = DateTime.now()
			.minus({ hours: 24 - i })
			.set({ minutes: 0, seconds: 0 })
		gasPriceSeries.value.push({
			date: dt.toJSDate(),
			value: parseFloat(gasPriceSeriesMap[dt.toFormat("dd-HH")]) || 0,
		})
	}
}

const buildGasTrackingCharts = async () => {
	await getGasPriceSeries()
	buildChart(
		gasPriceChartEl.value.wrapper,
		gasPriceSeries.value,
		() => (showTooltip.value = true),
		() => (showTooltip.value = false),
	)
}

const debouncedRedraw = useDebounceFn((e) => {
	buildGasTrackingCharts()
}, 500)

onMounted(async () => {
	window.addEventListener("resize", debouncedRedraw)

	buildGasTrackingCharts()
})

onBeforeUnmount(() => {
	window.removeEventListener("resize", debouncedRedraw)
})
</script>

<template>
	<Flex direction="column" gap="16" wide>
		<Flex align="center" gap="6">
			<Icon name="chart" size="13" color="primary" />
			<Text size="13" weight="600" color="primary">Average Gas Price</Text>
		</Flex>

		<Flex ref="chartWrapperEl" direction="column" :class="$style.chart_wrapper">
			<Flex direction="column" justify="between" :class="[$style.axis, $style.y]">
				<Text v-if="gasPriceSeries.length" size="12" weight="600" color="tertiary">
					{{ truncate(Math.max(...gasPriceSeries.map((d) => d.value))) }}
				</Text>
				<Skeleton v-else w="32" h="12" />

				<Text v-if="gasPriceSeries.length" size="12" weight="600" color="tertiary">
					{{ truncate(Math.max(...gasPriceSeries.map((d) => d.value)) / 2) }}
				</Text>
				<Skeleton v-else w="24" h="12" />

				<Text v-if="gasPriceSeries.length" size="12" weight="600" color="tertiary"> 0 </Text>
				<Skeleton v-else w="16" h="12" />
			</Flex>

			<Flex :class="[$style.axis, $style.x]">
				<Flex align="end" justify="between" wide>
					<Text size="12" weight="600" color="tertiary">
						{{ DateTime.now().minus({ hours: 24 }).toFormat("dd LLL") }}
					</Text>
					<Text size="12" weight="600" color="tertiary">Today</Text>
				</Flex>
			</Flex>

			<Transition name="fastfade">
				<div v-if="showTooltip" :class="$style.tooltip_wrapper">
					<div :style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }" :class="$style.dot" />
					<div :style="{ transform: `translateX(${tooltipXOffset}px)` }" :class="$style.line" />
					<div ref="badgeEl" :style="{ transform: `translateX(${tooltipXOffset - badgeOffset}px)` }" :class="$style.badge">
						<Text size="12" weight="600" color="secondary">
							{{ badgeText }}
						</Text>
					</div>
					<Flex
						ref="tooltipEl"
						:style="{ transform: `translate(${tooltipDynamicXPosition}px, ${tooltipYOffset - 40}px)` }"
						direction="column"
						gap="8"
						:class="$style.tooltip"
					>
						<Flex align="center" gap="16">
							<Text size="12" weight="600" color="secondary">Price</Text>
							<Text size="12" weight="600" color="primary"> {{ truncate(tooltipText) }} UTIA</Text>
						</Flex>
					</Flex>
				</div>
			</Transition>

			<Flex ref="gasPriceChartEl" :class="$style.chart" />
		</Flex>
	</Flex>
</template>

<style module>
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
		background: var(--green);

		box-shadow: 0 0 0 4px rgba(10, 222, 113, 27%);

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
		position: absolute;
		z-index: 10;

		background: var(--card-background);
		border-radius: 6px;
		box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

		padding: 8px;
	}
}
</style>
