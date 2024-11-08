<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Services */
import { abbreviate, formatBytes } from "@/services/utils"

/** API */
import { fetchRollups } from "@/services/api/rollup.js"

const props = defineProps({
	data: {
		type: Array,
		required: true,
	},
})

const chartEl = ref()
const tooltip = ref({
	data: [],
	show: false,
})

const isLoading = ref(false)
const rollups = ref()

const getRollups = async () => {
	isLoading.value = true

	const data = await fetchRollups({
        limit: 30,
    })

    rollups.value = prepareRollupsData(data)

    isLoading.value = false
}

const prepareRollupsData = (data) => {
    data.forEach(r => {
        if (!r.feeUpdated) {
            r.feeUpdated = +(r.fee / 1_000_000).toFixed(2)
        }
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

    const minBlobsCount = d3.min(data, d => d.blobs_count)
    const maxBlobsCount = d3.max(data, d => d.blobs_count)
    const minFee = d3.min(data, d => d.feeUpdated)
    const maxFee = d3.max(data, d => d.feeUpdated)
    const maxSize = d3.max(data, d => d.size)
    const minSize = d3.min(data, d => d.size)
    const midSize = maxSize / 2

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
        .range([ 15, 70 ]);
    
    const x = d3.scaleLog()
        .domain([minBlobsCount, maxBlobsCount + maxBlobsCount * 0.1])
        .range([marginLeft, width -  z(maxSize) / 2 - 5])
        .base(10)
        .nice()
    
    const yDomain = [1, maxFee + maxFee * 0.3]
    const y = d3.scaleLog()
        .domain(yDomain)
        .range([height + 5, z(maxSize) / 2])
        .base(10)
        .nice()
    
    function generateAxisData(axis, startExp) {
        let data = []
        let exponent = startExp

        while (true) {
            let value = Math.pow(10, exponent)
            

            if (axis === 'x') {
                if (x(value) < width) {
                    data.push(value)
                    exponent = exponent + 2
                } else {
                    break
                }
            } else if (axis === 'y') {
                data.push(value)
                if (y(value) > 0) {
                    exponent++
                } else {
                    break
                }
            } else {
                break
            }
        }

        return data
    }
    const yAxisData = generateAxisData('y', 1)
    const xAxisData = generateAxisData('x', Math.floor(Math.log10(minBlobsCount)))

    // Add axes:
    // svg.append("g")
    //     .attr("transform", "translate(0," + (height - 20) + ")")
    //     .attr("color", "var(--op-20)")
    //     .call(d3.axisBottom(x).ticks(2).tickFormat(d3.format(".2s")))
    svg.append("line")
            .attr("x1", marginLeft - 0.5)
            .attr("x2", width - 0.5)
            .attr("y1", height - 15)
            .attr("y2", height - 15)
            .attr("stroke", "var(--op-20)")

    xAxisData.forEach((xValue) => {
        let xPos = x(xValue)

        svg.append("line")
            .attr("x1", xPos)
            .attr("x2", xPos)
            .attr("y1", height - 14.5)
            .attr("y2", height - 10)
            .attr("stroke", "var(--op-20)")
        
        svg.append("text")
            .attr("x", xPos)
            .attr("y", height)
            .attr("fill", "var(--op-20)")
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .text(abbreviate(xValue))
    })

    svg.append("line")
            .attr("x1", width - 1)
            .attr("x2", width - 1)
            .attr("y1", height - 14.5)
            .attr("y2", height - 10)
            .attr("stroke", "var(--op-20)")


    
    yAxisData.forEach((yValue) => {
        let yPos = y(yValue)

        svg.append("line")
            .attr("x1", marginLeft)
            .attr("x2", width)
            .attr("y1", yPos)
            .attr("y2", yPos)
            .attr("stroke", "var(--op-20)")
            .attr("stroke-dasharray", "10 10")
        
        svg.append("text")
            .attr("x", marginLeft)
            .attr("y", yPos - 5)
            .attr("fill", "var(--op-20)")
            .attr("font-size", "10px")
            .attr("text-anchor", "start")
            .text(abbreviate(yValue))
    })

    // Add axis labels:
    svg.append("text")
        .attr("fill", "var(--op-20)")
        .attr("font-size", "14px")
        .attr("text-anchor", "end")
        .attr("x", 130)
        .attr("y", height)
        .text("Blobs count");

    svg.append("text")
        .attr("fill", "var(--op-20)")
        .attr("font-size", "14px")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("x", -275)
        .attr("y", 27)
        .text("Fee paid (TIA)")

    // Size legend
    let size = d3.scaleSqrt()
        .domain([minSize, maxSize / 2])
        .range([ 10, 35 ])
    
    let legendValues = [500 * 1_024 * 1_024, midSize * 0.5, maxSize / 2]
    let xCircle = width - 50
    let xLabel = width - 150
    let yCircle = height - 30
    svg
        .selectAll("legend")
        .data(legendValues)
        .enter()
        .append("circle")
            .attr("cx", xCircle)
            .attr("cy", function(d){ return yCircle - size(d) } )
            .attr("r", function(d){ return size(d) })
            .style("fill", "none")
            .attr("stroke", "var(--op-20)")

    svg
        .selectAll("legend")
        .data(legendValues)
        .enter()
        .append("line")
            .attr("x1", function(d){ return xCircle - size(d) } )
            .attr("x2", xLabel)
            .attr("y1", function(d, i){ return yCircle - size(d) + (i === 0 ? 5 : i === 2 ? -7 : 0) } )
            .attr("y2", function(d, i){ return yCircle - size(d) + (i === 0 ? 5 : i === 2 ? -7 : 0) } )
            .attr("stroke", "var(--op-20)")
            .style("stroke-dasharray", ("2, 2"))

    svg.selectAll("legend")
        .data(legendValues)
        .enter()
        .append("text")
            .attr('x', xLabel)
            .attr('y', function(d, i){ return yCircle - size(d) - 5 + (i === 0 ? 5 : i === 2 ? -7 : 0) } )
            .text( function(d, i){ return i === 0 ? '<' + formatBytes(d, 0) : formatBytes(d, 0) } )
            .style("font-size", 10)
            .style("fill", "var(--op-20)")
            .attr('alignment-baseline', 'middle')
    
    // Tooltip
    function onPointerEnter(event, rollup) {
        const element = document.getElementById(event.target.id)
        element.style.filter = "brightness(100%)"

        if (!tooltip.value.data.length) {
            tooltip.value.x = x(rollup.blobs_count)
            tooltip.value.y = y(rollup.feeUpdated)
            tooltip.value.r = z(rollup.size)
            tooltip.value.data.push(rollup)
            tooltip.value.show = true
        }
    }

    function onPointerLeave() {
        const element = document.getElementById(event.target.id)
        element.style.filter = "brightness(60%)"

        tooltip.value.data = []
        tooltip.value.show = false
    }

    const calculateY = (d) => {
        let cy = y(d.feeUpdated)                
        if (cy > height - 30) {
            return height - 30 - 1
        }

        return cy
    }
    // Draw chart
    const defs = svg.append("defs")
    data.forEach((d, i) => {
        defs.append("clipPath")
            .attr("id", `clip-${i}`)
        .append("circle")
            .attr("cx", x(d.blobs_count))
            .attr("cy", calculateY(d))
            .attr("r", 0)
            .transition()
            .duration(1_500)
            .attr("r", z(d.size))
        })
    
    const circles = svg.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", d => x(d.blobs_count))
            .attr("cy", d => {
                let cy = y(d.feeUpdated)                
                if (cy > height - 30) {
                    return height - 30 - 1
                }

                return cy
            })
            .attr("r", 0)
            .attr("stroke", "var(--op-20)")
            .attr("stroke-width", 1)
            .attr("fill", "none")
            .transition()
            .duration(1_500)
            .attr("r", d => z(d.size))

    svg.append('g')
        .selectAll("image")
        .data(data)
        .enter()
        .append("image")
            .attr("xlink:href", d => d.logo)
            .attr("id", d => d.id)
            .attr("width", d => z(d.size) * 2)
            .attr("height", d => z(d.size) * 2)
            .attr("x", d => x(d.blobs_count) - z(d.size))
            .attr("y", d => {
                let cy = y(d.feeUpdated)
                if (cy > height - 30) {
                    return height - 30 - z(d.size) - 1
                }

                return cy - z(d.size)
            })
            .attr("clip-path", (d, i) => `url(#clip-${i})`)
            .style("filter", "brightness(60%)")
            .attr("class", "transition_all")
            .on("pointerenter", (d, rollup) => onPointerEnter(d, rollup))
            .on("pointerleave", onPointerLeave)

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

onMounted(async () => {
    if (!props.data) {
        await getRollups()
    } else {
        rollups.value = prepareRollupsData(props.data)
    }

	buildChart(chartEl.value.wrapper, rollups.value)
})

watch(
	() => props.data,
	() => {
        rollups.value = prepareRollupsData(props.data)

        buildChart(chartEl.value.wrapper, rollups.value)
	}
)

</script>

<template>
    <Flex align="center" direction="column" gap="16" wide :class="$style.wrapper">
        <Transition name="fastfade">
            <div v-if="tooltip.show" :class="$style.tooltip_wrapper">
                <Flex
                    align="center"
                    direction="column"
                    :style="{ transform: `translate(${tooltip.x + 24 + (0.5 * tooltip.r)}px, ${tooltip.y + 150 - tooltip.r}px)` }"
                    gap="12"
                    :class="$style.tooltip"
                >
                    <Flex
                        v-for="(d, index) in tooltip.data"
                        align="center"
                        direction="column"
                        wide
                        gap="12"
                    >
                        <Flex align="center" justify="start" wide>
                            <Text size="12" weight="600" color="primary"> {{ d.name }} </Text>
                        </Flex>

                        <Flex align="center" justify="between" wide gap="12">
                            <Text size="12" color="tertiary"> Size </Text>
                            <Text size="12" color="secondary"> {{ formatBytes(d.size) }} </Text>
                        </Flex>

                        <Flex align="center" justify="between" wide gap="12">
                            <Text size="12" color="tertiary"> Blobs </Text>
                            <Text size="12" color="secondary"> {{ abbreviate(d.blobs_count) }} </Text>
                        </Flex>

                        <Flex align="center" justify="between" wide gap="12">
                            <Text size="12" color="tertiary"> Fee Paid </Text>
                            <Text size="12" color="secondary"> {{ `${abbreviate(d.feeUpdated)} TIA` }} </Text>
                        </Flex>
                    </Flex>
                </Flex>
            </div>
        </Transition>
        
        <Flex ref="chartEl" :class="$style.chart" />
    </Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);
}

.chart {
    width: 992px;
    height: 400px;

    margin-top: 24px;
}

.tooltip_wrapper {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
    pointer-events: none;

	& .tooltip {
		min-width: 150px;
		pointer-events: none;
		position: absolute;
		z-index: 10;

		background: var(--card-background);
		border-radius: 6px;
		box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

		padding: 10px;

		transition: all 0.2s ease;
	}

	& .legend {
		height: 34px;
		width: 3px;
		border-radius: 8px;
	}

	& .horizontal_divider {
		width: 100%;
		height: 1px;
		background: var(--op-5);
	}
}

@media (max-width: 1050px) {
    .chart {
        width: 100%;
        height: 400px;

        margin-top: 24px;
    }
}

</style>