<script setup>
import * as d3 from "d3"
import { DateTime } from "luxon"

const props = defineProps({
	allData: {
		required: true,
	},
	chartView: {
		type: String,
		default: "day",
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

const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#55c9ab", "#142f28"])).domain([0, 5])

const isInternalUpdate = ref(false)

const MIN_HANDLE_WIDTH = 20

const formatTooltipDate = (date) => {
	return DateTime.fromJSDate(date).toFormat("dd LLL yyyy")
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
		.range([height - 4 - axisBottomHeight, margin.top + 10])

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
				const barX = width - xBand(new Date(d.time).toISOString()) - xBand.bandwidth()
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
				const barX = width - xBand(new Date(d.time).toISOString()) - xBand.bandwidth()
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

	const [from, to] = defaultSelection.map(x.invert, x).map((d) => Math.floor(d?.getTime() / 1_000))
	emit("onUpdate", { from, to })

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

	function snapToBar(position, isLeft = false) {
		const bandWidth = xBand.step()
		const padding = xBand.padding() * bandWidth
		const offset = position - margin.left
		const barIndex = Math.round(offset / bandWidth)

		return margin.left + barIndex * bandWidth + padding / 2
	}

	const leftDragBehavior = d3.drag().on("drag", function (event) {
		const selection = d3.brushSelection(gb.node())
		if (selection) {
			const [, x1] = selection
			const newX0 = snapToBar(Math.min(Math.max(event.x, margin.left), x1 - xBand.step()), true)
			gb.call(brush.move, [newX0, x1])
		}
	})

	const rightDragBehavior = d3.drag().on("drag", function (event) {
		const selection = d3.brushSelection(gb.node())
		if (selection) {
			const [x0] = selection
			const newX1 = snapToBar(Math.max(Math.min(event.x, width - margin.right), x0 + xBand.step()))
			gb.call(brush.move, [x0, newX1])
		}
	})

	const handleDragBehavior = d3
		.drag()
		.on("start", function (event) {
			d3.select(this).style("cursor", "grabbing")
			const [x] = d3.pointer(event)
			this._initialX = x
			this._lastX = x
			this._startSelection = d3.brushSelection(gb.node())
		})
		.on("drag", function (event) {
			const selection = d3.brushSelection(gb.node())
			if (selection && this._startSelection) {
				const [x0, x1] = selection
				const step = xBand.step()
				const [currentX] = d3.pointer(event)

				const totalDelta = currentX - this._initialX
				const barWidth = xBand.bandwidth()

				const stepsToMove = Math.floor(Math.abs(totalDelta) / (barWidth * 0.1))

				if (stepsToMove > 0) {
					const isMovingRight = totalDelta > 0

					if (isMovingRight && x1 < width - margin.right) {
						const maxX0 = width - margin.right - (x1 - x0)
						const newX0 = Math.min(x0 + step, maxX0)
						const newX1 = newX0 + (x1 - x0)

						gb.call(brush.move, [newX0, newX1])
						this._initialX = currentX
					} else if (!isMovingRight && x0 > margin.left) {
						const newX0 = Math.max(x0 - step, margin.left)
						const newX1 = newX0 + (x1 - x0)

						gb.call(brush.move, [newX0, newX1])
						this._initialX = currentX
					}
				}
			}
		})
		.on("end", function () {
			d3.select(this).style("cursor", "grab")
			delete this._initialX
			delete this._lastX
			delete this._startSelection
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

				const leftDate = formatTooltipDate(x.invert(x0))
				const rightDate = formatTooltipDate(x.invert(x1))
				const tooltipText = `${leftDate} - ${rightDate}`

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

	function brushed({ selection, sourceEvent }) {
		if (selection) {
			let [x0, x1] = selection

			if (isNaN(x0) || isNaN(x1)) {
				return
			}

			if (sourceEvent) {
				const snappedX0 = snapToBar(x0, true)
				const snappedX1 = snapToBar(x1)

				x0 = Math.max(snappedX0, margin.left)
				x1 = Math.min(snappedX1, width - margin.right)

				if (x1 - x0 < Math.max(xBand.step(), 20)) {
					if (x1 >= width - margin.right) {
						x0 = x1 - Math.max(xBand.step(), 20)
					} else {
						x1 = x0 + Math.max(xBand.step(), 20)
					}
				}

				if (Math.abs(x0 - selection[0]) > 0.1 || Math.abs(x1 - selection[1]) > 0.1) {
					gb.call(brush.move, [x0, x1])
				}
			}

			if (!isNaN(x0) && !isNaN(x1)) {
				tooltip.style("opacity", 1)

				clip.attr("x", x0).attr("width", x1 - x0)
				updateHandlePosition([x0, x1])

				const [from, to] = [x0, x1].map(x.invert, x).map((d) => {
					const date = DateTime.fromJSDate(d)
					return Math.floor(date.startOf("day").toSeconds())
				})

				isInternalUpdate.value = true
				emit("onUpdate", { from, to })
				setTimeout(() => {
					isInternalUpdate.value = false
				}, 100)
			}
		}
	}

	function brushended({ selection }) {
		if (!selection) {
			gb.call(brush.move, defaultSelection)
			clip.attr("x", defaultSelection[0]).attr("width", defaultSelection[1] - defaultSelection[0])
		} else {
			const snappedX0 = snapToBar(selection[0], true)
			const snappedX1 = snapToBar(selection[1])

			const x0 = Math.max(snappedX0, margin.left)
			const x1 = Math.max(x0 + xBand.step(), Math.min(snappedX1, width - margin.right))

			if (x0 !== selection[0] || x1 !== selection[1]) {
				gb.call(brush.move, [x0, x1])
			}
		}
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

const createChart = () => {
	if (chartEl.value?.wrapper && props.allData) {
		clearChart()
		currentChart = buildTimelineSlider(chartEl.value.wrapper, props.allData, props.chartView)
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

watch([() => props.from, () => props.to], ([newFrom, newTo], [oldFrom, oldTo]) => {
	if (newFrom === oldFrom && newTo === oldTo) return
	if (!props.allData?.length) return

	if (isInternalUpdate.value) {
		isInternalUpdate.value = false
		return
	}

	createChart()
})

onMounted(() => {
	createChart()
})

onUnmounted(() => {
	clearChart()
})

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
