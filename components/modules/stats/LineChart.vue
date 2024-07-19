<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Stats Components */
import DiffChip from "@/components/modules/stats/DiffChip.vue"

/** Services */
import { abbreviate, comma, formatBytes } from "@/services/utils"

/** API */
import { fetchSeries, fetchSeriesCumulative } from "@/services/api/stats"

const props = defineProps({
	series: {
		type: Object,
		required: true,
	},
})

// TO DO: Fetch data if series.currentData is null
const currentData = computed(() => props.series.currentData)
const prevData = computed(() => props.series.prevData)

const chartEl = ref()
const chartElPrev = ref()
const tooltipEl = ref()
const badgeEl = ref()

const showTooltip = ref(false)
const tooltipXOffset = ref(0)
const tooltipYOffset = ref(0)
const tooltipYDataOffset = ref(0)
const tooltipDynamicXPosition = ref(0)
const tooltipText = ref("")

const badgeText = ref("")
const badgeOffset = ref(0)

const buildChart = (chart, data, color, prev, onEnter, onLeave) => {
	const width = chart.getBoundingClientRect().width
	const height = chart.getBoundingClientRect().height
	const marginTop = 6
	const marginRight = 12
	const marginBottom = 24
	const marginLeft = 12

	const MIN_VALUE = d3.min([...currentData.value.map(s => s.value), ...prevData.value.map(s => s.value)])
	const MAX_VALUE = d3.max([...currentData.value.map(s => s.value), ...prevData.value.map(s => s.value)])
	// const MIN_VALUE = d3.min([...prevData.value.map(s => s.value)])
	// const MAX_VALUE = d3.max([...prevData.value.map(s => s.value)])

	/** Scale */
	const x = d3.scaleUtc(
		d3.extent(data, (d) => d.date),
		[marginLeft, width],
	)
	const y = d3.scaleLinear([MIN_VALUE, MAX_VALUE], [height - marginBottom, marginTop])
	const line = d3
		.line()
		.x((d) => x(d.date))
		.y((d) => y(d.value))
		.curve(d3.curveCatmullRom)

	/** Tooltip */
	const bisect = d3.bisector((d) => d.date).center
	const onPointermoved = (event) => {
		onEnter()

		const idx = bisect(data, x.invert(d3.pointer(event)[0]))
		// console.log('idx', idx);
		// console.log('data[idx].value', data[idx].value);

		tooltipXOffset.value = x(data[idx].date)
		tooltipYDataOffset.value = y(data[idx].value)
		tooltipYOffset.value = event.layerY
		tooltipText.value = data[idx].value

		if (tooltipEl.value) {
			// if (idx > parseInt(selectedPeriod.value.value / 2)) {
			// 	tooltipDynamicXPosition.value = tooltipXOffset.value - tooltipEl.value.wrapper.getBoundingClientRect().width - 16
			// } else {
				tooltipDynamicXPosition.value = tooltipXOffset.value + 16
			// }
		}

		badgeText.value = DateTime.fromJSDate(data[idx].date).toFormat("LLL dd")
			// selectedPeriod.value.timeframe === "day"
			// 	? DateTime.fromJSDate(data[idx].date).toFormat("LLL dd")
			// 	: DateTime.fromJSDate(data[idx].date).set({ minutes: 0 }).toFormat("hh:mm a")
		// console.log('badgeText.value', badgeText.value);
		// if (!badgeEl.value) return
		// if (idx < 2) {
		// 	badgeOffset.value = 0
		// } else if (idx > selectedPeriod.value.value - 3) {
		// 	badgeOffset.value = badgeEl.value.getBoundingClientRect().width
		// } else {
		// 	badgeOffset.value = badgeEl.value.getBoundingClientRect().width / 2
		// }
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
		// .on("pointerenter pointermove", onPointermoved)
		// .on("pointerleave", onPointerleft)
		// .on("touchstart", (event) => event.preventDefault())

    /** Add axes */
	if (!prev) {
		svg.append("g")
			.attr("transform", "translate(0," + (height - 20) + ")")
			.attr("color", "var(--op-10)")
			.call(d3.axisBottom(x).ticks(4))
		
		svg.append("g")
			.attr("transform", `translate(0,0)`)
			.attr("color", "var(--op-10)")
			.call(d3.axisRight(y)
				.ticks(4)
				.tickSize(width)
				.tickFormat(d3.format(".2s")))
			.call(g => g.select(".domain")
				.remove())
			.call(g => g.selectAll(".tick line")
				.attr("stroke-opacity", 0.7)
				.attr("stroke-dasharray", "10, 10"))
			.call(g => g.selectAll(".tick text")
				.attr("x", 4)
				.attr("dy", -4))
			// .call(g => g.selectAll(".tick:first-child").remove())
	}
		
	/** Chart Lines */
	const path = svg.append("path")
		.attr("fill", "none")
		.attr("stroke", color)
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(data.filter((item) => item.value !== null)))

	// svg.append("path")
	// 	.attr("fill", "none")
	// 	.attr("stroke", "transparent")
	// 	.attr("stroke-width", 2)
	// 	.attr("stroke-linecap", "round")
	// 	.attr("stroke-linejoin", "round")
	// 	.attr("d", line(data.filter((item) => item.value === null).map((item) => ({ ...item, value: 0 }))))

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())

	const totalLength = path.node().getTotalLength();

	path.attr("stroke-dasharray", `${totalLength} ${totalLength}`)
		.attr("stroke-dashoffset", totalLength)
		.transition()
		.duration(1_000)
		.ease(d3.easeLinear)
		.attr("stroke-dashoffset", 0);
}

const drawChart = () => {
	buildChart(
		chartEl.value.wrapper,
		currentData.value,
		"var(--mint)",
		false,
		() => (showTooltip.value = true),
		() => (showTooltip.value = false),
	)
	if (prevData.value) {
		buildChart(
			chartElPrev.value.wrapper,
			prevData.value,
			"var(--txt-tertiary)",
			true,
			() => (showTooltip.value = true),
			() => (showTooltip.value = false),
		)
	}
}

onMounted(async () => {
	drawChart()
})

watch(
	() => props.series,
	() => {
		drawChart()
	},
)

</script>

<template>
	<Flex direction="column" justify="between" gap="16" wide :class="$style.wrapper">
		<Flex :class="$style.chart_wrapper">
			<Flex ref="chartElPrev" wide :class="$style.chart" />
			<Flex ref="chartEl" wide :class="$style.chart" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 800px;

	/* background: var(--card-background); */
	border-radius: 12px;

	padding: 16px;
}

.header {

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

.axis {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;

	/* border-top: 2px solid var(--op-5);

	padding-top: 8px; */
}

@media (max-width: 1000px) {
	.wrapper {
		max-width: initial;
		width: 100%;
	}
}
</style>
