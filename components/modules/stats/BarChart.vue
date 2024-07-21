<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

const props = defineProps({
	series: {
		type: Object,
		required: true,
	},
})

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
const tooltip = ref({
	data: [],
	show: false,
})

const buildChart = (chart, cData, pData, onEnter, onLeave) => {
	const width = chart.getBoundingClientRect().width
	const height = chart.getBoundingClientRect().height
	const marginTop = 12
	const marginRight = 12
	const marginBottom = 24
	const marginLeft = 36
	const marginAxisX = 20
	const barWidth = Math.round((width - marginLeft - marginRight) / (cData.data.length) - (pData.data.length ? 2 : 5))

	const MIN_VALUE = d3.min([...cData.data.map(s => s.value), ...pData.data?.map(s => s.value)])
	const MAX_VALUE = d3.max([...cData.data.map(s => s.value), ...pData.data?.map(s => s.value)])

	/** Scales */
	const x0 = d3.scaleUtc(
		d3.extent(cData.data, (d) => new Date(d.date)),
		[marginLeft, width - marginRight - barWidth],
	)

	const x1 = d3.scaleBand(
		['current', 'prev'],
		[0, barWidth],
	)

	let data = cData.data.map(d => ({
		date: new Date(d.date),
		value: d.value,
		color: cData.color,
		group: 'current',
	}))
	if (pData.data.length) {
		data = data.concat(pData.data.map(d => ({
			date: new Date(d.date),
			value: d.value,
			color: pData.color,
			group: 'prev',
		})))
	}

	const y = d3.scaleLinear([MIN_VALUE, MAX_VALUE], [height - marginBottom, marginTop])
	
	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;")
		.style("-webkit-tap-highlight-color", "transparent")
		// .on("pointerenter pointermove", onPointerMoved)
		// .on("pointerleave", onPointerleft)
		// .on("touchstart", (event) => event.preventDefault())

	/** Add axes */
	svg.append("g")
	.attr("transform", `translate( ${barWidth / 2 - 3}, ${height - marginAxisX} )`)
	.attr("color", "var(--op-10)")
	.call(d3.axisBottom(x0).ticks(6).tickFormat(d3.timeFormat(props.series.timeframe === 'hour' ? "%H:%M" : "%B %d")))
	.selectAll(".tick line")
		.filter(function(d) { return d === 0; })
		.remove();
	
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
	
	/** Draw bars */
	if (pData.data.length) {
		svg.append('g')
			.selectAll('g')
			.data(data)
			.enter().append('g')
			.attr('transform', d => `translate(${x0(new Date(d.date))},0)`)
			.selectAll('rect')
			.data(d => [d])
			.enter().append('rect')
			.attr('x', d => x1(d.group))
			.attr('y', d => y(0) - marginAxisX)
			.attr('width', 0)
			.attr('height', 0)
			.attr('fill', d => d.color)
			.transition()
			.duration(1_000)
			.attr('height', d => height - y(d.value))
			.attr('y', d => y(d.value) - marginAxisX)
			.attr('width', barWidth / 2 - 7)
	} else {
		svg.append('g')
			.selectAll("g")
			.data(data)
			.enter().append("rect")
			.attr("x", d => x0(new Date(d.date)))
			.attr('y', d => y(0) - marginAxisX)
			.attr("width", 0)
			.attr('height', 0)
			.attr('fill', d => d.color)
			.transition()
			.duration(1_000)
			.attr('y', d => y(d.value) - marginAxisX)
			.attr("width", barWidth)
			.attr('height', d => height - y(d.value))
	}

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

const drawChart = () => {
	currentData.value.color = "var(--mint)"
	prevData.value.color = "var(--txt-tertiary)"

	buildChart(
		chartEl.value.wrapper,
		currentData.value,
		prevData.value,
		() => (tooltip.value.show = true),
		() => (tooltip.value.show = false),
	)
}

watch(
	() => [currentData.value, prevData.value],
	() => {
		drawChart()
	},
)

onMounted(async () => {
	drawChart()
})
</script>

<template>
    <Flex direction="column" justify="between" gap="16" wide :class="$style.wrapper">
        <Flex :class="$style.chart_wrapper">
            <Flex ref="chartEl" wide :class="$style.chart" />
        </Flex>
    </Flex>
</template>

<style module>
.wrapper {
	height: 800px;

	border-radius: 12px;

	padding: 16px;
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
</style>