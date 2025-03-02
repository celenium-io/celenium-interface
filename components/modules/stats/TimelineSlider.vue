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
	const margin = { top: 4, right: 40, bottom: 4, left: 40 }
	const height = 75
	const axisBottomHeight = 20
	const barWidth = Math.max(Math.round((width - margin.left - margin.right) / props.allData.length - 5), 5)
	console.log("buildTimelineSlider", data)
	const x = d3
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
		.attr("transform", "translate(0," + (height - axisBottomHeight) + ")")
		.attr("color", "var(--op-20)")
		.call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b %d")))

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
			.attr("fill", "var(--mint)") // Цвет выделения
			.attr("clip-path", "url(#clip)") // Используем clipPath
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

	// const tooltipLeft = d3
	// 	.select(chart)
	// 	.append("div")
	// 	.attr("class", "tooltip tooltip-left")
	// 	.style("position", "absolute")
	// 	.style("visibility", "hidden")
	// 	.style("background", "white")
	// 	.style("border", "1px solid #ccc")
	// 	.style("padding", "5px")
	// 	.style("border-radius", "3px")
	// 	.style("font-size", "12px")

	// const tooltipRight = d3
	// 	.select(chart)
	// 	.append("div")
	// 	.attr("class", "tooltip tooltip-right")
	// 	.style("position", "absolute")
	// 	.style("visibility", "hidden")
	// 	.style("background", "white")
	// 	.style("border", "1px solid #ccc")
	// 	.style("padding", "5px")
	// 	.style("border-radius", "3px")
	// 	.style("font-size", "12px")

	const brush = d3
		.brushX()
		.extent([
			[margin.left, margin.top],
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

			// if (tooltipLeft.style("visibility") === "visible" || tooltipRight.style("visibility") === "visible") {
			// 	const dateLeft = x.invert(x0)
			// 	const dateRight = x.invert(x1)

			// 	tooltipLeft.text(d3.utcFormat("%Y-%m-%d %H:%M")(dateLeft))
			// 	tooltipRight.text(d3.utcFormat("%Y-%m-%d %H:%M")(dateRight))
			// }
			// updateHandleRect(selection)
		}
	}

	function brushended({ selection }) {
		if (!selection) {
			gb.call(brush.move, defaultSelection)
			clip.attr("x", 0).attr("width", 0)
		}
	}

	const defaultSelection = [x.range()[0], x.range()[1]]

	// const handleRect = svg
	// 	.append("rect")
	// 	.attr("class", "brush-handle")
	// 	.attr("width", 10)
	// 	.attr("height", 5)
	// 	.attr("fill", "gray")
	// 	.attr("cursor", "ew-resize")
	// 	.style("pointer-events", "all")

	// function updateHandleRect(selection) {
	// 	if (selection) {
	// 		const [x0, x1] = selection
	// 		const centerX = (x0 + x1) / 2
	// 		handleRect.attr("x", centerX - 5).attr("y", margin.top - 5)
	// 	}
	// }

	// updateHandleRect(defaultSelection)

	// handleRect.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))

	// function dragstarted(event) {
	// 	this.initialSelection = gb.select(".selection").node().getBBox()
	// 	this.initialX = event.x
	// }

	// function dragged(event) {
	// 	const dx = event.x - this.initialX

	// 	const newX0 = this.initialSelection.x + dx
	// 	const newX1 = newX0 + this.initialSelection.width

	// 	const clampedX0 = Math.max(margin.left, Math.min(width - margin.right - this.initialSelection.width, newX0))
	// 	const clampedX1 = clampedX0 + this.initialSelection.width

	// 	gb.call(brush.move, [clampedX0, clampedX1])

	// 	clip.attr("x", clampedX0).attr("width", clampedX1 - clampedX0)
	// 	updateHandleRect([clampedX0, clampedX1])

	// 	brush.move(gb, [clampedX0, clampedX1])
	// 	brushed({ selection: [clampedX0, clampedX1], sourceEvent: event })
	// }

	// function dragended(event) {
	// 	delete this.initialSelection
	// 	delete this.initialX
	// }

	// updateHandleRect(defaultSelection)
	// svg.on("mousedown", function (event) {
	// 	const [x, y] = d3.pointer(event)
	// 	const selection = gb.select(".selection").node()

	// 	if (selection && x >= +selection.x.baseVal.value && x <= +selection.x.baseVal.value + +selection.width.baseVal.value) {
	// 		gb.call(brush.clear)
	// 		isMouseDown = true
	// 	}
	// })

	// let isMouseDown = false
	// let startX = null

	// svg.on("mousedown", (event) => {
	// 	isMouseDown = true
	// 	console.log('mousedown', `isMouseDown: ${isMouseDown}` )
	// 	const [x, y] = d3.pointer(event)
	// 	const selection = gb.select(".selection").node()

	// 	if (selection && x > +selection.x.baseVal.value && x < +selection.x.baseVal.value + +selection.width.baseVal.value) {
	// 		gb.call(brush.clear)
	// 		startX = x
	// 	}
	// })

	// svg.on("mousemove", (event) => {
	// 	console.log('mousemove', `isMouseDown: ${isMouseDown}` )
	// 	if (isMouseDown) {
	// 		const [x, y] = d3.pointer(event)

	// 		const newSelection = [Math.min(startX, x), Math.max(startX, x)]

	// 		gb.call(brush.move, newSelection)

	// 		brushed({ selection: newSelection, sourceEvent: event })
	// 	}
	// })

	// svg.on("mouseup", () => {

	// 	console.log('mouseup', `isMouseDown: ${isMouseDown}` )

	// 	if (isMouseDown) {
	// 		isMouseDown = false

	// 		brushended({ selection: gb.select(".selection").node()?.getBBox() })
	// 	}
	// })

	const gb = svg.append("g").call(brush).call(brush.move, defaultSelection)

	gb.select(".selection").attr("fill", "var(--op-30)").attr("stroke", "var(--op-30)")
	// gb.select(".selection").attr("cursor", "crosshair")
	// gb.select(".overlay").style("pointer-events", "none")

	// const selectionArea = gb.select(".selection")

	// selectionArea
	// 	.on("mouseover", function (event) {
	// 		const selection = gb.select(".selection").node()
	// 		if (selection) {
	// 			const x0 = +selection.x.baseVal.value // Левый край
	// 			const x1 = x0 + +selection.width.baseVal.value // Правый край

	// 			const dateLeft = x.invert(x0)
	// 			const dateRight = x.invert(x1)

	// 			tooltipLeft
	// 				.style("visibility", "visible")
	// 				.style("left", `${event.pageX - 50}px`)
	// 				.style("top", `${event.pageY - 30}px`)
	// 				.text(d3.utcFormat("%Y-%m-%d %H:%M")(dateLeft))

	// 			tooltipRight
	// 				.style("visibility", "visible")
	// 				.style("left", `${event.pageX + 20}px`)
	// 				.style("top", `${event.pageY - 30}px`)
	// 				.text(d3.utcFormat("%Y-%m-%d %H:%M")(dateRight))
	// 		}
	// 	})
	// 	.on("mouseout", () => {
	// 		tooltipLeft.style("visibility", "hidden")
	// 		tooltipRight.style("visibility", "hidden")
	// 	})
	// const handles = gb.selectAll(".handle--custom")
	//   .data([{type: "w"}, {type: "e"}])
	//   .enter().append("rect")
	//   .attr("class", "handle--custom")
	//   .attr("x", d => d.type === "w" ? -10 : width - 10) // Позиционируем ручки
	//   .attr("y", 0)
	//   .attr("width", 20)
	//   .attr("height", height)
	//   .attr("fill", "steelblue")
	//   .attr("cursor", "ew-resize");

	// // Привязываем события к ручкам
	// handles
	//   .on("mouseover", function(event) {
	//     d3.select(this).attr("fill", "orange"); // Изменяем цвет при наведении
	//     selectionArea.dispatch("mouseover", event);
	//   })
	//   .on("mouseout", function() {
	//     d3.select(this).attr("fill", "steelblue"); // Возвращаем цвет при уходе мыши
	//     selectionArea.dispatch("mouseout");
	//   });
	// gb.selectAll(".handle--w, .handle--e")
	// 	.on("mouseover", function (event) {
	// 		selectionArea.dispatch("mouseover", event)
	// 	})
	// 	.on("mouseout", () => {
	// 		selectionArea.dispatch("mouseout")
	// 	})

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

// watch(
// 	() => [props.allData, props.chartView],
// 	([newChartView, newData], [oldChartView, oldData]) => {
// 		if (newChartView !== oldChartView || newData !== oldData) {
// 			d3.select(chartEl.value.wrapper).selectAll("*").remove()

// 			console.log('watch', newData)
// 			buildTimelineSlider(chartEl.value.wrapper, newData, chartView)
// 		}
// 	}
// )
</script>

<template>
	<Flex direction="column" justify="start" gap="8" wide :class="$style.wrapper">
		<Flex align="center" :class="$style.chart_wrapper">
			<Flex ref="chartEl" :class="$style.chart" />
		</Flex>
	</Flex>
</template>

<style lang="scss" scoped module>
.wrapper {
	height: 100%;
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
