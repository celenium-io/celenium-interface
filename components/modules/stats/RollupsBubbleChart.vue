<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** API */
import { fetchRollups } from "@/services/api/rollup.js"

const props = defineProps({
	series: {
		type: Object,
		required: true,
	},
	// period: {
	// 	type: Object,
	// 	required: true,
	// },
})

const chartEl = ref()

const isLoading = ref(false)
const rollups = ref()

const getRollups = async () => {
	isLoading.value = true

	const data = await fetchRollups({})

    rollups.value = prepareRollupsData(data)

    isLoading.value = false
}

const prepareRollupsData = (data) => {
    data.forEach(r => {
        r.fee = +(r.fee / 1_000_000).toFixed(2)
    })

    return data
}

const buildChart = (chart, data) => {
	const width = chart.getBoundingClientRect().width
	const height = chart.getBoundingClientRect().height
	const marginTop = 6
	const marginRight = 12
	const marginBottom = 24
	const marginLeft = 32

    const maxBlobsCount = d3.max(data, d => d.blobs_count)
    const maxFee = d3.max(data, d => d.fee)
    const minFee = d3.min(data, d => d.fee)
    const maxSize = d3.max(data, d => d.size)
    const minSize = d3.min(data, d => d.size)

	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;")
		.style("-webkit-tap-highlight-color", "transparent")

    const z = d3.scaleLinear()
        .domain([minSize, maxSize])
        .range([ 20, 80 ]);
    
    const maxRadius = z(maxSize)
    const minRadius = z(minSize)

    const x = d3.scaleLinear()
        .domain([0, maxBlobsCount + maxBlobsCount * 0.1])
        .range([ marginLeft, width ]);
        
    const y = d3.scaleLinear()
        .domain([0, maxFee + maxFee * 0.3])
        .range([ height - 30, 0]);

    // Add axes:
    svg.append("g")
        .attr("transform", "translate(0," + (height - 20) + ")")
        .attr("color", "var(--op-20)")
        .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format(".2s")))
    
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .attr("color", "var(--op-20)")
        .call(d3.axisRight(y)
            .ticks(4)
            .tickSize(width - marginLeft - marginRight)
            .tickFormat(d3.format(".2s")))
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-opacity", 0.7)
            .attr("stroke-dasharray", "10, 10"))
        .call(g => g.selectAll(".tick text")
            .attr("x", 4)
            .attr("dy", -4))
        .call(g => g.selectAll(".tick:first-child").remove())

    // Add axis labels:
    svg.append("text")
        .attr("fill", "var(--op-20)")
        .attr("font-size", "14px")
        .attr("text-anchor", "end")
        .attr("x", 130)
        .attr("y", height - 5)
        .text("Blobs count");

    svg.append("text")
        .attr("fill", "var(--op-20)")
        .attr("font-size", "14px")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("x", -275)
        .attr("y", 27)
        .text("Fee paid (TIA)")

    const defs = svg.append("defs")
    data.forEach((d, i) => {
        defs.append("clipPath")
            .attr("id", `clip-${i}`)
        .append("circle")
            .attr("cx", x(d.blobs_count))
            .attr("cy", y(d.fee))
            .attr("r", 0)
            .transition()
            .duration(1_500)
            .attr("r", z(d.size))
        });

    svg.append('g')
        .selectAll("image")
        .data(data)
        .enter()
        .append("image")
            .attr("xlink:href", d => d.logo)
            .attr("width", d => z(d.size) * 2)
            .attr("height", d => z(d.size) * 2)
            .attr("x", d => x(d.blobs_count) - z(d.size))
            .attr("y", d => y(d.fee) - z(d.size))
            .attr("clip-path", (d, i) => `url(#clip-${i})`);

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

onMounted(async () => {
    if (!props.series?.data) {
        await getRollups()
    } else {
        rollups.value = prepareRollupsData(props.series.data)
    }

	buildChart(
        chartEl.value.wrapper,
        rollups.value
    )
})
</script>

<template>
    <Flex align="center" direction="column" gap="16" wide :class="$style.wrapper">
        <Flex ref="chartEl" :class="$style.chart" />
    </Flex>
</template>

<style module>
.charts_wrapper {
	flex-wrap: wrap;
}

.wrapper {
	max-width: calc(var(--base-width) + 48px);
}

.section {
	margin-top: 20px;
}

.chart {
    width: 992px;
    height: 400px;

    margin-top: 24px;
}

.axis {
	position: absolute;
	top: 0;
	right: 0;

	&.x {
		bottom: 6px;
		left: 40px;
	}

	&.y {
		bottom: 34px;
		left: 0;
	}
}
</style>