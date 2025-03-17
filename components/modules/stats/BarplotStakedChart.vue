<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Services */
import { abbreviate, comma, formatBytes, sortArrayOfObjects, tia, truncateDecimalPart } from "@/services/utils"

const props = defineProps({
	series: {
		type: Object,
		required: true,
	},
})

const chartEl = ref()
const tooltipEl = ref()
const tooltip = ref({
	data: [],
	color: "",
	show: false,
})

const rollupNames = computed(() => {
	let namesSet = new Set(
		sortArrayOfObjects(props.series?.data[0]?.items, props.series?.metric, false)
		.map(item => item.name)
	)
	props.series?.data?.slice(1).forEach(d => {
		d.items.forEach(item => namesSet.add(item.name))
	})

	return [...namesSet]
})

const buildChart = (chart, data) => {
	const { width, height } = chart.getBoundingClientRect()
	const minStackHeight = 4
	const margin = {
		top: minStackHeight * (props.series.itemsCount > 0 ? props.series.itemsCount : rollupNames.value.length),
		right: 30,
		bottom: 20,
		left: 50,
		axisX: 44
	}
	const maxValue = d3.max(data, d => d3.sum(rollupNames.value, key => d[key]))

	/** Scales */
	const x = d3.scaleBand()
		.domain(data.map(d => d.time).reverse())
		.range([margin.left, width - margin.right])
		.padding(0.1)

	const y = d3.scaleLinear(
		[0, maxValue],
		[height - margin.axisX, margin.top]
	)
	let correctionY = data.reduce((acc, { time }) => {
		acc[time] = 0
		return acc
	}, {})
	
	// const colorPalette = [
	// 	"#18d2a5", "#379bff", "#eb5757", "#592121", "#ff5a17",
	// 	"#ff8351", "#e6c525", "#0ade71", "#33a853", "#5856de",
	// 	"#109373", "#1e473d", "#a88132", "#8c52ff", "#ff3377",
	// 	"#007acc", "#b22222", "#2e8b57", "#666666", "#004d40"
	// ]
	// const colorPalette = [
	// 	"#00c78f", "#0077ff", "#ff2d2d", "#8b0000", "#ff4500",
	// 	"#ff6f33", "#ffd700", "#00d455", "#228b22", "#4b32ff",
	// 	"#008066", "#003d29", "#c48c18", "#6a0dad", "#ff0055",
	// 	"#005bb5", "#a40000", "#007a3d", "#333333", "#002b26"
	// ]
	// const colorPalette = [
	// 	"#159f80", "#2f7bbf", "#d43f3f", "#7a2c2c", "#d45920",
	// 	"#d47740", "#c9a320", "#17a65c", "#2a7037", "#4946b3",
	// 	"#1b6a5b", "#0e3d31", "#9b7321", "#5a2c88", "#bf3050",
	// 	"#28558f", "#7a1a1a", "#206645", "#444444", "#1f3330"
	// ]
	// const colorPalette = [
	// 	"#18d2a5", "#379bff", "#eb5757", "#592121", "#ff5a17",
	// 	"#ff8351", "#e6c525", "#0ade71", "#33a853", "#5856de",
	// 	"#18d2a5", "#109373", "#1e473d"
	// ]
	const colorPalette = [
		// "#f4a261", "#2a9d8f", "#e9c46a", "#264653", "#e76f51",
		// "#588157", "#003049",
		// "#005f73",
		// "#005f73", "#0a9396", "#94d2bd", "#e9d8a6", "#ee9b00",
		// "#ca6702", "#bb3e03", "#ae2012", "#9b2226",
		// "#265077", "#022140", "#494B68", "#1E4258", "#2D5F5D",
		"#18d2a5", "#2F6AA0", "#033366", "#5A5D87", "#25647A", "#3A7A78",
		"#2A6B55", "#02402A", "#4A6B52", "#1E5A45", "#2D7A5F",
		// "#", "#", "#", "#", "#",
	]
	// const colorPalette = [
	// 	"#3A9B8F", "#5C6F5F", "#9C8A56", "#B4C575", "#76C7B7", 
	// 	"#F36D3C", "#556C77", "#F1A7A7", "#6B7566", "#8C9A3B", 
	// 	"#D84C64", "#8B4A6A", "#5E3B8C", "#3A8F6C", "#A4AAB0", 
	// 	"#5F5F5F", "#C49C7D", "#FF9F1C", "#88D4D6", "#D1D4D8"
	// ]
	const color = d3.scaleOrdinal()
		.domain(rollupNames.value)
		// .range(colorPalette)
		.range(d3.schemeSet2)

	const stackedData = d3.stack()
		.keys(rollupNames.value)
		(data)
	
	function formatDate(date) {
		if (props.series.timeframe === 'day') {
			return DateTime.fromJSDate(date).toFormat("LLL dd, HH:mm")
		}

		return DateTime.fromJSDate(date).toFormat("LLL dd, yyyy")
	}

	function formatValue(value, decimals) {
		switch (props.series.units) {
			case 'bytes':
				return formatBytes(value, decimals)
			case 'utia':
				return `${tia(value, 2)} TIA`
			case 'seconds':
				return `${truncateDecimalPart(value / 1_000, 3)}s`
			case 'usd':
				return `${abbreviate(value)} $`
			default:
				return comma(value)
		}
	}

	function formatScaleValue(value) {
		if (props.series.units) {
			return formatValue(value, -1)
		}

		return abbreviate(value)
	}

	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;")
		.attr("id", "chart")
		.style("-webkit-tap-highlight-color", "transparent")
		.on("pointerleave", onPointerLeft)

	/** Add axes */
	svg.append("g")
		.attr("transform", `translate(0,0)`)
		.attr("color", "var(--op-20)")
		.call(d3.axisRight(y)
			.ticks(4)
			.tickSize(width)
			.tickFormat(formatScaleValue))
		.call(g => g.select(".domain")
			.remove())
		.call(g => g.selectAll(".tick line")
			.attr("stroke-opacity", 0.7)
			.attr("stroke-dasharray", "10, 10"))
		.call(g => g.selectAll(".tick text")
			.attr("x", 4)
			.attr("dy", -4))

	svg.append("g")
		.attr("transform", `translate(0, ${height - margin.axisX} )`)
		.attr("color", "#ffffff33")
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat(
			props.series.timeframe === 'day'
				? "%H:%M"
				: props.series.timeframe === 'month'
					? "%b %d"
					: "%b"
		)))
		.selectAll("text")
			.attr("transform", "rotate(-45)")
			.attr("x", -10)
			.attr("y", 10)
			.style("text-anchor", "end")

	function onPointerLeft() {
		d3.selectAll("[class^='rect_']").style("opacity", 0.8)
		tooltip.value.show = false
	}

	function mouseover(event, d) {
		const name = d3.select(this.parentNode).datum().key;
		d3.selectAll("[class^='rect_']").style("opacity", 0.2)
		d3.selectAll(`[class='rect_${name}']`).style("opacity", 1)
		let selectedRollup = null
		for (let dr of props.series.data) {
			selectedRollup = dr.items.find(item => item.name === name)
			if (selectedRollup) {
				break;
			}
		}
		nextTick(() => {
			tooltip.value.data = {
				name: name,
				value: formatValue(d.data[name]),
				date: formatDate(d.data.time),
				logo: selectedRollup?.logo,
				color: color(name),
			}
			nextTick(() => {
				let tooltipWidth = tooltipEl.value?.wrapper ? tooltipEl.value?.wrapper?.getBoundingClientRect()?.width : 100
				let tooltipHeight = tooltipEl.value?.wrapper ? tooltipEl.value?.wrapper?.getBoundingClientRect()?.height : 40
				let xPosition = x(d.data.time)
				tooltip.value.x = (xPosition + tooltipWidth) > width - margin.right ? xPosition - tooltipWidth: xPosition + 25
				tooltip.value.y = event.offsetY - tooltipHeight - 10
			})
		})
		tooltip.value.show = true
	}

	/** Draw bars */
	svg.append("g")
		.selectAll("g")
		.data(stackedData)
		.enter().append("g")
			.attr("fill", d => color(d.key))
			.attr("class", d => "rect_" + d.key)
			.selectAll("rect")
			.data(d => d)
			.enter().append("rect")
				.attr("x", d => x(d.data?.time))
				.attr("y", height)
				.attr("height", 0)
				.attr("width", x.bandwidth())
			.on("mouseover", mouseover)
			.transition()
			.duration(800)
			.ease(d3.easeCubicOut)
			.attr("y", d => {
				let height = y(d[0]) - y(d[1])
				if (height > 0 && height < minStackHeight) {
					correctionY[d.data?.time] += minStackHeight - height
				}
				return y(d[1]) - correctionY[d.data.time]
			})
			.attr("height", d => {
				let height = y(d[0]) - y(d[1])
				if (height > 0 && height < minStackHeight) {
					return minStackHeight
				}
				return height
			})

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

const drawChart = () => {
	let data = JSON.parse(JSON.stringify(props.series.data))
	data.forEach(d => {
		d.time = new Date(d.time)
		let items = sortArrayOfObjects(d.items, props.series.metric, false)
		d.items = items.slice(0, Math.min(items.length, props.series.itemsCount > 0 ? props.series.itemsCount : items.length))
	})
	
	let formattedData = data.map(d => {
		const obj = { time: d.time }
		rollupNames.value.forEach(name => {
			let item = d.items.find(item => item.name === name)
			obj[name] = item ? item[props.series.metric] : 0
		})

		return obj
	})

	buildChart(
		chartEl.value.wrapper,
		formattedData,
	)
}

watch(
	() => [props.series.data, props.series.metric, props.series.itemsCount],
	() => {
		if (chartEl?.value?.wrapper) {
			drawChart()
		}
	},
)

onMounted(async () => {
	if (chartEl?.value?.wrapper) {
		drawChart()
	}
})
</script>

<template>
    <Flex direction="column" justify="between" gap="16" wide :class="$style.wrapper">
        <Flex :class="$style.chart_wrapper">
			<Transition name="fastfade">
				<div v-if="tooltip.show" :class="$style.tooltip_wrapper">
					<Flex
						ref="tooltipEl"
						align="center"
						direction="column"
						:style="{ transform: `translate(${tooltip.x}px, ${tooltip.y}px)` }"
						gap="6"
						:class="$style.tooltip"
					>
						<Flex align="center" jsutify="between" gap="8" wide>
							<Flex align="center" gap="8">
								<div v-if="tooltip.data?.logo" :class="$style.avatar_container">
									<img :src="tooltip.data?.logo" :class="$style.avatar_image" />
								</div>

								<Text size="12" weight="500" color="secondary"> {{ tooltip.data.name }} </Text>
							</Flex>

							<Text size="12" weight="500" color="primary"> {{ tooltip.data.value }} </Text>
						</Flex>

						<Flex align="center" justify="end" wide :class="$style.date">
							<Text size="11" weight="500" color="tertiary"> {{ tooltip.data.date }} </Text>
						</Flex>

						<div
							:class="$style.horizontal_divider"
							:style="{background: `linear-gradient(90deg, rgba(10, 222, 113, 0%) 0%, ${tooltip.data.color}, rgba(10, 222, 113, 0%) 100%)`}"
						/>
					</Flex>
				</div>
			</Transition>

            <Flex ref="chartEl" wide :class="$style.chart" />
        </Flex>
    </Flex>
</template>

<style module>
.wrapper {
	height: 800px;

	border-radius: 12px;

	padding: 16px;
}

.chart_wrapper {
	position: relative;

	height: 800px;
}

.chart {
	height: 100%;
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
		min-height: 40px;
		pointer-events: none;
		position: absolute;
		z-index: 10;

		background: var(--card-background);
		border-radius: 6px;
		box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

		padding: 10px 10px 0 10px;

		transition: all 0.2s ease;
	}

	& .horizontal_divider {
		width: 100%;
		height: 2px;
	}
}

.avatar_container {
	position: relative;
	width: 16px;
	height: 16px;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
</style>