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
const margin = { top: 54, right: 12, bottom: 4, left: 36 }
const height = 115
const axisBottomHeight = 20

const chartEl = ref()
const isInternalUpdate = ref(false)

let brush = null
let gb = null
let clip = null
let x = null
let xBand = null
let y = null
let width = 0
let tooltip = null
let defaultRange = {
	from: 0,
	to: 0,
}

const from = reactive({
	index: 0,
	date: null,
	ts: null,
})

const to = reactive({
	index: 0,
	date: null,
	ts: null,
})

const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#55c9ab", "#142f28"])).domain([0, 5])

const formatTooltipDate = (date) => {
	if (props.selectedTimeframe.timeframe === "hour") {
		return DateTime.fromJSDate(date instanceof Date ? date : new Date(date)).toFormat("HH:mm, dd LLL")
	}

	return DateTime.fromJSDate(date instanceof Date ? date : new Date(date)).toFormat("dd LLL yyyy")
}

const initBrush = (svg, data) => {
	brush = d3.brushX().extent([
		[margin.left, margin.top - 5],
		[width - margin.right, height - axisBottomHeight],
	])

	gb = svg.append("g").call(brush)

	gb.select(".selection").attr("fill", "var(--op-30)").attr("stroke", "var(--op-30)").style("pointer-events", "none")

	gb.selectAll(".handle").remove()

	gb.select(".overlay").on("mousedown.brush", function () {
		brush.on("brush", brushed)
	})

	initHandles(gb)

	brush.on("brush", brushed).on("end", brushended)

	setStartEndFromTimestamp(data, props.from, props.to)
	const x0 = getXFromBarIndex(from.index, true)
	const x1 = getXFromBarIndex(to.index, false)
	gb.call(brush.move, [x0, x1])
	brushed({ selection: [x0, x1] })

	return gb
}

const roundedRect = (x, y, width, height, radius) => {
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

let currentData = []

const buildTimelineSlider = (chart, data, chartView) => {
	currentData = data
	width = chart.getBoundingClientRect().width

	x = d3
		.scaleUtc()
		.domain(d3.extent(data, (d) => new Date(d.time)))
		.range([margin.left, width - margin.right])

	xBand = d3
		.scaleBand()
		.domain(data.map((d) => new Date(d.time).toISOString()))
		.range([margin.left, width - margin.right])
		.padding(0.1)

	y = d3
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
		.call(d3.axisBottom(x).ticks(Math.min(data.length, 6)).tickFormat(d3.timeFormat("%b %d")))
		.selectAll(".tick line")
		.filter(function (d) {
			return d === 0
		})
		.remove()

	clip = svg
		.append("defs")
		.append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 0)
		.attr("height", height)

	defaultRange = {
		from: margin.left,
		to: width - margin.right,
	}

	if (props.from && props.to) {
		const x0 = Math.max(margin.left, x(new Date(props.from * 1000)))
		const x1 = Math.min(width - margin.right, x(new Date(props.to * 1000)))

		if (!isNaN(x0) && !isNaN(x1)) {
			defaultRange = { from: x0, to: x1 }
		}
	}

	if (chartView === "line") {
		renderLineChart(svg, data)
	} else {
		renderBarChart(svg, data)
	}

	initBrush(svg, data)

	return svg.node()
}

const leftDragStarted = ref(false)
let fixedX0 = null
let fixedX0Index = null

let fixedX1 = null
let fixedX1Index = null

const brushed = ({ selection, sourceEvent }) => {
	if (!selection) return

	let [x0, x1] = selection
	if (isNaN(x0) || isNaN(x1)) return

	if (sourceEvent) {
		const currentX = sourceEvent.offsetX - margin.left

		const padding = (xBand.padding() * xBand.step()) / 2
		const currentIndex = Math.max(0, Math.floor(currentX / xBand.step()))

		if (fixedX1Index === null || fixedX0Index === null) {
			fixedX1Index = Math.floor(currentX / xBand.step())
			fixedX0Index = Math.floor(currentX / xBand.step())

			fixedX0 = xBand(new Date(currentData[fixedX0Index].time).toISOString()) - padding
			fixedX1 = xBand(new Date(currentData[currentIndex].time).toISOString()) - padding + xBand.step()
		}

		if (fixedX0Index - currentIndex > 0) {
			fixedX0 = xBand(new Date(currentData[currentIndex].time).toISOString()) - padding
			setStartEndFromIndex(currentData, currentIndex, fixedX1Index)
		} else if (fixedX0Index - currentIndex < 0) {
			fixedX1 = xBand(new Date(currentData[currentIndex].time).toISOString()) - padding + xBand.step()
			setStartEndFromIndex(currentData, fixedX0Index, currentIndex)
		} else {
			fixedX0 = xBand(new Date(currentData[currentIndex].time).toISOString()) - padding
			fixedX1 = xBand(new Date(currentData[currentIndex].time).toISOString()) - padding + xBand.step()
			setStartEndFromIndex(currentData, currentIndex, currentIndex)
		}
		const newX0 = fixedX0
		const newX1 = fixedX1
		gb.call(brush.move, [newX0, newX1])

		clip.attr("x", newX0).attr("width", newX1 - newX0)
		updateHandlePosition([newX0, newX1])
	} else {
		updateHandlePosition([x0, x1])
		clip.attr("x", x0).attr("width", x1 - x0)
	}
}

const brushended = ({ selection }) => {
	if (!selection) {
		gb.call(brush.move, [defaultRange.from, defaultRange.to])
		clip.attr("x", defaultRange.from).attr("width", defaultRange.to - defaultRange.from)
		return
	}

	leftDragStarted.value = false

	fixedX0Index = null
	fixedX0 = null

	fixedX1Index = null
	fixedX1 = null

	isInternalUpdate.value = true

	queueMicrotask(() => {
		emit("onUpdate", { from: from.ts, to: to.ts, source: "timeline" })
		queueMicrotask(() => {
			isInternalUpdate.value = false
		})
	})
}

const renderLineChart = (svg, data) => {
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
}

const renderBarChart = (svg, data) => {
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

let handle = null
let leftHandle = null
let rightHandle = null

const updateHandlePosition = (selection) => {
	if (selection) {
		const [x0, x1] = selection

		if (isNaN(x0) || isNaN(x1)) {
			return
		}

		const brushWidth = x1 - x0
		const handleWidth = brushWidth
		const handleX = x0 + (brushWidth - handleWidth) / 2

		if (!isNaN(handleX) && !isNaN(handleWidth)) {
			handle
				.attr("transform", `translate(${handleX}, 0)`)
				.select("rect")
				.attr("width", handleWidth)
				.attr("y", margin.top - 14)

			const dotsWidth = 12
			const dotsX = (handleWidth - dotsWidth) / 2

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

const getBarIndexFromX = (eventX, isLeft = false) => {
	const invertedX = x.invert(eventX)

	if (isLeft) {
		return d3.bisectLeft(
			currentData.map((d) => new Date(d.time)),
			invertedX,
		)
	}
	return d3.bisectRight(
		currentData.map((d) => new Date(d.time)),
		invertedX,
	)
}

const initHandles = (gb) => {
	handle = gb
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

	leftHandle = gb
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

	rightHandle = gb
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

	tooltip = handle.append("g").attr("class", "tooltip").style("opacity", 0).style("pointer-events", "none")

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
		.attr("y", margin.top - 32)
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

	const leftDragBehavior = d3.drag().on("drag", function (event) {
		const selection = d3.brushSelection(gb.node())
		if (!selection) return

		const [, x1] = selection
		const barIndex = Math.min(to.index - 1, getBarIndexFromX(event.x, true))
		const newX0 = getXFromBarIndex(barIndex, true)
		if (x1 - newX0 >= xBand.step()) {
			setStartEndFromIndex(currentData, barIndex, to.index)
			gb.call(brush.move, [newX0, x1])
		}
	})

	const rightDragBehavior = d3.drag().on("drag", function (event) {
		const selection = d3.brushSelection(gb.node())
		if (!selection) return

		const [x0] = selection
		const barIndex = Math.min(Math.max(from.index + 1, getBarIndexFromX(event.x, false)), currentData.length - 1)
		const newX1 = getXFromBarIndex(barIndex, false)

		if (newX1 - x0 >= xBand.step()) {
			gb.call(brush.move, [x0, newX1])
			setStartEndFromIndex(currentData, from.index, barIndex)
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
			tooltip.transition().duration(200).style("opacity", 1)
			const selection = d3.brushSelection(gb.node())
			if (!selection || !this._startSelection) return

			const delta = event.x - this._lastX
			const barWidth = xBand.step()
			const totalBars = currentData.length
			const dynamicStep = 0.25 * Math.pow(barWidth, 1.1)
			accumulatedDelta += delta

			if (Math.abs(accumulatedDelta) < barWidth * dynamicStep) return

			const stepDirection = delta > 0 ? 1 : -1
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

			setStartEndFromIndex(currentData, newFromIndex, newToIndex)
			gb.call(brush.move, [getXFromBarIndex(newFromIndex, true), getXFromBarIndex(newToIndex, false)])

			accumulatedDelta = 0
			this._lastX = event.x
		})
		.on("end", function () {
			d3.select(this).style("cursor", "grab")
			tooltip.transition().duration(200).style("opacity", 0)
			accumulatedDelta = 0
		})

	handle.call(handleDragBehavior)

	leftHandle.call(leftDragBehavior)
	rightHandle.call(rightDragBehavior)

	updateHandlePosition([defaultRange.from, defaultRange.to])

	gb.select(".selection")
		.on("mouseenter", function () {
			tooltip.transition().duration(200).style("opacity", 1)
		})
		.on("mouseleave", function () {
			tooltip.transition().duration(200).style("opacity", 0)
		})
}

const clearChart = () => {
	if (chartEl.value?.wrapper) {
		d3.select(chartEl.value.wrapper).selectAll("*").remove()
		brush = null
		gb = null
		clip = null
		x = null
		xBand = null
		y = null
		tooltip = null
		defaultRange = { from: 0, to: 0 }
		currentData = []
		handle = null
		leftHandle = null
		rightHandle = null
	}
}

const setStartEndFromTimestamp = (data, fromTimestamp, toTimestamp) => {
	const fromIndex = data.findIndex((d) => {
		const timestamp = Math.floor(new Date(d.time).getTime() / 1000)
		return timestamp >= fromTimestamp
	})

	const toIndex =
		data.findIndex((d) => {
			const timestamp = Math.floor(new Date(d.time).getTime() / 1000)
			return timestamp > toTimestamp
		}) - 1

	const finalToIndex = toIndex === -2 ? data.length - 1 : toIndex

	const validFromIndex = fromIndex >= 0 ? fromIndex : 0
	const validToIndex = finalToIndex >= 0 ? finalToIndex : data.length - 1

	setStartEndFromIndex(data, validFromIndex, validToIndex)
}

const setStartEndFromIndex = (data, startIndex, endIndex) => {
	const { timeframe } = props.selectedTimeframe
	const startDate = new Date(data[startIndex]?.time)
	const endDate = new Date(data[endIndex]?.time)
	const now = new Date()

	from.index = startIndex
	to.index = endIndex

	const ts = (date) => Math.floor(date.getTime() / 1000)

	const getEndDate = {
		month: () => {
			const newEndDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)
			return newEndDate > now ? now : newEndDate
		},
		week: () => {
			const newEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + (7 - endDate.getDay()))
			return newEndDate > now ? now : newEndDate
		},
		default: () => (endDate > now ? now : endDate),
	}

	from.date = startDate
	to.date = getEndDate[timeframe]?.() || getEndDate.default()

	from.ts = ts(from.date)
	to.ts = ts(to.date)
}

const getXFromBarIndex = (barIndex, isLeft = false) => {
	if (!xBand) return 0
	const padding = (xBand.padding() * xBand.step()) / 2
	return margin.left + (barIndex + (isLeft ? 0 : 1)) * xBand.step() + padding
}

const createChart = () => {
	if (chartEl.value?.wrapper && props.allData) {
		clearChart()
		const reversedData = props.allData?.slice().reverse()

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
