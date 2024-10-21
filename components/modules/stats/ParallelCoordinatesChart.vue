<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Stats Components */
import DiffChip from "@/components/modules/stats/DiffChip.vue"

/** Services */
import { abbreviate, capitilize, comma, formatBytes, sortArrayOfObjects } from "@/services/utils"

/** API */
import { fetchSeries, fetchSeriesCumulative } from "@/services/api/stats"

const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
    metrics: {
        type: Array,
        required: true,
    }
})

const resData = ref([])
const sortedData = ref({})
// const sortedData1 = computed(() => {
//     let res = {}
//     props.metrics.forEach(m => {
//         res[m] = sortArrayOfObjects(resData.value, m)
//     })

//     return res
// })

// console.log('sortedData', sortedData.value);

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

const prepareData = () => {
    let res = []
    let sortRes = {}

    props.data.forEach(d => {
        let row = {}
        props.metrics.forEach(m => {
            row[m] = d[m]
            row.metric = m
            row.slug = d.slug
        })

        res.push(row)
    })

    props.metrics.forEach(m => {
        sortRes[m] = [...props.data].sort((a, b) => a[m] - b[m]) //sortArrayOfObjects(props.data, m)
    })

    resData.value = res
    sortedData.value = sortRes
}

const buildChart = (chart, data) => {
	const height = chart.getBoundingClientRect().height
	const width = chart.getBoundingClientRect().width
    
    const margin = { top: 6, right: 12, bottom: 12, left: 12 }
    innerRadius.value = 60
    outerRadius.value = Math.min(width, height) / 2
    const maxValue = d3.max(data, d => d.value)
    const minValue = +d3.min(data, d => d.value)
    

	/** SVG Container */
	const svg = d3
		.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
        // .append("g")
        //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
    // const yy = d3.scaleLinear()
    //             // .domain( d3.extent(data, function(d) { return +d[m]; }) )
    //             .domain([ 0, data.length + 1 ])
    //             .range([height, 0])
    // console.log('data.length', data.length);
    
    // console.log('yy(3)', yy(3));
    
    
    let y = {}
    props.metrics.forEach(m => {
        // switch (m) {
        //     case 'total_size':
        //         y[m] = d3.scaleLog()
        //             .domain([1, maxFee + maxFee * 0.3])
        //             .range([height + 5, 0])
        //             .base(10)
        //             .nice()
                
        //         break;
        
        //     default:
        //         break;
        // }
        y[m] = d3.scaleLinear()
                // .domain( d3.extent(data, function(d) { return +d[m]; }) )
                .domain([ 0, data.length + 1 ])
                .range([height, 0])
        // y[m] = d3.scaleLog()
        //         .domain( d3.extent(data, function(d) { return +d[m]; }) )
        //         .range([height, 0])
    })

    // for (i in dimensions) {
    //     name = dimensions[i]
    //     y[name] = d3.scaleLinear()
    //     .domain( d3.extent(data, function(d) { return +d[name]; }) )
    //     .range([height, 0])
    // }

    // X scale
    const x = d3.scalePoint()
                .range([0, width])
                .padding(1)
                .domain(props.metrics)
    // const x = d3.scaleBand()
    //     .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
    //     .align(0)                  // This does nothing ?
    //     .domain( data.map(function(d) { return d.name; }) ); // The domain of the X axis is the list of states.

    // const y = d3.scaleLog()
    //     .range([innerRadius.value, outerRadius.value])   // Domain will be define later.
    //     .domain([minValue, maxValue]) // Domain of Y is from 0 to the max seen in the data
    
    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    const path = (d) => {
        // console.log('d', d);        
        
        // console.log('metrics.map', props.metrics.map(m => [x(m), y[m](i)]));
        
        return d3.line()(props.metrics.map(function(m) {
            // console.log('i', i);
            
            // console.log('x(p)', x(m));
            // console.log('y[p]', y[p]);
            // console.log('d[p]', d[p]);
            // console.log('y[p](i)', y[m](i));
            
            let index = sortedData.value[m].findIndex(el => el.slug === d.slug)
            // console.log('m', m);
            // console.log('d.slug', d.slug);
            
            // console.log('sortedData.value[m]', sortedData.value[m]);
            
            // console.log('index', index);            
            // console.log('y[m](index)', y[m](index));
            
            return [x(m), y[m](index)]; }));
    }
    // console.log('x(avg_size)', x('avg_size'));
    // console.log('y["avg_size"](2)', y.avg_size(2));
    
    

    // console.log('data', data);
    
    // console.log('resData()', resData());
    

    // Draw the lines
    svg
        .selectAll("myPath")
        .data(data)
        .enter().append("path")
        .attr("d", path )
        .style("fill", "none")
        .style("stroke", "var(--brand)")
        .style("stroke-width", "6px")
        .style("opacity", 0.5)
    
    
    
    // // Add bars
    // svg.append("g")
    //     .selectAll("path")
    //     .data(data)
    //     .enter()
    //     .append("path")
    //         .attr("fill", "var(--brand)")
    //         .attr("d", d3.arc()     // imagine your doing a part of a donut plot
    //             .innerRadius(innerRadius.value)
    //             .outerRadius(function(d) { return y(d.value); })
    //             .startAngle(function(d) { return x(d.name); })
    //             .endAngle(function(d) { return x(d.name) + x.bandwidth(); })
    //             .padAngle(0.01)
    //             .padRadius(innerRadius.value))
    
      // Draw the axis:
  svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(props.metrics).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")
    
	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

onMounted(() => {
    prepareData()
    console.log('sortedData.value', sortedData.value);
    

    buildChart(chartEl.value.wrapper, resData.value)
    // console.log('props.data', props.data);
    
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
