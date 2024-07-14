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
    console.log(series);

    // Создаем временную шкалу
    const x = d3.scaleUtc()
        .domain(d3.extent(transformedData.value, d => new Date(d.time)))
        .range([marginLeft, width])
        // .nice();

    // Создаем линейную шкалу для значений
    // const y = d3.scaleLinear()
    //     .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
    //     .range([height, 0]);

    const y1Max = d3.max(series, y => d3.max(y, d => d[1]));
    const y = d3.scaleLinear()
        .domain([0, y1Max])
        .range([height - marginBottom, marginTop]);

    // const color = d3.scaleOrdinal()
    //     .domain(keys.value)
    //     .range(["#65efcc", "#0E3F34"]);

    // const color = d3.scaleSequential(d3.interpolateGnBu)
    //     .domain([-1, 40])
    
    const color = d3.scaleSequential()
        .domain([-0.5 * keys.value.length, 1.5 * keys.value.length])
        .interpolator(d3.interpolateRgb("#0E3F34", "#65efcc"));

    // Добавляем ось x
    // svg.append("g")
    //     .attr("transform", `translate(0,${height})`)
    //     .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%Y-%m-%d")));

    // Добавляем ось y
    svg.append("g")
    const rect = svg.selectAll(".series")
        .data(series)
        .join("g")
        .attr("fill", (d, i) => color(i))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(new Date(d.data.time)))
        // .attr("y", d => y(d[1]))
        .attr("y", height - marginBottom)
        // .attr("height", d => y(d[0]) - y(d[1]))
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

const n = ref(5) //computed(() => xz.value.length)
const m = 5
const xz = ref([]) // dates
// xz.value = d3.range(m)
// console.log('xz.value', xz.value);
const yz = ref([])

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
    // keys.value.forEach(key => {
    //     console.log(key);
    //     data["1"].forEach((d, i) => {
    //         console.log(data[key][i]);
    //         if (d.time !== data[key][i].time) {
    //             console.log(d.time, data[key][i].time);
    //             data[key].splice(i, 0, { time: d.time, value: "0" })
    //         }
    //     })
    // })

    filledData[maxKey].forEach((d, i) => {
        let entry = { time: d.time };
        keys.value.forEach(key => {
            entry[key] = +filledData[key][i].value;
        });
        transformedData.value.push(entry);
    });

    transformedData.value.reverse()
    // console.log('keys.value', keys.value);
    // console.log('transformedData.value', transformedData.value);

    // xz.value = []
    // xz.value = data[32].reverse().map(item => DateTime.fromISO(item.time).toJSDate())

    // console.log(data);
    // xz.value = data[32].reverse().map((item, i) => i)
    // console.log(xz.value);

    // yz.value = []

    // Object.keys(data).forEach(k => {
    //     let total = data[k].reduce((sum, el) => {
    //         return sum + el.value
    //     }, 0)

    //     data[k].forEach(el => {

    //     })
    // })

    // Object.keys(data).forEach((k, i) => {
    //     yz.value[i] = []
    //     data[k].reverse().forEach(el => {
    //         yz.value[i].push(el.value)
    //     })
    // })
    // n.value = yz.value.length

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