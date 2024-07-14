<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Stats Components */
import DiffChip from "@/components/modules/stats/DiffChip.vue"

/** Services */
import { abbreviate, comma, formatBytes } from "@/services/utils"

/** API */
import { fetchSeries } from "@/services/api/stats"

const props = defineProps({
	series: {
		type: Object,
		required: true,
	},
	period: {
		type: Object,
		required: true,
	},
})

// console.log('props.series', props.series);
// console.log('props.period', props.period);

const currentData = ref([])
const prevData = ref([])
const currentTotal = ref(0)
const prevTotal = ref(0)
const diff = computed(() => {
	if (!prevTotal.value) return undefined

	return (((currentTotal.value - prevTotal.value) / prevTotal.value) * 100).toFixed(1)
})
const chartEl = ref()
const chartElPrev = ref()

const getSeries = async () => {
	const data = (await fetchSeries({
		table: props.series.name,
		period: props.period.timeframe,
		from: parseInt(
			DateTime.now().minus({
				days: props.period.timeframe === "day" ? props.period.value * 2 : 0,
				hours: props.period.timeframe === "hour" ? props.period.value * 2 : 0,
			}).ts / 1_000)
	})).reverse()
	
	prevData.value = data.slice(0, props.period.value).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
	currentData.value = data.slice(props.period.value, data.length).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))

	currentTotal.value = currentData.value.reduce((sum, el) => {
		return sum + el.value;
	}, 0);

	prevTotal.value = prevData.value.reduce((sum, el) => {
		return sum + el.value;
	}, 0);
}

const buildChart = (chart, data, color) => {
	const width = chart.getBoundingClientRect().width
	const height = chart.getBoundingClientRect().height
	const marginTop = 6
	const marginRight = 12
	const marginBottom = 24
	const marginLeft = 12

	const MAX_VALUE = Math.max(Math.max(...prevData.value.map((s) => s.value)), Math.max(...currentData.value.map((s) => s.value)))

	/** Scale */
	const x = d3.scaleUtc(
		d3.extent(data, (d) => d.date),
		[marginLeft, width - marginRight],
	)
	const y = d3.scaleLinear([0, MAX_VALUE], [height - marginBottom - 6, marginTop])
	const line = d3
		.line()
		.x((d) => x(d.date))
		.y((d) => y(d.value))
		.curve(d3.curveCatmullRom)

	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;")
		.style("-webkit-tap-highlight-color", "transparent")
		// .on("touchstart", (event) => event.preventDefault())

	/** Default Horizontal Lines  */
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-5)")
		.attr("stroke-width", 1)
		.attr("d", `M${0},${0} L${width},${0}`)
	
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-5)")
		.attr("stroke-width", 1)
		.attr("d", `M${0},${(height - marginBottom - 6) / 2} L${width},${(height - marginBottom - 6) / 2}`)

	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-5)")
		.attr("stroke-width", 1)
		.attr("d", `M${0},${height - marginBottom - 6} L${width},${height - marginBottom - 6}`)
	
	/** Chart Lines */
	const path = svg.append("path")
		.attr("fill", "none")
		.attr("stroke", color)
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(data.filter((item) => item.value !== null)))

	// svg.append("path")
	// 	.attr("fill", "none")
	// 	.attr("stroke", "transparent")
	// 	.attr("stroke-width", 2)
	// 	.attr("stroke-linecap", "round")
	// 	.attr("stroke-linejoin", "round")
	// 	.attr("d", line(data.filter((item) => item.value === null).map((item) => ({ ...item, value: 0 }))))

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())

	const totalLength = path.node().getTotalLength();

	path.attr("stroke-dasharray", `${totalLength} ${totalLength}`)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(1_000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
}

const drawChart = async () => {
	await getSeries()

	buildChart(chartEl.value.wrapper, currentData.value, "var(--mint)")
	buildChart(chartElPrev.value.wrapper, prevData.value, "var(--txt-tertiary)")
}

onMounted(async () => {
	await drawChart()
})

watch(
	() => props.period,
	async () => {
		await drawChart()
	},
)

</script>

<template>
	<Flex direction="column" justify="between" gap="16" wide :class="$style.wrapper">
		<Flex align="center" direction="column" gap="12" :class="$style.header">
			<Flex align="center" gap="10" justify="start" wide>
				<Text size="14" weight="600" color="secondary"> {{ series.title }} </Text>
				<DiffChip :value="diff" />
			</Flex>
			
			<Flex align="center" gap="10" justify="start" wide>
				<Text size="16" weight="600" color="primary"> {{ series.units === 'bytes' ? formatBytes(currentTotal) : comma(currentTotal) }} </Text>
				<Text size="14" weight="600" color="tertiary"> {{ `${series.units === 'bytes' ? formatBytes(prevTotal) : abbreviate(prevTotal)} previous period` }} </Text>
			</Flex>
		</Flex>

		<Flex :class="$style.chart_wrapper">
			<Flex ref="chartElPrev" wide :class="$style.chart" />
			<Flex ref="chartEl" wide :class="$style.chart" />

			<Flex align="center" justify="between" :class="$style.axis">
				<Text size="11" weight="600" color="tertiary">
					{{ DateTime.now().minus({
							days: period.timeframe === "day" ? period.value : 0,
							hours: period.timeframe === "hour" ? period.value : 0,
						}).toFormat("LLL dd")
					}}
				</Text>

				<Text size="11" weight="600" color="tertiary">
					Today
				</Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 280px;

	background: var(--card-background);
	border-radius: 12px;

	padding: 16px;
}

.header {

}

.chart_wrapper {
	position: relative;

	height: 180px;
}

.chart {
	height: 100%;
	position: absolute;

	overflow: hidden;

	& svg {
		overflow: visible;
	}
}

.axis {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;

	/* border-top: 2px solid var(--op-5);

	padding-top: 8px; */
}

@media (max-width: 1000px) {
	.wrapper {
		max-width: initial;
		width: 100%;
	}
}
</style>
