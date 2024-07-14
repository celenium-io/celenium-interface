<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** API */
import { fetchSquareSize } from "@/services/api/stats"

const chartEl = ref()

const buildChart = (chart) => {
	const width = chart.getBoundingClientRect().width
	const height = chart.getBoundingClientRect().height
    const marginTop = 0;
    const marginRight = 0;
    const marginBottom = 10;
    const marginLeft = 0;
    const barWidth = Math.round((width - marginLeft - marginRight) / (xz.value.length) - 10)

    // console.log('n.value1', n.value);
    const y01z = d3.stack()
        .keys(d3.range(n.value))
        (d3.transpose(yz.value)) // stacked yz
        .map((data, i) => data.map(([y0, y1]) => [y0, y1, i]));

    const yMax = d3.max(yz.value, y => d3.max(y));
    const y1Max = d3.max(y01z, y => d3.max(y, d => d[1]));

    // const x = d3.scaleBand()
    //     .domain(xz.value)
    //     .rangeRound([marginLeft, width - marginRight])
    //     .padding(0.08);

    const x = d3.scaleUtc()
        .domain(d3.extent(xz.value))
        .range([marginLeft, width - marginRight])
        .nice()
    
    const y = d3.scaleLinear()
        .domain([0, y1Max])
        .range([height - marginBottom, marginTop]);

    // const color = d3.scaleSequential(d3.interpolateBlues)
    //     .domain([-0.5 * n, 1.5 * n]);
    const color = d3.scaleSequential()
        .domain([-1 * n.value, 1 * n.value])
        .interpolator(d3.interpolateRgb("#18D2A5", "#0E3F34"));

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;");

    const rect = svg.selectAll("g")
        .data(y01z)
        .join("g")
        .attr("fill", (d, i) => color(i))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        // .attr("x", (d, i) => x(i))
        .attr("x", d => x(new Date(d)))
        .attr("y", height - marginBottom)
        // .attr("width", x.bandwidth())
        .attr("width", barWidth)
        .attr("height", 0);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat(() => ""));
    
    y.domain([0, y1Max]);

    rect.transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .transition()
        // .attr("x", (d, i) => x(i))
        // .attr("x", d => x(new Date(d)))
        // .attr("width", x.bandwidth())
        .attr("width", barWidth)

    if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

const n = ref(5) //computed(() => xz.value.length)
const m = 5
const xz = ref([]) // dates
// xz.value = d3.range(m)
// console.log('xz.value', xz.value);
const yz = ref([])

const getSquareSizes = async () => {
	const data = await fetchSquareSize()

    xz.value = []
    xz.value = data[32].reverse().map(item => DateTime.fromISO(item.time).toJSDate())
    // console.log(data);
    // xz.value = data[32].reverse().map((item, i) => i)
    console.log(xz.value);

    yz.value = []
    // Object.keys(data).forEach(k => {
    //     let total = data[k].reduce((sum, el) => {
    //         return sum + el.value
    //     }, 0)

    //     data[k].forEach(el => {

    //     })
    // })

    Object.keys(data).forEach((k, i) => {
        yz.value[i] = []
        data[k].reverse().forEach(el => {
            yz.value[i].push(el.value)
        })
    })
    n.value = yz.value.length
    // console.log(data);
    // console.log('yz.value', yz.value);
}
// yz.value = d3.range(n).map(() => bumps(m)) // the y-values of each of the n series
// console.log('yz.value', yz.value);

function bumps(m) {
    const values = [];

    // Initialize with uniform random values in [0.1, 0.2).
    for (let i = 0; i < m; ++i) {
        values[i] = 0.1 + 0.1 * Math.random();
    }

    // Add five random bumps.
    for (let j = 0; j < 5; ++j) {
        const x = 1 / (0.1 + Math.random());
        const y = 2 * Math.random() - 0.5;
        const z = 10 / (0.1 + Math.random());
        for (let i = 0; i < m; i++) {
            const w = (i / m - y) * z;
            values[i] += x * Math.exp(-w * w);
        }
    }

    // Ensure all values are positive.
    for (let i = 0; i < m; ++i) {
        values[i] = Math.max(0, values[i]);
    }

    return values;
}

onMounted(async () => {
    await getSquareSizes()

	buildChart(chartEl.value.wrapper)
})


</script>

<template>
    <Flex ref="chartEl" wide :class="$style.chart" />
    <!-- <Flex ref="chartEl" wide /> -->
</template>

<style module>
.chart {
    width: 1000px;
    height: 500px;
}
</style>