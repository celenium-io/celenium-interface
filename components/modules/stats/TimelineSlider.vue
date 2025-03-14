<script setup>
import * as d3 from "d3"

const props = defineProps({
	allData: {
		required: true,
	},
	chartView: {
		type: String,
		default: "day",
	},
})

const emit = defineEmits(["onUpdate"])

const chartEl = ref()
const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#55c9ab", "#142f28"])).domain([0, 5])

const buildTimelineSlider = (chart, data, chartView) => {
	const width = chart.getBoundingClientRect().width

	const margin = { top: 14, right: 12, bottom: 4, left: 12 }
	const height = 75
	const axisBottomHeight = 20


	const x = d3
		.scaleUtc()
		.domain(d3.extent(data, (d) => new Date(d.time)))
		.range([margin.left, width - margin.right])

	const xBand = d3
		.scaleBand()
		.domain(data.map((d) => new Date(d.time).toISOString()))
		.range([margin.left, width - margin.right])
		.padding(0.1)

	const scaleX = d3
		.scaleUtc()
		.domain(d3.extent(data, (d) => new Date(d.time)))
		.range([margin.left, width - margin.right])

	const y = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => +d.value)])
		.range([height - margin.top - axisBottomHeight, margin.bottom + 7])

	const svg = d3
		.select(chart)
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("style", "max-width: 100%;")
		.style("display", "block")

	svg.append("g")
		.attr("transform", `translate(0, ${height - axisBottomHeight} )`)
		.attr("color", "var(--op-20)")
		.call(d3.axisBottom(scaleX).ticks(Math.min(data.length, 6)).tickFormat(d3.timeFormat("%b %d")))
		.selectAll(".tick line")
		.filter(function (d) {
			return d === 0
		})
		.remove()

	if (chartView === "line") {
		svg.append("path")
			.datum(data)
			.attr("fill", "none")
			.attr("stroke", "var(--op-50)")
			.attr("stroke-width", 1)
			.attr("class", "line")
			.attr(
				"d",
				d3
					.line()
					.x((d) => x(new Date(d.time)))
					.y((d) => y(d.value))
					.curve(d3.curveCatmullRom),
			)

		const highlightedLine = svg
			.append("path")
			.datum(data)
			.attr("fill", "none")
			.attr("stroke", (d, i) => color(i))
			.attr("stroke-width", 2)
			.attr("class", "line")
			.attr("clip-path", "url(#clip)")
			.attr(
				"d",
				d3
					.line()
					.x((d) => x(new Date(d.time)))
					.y((d) => y(d.value))
					.curve(d3.curveCatmullRom),
			)
	} else {
		svg.append("g")
			.attr("fill", "var(--txt-tertiary)")
			.attr("class", "bar")
			.selectAll("rect")
			.data(data)
			.join("rect")
			.attr("x", (d) => width - xBand(new Date(d.time).toISOString()) - xBand.bandwidth())
			.attr("y", height - axisBottomHeight)
			.attr("height", 0)
			.attr("width", xBand.bandwidth())
			.transition()
			.duration(1000)
			.attr("y", (d) => y(d.value))
			.attr("height", (d) => height - y(d.value) - axisBottomHeight)

		const highlightedBars = svg
			.append("g")
			.attr("class", "highlighted-bars")
			.selectAll("rect")
			.data(data)
			.join("rect")
			.attr("class", "bar highlighted")
			.attr("fill", "var(--mint)")
			.attr("x", (d) => width - xBand(new Date(d.time).toISOString()) - xBand.bandwidth())
			.attr("y", height - axisBottomHeight)
			.attr("height", 0)
			.attr("width", xBand.bandwidth())
			.attr("clip-path", "url(#clip)")
			.transition()
			.duration(1000)
			.attr("y", (d) => y(d.value))
			.attr("height", (d) => height - y(d.value) - axisBottomHeight)
	}

	const clip = svg
		.append("defs")
		.append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 0)
		.attr("height", height)

	const brush = d3
		.brushX()
		.extent([
			[margin.left, margin.top - 4],
			[width - margin.right, height - axisBottomHeight],
		])
		.on("brush", brushed)
		.on("end", brushended)

	function brushed({ selection }) {

		if (selection) {
			const [x0, x1] = selection

			const [from, to] = selection.map(x.invert, x).map((d) => Math.floor(d?.getTime() / 1_000))

			setTimeout(() => {
				emit("onUpdate", { from, to })
			}, 300)

			clip.attr("x", x0).attr("width", x1 - x0)

			svg.property("value", selection.map(x.invert, x).map(d3.utcDay.round))
			svg.dispatch("input")
		}
	}

	function brushended({ selection, sourceEvent }) {
		console.log("brushended", selection, sourceEvent)
		if (!selection) {
			gb.call(brush.move, defaultSelection)
			clip.attr("x", 0).attr("width", 0)
		}
	}

	const defaultSelection = [x.range()[0], x.range()[1]]

	const gb = svg.append("g").call(brush).call(brush.move, defaultSelection)

	gb.select(".selection").attr("fill", "var(--op-30)").attr("stroke", "var(--op-30)").style("pointer-events", "none")

	const handle = gb
		.append("g")
		.attr("class", "brush-handle")
		.style("display", "inline")
		.style("cursor", "grab")
		.attr("transform", `translate(${width / 2}, 0)`)

	handle
		.append("rect")
		.attr("x", -2.5)
		.attr("y", margin.top - 14)
		.attr("width", 25)
		.attr("height", 5)
		.attr("rx", 2)
		.attr("fill", "var(--op-30)")

	handle
		.append("g")
		.attr("transform", `translate(4, ${margin.top - 12.5})`)
		.selectAll("circle")
		.data([0, 1, 2])
		.join("circle")
		.attr("cx", (d) => d * 6)
		.attr("cy", 1)
		.attr("r", 1)
		.attr("fill", "var(--op-50)")

	function updateHandlePosition(selection) {
		if (selection) {
			const [x0, x1] = selection
			const handleX = x0 + (x1 - x0) / 2
			handle.attr("transform", `translate(${handleX}, 0)`)
		}
	}
	updateHandlePosition(defaultSelection)

	return svg.node()
}

onMounted(() => {
	buildTimelineSlider(chartEl.value.wrapper, props.allData)
})

watch(
	() => props.chartView,
	(newTypeChart, oldTypeChart) => {
		if (newTypeChart !== oldTypeChart) {
			d3.select(chartEl.value.wrapper).selectAll("*").remove()

			buildTimelineSlider(chartEl.value.wrapper, props.allData, props.chartView)
		}
	},
)

watch(
	() => props.allData,
	(newData, oldData) => {
		if (newData !== oldData) {
			d3.select(chartEl.value.wrapper).selectAll("*").remove()
			buildTimelineSlider(chartEl.value.wrapper, props.allData, props.chartView)
		}
	},
)
</script>

<template>
	<Flex direction="column" justify="between" wide :class="$style.wrapper">
		<Flex :class="$style.chart_wrapper">
			<Flex ref="chartEl" wide :class="$style.chart" />
		</Flex>
	</Flex>
</template>

<style lang="scss" scoped module>
.wrapper {
	height: 100%;
	padding: 16px;
}
.chart_wrapper {
	height: 86px;
	position: relative;
}

.chart {
	width: 100%;
	height: 100%;
	position: absolute;

	overflow: hidden;

	& svg {
		overflow: visible;
	}
}

svg {
	font-family: sans-serif;
}

@media (max-width: 1000px) {
	.wrapper {
		max-width: initial;
		width: 100%;
	}
}
</style>
