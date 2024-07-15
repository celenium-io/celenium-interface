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
    const marginLeft = 10;
    const barWidth = Math.round((width - marginLeft - marginRight) / (transformedData.value.length) - 1)

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;");

    const stack = d3.stack()
        .keys(keys.value)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const series = stack(transformedData.value);

    const x = d3.scaleUtc()
        .domain(d3.extent(transformedData.value, d => new Date(d.time)))
        .range([marginLeft, width])
        // .nice();

    const y1Max = d3.max(series, y => d3.max(y, d => d[1]));
    const y = d3.scaleLinear()
        .domain([0, y1Max])
        .range([height - marginBottom, marginTop]);

    // const color = d3.scaleOrdinal()
    //     .domain(keys.value)
    //     .range(["#65efcc", "#0E3F34"]);

    const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#65efcc", "#142f28"]))
        .domain([0, keys.value.length])
        // .interpolator(d3.interpolateRgb("#CC6510", "#65efcc"))
        // .interpolator(d3.interpolateRgb("#0E3F34", "#65efcc"));

    // Add x-scale
    // svg.append("g")
    //     .attr("transform", `translate(0,${height})`)
    //     .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%Y-%m-%d")));

    svg.append("g")
    const rect = svg.selectAll(".series")
        .data(series)
        .join("g")
        .attr("fill", (d, i) => color(i))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(new Date(d.data.time)))
        .attr("y", height - marginBottom)
        .attr("width", barWidth)
        .attr("height", 0)

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat(() => ""));
    
    // y.domain([0, y1Max]);

    rect.transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .transition()
        .attr("x", d => x(new Date(d.data.time)))
        .attr("width", barWidth)
            
    if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

const transformedData = ref([])
const keys = ref([])

const getSquareSizes = async () => {
	const data = await fetchSquareSize()

    keys.value = Object.keys(data);

    let maxLength = 0;
    let maxKey = null;

    for (const key in data) {
        if (data[key].length > maxLength) {
            maxLength = data[key].length;
            maxKey = key;
        }
    }

    const templateArray = data[maxKey];
    const templateTimes = templateArray.map(item => item.time);
    const filledData = {};
    for (const key in data) {
        filledData[key] = templateTimes.map(time => {
            const found = data[key].find(item => item.time === time);
            return found ? found : { time: time, value: "0" };
        });
    }

    filledData[maxKey].forEach((d, i) => {
        let entry = { time: d.time };
        keys.value.forEach(key => {
            entry[key] = +filledData[key][i].value;
        });
        transformedData.value.push(entry);
    });

    transformedData.value.reverse()
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