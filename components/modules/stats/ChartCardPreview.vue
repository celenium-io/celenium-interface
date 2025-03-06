<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Stats Components */
import DiffChip from "@/components/modules/stats/DiffChip.vue"

/** Services */
import { abbreviate, comma, formatBytes, tia } from "@/services/utils"

/** API */
import { fetchSeries, fetchSeriesCumulative, fetchTVS } from "@/services/api/stats"

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

const currentData = ref([])
const prevData = ref([])
const currentTotal = ref(0)
const prevTotal = ref(0)
const dataLoaded = ref(false)
const diff = computed(() => {
	if (!dataLoaded.value) return undefined

	const res = prevTotal.value ? ((currentTotal.value - prevTotal.value) / prevTotal.value) : 1
	return (res * 100).toFixed(1)
})
const chartEl = ref()
const chartElPrev = ref()

const getSeries = async () => {
	let data = []
	let baseTime = DateTime.now().startOf("hour").plus({ seconds: 1 })
	let from = parseInt(
		baseTime.minus({
			days: props.period.timeframe === "day" ? props.period.value * 2 + 1 : 0,
			hours: props.period.timeframe === "hour" ? props.period.value * 2 + 1 : 0,
		}).ts / 1_000
	)
	let to = parseInt(
		baseTime.minus({
			days: props.period.timeframe === "day" ? 1 : 0,
			hours: props.period.timeframe === "hour" ? 1 : 0,
		}).ts / 1_000
	)
	
	if (props.series.aggregate === 'cumulative') {
		data = await fetchSeriesCumulative({
			name: props.series.name,
			period: 'day',
			from: parseInt(
				baseTime.minus({
					months: 2,
				}).ts / 1_000)
		})
	} else if (props.series.name === "tvs") {
		data = (await fetchTVS({
			period: props.period.timeframe,
			from: from,
			to: to,
		})).map(v => { return { time: v.time, value: v.close } }).reverse()
	} else {
		data = (await fetchSeries({
			table: props.series.name,
			period: props.period.timeframe,
			from: from,
			to: to,
		})).reverse()
	}
	
	prevData.value = data.slice(0, props.period.value).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
	currentData.value = data.slice(props.period.value, data.length).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))

	if (props.series.name === 'block_time') {
		prevData.value = prevData.value
			.map(el => {
				return {
					...el,
					value: (el.value / 1_000).toFixed(2)
				}
			})
		currentData.value = currentData.value
			.map(el => {
				return {
					...el,
					value: (el.value / 1_000).toFixed(2)
				}
			})
	}

	if (props.series.name === 'tvs') {
		currentTotal.value = currentData.value[currentData.value.length - 1].value // Math.max(...currentData.value.map(d => d.value))
		prevTotal.value = prevData.value[prevData.value.length - 1].value // Math.max(...prevTotal.value.map(d => d.value))
	} else if (props.series.aggregate !== 'cumulative') {
		currentTotal.value = currentData.value.reduce((sum, el) => {
			return sum + +el.value;
		}, 0);

		prevTotal.value = prevData.value.reduce((sum, el) => {
			return sum + +el.value;
		}, 0);		
	} else {
		currentTotal.value = currentData.value.slice(-1)[0].value
		prevTotal.value = prevData.value.slice(-1)[0].value
	}

	if (props.series.aggregate === 'avg') {
		prevTotal.value = prevTotal.value / prevData.value.length
		currentTotal.value = currentTotal.value / currentData.value.length
	}

	dataLoaded.value = true
}

const buildChart = (chart, data, color) => {
	const width = chart.getBoundingClientRect().width
	const height = chart.getBoundingClientRect().height
	const marginTop = 8
	const marginRight = 12
	const marginBottom = 24
	const marginLeft = 12

	const MAX_VALUE = Math.max(Math.max(...prevData.value.map((s) => s.value)), Math.max(...currentData.value.map((s) => s.value)))
	const MIN_VALUE = Math.min(Math.min(...prevData.value.map((s) => s.value)), Math.min(...currentData.value.map((s) => s.value)))

	/** Scale */
	const x = d3.scaleUtc(
		d3.extent(data, (d) => d.date),
		[marginLeft, width - marginRight],
	)
	const y = d3.scaleLinear([MIN_VALUE, MAX_VALUE], [height - marginBottom - 6, marginTop])
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
		<Flex align="center" direction="column" gap="16" :class="$style.header">
			<Flex align="center" justify="between" wide>
				<Flex align="center" gap="10" justify="start">
					<Text size="14" weight="600" color="secondary"> {{ series.title }} </Text>
					<DiffChip :value="diff" :invert="series.name === 'block_time'" />
				</Flex>

				<NuxtLink v-if="series.page" :to="`/stats/${series.page}${series.aggregate ? '?aggregate=' + series.aggregate : ''}`">
					<Flex align="center">
						<Icon name="expand" size="16" color="tertiary" :class="$style.link" />
					</Flex>
				</NuxtLink>
			</Flex>
			
			<Flex v-if="series.units === 'seconds'" align="end" gap="10" justify="start" wide>
				<Text size="16" weight="600" color="primary"> {{ `~${Math.round(currentTotal)}s` }} </Text>
				<Text size="14" weight="600" color="tertiary"> {{ `~${Math.round(prevTotal)}s previous ${period.title.replace('Last ', '')}` }} </Text>
			</Flex>
			<Flex v-else-if="series.units === 'utia'" align="end" gap="10" justify="start" wide>
				<Text size="16" weight="600" color="primary"> {{ series.name === 'gas_price' ? `${currentTotal.toFixed(4)} UTIA` : `${tia(currentTotal, 2)} TIA` }} </Text>
				<Text size="14" weight="600" color="tertiary"> {{ series.name === 'gas_price' ? `${prevTotal.toFixed(4)} UTIA` : `${tia(prevTotal, 2)} TIA` }} </Text>
			</Flex>
			<Flex v-else-if="series.units === 'usd'" align="end" gap="10" justify="start" wide>
				<Text size="16" weight="600" color="primary"> {{ `${abbreviate(currentTotal)} $` }} </Text>
				<Text size="14" weight="600" color="tertiary"> {{ `${abbreviate(prevTotal)} $` }} </Text>
			</Flex>
			<Flex v-else align="end" gap="10" justify="start" wide>
				<Text size="16" weight="600" color="primary"> {{ series.units === 'bytes' ? formatBytes(currentTotal) : comma(currentTotal) }} </Text>

				<Text
					v-if="series.aggregate === 'cumulative'"
					size="14"
					weight="600"
					color="tertiary"
				>
					{{ `${formatBytes(prevTotal)} previous month` }}
				</Text>
				<Text
					v-else
					size="14"
					weight="600"
					color="tertiary"
				>
					{{ `${series.units === 'bytes' ? formatBytes(prevTotal) : abbreviate(prevTotal)} previous ${period.title.replace('Last ', '')}` }}
				</Text>
				
			</Flex>
		</Flex>

		<Flex :class="$style.chart_wrapper">
			<Flex ref="chartElPrev" wide :class="$style.chart" />
			<Flex ref="chartEl" wide :class="$style.chart" />

			<Flex align="center" justify="between" :class="$style.axis">
				<Text v-if="series.aggregate === 'cumulative'" size="11" weight="600" color="tertiary">
					{{ DateTime.now().minus({
							months: 2,
						}).toFormat("LLL dd")
					}}
				</Text>
				<Text v-else size="11" weight="600" color="tertiary">
					{{ DateTime.now().minus({
							days: period.timeframe === "day" ? period.value : 0,
							hours: period.timeframe === "hour" ? period.value : 0,
						}).toFormat("LLL dd")
					}}
				</Text>

				<Text size="11" weight="600" color="tertiary">
					{{ DateTime.now().minus({
							days: period.timeframe === "day" ? 1 : 0,
							hours: period.timeframe === "hour" ? 1 : 0,
						}).toFormat("LLL dd")
					}}
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

.link:hover {
	fill: var(--txt-secondary)
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
