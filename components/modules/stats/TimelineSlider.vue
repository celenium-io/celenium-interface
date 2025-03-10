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

/* TODO:
	+ Разобраться с высотой графика (убрать рандомные значения)
	- Добавить ручки на слайдер за которые можно тянуть
	- Добавить всплывающие тултипы с датами
	- Смена на бары
*/

const buildTimelineSlider = (chart, data, chartView) => {
	const width = chart.getBoundingClientRect().width

	// console.log("buildTimelineSlider_slider", width, chart)
	const margin = { top: 4, right: 12, bottom: 4, left: 12 }
	const height = 75
	const axisBottomHeight = 20
	// const barWidth = Math.max(Math.round((width - margin.left - margin.right - props.allData.length * 5) / props.allData.length ), 2)
	const barWidth = Math.max(Math.round((width - margin.left - margin.right - data.length * 5 ) / data.length ), 2)

	const x = d3
		.scaleUtc()
		.domain(d3.extent(data, (d) => new Date(d.time)))
		.range([margin.left, width - margin.right - margin.left])

	const scaleX = d3
		.scaleUtc()
		.domain(d3.extent(data, (d) => new Date(d.time)))
		.range([margin.left - barWidth / 2, width - margin.right - margin.left / 2])

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
		.attr("transform", `translate(${barWidth / 2 - 3 }, ${height - axisBottomHeight} )`)
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
			.selectAll("g")
			.data(data)
			.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("data-index", (d) => d.index)
			.attr("x", (d) => x(new Date(d.time)))
			.attr("y", (d) => y(d.value))
			.attr("width", barWidth)
			.attr("height", 0)
			.attr("fill", "var(--txt-tertiary)")
			.transition()
			.duration(1_000)
			.attr("height", (d) => height - y(d.value) - axisBottomHeight)

		const highlightedBars = svg
			.append("g")
			.selectAll("rect.highlighted")
			.data(data)
			.enter()
			.append("rect")
			.attr("class", "bar highlighted")
			.attr("data-index", (d) => d.index)
			.attr("x", (d) => x(new Date(d.time)))
			.attr("y", (d) => y(d.value))
			.attr("width", barWidth)
			.attr("height", 0)
			.attr("fill", "var(--mint)")
			.attr("clip-path", "url(#clip)")
			.transition()
			.duration(1000)
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
			[margin.left, margin.top],
			[width - margin.right - margin.left, height - axisBottomHeight],
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

	function brushended({ selection }) {
		if (!selection) {
			gb.call(brush.move, defaultSelection)
			clip.attr("x", 0).attr("width", 0)
		}
	}

	const defaultSelection = [x.range()[0], x.range()[1]]

	const gb = svg.append("g").call(brush).call(brush.move, defaultSelection)

	gb.select(".selection").attr("fill", "var(--op-30)").attr("stroke", "var(--op-30)")

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
