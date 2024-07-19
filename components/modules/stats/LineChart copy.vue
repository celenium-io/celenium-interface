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
const currentData = computed(() => { return {data: props.series.currentData}})
const prevData = computed(() => { 
	let data = []
	props.series.prevData?.forEach((d, index) => {
		data.push({
			date: currentData.value.data[index].date,
			realDate: d.date,
			value: d.value,
		})
	})
	return { data: data }
})

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

const buildChart = (chart, cData, pData) => {
	const width = chart.getBoundingClientRect().width
	const height = chart.getBoundingClientRect().height
	const marginTop = 6
	const marginRight = 12
	const marginBottom = 24
	const marginLeft = 12
	const marginAxisX = 20

	const MIN_VALUE = d3.min([...cData.data.map(s => s.value), ...pData.data.map(s => s.value)])
	const MAX_VALUE = d3.max([...cData.data.map(s => s.value), ...pData.data.map(s => s.value)])

	/** Scale */
	const x = d3.scaleUtc(
		d3.extent(cData.data, (d) => d.date),
		[marginLeft, width],
	)
	const y = d3.scaleLinear([MIN_VALUE, MAX_VALUE], [height - marginBottom, marginTop])
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
		.on("pointerenter pointermove", onPointermoved)
		.on("pointerleave", onPointerleft)
		// .on("touchstart", (event) => event.preventDefault())

    /** Add axes */
	// if (!prev) {
		svg.append("g")
			.attr("transform", "translate(0," + (height - marginAxisX) + ")")
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
	// }

	// This allows to find the closest X index of the mouse:
	const bisect = d3.bisector(function(d) { return d.date; }).left;

	const cFocus = svg
		.append('g')
		.append('circle')
			.style("fill", cData.color)
			.attr('r', 4)
			.style("opacity", 0)
			.style("transition", "all 0.2s ease" )

	const pFocus = svg
		.append('g')
		.append('circle')
			.style("fill", pData.color)
			.attr('r', 4)
			.style("opacity", 0)
			.style("transition", "all 0.2s ease" )

	const focusLine = svg
		.append('g')
		.append('line')
			.style("stroke-width", 2)
			.style("stroke", "var(--op-10)")
			.style("fill", "none")
			.style("opacity", 0)
			// .style("transition", "all 0.2s ease" )

	// create a tooltip
	// const tooltip = svg
	// 	.append("div")
	// 	.style("opacity", 1)
	// 	.attr("class", "tooltip")
	// 	.style("background-color", "var(--card-background)")
	// 	.style("border", "solid")
	// 	.style("border-width", "2px")
	// 	.style("border-radius", "6px")
	// 	.style("padding", "5px")

	const tooltip = svg
		.append("g")
		.append("div")
			.style("position", "absolute")
			.style("opacity", 1)
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "1px")
			.style("border-radius", "5px")
			.style("padding", "10px")
			.style('width', 100 + "px")
			.style('height', 100 + "px")
			.style("left", "500px")
			.style("top", "200px")
			.html("<p>I'm a tooltip written in HTML</p>")

	
	const focusText = svg
		.append('g')
		.append('text')
			.style("opacity", 0)
			.attr("text-anchor", "left")
			.attr("alignment-baseline", "middle")
	
	// Create a rect on top of the svg area: this rectangle recovers mouse position
	// svg
	// 	.append('rect')
	// 	.style("fill", "none")
	// 	.style("pointer-events", "all")
	// 	.attr('width', width)
	// 	.attr('height', height)
	// 	.on('mouseover', mouseover)
	// 	.on('mousemove', mousemove)
	// 	.on('mouseout', mouseout);

	// What happens when the mouse move -> show the annotations at the right positions.
	// function mouseover() {
	// 	cFocus.style("opacity", 1)
	// 	pFocus.style("opacity", 1)
	// 	focusText.style("opacity",1)
	// }

	function onPointermoved(event) {
		cFocus.style("opacity", 1)
		pFocus.style("opacity", 1)
		focusLine.style("opacity", 1)
		tooltip.style("opacity", 1)
		focusText.style("opacity",1)

		// recover coordinate we need
		let idx = bisect(cData.data, x.invert(d3.pointer(event)[0]), 1)
		let selectedCData = cData.data[idx]
		let selectedPData = pData.data[idx]
		cFocus
			.attr("cx", x(selectedCData.date))
			.attr("cy", y(selectedCData.value))
		pFocus
			.attr("cx", x(selectedPData.date))
			.attr("cy", y(selectedPData.value))
		focusLine
			.attr("x1", x(selectedPData.date))
			.attr("y1", 0)
			.attr("x2", x(selectedPData.date))
			.attr("y2", height - marginAxisX)

		// tooltip
		// 	.html("x:" + selectedCData.date + "  -  " + "y:" + selectedCData.value)
		// 	.style("left", x(selectedCData.date))
		// 	.style("top", y(selectedCData.date))
			// .attr("x", x(selectedCData.date)+15)
			// .attr("y", y(selectedCData.value))
		
		// focusText
		// 	.html("x:" + selectedCData.date + "  -  " + "y:" + selectedCData.value)
		// 	.attr("x", x(selectedCData.date)+15)
		// 	.attr("y", y(selectedCData.value))
	}

	function onPointerleft() {
		cFocus.style("opacity", 0)
		pFocus.style("opacity", 0)
		tooltip.style("opacity", 0)
		focusText.style("opacity", 0)
	}

	/** Chart Lines */
	const cPath = svg.append("path")
		.attr("fill", "none")
		.attr("stroke", cData.color)
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(cData.data.filter((item) => item.value !== null)))

	const pPath = svg.append("path")
		.attr("fill", "none")
		.attr("stroke", pData.color)
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(pData.data.filter((item) => item.value !== null)))

	// svg.append("path")
	// 	.attr("fill", "none")
	// 	.attr("stroke", "transparent")
	// 	.attr("stroke-width", 2)
	// 	.attr("stroke-linecap", "round")
	// 	.attr("stroke-linejoin", "round")
	// 	.attr("d", line(data.filter((item) => item.value === null).map((item) => ({ ...item, value: 0 }))))

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())

	const totalLength = cPath.node().getTotalLength();

	cPath.attr("stroke-dasharray", `${totalLength} ${totalLength}`)
		.attr("stroke-dashoffset", totalLength)
		.transition()
		.duration(1_000)
		.ease(d3.easeLinear)
		.attr("stroke-dashoffset", 0);

	pPath.attr("stroke-dasharray", `${totalLength} ${totalLength}`)
		.attr("stroke-dashoffset", totalLength)
		.transition()
		.duration(1_000)
		.ease(d3.easeLinear)
		.attr("stroke-dashoffset", 0);

}

const drawChart = () => {
	currentData.value.color = "var(--mint)"
	prevData.value.color = "var(--txt-tertiary)"

	buildChart(
		chartEl.value.wrapper,
		currentData.value,
		prevData.value,
	)
	// if (prevData.value) {
	// 	buildChart(
	// 		chartElPrev.value.wrapper,
	// 		prevData.value,
	// 		"var(--txt-tertiary)",
	// 		true,
	// 		() => (showTooltip.value = true),
	// 		() => (showTooltip.value = false),
	// 	)
	// }
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
			<!-- <Flex ref="chartElPrev" wide :class="$style.chart" /> -->
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
