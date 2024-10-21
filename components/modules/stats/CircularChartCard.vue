<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Stats Components */
import DiffChip from "@/components/modules/stats/DiffChip.vue"

/** Services */
import { abbreviate, capitilize, comma, formatBytes } from "@/services/utils"

/** API */
import { fetchSeries, fetchSeriesCumulative } from "@/services/api/stats"

const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
})

const resData = ref([])
const total = ref(0)

// const prepareRollupsData = () => {
//     props.data.forEach(el => {
//         resData.value.push({
//             name: el.name,
//             value: el.throughput,
//         })
//     })

    // console.log('resData', resData.value);
    
    // let key = props.series.name
    // props.data.forEach(el => {
    //     resData.value.push(
    //         {
    //             name: el.name,
    //             value: props.series.units === 'utia' ? Math.round(el[key], 2) : el[key],
    //             share: Math.round(el[`${key}_pct`] * 100, 2),
    //         }
    //     )
    // })

    // resData.value.sort((a, b) => b.value - a.value)
    // total.value = resData.value.reduce((sum, el) => sum + el.value, 0)

    // let startlength = resData.value.length
    // resData.value = resData.value.slice(0, Math.min(startlength, 4))

    // if (startlength > 4) {
    //     resData.value.push({
    //         name: "Other",
    //         value: total.value - resData.value.reduce((sum, el) => sum + el.value, 0),
    //         share: 100 - resData.value.reduce((sum, el) => sum + el.share, 0),
    //     })
    // }
// }

const chartEl = ref()
const innerRadius = ref(0)
const outerRadius = ref(0)
const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#55c9ab", "#142f28"]))
        .domain([0, 5])

const buildChart = (chart, data) => {
	const height = chart.getBoundingClientRect().height
    // console.log('height', height);
    
	const width = chart.getBoundingClientRect().width
    // console.log('width', width);
    
    const margin = { top: 6, right: 12, bottom: 12, left: 12 }
    innerRadius.value = 60
    outerRadius.value = Math.min(width, height) / 2
    const maxValue = d3.max(data, d => d.value)
    const minValue = +d3.min(data, d => d.value)
    
    // console.log('outerRadius.value', outerRadius.value);
    

	/** SVG Container */
	const svg = d3
		.create("svg")
            .attr("width", width)
            .attr("height", height)
            // .attr("width", width + margin.left + margin.right)
            // .attr("height", height + margin.top + margin.bottom)
            .attr("viewBox", [0, 0, width, height])
		// .attr("preserveAspectRatio", "none")
		// .attr("style", "max-width: 100%;")
        .attr("transform", `translate(${width / 2}, ${height / 2 + 10})`)
		// .style("-webkit-tap-highlight-color", "transparent")
		// .on("touchstart", (event) => event.preventDefault())

    // X scale
    const x = d3.scaleBand()
        .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0)                  // This does nothing ?
        .domain( data.map(function(d) { return d.name; }) ); // The domain of the X axis is the list of states.

    // Y scale
    // const y = d3.scaleRadial()
    //     .range([innerRadius.value, outerRadius.value])   // Domain will be define later.
    //     .domain([minValue * 1.2, maxValue]) // Domain of Y is from 0 to the max seen in the data
    const y = d3.scaleLog()
        .range([innerRadius.value, outerRadius.value])   // Domain will be define later.
        .domain([minValue, maxValue]) // Domain of Y is from 0 to the max seen in the data

    // console.log('y(12332)', y(960));
    // console.log('x(Eclipse)', x('B3'));
    
    
    // Add bars
    svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
            .attr("fill", "var(--brand)")
            .attr("d", d3.arc()     // imagine your doing a part of a donut plot
                .innerRadius(innerRadius.value)
                .outerRadius(function(d) { return y(d.value); })
                .startAngle(function(d) { return x(d.name); })
                .endAngle(function(d) { return x(d.name) + x.bandwidth(); })
                .padAngle(0.01)
                .padRadius(innerRadius.value))
    
	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

onMounted(() => {
    buildChart(chartEl.value.wrapper, props.data)
})
</script>

<template>
	<Flex direction="column" justify="start" gap="8" wide :class="$style.wrapper">
        <Flex ref="chartEl" :class="$style.chart" />
	</Flex>
</template>

<style module>
.wrapper {
    width: 100%;
	height: 100%;

	/* background: var(--card-background); */
	/* border-radius: 12px; */

	/* padding: 16px; */
}

.legend_wrapper {
    max-width: 55%;
}

.legend_item {
    transition: all 0.6s ease;
}

.legend {
	width: 10px;
	height: 10px;

	border-radius: 5px;
	cursor: pointer;

	margin-right: 6px;
}

.chart_wrapper {
    width: 155px;
	height: 155px;

	position: relative;
}

.chart {
    width: 100%;
	height: 100%;
	/* position: absolute; */

	overflow: hidden;

	& svg {
		overflow: visible;
	}
}

.fadein {
    opacity: 0;
    animation-name: fadeIn;
    animation-duration: 1s;
    animation-fill-mode: forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@media (max-width: 1000px) {
	.wrapper {
		max-width: initial;
		width: 100%;
	}
}
</style>
