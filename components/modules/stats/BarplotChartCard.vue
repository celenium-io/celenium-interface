<script setup>
/** Vendor */
import * as d3 from "d3"

const props = defineProps({
	series: {
		type: Object,
		required: true,
	},
    data: {
        type: Array,
        required: true,
    },
})

const chartEl = ref()
const tooltipEl = ref()
const tooltip = ref({
    show: false,
})
const labels = ref(props.data.map(d => d.name))

const buildChart = (chart) => {
	const { height, width } = chart.getBoundingClientRect()
    const margin = { top: 6, right: 12, bottom: 42, left: 12 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom
    const maxAmount = d3.max(props.data.map(d => d.amount))    

    const x = d3.scaleBand()
        .range([ 0, chartWidth ])
        .domain(labels.value)
        .padding(0.3)

    const y = d3.scaleLinear()
        .domain([0, maxAmount])
        .range([ chartHeight, 0])
    
    const onPointerMoved = function (event) {
        tooltip.value.show = true

        const index = Math.round((d3.pointer(event)[0] - x.step() / 2) / x.step());
        const idx = Math.max(0, Math.min(index, labels.value.length - 1));

        const elements = document.querySelectorAll(`[metric=${props.series.name}]`)
		elements.forEach(el => {
			if (+el.getAttribute('id') === idx) {
				el.style.filter = "brightness(1.2)"
			} else {
				el.style.filter = "brightness(0.6)"
			}
		})

        const value = props.data[idx]
        let xPos = x(value.name) + x.bandwidth() / 2
        let yPos = y(value.amount) - 5
        if (tooltipEl.value) {
            if (xPos + tooltipEl.value.wrapper.getBoundingClientRect().width > chartWidth) {
                xPos = x(value.name) - tooltipEl.value.wrapper.getBoundingClientRect().width + x.bandwidth() / 2
            }

            yPos = y(value.amount) - tooltipEl.value.wrapper.getBoundingClientRect().height - 5
        }
		tooltip.value.x = xPos
		tooltip.value.y = yPos
        tooltip.value.amount = value.amount
    }

    const onPointerLeft = function (event, d) {
        const elements = document.querySelectorAll(`[metric=${props.series.name}]`)
		elements.forEach(el => {
            el.style.filter = "brightness(1)"
		})

        tooltip.value.show = false
    }

	/** SVG Container */
    const svg = d3
		.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .on("pointerenter pointermove", onPointerMoved)
            .on("pointerleave", onPointerLeft)
            .on("touchstart", (event) => event.preventDefault())

    // Add axises        
    svg.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .attr("color", "var(--op-20)")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("id", (d, i) => i)
            .attr("metric", props.series.name)
            .attr("color", "var(--txt-primary)")
            .attr("font-size", "12")
            .attr("transform", "translate(-10, 4) rotate(-60)")
            .style("text-anchor", "end")
            .style("transition", "all 0.3s ease-in-out")
    
    svg.append("g")
        .attr("color", "var(--op-20)")
        .call(d3.axisLeft(y))

    // Bars
    svg.selectAll("bar")
        .data(props.data)
        .enter()
        .append("rect")
            .attr("id", (d, i) => i)
            .attr("metric", props.series.name)
            .attr("x", d => x(d.name))
            .attr("width", x.bandwidth())
            .attr("fill", "var(--brand)")
            .attr("height", d => chartHeight - y(0))
            .attr("y", d => y(0))

    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", d => y(d.amount))
        .attr("height", d => chartHeight - y(d.amount))
        .delay((d, i) => i * 100)
        .on("end", () => d3.select(this).style("transition", "all 0.3s ease-in-out"))

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

onMounted(() => {
    buildChart(chartEl.value.wrapper)
})
</script>

<template>
	<Flex direction="column" justify="start" gap="8" wide :class="$style.wrapper">
        <Flex align="center" justify="start" wide>
            <Text size="14" weight="600" color="secondary"> {{ `By ${series.title}` }} </Text>
        </Flex>

        <Flex align="center" :class="$style.chart_wrapper">
            <Transition name="fastfade">
				<div v-if="tooltip.show" :class="$style.tooltip_wrapper">
					<Flex
                        ref="tooltipEl"
						align="center"
						justify="between"
						:style="{ transform: `translate(${tooltip.x}px, ${tooltip.y}px)` }"
						gap="8"
						:class="$style.tooltip"
					>
                        <Text size="12" weight="500" color="secondary"> Amount: </Text>
                        <Text size="12" weight="600" color="primary"> {{ tooltip.amount }} </Text>
                    </Flex>
				</div>
			</Transition>

            <Flex ref="chartEl" :class="$style.chart" />
        </Flex>
	</Flex>
</template>

<style module>
.wrapper {
    width: 100%;
	height: 100%;

	background: var(--card-background);
	border-radius: 12px;

	padding: 16px;
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

.clickable {
    cursor: pointer;
}

.chart_wrapper {
    width: 100%;
	height: 100%;

	position: relative;
}

.chart {
    width: 100%;
	height: 100%;
	position: absolute;

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

.loading {
	animation: loading 1s ease infinite;
}

.tooltip_wrapper {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	& .tooltip {
		min-width: 50px;
        height: 22px;
		pointer-events: none;
		position: absolute;
		z-index: 10;

		background: var(--card-background);
		border-radius: 4px;
		box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

		padding: 0 6px;

		transition: all 0.2s ease;
	}
}

@keyframes loading {
	0% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}

	100% {
		opacity: 1;
	}
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
