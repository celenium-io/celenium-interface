<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Services */
import { comma } from "@/services/utils"

/** API */
import { fetchSquareSize } from "@/services/api/stats"

const chartEl = ref()

/** Tooltip */
const tooltip = ref({
	data: [],
	show: false,
})

const buildChart = (chart, onEnter, onLeave) => {
	const width = chart.getBoundingClientRect().width
	const height = chart.getBoundingClientRect().height
	const marginTop = 0
	const marginRight = 0
	const marginBottom = 24
	const marginLeft = 6
	const marginAxisX = 20
	const barWidth = Math.round((width - marginLeft - marginRight) / transformedData.value.length - 1)

	/** Tooltip */
	const bisect = d3.bisector((d) => new Date(d.time)).center
	const onPointerMoved = (event) => {
		onEnter()

		const idx = bisect(transformedData.value, x.invert(d3.pointer(event)[0] - barWidth / 2))
		const elements = document.querySelectorAll("[data-index]")
		for (const el of elements) {
			if (+el.getAttribute("data-index") === idx) {
				el.style.filter = "brightness(1.2)"
			} else {
				el.style.filter = "brightness(0.6)"
			}
		}

		tooltip.value.x = x(new Date(transformedData.value[idx].time))
		tooltip.value.y = height / 2
		tooltip.value.data = []

		tooltip.value.date = DateTime.fromISO(transformedData.value[idx].time).toFormat("LLL dd, yyyy")
		Object.keys(transformedData.value[idx]).forEach((key, i) => {
			if (key !== "time") {
				tooltip.value.data.push({
					size: key,
					value: transformedData.value[idx][key],
					color: color(i),
				})
			}
		})

		tooltip.value.data.reverse()
	}

	const onPointerLeft = () => {
		onLeave()

		const elements = document.querySelectorAll("[data-index]")
		for (const el of elements) {
			el.style.filter = ""
		}
	}

	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;")
		.style("-webkit-tap-highlight-color", "transparent")
		.on("pointerenter pointermove", onPointerMoved)
		.on("pointerleave", onPointerLeft)
		.on("touchstart", (event) => event.preventDefault())

	const stack = d3.stack().keys(keys.value).order(d3.stackOrderNone).offset(d3.stackOffsetNone)

	const series = stack(transformedData.value)

	const x = d3
		.scaleUtc()
		.domain(d3.extent(transformedData.value, (d) => new Date(d.time)))
		.range([marginLeft, width])

	const y1Max = d3.max(series, (y) => d3.max(y, (d) => d[1]))
	const y = d3
		.scaleLinear()
		.domain([0, y1Max])
		.range([height - marginBottom, marginTop])

	const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#65efcc", "#142f28"])).domain([0, keys.value.length])

	// Add x-scale
	svg.append("g")
		.attr("transform", `translate(0, ${height - marginAxisX})`)
		.attr("color", "var(--op-20)")
		.call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%B %d")))

	svg.append("g")
	const rect = svg
		.selectAll(".series")
		.data(series)
		.join("g")
		.attr("fill", (d, i) => color(i))
		.selectAll("rect")
		.data((d) => d)
		.join("rect")
		.attr("class", "bar")
		.attr("data-index", (d, i) => i)
		.attr("x", (d) => x(new Date(d.data.time)))
		.attr("y", height - marginBottom)
		.attr("width", barWidth)
		.attr("height", 0)

	rect.transition()
		.duration(500)
		.delay((d, i) => i * 20)
		.attr("y", (d) => y(d[1]))
		.attr("height", (d) => y(d[0]) - y(d[1]))
		.transition()
		.attr("x", (d) => x(new Date(d.data.time)))
		.attr("width", barWidth)

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

const transformedData = ref([])
const keys = ref([])

const getSquareSizes = async () => {
	const data = await fetchSquareSize()

	keys.value = Object.keys(data)

	let maxLength = 0
	let maxKey = null

	for (const key in data) {
		if (data[key].length > maxLength) {
			maxLength = data[key].length
			maxKey = key
		}
	}

	const templateArray = data[maxKey]
	const templateTimes = templateArray.map((item) => item.time)
	const filledData = {}
	for (const key in data) {
		filledData[key] = templateTimes.map((time) => {
			const found = data[key].find((item) => item.time === time)
			return found ? found : { time: time, value: "0" }
		})
	}

	filledData[maxKey].forEach((d, i) => {
		const entry = { time: d.time }
		for (const key of keys.value) {
			entry[key] = +filledData[key][i].value
		}
		transformedData.value.push(entry)
	})

	transformedData.value.reverse()
}

onMounted(async () => {
	await getSquareSizes()

	buildChart(
		chartEl.value.wrapper,
		() => {
			tooltip.value.show = true
		},
		() => {
			tooltip.value.show = false
		},
	)
})
</script>

<template>
    <Flex direction="column" justify="between" gap="16" wide :class="$style.wrapper">
        <Flex :class="$style.chart_wrapper">
            <Transition name="fastfade">
                <div v-if="tooltip.show" :class="$style.tooltip_wrapper">
                    <Flex
                        align="center"
                        direction="column"
                        :style="{ transform: `translate(${tooltip.x + 40}px, ${tooltip.y - 70}px)` }"
                        gap="12"
                        :class="$style.tooltip"
                    >
                        <Flex align="center" justify="between" wide>
                            <Text size="12" color="secondary">Square Size</Text>
                            <Text size="12" color="tertiary"> {{ tooltip.date }} </Text>
                        </Flex>
                        <Flex
                            v-for="d in tooltip.data"
                            align="center"
                            justify="between"
                            wide
                        >
                            <Flex align="center" gap="6">
                                <div
                                    :class="$style.legend"
                                    :style="{
                                        background: d.color
                                    }"
                                />

                                <Text size="12" weight="600" color="primary"> {{ `${d.size} x ${d.size}` }} </Text>
                            </Flex>

                            <Flex align="center">
                                <Text size="12" weight="600" color="primary" style="text-align: right"> {{ comma(d.value) }} </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </div>
            </Transition>

            <Flex ref="chartEl" :class="$style.chart" />
        </Flex>
    </Flex>
</template>

<style module>
.wrapper {
	height: 600px;

	border-radius: 12px;

	padding: 16px;
}

.chart_wrapper {
	position: relative;

	height: 600px;
}

.chart {
    width: 992px;
    height: 600px;
	position: absolute;

	overflow: hidden;

	& svg {
		overflow: visible;
	}
}

.tooltip_wrapper {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	& .tooltip {
		min-width: 180px;
		pointer-events: none;
		position: absolute;
		z-index: 10;

		background: var(--card-background);
		border-radius: 6px;
		box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

		padding: 10px;

		transition: all 0.2s ease;
	}

	& .legend {
		width: 12px;
		height: 12px;
		border-radius: 2px;
	}
}
</style>
