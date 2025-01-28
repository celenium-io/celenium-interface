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

const chartEl = ref()
const innerRadius = ref(0)
const outerRadius = ref(0)
const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#55c9ab", "#142f28"]))
        .domain([0, 5])

const buildChart = async (chart, data) => {
	// const height = chart.getBoundingClientRect().height
	// const width = chart.getBoundingClientRect().width
    const height = 600
	const width = 1_000
    const margin = { top: 6, right: 12, bottom: 12, left: 12 }

    // const maxValue = d3.max(data, d => d.value)
    // const minValue = +d3.min(data, d => d.value)
    
	/** SVG Container */
	const svg = d3
		.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
        // .attr("transform", `translate(${width / 2}, ${height / 2 + 10})`)

    // Map and projection
    const projection = d3.geoMercator()
        .center([0, 40])                // GPS of location to zoom on
        .scale(150)                     // This is like the zoom
        .translate([ width / 2, height / 2 ])
    
    // d3.queue()
    //     .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
    //     .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_gpsLocSurfer.csv") // Position of circles
    //     .await(ready);

    // Load external data and boot
    const geoMap = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    const geoData = await d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_gpsLocSurfer.csv")

    const allContinent = d3.map(geoData, function(d){return(d.homecontinent)}).keys()
    const color = d3.scaleOrdinal()
        .domain(allContinent)
        .range(d3.schemePaired);
    
    // Filter data
    // const fData = geoData?.features.filter( function(d){return d.properties.name=="France"} )

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(geoMap.features.filter(d => d.properties.name !== "Antarctica"))
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "var(--txt-secondary)")
        .style("opacity", .3)
    
    // svg.append("g")
    //     .selectAll("path")
    //     .data(geoData.features)
    //     .enter()
    //     .append("path")
    //     .attr("fill", "green")
    //     .attr("d", d3.geoPath()
    //         .projection(projection)
    //     )
    //     .style("stroke", "white")
    //     .style("opacity", .3)
    
	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

onMounted( async () => {
    await buildChart(chartEl.value.wrapper, props.data)
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

	overflow: hidden;

	& svg {
		overflow: visible;
	}
}

@media (max-width: 1000px) {
	.wrapper {
		max-width: initial;
		width: 100%;
	}
}
</style>
