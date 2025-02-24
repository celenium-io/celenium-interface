<script setup>
/** Vendor */
import * as d3 from "d3"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { isMobile, sortArrayOfObjects } from "@/services/utils"

/** Constants */
import { convertCountryCode, getCountryByCity, getCountryCentroid, getRandomLoaderPath } from "@/services/constants/stats"

/** API */
import { fetchNodeStats } from "@/services/api/stats"

const isLoading = ref(true)
const loaderPath = ref(getRandomLoaderPath())
const geoMap = ref()
const nodeCityData = ref([])
const chartView = ref("countries")
const handleChangeChartView = () => {
	if (chartView.value === "countries") {
		chartView.value = "cities"
	} else {
		chartView.value = "countries"
	}
}

const getNodeStats = async (name) => {
    const data = await fetchNodeStats({ name })

    if (!data.length) return []

    return sortArrayOfObjects(data, "amount")
}

function getCountryByCoordinatesOrCityName(name, lat, lon, geoJSON) {
    const point = [lon, lat]

    for (const feature of geoJSON.features) {
        if (!Number(feature.id) && d3.geoContains(feature, point)) {
            return feature.id
        }
    }

    return getCountryByCity(name)
}

const chartEl = ref()

const buildChart = async (chart) => {
	const { height, width } = chart.getBoundingClientRect()
    const margin = { top: 6, right: 12, bottom: 12, left: 12 }

    // Map and projection
    const projection = d3.geoMercator()
        .center([0, 40]) // GPS of location to zoom on
        .scale(150) // This is like the zoom
        .translate([ width / 2, height / 2 ])
    
    const countryMaxAmount = d3.max(geoMap.value, (d) => +d.amount)
    const countryColor = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#1e473d", "#18d2a5"]))
        .domain([1, countryMaxAmount])
    
    const size = d3.scaleSqrt()
        .domain(d3.extent(nodeCityData.value, d => +d.amount))
        .range([4, 20])
    
    const path =  d3.geoPath().projection(projection)
    let zoomScale = 1

	/** SVG Container */
	const svg = d3
		.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
        // .attr("transform", `translate(${width / 2}, ${height / 2 + 10})`)

    // Tooltip | We wrap the SVG with a container that has the html element above it
    const container = document.createElement("div")
    container.innerHTML = `
        <style>
            .tooltip {
                font-size: 13px;
                background: var(--card-background);
                pointer-events: none;
                border-radius: 6px;
                box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);
                padding: 4px 8px 4px 8px;
                position: absolute;
                top: 10px;
                left: 10px;
                z-index: 1;
                display: none;
            }
        </style>
        <div class="tooltip"></div>
    `
    container.appendChild(svg.node())
    document.body.appendChild(container)

    // Three function that change the tooltip when user hover / move / leave a cell
    const tooltip = container.querySelector(".tooltip")
    const mouseover = function(d) {
        tooltip.style.opacity = 1
    }
    const mousemove = function(event, d) {
        const { pageX, pageY } = event
        tooltip.style.display = "block";
        tooltip.style.left = `${pageX + 10}px`
        tooltip.style.top = `${pageY - 20}px`

        if (chartView.value === "countries") {
            tooltip.innerHTML = `
                <div class="flex items-center gap--8">
                    <span style="color: var(--txt-secondary);">${d.properties.name}:</span>
                    <span style="color: var(--txt-primary);">${d.amount}</span>
                </div>
            `
        } else if (chartView.value === "cities") {
            let hoverCities = []
            if (zoomScale > 4) {
                const { x, y } = d
                const r = size(+d.amount) / (zoomScale * 1.1)

                cities.each(c => {
                    const x1 = c.x
                    const y1 = c.y
                    const r1 = size(+c.amount) / (zoomScale * 1.1)

                    const distance = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2)
                    
                    if (distance < r + r1) {
                        hoverCities.push(c)
                    }
                })
            } else {
                hoverCities.push(d)
            }
            
            let tooltipContent = sortArrayOfObjects(hoverCities, "amount", false).map(c => {
                return `
                    <div class="flex items-center gap--8">
                        <span style="color: var(--txt-secondary);">${c.name}:</span>
                        <span style="color: var(--txt-primary);">${c.amount}</span>
                    </div>
                `
            }).join('')
            tooltip.innerHTML = tooltipContent
        }
    }
    const mouseleave = function(event, d) {
        tooltip.style.opacity = 0
    }

    // Main container
    const g = svg.append("g")

    // Draw the map
    const map = g.append("g")
        .selectAll("path")
        .data(geoMap.value)
        .enter()
        .append("path")
        .attr("stroke", "var(--geo-map)")
        .attr("stroke-width", 1)
        .attr("fill", "transparent")
        .attr("d", d3.geoPath()
            .projection(projection)
        )

    let cities
    if (chartView.value === "countries") {
        map
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke", "var(--brand)")
                    .attr("stroke-width", 2 / zoomScale)
                d3.select(this).raise()
                mouseover(event, d)
            })
            .on("mousemove", mousemove)
            .on("mouseleave", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke", "var(--geo-map)")
                    .attr("stroke-width", 1 / zoomScale)
                d3.select(this).lower()
                mouseleave(event, d)
            })
        
        map
            .transition()
            .duration(700)
            .attr("fill", d => chartView.value === "countries"
                ? d.amount
                    ? countryColor(+d.amount)
                    : "transparent"
                : "transparent")
    } else if (chartView.value === "cities") {
        const lostCities = geoMap.value
            .filter(c => c.amountLostCities > 0)
            .map(c => {
                const centroid = getCountryCentroid(c.id)
                let coords
                if (centroid) {
                    coords = projection([+centroid[0], +centroid[1]])
                } else {
                    coords = path.centroid(c.geometry)
                }
                return {
                    name: `Somewhere in ${c.properties.name}`,
                    amount: c.amountLostCities,
                    x: coords[0],
                    y: coords[1],
                }
            })
        nodeCityData.value = nodeCityData.value.map(c => {
            const coords = projection([+c.latitude, +c.longitude])
            return {
                ...c,
                x: coords[0],
                y: coords[1],
            }
        })
        const citiesData = [...nodeCityData.value, ...lostCities]

        cities = g.append("g")
            .selectAll("cities")
            .data(citiesData)
            .enter()
            .append("circle")
                .attr("transform", d => `translate(${d.x}, ${d.y})`)
                // .attr("r", d => size(d.amount))
                .attr("r", 0)
                .style("fill", "var(--brand)")
                .attr("fill-opacity", 0)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
        cities.transition()
            .delay((d, i) => i * 3)
            .duration(500)
            .attr("r", d => size(+d.amount))
            .attr("fill-opacity", 0.7)
    }

    // Legend
    const legend = {
        width: 220,
        height: 10,
        marginBottom: 40,
        marginRight: 150,
        marginLeft: 40,
    }
    
    function legendCitiesX(i) {
        let x = legend.marginLeft

        if (!i) return x
        
        for (let ind = 0; ind < i; ind++) {
            x = x + size(legendValues[ind]) * 2 + 30
        }
        x = x - size(legendValues[0]) + size(legendValues[i])

        return x
    }

    let legendValues = []
    let legendGroup, legendCitiesMarkers, legendCitiesLabels
    if (!isMobile()) {
        if (chartView.value === "countries") {
            legendGroup = svg
                .append("g")
                .attr("transform", `translate(${legend.marginLeft}, ${height - legend.marginBottom})`)
                .style("opacity", 0)
            const defs = svg.append("defs")
            const linearGradient = defs.append("linearGradient")
                .attr("id", "legend-gradient")
                .attr("x1", "0%")
                .attr("x2", "100%")
                .attr("y1", "0%")
                .attr("y2", "0%")
            
            legendValues = [1, 25, 50, 100, countryMaxAmount]
            legendValues.forEach((d, i, arr) => {
                linearGradient.append("stop")
                    .attr("offset", `${(i / (arr.length - 1)) * 100}%`)
                    .attr("stop-color", countryColor(d))
            })
            
            legendGroup.append("rect")
                .attr("x", 0)
                .attr("y", 10)
                .attr("width", legend.width)
                .attr("height", legend.height)
                .style("fill", "url(#legend-gradient)")
            
            const legendScale = d3.scaleLinear()
                .domain([1, countryMaxAmount])
                .range([1, legend.width])

            const legendAxis = d3.axisBottom(legendScale)
                .tickValues(legendValues)
                .tickFormat(d3.format("d"))

            legendGroup.append("g")
                .attr("transform", `translate(0, ${legend.marginBottom - 20})`)
                .call(legendAxis)
                .attr("color", "var(--txt-tertiary)")
            
            legendGroup
                .transition()
                .duration(1_000)
                .style("opacity", 1)
                
        } else if (chartView.value === "cities") {
            legendValues = [1, 25, 100]
            legendCitiesMarkers = svg.append("g")
                .selectAll("legendCircles")
                .data(legendValues)
                .enter()
                .append("circle")
                    .attr("cx", (d, i) => legendCitiesX(i))
                    .attr("cy", d => height - legend.marginBottom + 20 - size(+d))
                    .attr("r", d => size(+d))
                    .style("fill", "var(--brand)")
                    .attr("fill-opacity", 0)
            legendCitiesMarkers
                .transition()
                .duration(1_000)
                .attr("fill-opacity", 0.7)

            legendCitiesLabels = svg.append("g")
                .selectAll("legendLabels")
                .data(legendValues)
                .enter()
                .append("text")
                    .attr('x', (d, i) => legendCitiesX(i))
                    .attr('y', height - legend.marginBottom + 15 + size(legendValues.pop()))
                    .text(d => d)
                    .style("font-size", 12)
                    // .style("fill", "var(--txt-secondary)")
                    .style("fill", "var(--txt-tertiary)")
                    .attr('text-anchor', 'middle')
                    .attr("fill-opacity", 0)
            legendCitiesLabels
                .transition()
                .duration(1_000)
                .attr("fill-opacity", 1)
        }
    }

    // Add zoom functionality
    const bounds = d3.geoPath().projection(projection).bounds({ type: "FeatureCollection", features: geoMap.value })
    const [[x0, y0], [x1, y1]] = bounds
    const zoom = d3.zoom()
        .scaleExtent([1, 20])
        .translateExtent([[x0, y0], [x1, y1]])
        .on("zoom", (event) => {
            zoomScale = event.transform.k
            g.attr("transform", event.transform)
            map.attr("stroke-width", 1 / zoomScale)
            if (chartView.value === "countries" && legendValues.length) {
                if (zoomScale > 3) {
                    legendGroup
                        .transition()
                        .duration(1_000)
                        .style("opacity", 0)
                } else {
                    legendGroup
                        .transition()
                        .duration(1_000)
                        .style("opacity", 1)
                }
            } else if (chartView.value === "cities") {
                if (zoomScale > 1) {
                    cities.attr("r", d => size(+d.amount) / (zoomScale * 1.1))
                    if (legendValues.length) {
                        if (zoomScale > 3) {
                            legendCitiesMarkers
                                .transition()
                                .duration(1_000)
                                .attr("fill-opacity", 0)
                            legendCitiesLabels
                                .transition()
                                .duration(1_000)
                                .attr("fill-opacity", 0)
                        } else {
                            legendCitiesMarkers
                                .transition()
                                .duration(1_000)
                                .attr("fill-opacity", 0.7)
                            legendCitiesLabels
                                .transition()
                                .duration(1_000)
                                .attr("fill-opacity", 1)
                        }
                    }
                } else {
                    cities.attr("r", d => size(+d.amount))
                }
            }
        })

    svg.call(zoom);

    svg.on("wheel", (event) => event.preventDefault(), { passive: false })

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

onMounted( async () => {
    isLoading.value = true
    try {
        const geoData = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        // const geoData = await d3.json("https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson")
        if (geoData?.features.length) {
            geoMap.value = geoData.features.filter(d => d.properties.name !== "Antarctica")
            const countryData = await getNodeStats("country")
            const cityData = (await getNodeStats("city")).filter(el => el.latitude)

            nodeCityData.value = Object.values(cityData.reduce((acc, obj) => {
                if (!acc[obj.name]) {
                    acc[obj.name] = { ...obj }
                } else {
                    acc[obj.name].amount += obj.amount
                }
                return acc
            }, {}))

            nodeCityData.value.forEach(c => {
                c.country = getCountryByCoordinatesOrCityName(c.name, c.latitude, c.longitude, geoData)
            })        

            const amountCityMap = nodeCityData.value.reduce((acc, { country, amount }) => {
                if (acc[country]) {
                    acc[country] += amount;
                } else {
                    acc[country] = amount;
                }

                return acc
                }, {})
            
            const amountCountryMap = Object.fromEntries(
                countryData.map(d => {
                    const name = convertCountryCode(d.name)
                    return name ? [name, d.amount] : null
                })
                .filter(Boolean)
            )
            
            geoMap.value = geoMap.value.map(feature => ({
                ...feature,
                amount: amountCountryMap[feature.id] || 0,
                amountLostCities: (amountCountryMap[feature.id] || 0) - (amountCityMap[feature.id] || 0),
            }))
            
            
            await buildChart(chartEl.value.wrapper)
        }
    } finally {
        isLoading.value = false
    }
})

watch(
    () => chartView.value,
    async () => {
        await buildChart(chartEl.value.wrapper)
    }
)
</script>

<template>
	<Flex direction="column" justify="start" gap="8" wide :class="$style.wrapper">
        <Flex
            @click="handleChangeChartView"
            align="center"
            gap="12"
            :class="$style.chart_selector"
            :style="{
                background: `linear-gradient(to ${chartView === 'countries' ? 'right' : 'left'}, var(--op-5) 50%, transparent 50%)`,
            }"
        >
            <Icon
                name="earth"
                size="14"
                :style="{ fill: `${chartView === 'countries' ? 'var(--mint)' : 'var(--txt-tertiary)'}` }"
            />

            <Icon
                name="city"
                size="14"
                :style="{ fill: `${chartView === 'cities' ? 'var(--mint)' : 'var(--txt-tertiary)'}` }"
            />
        </Flex>

        <Tooltip v-if="chartView === 'cities'" position="start" :class="$style.chart_info">
            <Icon name="info" size="16" color="tertiary" />

            <template #content>
                <Flex align="center" gap="2" :style="{ width: '200px' }">
                    <Text size="12" weight="600" color="secondary">
                        Somewhere in..
                        <Text size="12" weight="400" color="secondary">
                            means that it was not possible to determine the exact location.
                        </Text>
                    </Text>
                    
                </Flex>
            </template>
        </Tooltip>
        
        <Flex ref="chartEl" :class="$style.chart" />

        <Flex v-if="isLoading" align="center" direction="column" gap="8" :class="$style.loader">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 512 512">
                <path id="france-path" fill="transparent" :d="loaderPath"/>
            </svg>

            <Text size="12" color="secondary">Loading map..</Text>
        </Flex>
	</Flex>
</template>

<style module>
.wrapper {
    width: 100%;
	height: 100%;

    position: relative;
}

.chart {
    width: 100%;
	height: 100%;

	overflow: hidden;

	& svg {
		overflow: visible;
        /* display: block; */
	}
}

.chart_selector {
    width: 52px;
    position: absolute;
    top: 8px;
	right: 8px;

	padding: 4px 6px;
	box-shadow: inset 0 0 0 1px var(--op-10);
	border-radius: 5px;
	cursor: pointer;
	transition: all 1s ease-in-out;
}

.chart_info {
    position: absolute;
    top: 8px;
	left: 8px;
}

.loader{
    position: absolute;
    top: 30%;
    right: 50%;
    animation: blink 1s ease-in-out infinite;

    path {
        stroke: var(--txt-secondary);
        stroke-width: 5;
        stroke-dasharray: 1800;
        stroke-dashoffset: 1800;
        animation: drawPath 2s linear infinite;
    }
}

/* .france_icon circle {
    fill: var(--brand);
    box-shadow: 0 0 0 4px var(--dark-mint);
    animation: movePoint 2s linear infinite, blink 1s ease-in-out infinite;
    offset-path: path('M283.4 19.83c-3.2 0-31.2 5.09-31.2 5.09c-1.3 41.61-30.4 78.48-90.3 84.88l-12.8-23.07l-25.1 2.48l11.3 60.09l-113.79-4.9l12.2 41.5C156.3 225.4 150.7 338.4 124 439.4c47 53 141.8 47.8 186 43.1c3.1-62.2 52.4-64.5 135.9-32.2c11.3-17.6 18.8-36 44.6-50.7l-46.6-139.5l-27.5 6.2c11-21.1 32.2-49.9 50.4-63.4l15.6-86.9c-88.6-6.3-146.4-46.36-199-96.17');
    offset-distance: 103%;
} */

@keyframes drawPath {
    to {
        stroke-dashoffset: 0;
    }
}

/* @keyframes movePoint {
    0% {
        offset-distance: 0%;
        transform: translate(0, 0);
    }
    100% {
        offset-distance: 103%;
        transform: translate(0, 0);
    }
} */

@keyframes blink {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
    }
    100% {
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
