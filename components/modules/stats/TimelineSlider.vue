<script setup>
import * as d3 from "d3"
import { DateTime } from "luxon"

const props = defineProps({
	allData: {
		required: true,
	},
	selectedTimeframe: {
		type: Object,
		required: true,
	},
	chartView: {
		type: String,
		default: "line",
	},
	from: {
		type: [String, Number],
		default: "",
	},
	to: {
		type: [String, Number],
		default: "",
	},
})

const emit = defineEmits(["onUpdate"])
const margin = { top: 54, right: 12, bottom: 4, left: 12 }
const height = 115
const axisBottomHeight = 20

const chartEl = ref()
let currentChart = null
let brush = null

const from = reactive({
	index: 0,
	date: 0,
	ts: 0,
})

const to = reactive({
	index: 0,
	date: 0,
	ts: 0,
})

const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#55c9ab", "#142f28"])).domain([0, 5])

const MIN_HANDLE_WIDTH = 20

const formatTooltipDate = (date) => {
	return DateTime.fromJSDate(date instanceof Date ? date : new Date(date)).toFormat("dd LLL yyyy")
}

const buildTimelineSlider = (chart, data, chartView) => {
	const width = chart.getBoundingClientRect().width

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
		.range([height - 4 - axisBottomHeight, margin.top])

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

	const clip = svg
		.append("defs")
		.append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 0)
		.attr("height", height)

	let defaultSelection = [x.range()[0], x.range()[1]]

	if (props.from && props.to) {
		const x0 = Math.max(margin.left, x(new Date(props.from * 1000)))
		const x1 = Math.min(width - margin.right, x(new Date(props.to * 1000)))

		if (!isNaN(x0) && !isNaN(x1)) {
			defaultSelection = [x0, x1]
		}
	}

	function roundedRect(x, y, width, height, radius) {
		if (height < 1) return `M${x},${y} h${width}`

		const [tl, tr, br, bl] = Array.isArray(radius) ? radius : [radius, radius, radius, radius]

		return `
		M${x + tl},${y}
		h${width - tl - tr}
		q${tr},0 ${tr},${tr}
		v${height - tr - br}
		q0,${br} ${-br},${br}
		h${-(width - br - bl)}
		q${-bl},0 ${-bl},${-bl}
		v${-(height - bl - tl)}
		q0,${-tl} ${tl},${-tl}
	`
	}

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
			.selectAll("path")
			.data(data)
			.join("path")
			.transition()
			.duration(1000)
			.attr("d", (d) => {
				const barX = xBand(new Date(d.time).toISOString())
				const barY = y(d.value)
				const barWidth = xBand.bandwidth()
				const barHeight = height - y(d.value) - axisBottomHeight

				return roundedRect(barX, barY, barWidth, barHeight, [2, 2, 0, 0])
			})

		const highlightedBars = svg
			.append("g")
			.attr("class", "highlighted-bars")
			.selectAll("path")
			.data(data)
			.join("path")
			.attr("class", "bar highlighted")
			.attr("fill", "var(--mint)")
			.attr("clip-path", "url(#clip)")
			.transition()
			.duration(1000)
			.attr("d", (d) => {
				const barX = xBand(new Date(d.time).toISOString())
				const barY = y(d.value)
				const barWidth = xBand.bandwidth()
				const barHeight = height - y(d.value) - axisBottomHeight

				return roundedRect(barX, barY, barWidth, barHeight, [2, 2, 0, 0])
			})
	}

	brush = d3.brushX().extent([
		[margin.left, margin.top - 5],
		[width - margin.right, height - axisBottomHeight],
	])

	const gb = svg.append("g").call(brush).call(brush.move, defaultSelection)

	gb.select(".selection").attr("fill", "var(--op-30)").attr("stroke", "var(--op-30)").style("pointer-events", "none")

	gb.selectAll(".handle").remove()

	gb.select(".overlay").on("mousedown.brush", function () {
		brush.on("brush", brushed)
	})

	clip.attr("x", defaultSelection[0]).attr("width", defaultSelection[1] - defaultSelection[0])

	const handle = gb
		.append("g")
		.attr("class", "brush-handle")
		.style("display", "inline")
		.style("cursor", "grab")
		.attr("transform", "translate(0, 0)")
		.style("pointer-events", "all")

	handle
		.append("rect")
		.attr("x", 0)
		.attr("y", margin.top - 14)
		.attr("height", 5)
		.attr("rx", 2)
		.attr("fill", "var(--op-30)")

	const dotsContainer = handle
		.append("g")
		.attr("transform", `translate(0, ${margin.top - 12.5})`)
		.attr("class", "dots-container")

	dotsContainer
		.selectAll("circle")
		.data([0, 1, 2])
		.join("circle")
		.attr("cx", (d) => d * 6)
		.attr("cy", 1)
		.attr("r", 1)
		.attr("fill", "var(--op-50)")

	const leftHandle = gb
		.append("g")
		.attr("class", "brush-handle left")
		.style("display", "inline")
		.style("cursor", "ew-resize")
		.attr("transform", "translate(0, 0)")

	leftHandle
		.append("rect")
		.attr("y", margin.top + 5)
		.attr("x", margin.top - 56.5)
		.attr("height", 25)
		.attr("width", 5)
		.attr("ry", 2)
		.attr("fill", "var(--op-30)")

	leftHandle
		.append("g")
		.attr("transform", `translate(${margin.top - 55}, ${margin.top + 10})`)
		.selectAll("circle")
		.data([0, 1, 2])
		.join("circle")
		.attr("cy", (d) => d * 6)
		.attr("cx", 1)
		.attr("r", 1)
		.attr("fill", "var(--op-50)")

	const rightHandle = gb
		.append("g")
		.attr("class", "brush-handle right")
		.style("display", "inline")
		.style("cursor", "ew-resize")
		.attr("transform", "translate(0, 0)")

	rightHandle
		.append("rect")
		.attr("y", margin.top + 5)
		.attr("x", margin.top - 51.5)
		.attr("height", 25)
		.attr("width", 5)
		.attr("ry", 2)
		.attr("fill", "var(--op-30)")

	rightHandle
		.append("g")
		.attr("transform", `translate(${margin.top - 50}, ${margin.top + 10})`)
		.selectAll("circle")
		.data([0, 1, 2])
		.join("circle")
		.attr("cy", (d) => d * 6)
		.attr("cx", 1)
		.attr("r", 1)
		.attr("fill", "var(--op-50)")

	const tooltip = handle.append("g").attr("class", "tooltip").style("opacity", 0).style("pointer-events", "none")

	tooltip
		.append("rect")
		.attr("rx", 3)
		.attr("ry", 3)
		.attr("fill", "var(--bg-primary)")
		.attr("stroke", "var(--op-10)")
		.attr("stroke-width", 1)
		.attr("y", margin.top - 45)
		.attr("height", 24)

	tooltip
		.append("text")
		.attr("fill", "var(--txt-primary)")
		.attr("y", margin.top - 33)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "middle")
		.style("font-size", "12px")

	handle
		.on("mouseenter", function () {
			tooltip.transition().duration(200).style("opacity", 1)
		})
		.on("mouseleave", function () {
			tooltip.transition().duration(200).style("opacity", 0)
		})
		.on("mousedown", function () {
			tooltip.transition().duration(200).style("opacity", 1)
		})

	leftHandle
		.on("mouseenter", function () {
			tooltip.transition().duration(200).style("opacity", 1)
		})
		.on("mouseleave", function () {
			tooltip.transition().duration(200).style("opacity", 0)
		})

	rightHandle
		.on("mouseenter", function () {
			tooltip.transition().duration(200).style("opacity", 1)
		})
		.on("mouseleave", function () {
			tooltip.transition().duration(200).style("opacity", 0)
		})

	const getBarIndexFromX = (eventX, isLeft = false) => {
		const invertedX = x.invert(eventX)
		// const padding = (xBand.padding() * xBand.step()) / 2
		if (isLeft) {
			return d3.bisectLeft(
				data.map((d) => new Date(d.time)),
				invertedX,
			)
		}
		return d3.bisectRight(
			data.map((d) => new Date(d.time)),
			invertedX,
		)
	}

	const getXFromBarIndex = (barIndex, isLeft = false) => {
		const padding = (xBand.padding() * xBand.step()) / 2

		// +1 because bisectRight returns the index of the next element
		return margin.left + (barIndex + (isLeft ? 0 : 1)) * xBand.step() + padding
	}

	const leftDragBehavior = d3.drag().on("drag", function (event) {
		const selection = d3.brushSelection(gb.node())
		if (!selection) return

		const [, x1] = selection
		const barIndex = Math.min(to.index - 1, getBarIndexFromX(event.x, true))
		const newX0 = getXFromBarIndex(barIndex, true)

		if (x1 - newX0 >= xBand.step()) {
			gb.call(brush.move, [newX0, x1])
			setFromTo(data, barIndex, to.index)
		}
	})

	const rightDragBehavior = d3.drag().on("drag", function (event) {
		const selection = d3.brushSelection(gb.node())
		if (!selection) return

		const [x0] = selection
		const barIndex = Math.max(from.index + 1, getBarIndexFromX(event.x, false))
		const newX1 = getXFromBarIndex(barIndex, false)

		if (newX1 - x0 >= xBand.step()) {
			gb.call(brush.move, [x0, newX1])
			setFromTo(data, from.index, barIndex)
		}
	})

	let accumulatedDelta = 0

	const handleDragBehavior = d3
		.drag()
		.on("start", function (event) {
			d3.select(this).style("cursor", "grabbing")
			this._lastX = event.x
			this._startSelection = d3.brushSelection(gb.node())
		})
		.on("drag", function (event) {
			const selection = d3.brushSelection(gb.node())
			if (!selection || !this._startSelection) return

			let [x0, x1] = selection
			const delta = event.x - this._lastX
			const barWidth = xBand.step()
			const totalBars = data.length
			const dynamicStep = Math.max(1, Math.floor(totalBars * 0.01))
			const chartMinX = margin.left
			const chartMaxX = width - margin.right
			const minBrushWidth = barWidth

			accumulatedDelta += delta
			if (Math.abs(accumulatedDelta) < barWidth * dynamicStep) return

			if (chartView === "line") {
				let newX0 = x0 + delta
				let newX1 = x1 + delta
				const selectionWidth = x1 - x0

				if (newX1 > chartMaxX) {
					newX1 = chartMaxX
					newX0 = Math.max(chartMinX, newX1 - selectionWidth)
				}
				if (newX0 < chartMinX) {
					newX0 = chartMinX
					newX1 = Math.min(chartMaxX, newX0 + selectionWidth)
				}
				if (newX1 - newX0 < minBrushWidth) return 

				const fromIndex = getBarIndexFromX(newX0)
				const toIndex = Math.min(getBarIndexFromX(newX1), data.length - 1)

				setFromTo(data, fromIndex, toIndex)
				gb.call(brush.move, [newX0, newX1])

				this._lastX = event.x
			} else {
				const stepDirection = delta > 0 ? dynamicStep : -dynamicStep
				const selectionWidth = to.index - from.index

				let newFromIndex = Math.max(0, Math.min(from.index + stepDirection, totalBars - 1))
				let newToIndex = newFromIndex + selectionWidth

				if (newToIndex >= totalBars) {
					newToIndex = totalBars - 1
					newFromIndex = Math.max(0, newToIndex - selectionWidth)
				}
				if (newFromIndex <= 0) {
					newFromIndex = 0
					newToIndex = Math.min(totalBars - 1, newFromIndex + selectionWidth)
				}
				if (newToIndex - newFromIndex < 1) return

				setFromTo(data, newFromIndex, newToIndex)
				gb.call(brush.move, [getXFromBarIndex(newFromIndex, true), getXFromBarIndex(newToIndex, false)])
			}

			accumulatedDelta = 0
			this._lastX = event.x
		})
		.on("end", function () {
			d3.select(this).style("cursor", "grab")
			accumulatedDelta = 0
		})

	handle.call(handleDragBehavior)

	function updateHandlePosition(selection) {
		if (selection) {
			const [x0, x1] = selection

			if (isNaN(x0) || isNaN(x1)) {
				return
			}

			const brushWidth = x1 - x0
			const handleWidth = Math.max(MIN_HANDLE_WIDTH, brushWidth)

			const handleX = x0 + (brushWidth - handleWidth) / 2

			if (!isNaN(handleX) && !isNaN(handleWidth)) {
				handle
					.attr("transform", `translate(${handleX}, 0)`)
					.select("rect")
					.attr("width", handleWidth)
					.attr("y", margin.top - 14)

				const dotsWidth = 12
				const dotsX = (handleWidth - dotsWidth) / 2
				handle.select(".dots-container").attr("transform", `translate(${dotsX}, ${margin.top - 12.5})`)

				leftHandle.attr("transform", `translate(${x0}, 0)`)
				rightHandle.attr("transform", `translate(${x1 - 5}, 0)`)

				const tooltipText = `${formatTooltipDate(from.date)} - ${formatTooltipDate(to.date)}`

				tooltip
					.select("text")
					.text(tooltipText)
					.attr("x", handleWidth / 2)

				const textWidth = tooltip.select("text").node().getBBox().width
				const padding = 8
				const tooltipWidth = textWidth + padding * 2

				const handleCenterX = handleX + handleWidth / 2
				const tooltipHalfWidth = tooltipWidth / 2

				let tooltipX = (handleWidth - tooltipWidth) / 2

				if (handleCenterX - tooltipHalfWidth < margin.left) {
					tooltipX = -handleX + margin.left
					tooltip
						.select("text")
						.attr("x", handleX - margin.left + tooltipHalfWidth)
						.attr("text-anchor", "middle")
				} else if (handleCenterX + tooltipHalfWidth > width - margin.right) {
					tooltipX = width - margin.right - handleX - tooltipWidth
					tooltip
						.select("text")
						.attr("x", width - margin.right - handleX - tooltipHalfWidth)
						.attr("text-anchor", "middle")
				} else {
					tooltip
						.select("text")
						.attr("x", handleWidth / 2)
						.attr("text-anchor", "middle")
				}

				tooltip.select("rect").attr("width", tooltipWidth).attr("x", tooltipX)
			}
		}
	}

	leftHandle.call(leftDragBehavior)
	rightHandle.call(rightDragBehavior)

	function brushed({ selection }) {
		if (!selection) return

		const [x0, x1] = selection
		if (isNaN(x0) || isNaN(x1)) return

		tooltip.style("opacity", 1)
		clip.attr("x", x0).attr("width", x1 - x0)
		updateHandlePosition([x0, x1])
	}

	function brushended({ selection }) {
		if (!selection) {
			gb.call(brush.move, defaultSelection)
			clip.attr("x", defaultSelection[0]).attr("width", defaultSelection[1] - defaultSelection[0])
			return
		}

		queueMicrotask(() => {
			emit("onUpdate", { from: from.ts, to: to.ts })
		})
	}

	brush.on("brush", brushed).on("end", brushended)

	d3.select("body").on("mouseup.brush", function () {
		tooltip.transition().duration(200).style("opacity", 0)
	})

	updateHandlePosition(defaultSelection)

	gb.select(".selection")
		.on("mouseenter", function () {
			tooltip.transition().duration(200).style("opacity", 1)
		})
		.on("mouseleave", function () {
			tooltip.transition().duration(200).style("opacity", 0)
		})

	return svg.node()
}

const clearChart = () => {
	if (chartEl.value?.wrapper) {
		d3.select(chartEl.value.wrapper).selectAll("*").remove()
	}
}

const setFromTo = (data, fromIndex, toIndex) => {
	const { timeframe } = props.selectedTimeframe
	const fromDate = new Date(data[fromIndex]?.time)
	const toDate = new Date(data[toIndex]?.time)
	const now = new Date()

	from.index = fromIndex
	to.index = toIndex

	const ts = (date) => Math.floor(date.getTime() / 1000)

	const getEndDate = {
		month: () => {
			const endDate = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0)
			return endDate > now ? now : endDate
		},
		week: () => {
			const endDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() + (7 - toDate.getDay()))
			return endDate > now ? now : endDate
		},
		default: () => (toDate > now ? now : toDate),
	}

	from.date = fromDate
	to.date = getEndDate[timeframe]?.() || getEndDate.default()

	from.ts = ts(from.date)
	to.ts = ts(to.date)
}

const createChart = () => {
	if (chartEl.value?.wrapper && props.allData) {
		clearChart()
		const reversedData = props.allData?.slice().reverse()
		setFromTo(reversedData, 0, reversedData.length - 1)

		buildTimelineSlider(chartEl.value.wrapper, reversedData, props.chartView)
	}
}

watch(
	() => props.chartView,
	(newTypeChart, oldTypeChart) => {
		if (newTypeChart !== oldTypeChart) {
			createChart()
		}
	},
)

watch(
	() => props.allData,
	(newData, oldData) => {
		if (newData !== oldData) {
			createChart()
		}
	},
	{ deep: true },
)

onMounted(() => {
	createChart()
})

onUnmounted(() => {
	clearChart()
})
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
	padding: 0 16px 16px 16px;
}
.chart_wrapper {
	height: 126px;
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
