<script setup>
/** Vendor */
import * as d3 from "d3"

/** Services */
import { capitalizeAndReplace } from "@/services/utils"

const props = defineProps({
	series: {
		type: Array,
		required: true,
	},
})

const chartEl = ref()
const tooltipEl = ref()
const tooltip = ref({
	data: [],
	show: false,
})

const buildChart = (chart) => {
	const { width } = chart.getBoundingClientRect()

    const radialScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, (width - 160) / 2])
    
    const maxRadius = radialScale(100)
    const ticks = [25, 50, 75, 100]
    const features = Object.keys(props.series?.mainData).filter(k => k !== "name")
    const featureAngles = features.map((f, i) => ({
        feature: f,
        angle: (-Math.PI / 2) + (2 * Math.PI * i / features.length)
    }))
    const legendItems = [
        { name: props.series.mainData?.name || "Main", color: "var(--brand)" }
    ]
    const colors = ["var(--txt-primary)", "var(--blue)", "var(--yellow)", "var(--red)"]
    const baseOpacity = 0.8
    const hoverOpacity = 1

    function angleToCoordinate(angle, value){
        let x = Math.cos(angle) * radialScale(value)
        let y = Math.sin(angle) * radialScale(value)

        return {"x": x, "y": y}
    }
    function getPathCoordinates(data_point){
        const coordinates = []
        for (let i = 0; i < features.length; i++){
            let ft_name = features[i]
            let angle = (-Math.PI / 2) + (2 * Math.PI * i / features.length)
            coordinates.push(angleToCoordinate(angle, data_point[ft_name]))
        }

        return coordinates
    }

    function onPointerMove(event) {
        const [x, y] = d3.pointer(event)
        const cursorAngle = Math.atan2(y, x)
        const cursorDist = Math.sqrt(x * x + y * y)

        if (cursorDist > maxRadius) {
            clearHighlight()
            return
        }

        let closest = null
        let minDiff = Infinity
        for (const { feature, angle } of featureAngles) {
            let diff = Math.abs(cursorAngle - angle)
            if (diff > Math.PI) diff = 2 * Math.PI - diff
            if (diff < minDiff) {
                minDiff = diff
                closest = feature
            }
        }

        if (closest && minDiff < Math.PI / features.length / 2) {
            highlightFeature(closest)

            nextTick(() => {
                tooltip.value.data = [{
                    name: props.series.mainData.name || "Main",
                    value: `${props.series.mainData[closest]}%`,
                    color: "var(--brand)",
                }]
                props.series?.comparisonData?.forEach((data, i) => {
                    if (data[closest] !== undefined) {
                        tooltip.value.data.push({
                            name: data.name || `Set ${i + 1}`,
                            value: `${data[closest]}%`,
                            color: colors[i],
                        })
                    }
                })
                
                nextTick(() => {
                    const tooltipWidth = tooltipEl.value?.wrapper ? tooltipEl.value?.wrapper?.getBoundingClientRect()?.width : 100
                    const offsetX = (cursorAngle < 0 && cursorAngle - 0.5 > -Math.PI / 2) || (cursorAngle > 0 && cursorAngle < Math.PI / 2) ? -(tooltipWidth + 20) : 20
                    const offsetY = -40
                    tooltip.value.x = event.offsetX + offsetX
                    tooltip.value.y = event.offsetY + offsetY
                })
            })
            
            tooltip.value.show = true
        } else {
            clearHighlight()
        }
    }

    function highlightFeature(feature) {
        svg.selectAll("[data-feature]")
            .attr("opacity", function() {
                return d3.select(this).attr("data-feature") === feature
                    ? hoverOpacity
                    : baseOpacity
            })
            .attr("stroke-opacity", function() {
                return d3.select(this).attr("data-feature") === feature
                    ? hoverOpacity
                    : baseOpacity
            })
            .attr("stroke-dasharray", function() {
                return d3.select(this).attr("data-feature") === feature
                    ? "8 8"
                    : "6 6"
            })
        svg.selectAll("circle")
            .transition()
            .duration(150)
            .style("filter", function() {
                const circle = d3.select(this)
                const isActive = circle.attr("data-feature") === feature
                const color = circle.attr("fill")

                return isActive
                ? `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 8px ${color})`
                : "none"
            })
    }

    function clearHighlight() {
        svg.selectAll("[data-feature]")
            .attr("opacity", baseOpacity)
            .attr("stroke-opacity", baseOpacity)
            .attr("stroke-dasharray", "6 6")
        svg.selectAll("circle")
            .transition()
            .duration(150)
            .style("filter", "none")
        
        tooltip.value.show = false
    }

	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", width)
        .attr("viewBox", [-width / 2, -width / 2 + 20, width, width])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;")
		.attr("id", "chart")
		.style("-webkit-tap-highlight-color", "transparent")
		.on("pointerenter pointermove", onPointerMove)
		.on("pointerleave", clearHighlight)
		.on("touchstart", (event) => event.preventDefault())

    ticks.forEach(t =>
        svg.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("fill", "none")
            .attr("stroke", "var(--txt-tertiary)")
            .attr("stroke-width", "1")
            .attr("r", radialScale(t))
            .attr("opacity", 0.5)
    )

    // Draw axis
    for (let i = 0; i < features.length; i++) {
        const angle = (-Math.PI / 2) + (2 * Math.PI * i / features.length)
        const lineCoordinate = angleToCoordinate(angle, 100)
        const labelCoordinate = angleToCoordinate(angle, 116)
        let labelAnchor = "start"
        
        if (angle < 0 && angle > -Math.PI / 4) {
            labelCoordinate.x -= width > 400 ? 16 : 4
        }
        if (angle < 0 && angle < -Math.PI / 3) {
            labelCoordinate.y -= 12
        }

        if (angle > Math.PI / 2) {
            labelAnchor = "end"
        } else if (angle < -Math.PI / 3) {
            labelAnchor = "middle"
        }

        // Draw axis labels and values
        const label = svg.append("text")
            .attr("text-anchor", labelAnchor)
            .attr("x", labelCoordinate.x)
            .attr("y", labelCoordinate.y)
            .attr("font-size", "12px")
            .attr("fill", "var(--txt-secondary)")
            .attr("opacity", baseOpacity)
            .attr("pointer-events", "bounding-box")
            .attr("data-feature", features[i])
            .style("cursor", "default")

        label.append("tspan")
            .text(capitalizeAndReplace(features[i], "_"))
            .attr("x", labelCoordinate.x)

        label.append("tspan")
            .text(`${props.series.mainData[features[i]]}%`)
            .attr("font-size", "12px")
            .attr("fill", "var(--brand)")
            .attr("font-weight", "600")
            .attr("x", labelCoordinate.x)
            .attr("dy", "1.3em")

        // Draw axis line
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", lineCoordinate.x)
            .attr("y2", lineCoordinate.y)
            .attr("stroke-opacity", baseOpacity)
            .attr("stroke", "var(--txt-tertiary)")
            .attr("stroke-width", "1")
            .attr("stroke-dasharray", "6 6")
            .attr("pointer-events", "bounding-box")
            .attr("data-feature", features[i])
            .style("transition", "all 0.3s ease")
    }

    // Draw main dataset
    const mainCoords = getPathCoordinates(props.series.mainData)
    svg.append("path")
        .datum([...mainCoords])
        .attr("d", d3.line()
            .curve(d3.curveCatmullRomClosed)
            .x(d => d.x)
            .y(d => d.y)
        )
        .attr("stroke-width", 2)
        .attr("stroke", "var(--brand)")
        .attr("stroke-opacity", 1)
        .attr("fill", "var(--brand)")
        .attr("fill-opacity", 0.2)
    
    mainCoords.forEach((d, i) => {
        svg.append("circle")
            .attr("r", 4)
            .attr("fill", "var(--brand)")
            .attr("cx", d.x)
            .attr("cy", d.y)
            .attr("opacity", baseOpacity)
            .attr("data-feature", features[i])
    })    

    // Draw datasets for comparison
    props.series?.comparisonData?.forEach((data, i) => {
        const coords = getPathCoordinates(data)
        const color = colors[i]
        legendItems.push({ name: data.name || `Set ${i + 1}`, color})

        svg.append("path")
            .datum([...coords])
            .attr("d", d3.line()
                .curve(d3.curveCatmullRomClosed)
                .x(d => d.x)
                .y(d => d.y)
            )
            .attr("stroke-width", 2)
            .attr("stroke", color)
            .attr("stroke-opacity", 1)
            .attr("fill", color)
            .attr("fill-opacity", 0.2)

        coords.forEach((d, i) => {
            svg.append("circle")
                .attr("r", 4)
                .attr("fill", color)
                .attr("cx", d.x)
                .attr("cy", d.y)
                .attr("opacity", baseOpacity)
                .attr("data-feature", features[i])
       })
    })

    // Draw legend
    const legendSpacing = 22
    const legendGroup = svg.append("g")
        .attr("class", "legend-group")
        .attr("transform", `translate(${-width / 2 + 20}, ${width / 2 - 20})`)

    legendItems.forEach((item, i) => {
        const y = i * legendSpacing

        legendGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", y)
            .attr("r", 6)
            .attr("fill", item.color)
            .attr("opacity", baseOpacity);

        legendGroup.append("text")
            .attr("x", 14)
            .attr("y", y + 1)
            .attr("font-size", "12px")
            .attr("fill", "var(--txt-secondary)")
            .attr("alignment-baseline", "middle")
            .text(item.name)
    })

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

watch(
	() => props.series,
	() => {
        if (chartEl?.value?.wrapper && props.series?.mainData) {
            buildChart(chartEl.value.wrapper)
        }
	},
    { deep: true },
)

onMounted(() => {
	if (chartEl?.value?.wrapper && props.series?.mainData) {
		buildChart(chartEl.value.wrapper)
	}
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex :class="$style.chart_wrapper">
			<Transition name="fastfade">
				<div v-if="tooltip.show" :class="$style.tooltip_wrapper">
					<Flex
                        ref="tooltipEl"
						align="center"
						direction="column"
						:style="{ transform: `translate(${tooltip.x}px, ${tooltip.y}px)` }"
						:class="$style.tooltip"
					>
						<Flex v-for="(d, index) in tooltip.data" align="center" direction="column" wide>
							<Flex align="center" justify="between" gap="20" wide :class="$style.tooltip_data_item">
								<Flex align="center" direction="column" gap="6">
									<Flex align="center" justify="start" wide>
										<Text size="12" weight="500" color="secondary"> {{ d.name }} </Text>
									</Flex>

									<Flex align="center" justify="start" wide>
										<Text size="12" weight="600" color="primary"> {{ d.value }} </Text>
									</Flex>
								</Flex>

								<div
									:class="$style.legend"
									:style="{
										background: d.color,
									}"
								/>
							</Flex>

							<div v-if="index !== tooltip.data.length - 1" :class="$style.horizontal_divider" />
						</Flex>
					</Flex>
				</div>
			</Transition>

			<Flex ref="chartEl" wide :class="$style.chart" />
		</Flex>
	</Flex>
</template>

<style module lang="scss">
.wrapper {
    flex: 1;

    aspect-ratio: 1 / 1;

	border-radius: 12px;
}

.chart_wrapper {
    flex: 1;

	position: relative;
}

.chart {
	position: absolute;
    
	overflow: hidden;

	& svg {
		overflow: visible;
	}
}

.tooltip_wrapper {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	& .tooltip {
		min-width: 100px;
		pointer-events: none;
		position: absolute;
		z-index: 10;

		background: var(--card-background);
		border-radius: 6px;
		box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

		transition: all 0.2s ease;
	}

    & .tooltip_data_item {
		padding: 6px;
    }

	& .legend {
		height: 28px;
		width: 3px;
		border-radius: 8px;
	}

	& .horizontal_divider {
		width: 100%;
		height: 1px;
		background: var(--op-5);
	}
}
</style>
