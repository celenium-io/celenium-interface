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
const margin = { top: 14, right: 12, bottom: 4, left: 12 }
const height = 75
const axisBottomHeight = 20

const chartEl = ref()
let currentChart = null
let brush = null

const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#55c9ab", "#142f28"])).domain([0, 5])

const isInternalUpdate = ref(false)

const MIN_HANDLE_WIDTH = 20

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
		.range([height - 4 - axisBottomHeight, margin.bottom + 10])

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
		defaultSelection = [
			Math.max(margin.left, x(new Date(props.from * 1000))),
			Math.min(width - margin.right, x(new Date(props.to * 1000))),
		]
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
			.attr("d", (d) => {
				const barX = width - xBand(new Date(d.time).toISOString()) - xBand.bandwidth()
				const barWidth = xBand.bandwidth()

				return `
					M ${barX},${height - axisBottomHeight}
					L ${barX},${height - axisBottomHeight}
					L ${barX + barWidth},${height - axisBottomHeight} 
					L ${barX + barWidth},${height - axisBottomHeight}
				`
			})
			.transition()
			.duration(1000)
			.attr("d", (d) => {
				const barX = width - xBand(new Date(d.time).toISOString()) - xBand.bandwidth()
				const barY = y(d.value)
				const barWidth = xBand.bandwidth()
				const barHeight = height - y(d.value) - axisBottomHeight
				const radius = Math.min(2, barWidth / 2, barHeight / 2)

				if (barHeight < 1) {
					return `M ${barX},${height - axisBottomHeight} h ${barWidth}`
				}

				return `
					M ${barX},${barY + barHeight}
					L ${barX},${barY + radius}
					Q ${barX},${barY} ${barX + radius},${barY}
					L ${barX + barWidth - radius},${barY}
					Q ${barX + barWidth},${barY} ${barX + barWidth},${barY + radius}
					L ${barX + barWidth},${barY + barHeight}
					Z
				`
			})

		const highlightedBars = svg
			.append("g")
			.attr("class", "highlighted-bars")
			.selectAll("path")
			.data(data)
			.join("path")
			.attr("class", "bar highlighted")
			.attr("fill", "var(--mint)")
			.attr("d", (d) => {
				const barX = width - xBand(new Date(d.time).toISOString()) - xBand.bandwidth()
				const barWidth = xBand.bandwidth()

				return `
					M ${barX},${height - axisBottomHeight}
					L ${barX},${height - axisBottomHeight}
					L ${barX + barWidth},${height - axisBottomHeight}
					L ${barX + barWidth},${height - axisBottomHeight}
				`
			})
			.attr("clip-path", "url(#clip)")
			.transition()
			.duration(1000)
			.attr("d", (d) => {
				const barX = width - xBand(new Date(d.time).toISOString()) - xBand.bandwidth()
				const barY = y(d.value)
				const barWidth = xBand.bandwidth()
				const barHeight = height - y(d.value) - axisBottomHeight
				const radius = Math.min(2, barWidth / 2, barHeight / 2)

				if (barHeight < 1) {
					return `M ${barX},${height - axisBottomHeight} h ${barWidth}`
				}

				return `
					M ${barX},${barY + barHeight}
					L ${barX},${barY + radius}
					Q ${barX},${barY} ${barX + radius},${barY}
					L ${barX + barWidth - radius},${barY}
					Q ${barX + barWidth},${barY} ${barX + barWidth},${barY + radius}
					L ${barX + barWidth},${barY + barHeight}
					Z
				`
			})
	}

	brush = d3.brushX().extent([
		[margin.left, margin.top - 4],
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
		.attr("y", 20)
		.attr("x", margin.top - 16.5)
		.attr("height", 25)
		.attr("width", 5)
		.attr("ry", 2)
		.attr("fill", "var(--op-30)")

	leftHandle
		.append("g")
		.attr("transform", `translate(${margin.top - 15}, 25)`)
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
		.attr("y", 20)
		.attr("x", margin.top - 11.5)
		.attr("height", 25)
		.attr("width", 5)
		.attr("ry", 2)
		.attr("fill", "var(--op-30)")

	rightHandle
		.append("g")
		.attr("transform", `translate(${margin.top - 10}, 25)`)
		.selectAll("circle")
		.data([0, 1, 2])
		.join("circle")
		.attr("cy", (d) => d * 6)
		.attr("cx", 1)
		.attr("r", 1)
		.attr("fill", "var(--op-50)")

	function snapToBar(position, isLeft = false) {
		const bandWidth = xBand.step()
		const padding = xBand.padding() * bandWidth
		const offset = position - margin.left
		const barIndex = Math.round(offset / bandWidth)

		return margin.left + barIndex * bandWidth + (isLeft ? 0 : padding)
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
			this._accumulator = 0
			this._startSelection = d3.brushSelection(gb.node())
			this._hasMoved = false
		})
		.on("drag", function (event) {
			const selection = d3.brushSelection(gb.node())
			if (selection && this._startSelection) {
				const [x0, x1] = selection
				const barWidth = xBand.bandwidth()
				const step = xBand.step()
				const [currentX] = d3.pointer(event)

				if (!this._hasMoved) {
					if (Math.abs(currentX - this._initialX) < barWidth) {
						this._lastX = currentX
						return
					}
					this._hasMoved = true
					this._accumulator = 0
					this._lastX = currentX
					return
				}

				this._accumulator += currentX - this._lastX

				if (Math.abs(this._accumulator) >= barWidth) {
					const isMovingRight = this._accumulator > 0
					const isMovingLeft = this._accumulator < 0

					if (isMovingRight && x1 < width - margin.right) {
						const maxX0 = width - margin.right - (x1 - x0)
						const newX0 = Math.min(x0 + step, maxX0)
						const newX1 = newX0 + (x1 - x0)

						gb.call(brush.move, [newX0, newX1])
						this._lastX += step
					} else if (isMovingLeft && x0 > margin.left) {
						const newX0 = Math.max(x0 - step, margin.left)
						const newX1 = newX0 + (x1 - x0)

						gb.call(brush.move, [newX0, newX1])
						this._lastX -= step
					}

					this._accumulator %= barWidth
				}

				this._lastX = currentX
			}
		})
		.on("end", function () {
			d3.select(this).style("cursor", "grab")
			delete this._lastX
			delete this._accumulator
			delete this._startSelection
			delete this._initialX
			delete this._hasMoved
		})

	handle.call(handleDragBehavior)

	function updateHandlePosition(selection) {
		if (selection) {
			const [x0, x1] = selection
			const brushWidth = x1 - x0
			const handleWidth = Math.max(MIN_HANDLE_WIDTH, brushWidth)

			const handleX = x0 + (brushWidth - handleWidth) / 2

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
		}
	}

	leftHandle.call(leftDragBehavior)
	rightHandle.call(rightDragBehavior)

	function brushed({ selection, sourceEvent }) {
		if (selection) {
			let [x0, x1] = selection

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

			clip.attr("x", x0).attr("width", x1 - x0)
			updateHandlePosition([x0, x1])

			const [from, to] = [x0, x1].map(x.invert, x).map((d) => Math.floor(d?.getTime() / 1_000))
			setTimeout(() => {
				isInternalUpdate.value = true
				emit("onUpdate", { from, to })
			}, 300)
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

	updateHandlePosition(defaultSelection)

	gb.select(".selection").on("mousedown.brush", function (event) {
		if (!event.target.classList.contains("handle")) {
			event.stopPropagation()
		}
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
