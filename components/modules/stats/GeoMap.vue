<script setup>
/** Vendor */
import * as d3 from "d3"
import { geoCentroid } from "d3-geo"
import { DateTime } from "luxon"

/** Stats Components */
import DiffChip from "@/components/modules/stats/DiffChip.vue"

/** Services */
import { convertCountryCode } from "@/services/constants/mapping"
import { abbreviate, capitilize, comma, formatBytes, sortArrayOfObjects } from "@/services/utils"

/** API */
import { fetchNodeStats } from "@/services/api/stats"

const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
})

const isLoading = ref(false)
const geoMap = ref()
const nodeCityData = ref([])
const nodeCountryData = ref([])

const getNodeStats = async (name) => {
    isLoading.value = true
    try {
        const data = await fetchNodeStats({ name })

        if (!data.length) return []

        // res = sortArrayOfObjects(data, "amount") //.filter(el => el.latitude)
        
        return sortArrayOfObjects(data, "amount")
    } finally {
        isLoading.value = false
    }
}


const chartEl = ref()
// const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#55c9ab", "#142f28"]))
//         .domain([0, 5])

const buildChart = async (chart) => {
	const { height, width } = chart.getBoundingClientRect()
    const margin = { top: 6, right: 12, bottom: 12, left: 12 }

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
    
    const countryMaxAmount = d3.max(geoMap.value, (d) => +d.amount)
    const countryMinAmount = d3.min(geoMap.value, (d) => +d.amount)

    const countryColor = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["var(--dark-mint)", "var(--mint)"]))
        .domain([countryMinAmount, countryMaxAmount])
    
    const colorScale = d3.scaleThreshold()
        .domain([1, 10, 100, 200, 300])
        .range(d3.schemeBlues[5]);
    
    const size = d3.scaleSqrt()
        .domain(d3.extent(nodeCityData.value, d => +d.amount))
        .range([ 4, 20])

    const path =  d3.geoPath().projection(projection)
    console.log('path.centroid("AFG")', path.centroid("AFG"));
    
    
    // Main container
    const g = svg.append("g")
    // Draw the map
    const map = g.append("g")
        .selectAll("path")
        .data(geoMap.value)
        .enter()
        .append("path")
        .attr("fill", d => d.amount ? colorScale(+d.amount) : "none")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "var(--geo-map)")
        .attr("stroke-width", 1)
    
    // Add circles:
    const circles = g.append("g")
        .selectAll("myCircles")
        .data(nodeCityData.value)
        .enter()
        .append("circle")
            // .attr("cx", d => projection([+d.longitude, +d.latitude])[0])
            // .attr("cy", d => projection([+d.longitude, +d.latitude])[1])
            .attr("cx", d => projection([+d.longitude, +d.latitude])[0])
            .attr("cy", d => projection([+d.longitude, +d.latitude])[1])
            // .attr("r", "5px")
            .attr("r", d => size(d.amount))
            .style("fill", "var(--brand)")
            // .style("fill", "none")
            // .attr("stroke", function(d){ if(d.n>2000){return "black"}else{return "none"}  })
            // .attr("stroke-width", 1)
            .attr("fill-opacity", .7)
    
    const centerCircles = g.append("g")
        .selectAll("centerCircles")
        .data(geoMap.value)
        .enter()
        .append("circle")
            .attr("transform", function(d) {
                let coords = path.centroid(d.geometry);

                return `translate(${coords[0]}, ${coords[1]})`
            })
            .attr("r", "2px")
            .attr("fill", "red")
    
    const bounds = d3.geoPath().projection(projection).bounds({ type: "FeatureCollection", features: geoMap.value })
    const [[x0, y0], [x1, y1]] = bounds

    // Add zoom functionality
    const zoom = d3.zoom()
        .scaleExtent([1, 200])
        .translateExtent([[x0, y0], [x1, y1]])
        .on("zoom", (event) => {
            g.attr("transform", event.transform)
            circles.attr("r", d => size(d.amount) / (event.transform.k * 1.5))
            map.attr("stroke-width", 1 / event.transform.k)
        })

    svg.call(zoom);

    svg.on("wheel", (event) => event.preventDefault(), { passive: false });

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

onMounted( async () => {
    const geoData = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    if (geoData?.features.length) {
        geoMap.value = geoData.features.filter(d => d.properties.name !== "Antarctica")
        const countryData = await getNodeStats("country")
        const amountMap = Object.fromEntries(
            countryData.map(d => {
                const name = convertCountryCode(d.name)
                return name ? [name, d.amount] : null
            })
            .filter(Boolean)
        )
        
        geoMap.value = geoMap.value.map(feature => ({
            ...feature,
            amount: amountMap[feature.id] || 0
        }))
        
        //geoContains

        nodeCityData.value = (await getNodeStats("city")).filter(el => el.latitude)
        console.log('nodeCityData.value', nodeCityData.value);

        console.log('geoMap.value', geoMap.value);
        
        
        
        await buildChart(chartEl.value.wrapper)
        // console.log('nodeCountryData.value', nodeCountryData.value);
    }
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
