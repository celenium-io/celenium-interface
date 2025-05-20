<script setup>
/** Vendor */
import * as d3 from "d3"

/** Services */
import { abbreviate, capitilize, formatBytes } from "@/services/utils"

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
})

const router = useRouter()

const resData = ref([])
const total = ref(0)

const prepareRollupsData = () => {
	resData.value = []
	let key = props.series.name
	props.data?.forEach((el) => {
		resData.value.push({
			name: el.name,
			slug: el.slug,
			value: props.series.units === "utia" ? Math.round(el[key], 2) : el[key],
		})
	})

	resData.value.sort((a, b) => b.value - a.value)

	total.value = resData.value.reduce((sum, el) => sum + +el.value, 0)
	let length = resData.value.length
	let totalShare = 0
	resData.value.forEach((el, i) => {
		let share = +((el.value / total.value) * 100).toFixed(0)
		if (i < length - 1 || length === 1) {
			el.share = share
		} else {
			el.share = 100 - totalShare
		}
		totalShare += share
	})

	let startlength = resData.value.length
	resData.value = resData.value.slice(0, Math.min(startlength, 4))

	if (startlength > 4) {
		resData.value.push({
			name: "Other",
			value: total.value - resData.value.reduce((sum, el) => sum + el.value, 0),
			share: 100 - resData.value.reduce((sum, el) => sum + el.share, 0),
		})
	}
}

const chartEl = ref()
const radius = ref(0)
const innerRadius = ref(0)
const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#55c9ab", "#142f28"])).domain([0, 5])

const buildChart = (chart, data) => {
	const { width, height } = chart.getBoundingClientRect()
	radius.value = Math.min(width, height) / 2
	innerRadius.value = props.dounut ? radius.value * 0.6 : 0

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
		.on("touchstart", (event) => event.preventDefault())

	/** Pie chart */
	const pie = d3
		.pie()
		.sort(null)
		.value((d) => d.value)

	const arc = d3
		.arc()
		.outerRadius(radius.value - 10)
		.innerRadius(innerRadius.value)

	const arcOver = d3
		.arc()
		.outerRadius(radius.value - 5)
		.innerRadius(innerRadius.value)

	const g = svg
		.selectAll(".arc")
		.data(pie(data))
		.enter()
		.append("g")
		.attr("class", (d, index) => `arc-${props.series.name}-${index}`)

	g.append("path")
		.style("fill", (d, i) => color(i))
		.transition()
		.duration(1000)
		.attrTween("d", function (d) {
			const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
			return function (t) {
				return arc(i(t))
			}
		})

	/** Events */
	g.on("pointerenter", function (event, d) {
		d3.select(this)
			.select("path")
			.transition()
			.duration(200)
			.attr("d", arcOver)
			.attr("transform", (d) => {
				const [x, y] = arc.centroid(d)
				const dist = 0.05
				return `translate(${x * dist}, ${y * dist})`
			})

		const index = d.index
		d3.selectAll(`.legend-item-${props.series.name}`).classed("dimmed", true)
		d3.select(`.legend-item-${props.series.name}-${index}`).classed("dimmed", false)
	}).on("pointerleave", function (event, d) {
		d3.select(this).select("path").transition().duration(200).attr("d", arc).attr("transform", "translate(0, 0)")

		d3.selectAll(`.legend-item-${props.series.name}`).classed("dimmed", false)
	})

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

const init = () => {
	if (props.data?.length) {
		prepareRollupsData()

		nextTick(() => {
			buildChart(chartEl.value.wrapper, resData.value)
		})

		/** Add listeners for legend items */
		nextTick(() => {
			const legend = d3.selectAll(`.legend-item-${props.series.name}`)
			legend._groups[0].forEach((item, index) => {
				item.addEventListener("pointerenter", () => {
					const arc = d3
						.arc()
						.outerRadius(radius.value - 10)
						.innerRadius(innerRadius.value)
					const arcEl = d3.select(`.arc-${props.series.name}-${index} path`)
					arcEl
						.classed("dimmed", false)
						.transition()
						.duration(200)
						.attr(
							"d",
							d3
								.arc()
								.outerRadius(radius.value - 5)
								.innerRadius(innerRadius.value),
						)
						.attr("transform", (d) => {
							const [x, y] = arc.centroid(d)
							const dist = 0.05
							return `translate(${x * dist}, ${y * dist})`
						})

					d3.selectAll(`.legend-item-${props.series.name}`).classed("dimmed", true)
					item.classList.remove("dimmed")
				})

				item.addEventListener("pointerleave", () => {
					const arc = d3.select(`.arc-${props.series.name}-${index} path`)
					arc.transition()
						.duration(200)
						.attr(
							"d",
							d3
								.arc()
								.outerRadius(radius.value - 10)
								.innerRadius(innerRadius.value),
						)
						.attr("transform", "translate(0, 0)")

					d3.selectAll(`.legend-item-${props.series.name}`).classed("dimmed", false)
				})
			})
		})
	}
}

const handleNavigate = (el) => {
	if (el.slug) {
		router.push(`/rollup/${el.slug}`)
	}
}

onMounted(() => {
	init()
})

watch(
	() => props.data,
	() => {
		init()
	},
)
</script>

<template>
	<Flex v-if="props.data?.length" direction="column" justify="start" gap="8" wide :class="$style.wrapper">
		<Flex align="center" justify="between" wide>
			<Text size="14" weight="600" color="secondary"> {{ `By ${series.title}` }} </Text>

			<NuxtLink v-if="series.page" :to="`/stats/${series.page}${series.aggregate ? '?aggregate=' + series.aggregate : ''}`">
				<Flex align="center">
					<Icon name="bar-chart" size="16" color="tertiary" :class="$style.link" />
				</Flex>
			</NuxtLink>
		</Flex>

		<Flex align="center" justify="between" wide>
			<Flex align="center" direction="column" gap="16" wide :class="$style.legend_wrapper">
				<Flex
					v-for="(el, index) in resData"
					@click="handleNavigate(el)"
					align="center"
					justify="between"
					wide
					:style="{ animationDelay: `${index * 0.1}s` }"
					:class="[
						`legend-item-${series.name}`,
						`legend-item-${series.name}-${index}`,
						{
							[$style.legend_item]: true,
							[$style.fadein]: true,
							[$style.clickable]: el.name !== 'Other',
						},
					]"
				>
					<Flex align="center" justify="start" gap="6">
						<Icon
							v-if="index === 0"
							name="crown"
							size="12"
							:style="{
								marginLeft: '-2px',
								marginRight: '4px',
								fill: color(index),
							}"
						/>
						<div
							v-else
							:class="$style.legend"
							:style="{
								background: color(index),
							}"
						/>

						<Text size="12" weight="600" color="primary"> {{ capitilize(el.name) }} </Text>
					</Flex>

					<Flex align="center" gap="6">
						<Text size="12" weight="500" color="tertiary">
							{{
								series.units === "bytes"
									? formatBytes(el.value)
									: series.units === "utia"
									? abbreviate(el.value) + " TIA"
									: abbreviate(el.value)
							}}
						</Text>

						<Text size="12" weight="500" color="secondary">
							{{ `${el.share > 99 && resData.length > 1 ? 99 : el.share < 1 ? "<1" : el.share.toFixed(0)}%` }}
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex align="center" :class="$style.chart_wrapper">
				<Flex ref="chartEl" :class="$style.chart" />
			</Flex>
		</Flex>
	</Flex>
	<Flex v-else wide :class="$style.wrapper">
		<Flex align="center" justify="center" direction="column" gap="8" wide :class="$style.wrapper">
			<Text size="13" weight="600" color="secondary" align="center"> No data to display </Text>
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

.link {
	transition: fill 0.3s ease;

	&:hover {
		fill: var(--txt-secondary);
	}
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
	width: 155px;
	height: 155px;

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
