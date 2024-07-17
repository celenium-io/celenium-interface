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
	series: {
		type: Object,
		required: true,
	},
    data: {
        type: Array,
        required: true,
    },
    dounut: {
        type: Boolean,
        default: false,
    },
	// period: {
	// 	type: Object,
	// 	required: true,
	// },
})

const resData = ref([])
const total = ref(0)

const prepareRollupsData = () => {
    let key = props.series.name
    props.data.forEach(el => {
        resData.value.push(
            {
                name: el.name,
                value: props.series.units === 'utia' ? Math.round(el[key] / 1_000_000, 0) : el[key],
                share: Math.round(el[`${key}_pct`] * 100, 2),
            }
        )
    })

    resData.value.sort((a, b) => b.value - a.value)
    total.value = resData.value.reduce((sum, el) => sum + el.value, 0)

    let startlength = resData.value.length
    resData.value = resData.value.slice(0, Math.min(startlength, 4))

    if (startlength > 4) {
        resData.value.push({
            name: "Other",
            value: total.value - resData.value.reduce((sum, el) => sum + el.value, 0),
            share: 100 - resData.value.reduce((sum, el) => sum + el.share, 0)
        })
    }
}

const resElCount = computed(() => resData.value.length)
const chartEl = ref()
const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#55c9ab", "#142f28"]))
        .domain([0, 5])

const buildChart = (chart, data) => {
	const height = chart.getBoundingClientRect().height
	const width = chart.getBoundingClientRect().width
	const marginTop = 6
	const marginRight = 12
	const marginBottom = 24
	const marginLeft = 12
    const radius = Math.min(width, height) / 2

	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
		.style("-webkit-tap-highlight-color", "transparent")
		// .on("touchstart", (event) => event.preventDefault())

    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(props.dounut ? radius * 0.6 : 0)

    const g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc")

        // .attr("d", arc)
    g.append("path")
        .style("fill", (d, i) => color(i))
        .transition()
            .duration(1000)
            .attrTween("d", function(d) {
                const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function(t) {
                    return arc(i(t));
                };
            });

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

onMounted(() => {
    prepareRollupsData()

    buildChart(chartEl.value.wrapper, resData.value)
})
</script>

<template>
	<Flex direction="column" justify="start" wide :class="$style.wrapper">
        <Flex align="center" justify="start" wide :class="$style.header">
            <Text size="14" weight="600" color="secondary"> {{ `By ${series.title}` }} </Text>
        </Flex>

		<Flex align="center" justify="between" wide>
            <Flex align="center" direction="column" gap="16" wide :class="$style.legend_wrapper">
                <Flex v-for="(el, index) in resData" align="center" justify="between" wide>
                    <Flex align="center" justify="start" gap="6">
                        <Icon v-if="index === 0"
                            name="crown"
                            size="12"
                            :style="{
                                marginLeft: '-2px',
                                marginRight: '4px',
                                fill: color(index),
                            }"
                        />
                        <div v-else
                            :class="$style.legend"
                            :style="{
                                background: color(index),
                            }"
                        />

                        <Text size="12" weight="600" color="primary"> {{ capitilize(el.name) }} </Text>
                    </Flex>

                    <Flex align="center" gap="6">
                        <Text size="12" weight="500" color="tertiary"> {{ series.units === 'bytes' ? formatBytes(el.value) : abbreviate(el.value) }} </Text>

                        <Text size="12" weight="500" color="secondary"> {{ `${el.share > 99 && resData.length > 1 ? 99 : el.share < 1 ? '<1' : el.share.toFixed(0)}%` }} </Text>
                    </Flex>
                </Flex>
            </Flex>

            <Flex align="center" :class="$style.chart_wrapper">
                <Flex ref="chartEl" :class="$style.chart" />
            </Flex>
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

.header {

}

.legend_wrapper {
    max-width: 55%;
}

.legend {
	width: 10px;
	height: 10px;

	border-radius: 5px;
	cursor: pointer;

	margin-right: 6px;
}

.chart_wrapper {
    width: 160px;
	height: 160px;

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

@media (max-width: 1000px) {
	.wrapper {
		max-width: initial;
		width: 100%;
	}
}
</style>
