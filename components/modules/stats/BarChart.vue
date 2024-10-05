<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Services */
import { abbreviate, comma, formatBytes, tia, truncateDecimalPart } from "@/services/utils"

const props = defineProps({
	series: {
		type: Object,
		required: true,
	},
})

const currentData = computed(() => { return {data: props.series.currentData}})
const prevData = computed(() => { 
	let data = []
	props.series.prevData?.forEach((d, index) => {
		data.push({
			date: currentData.value.data[index].date,
			realDate: d.date,
			value: d.value,
		})
	})
	return { data: data }
})

const chartEl = ref()
const tooltip = ref({
	data: [],
	show: false,
})

const buildChart = (chart, cData, pData, onEnter, onLeave) => {
	const width = chart.getBoundingClientRect().width
	const height = chart.getBoundingClientRect().height
	const marginTop = 12
	const marginRight = 12
	const marginBottom = 24
	const marginLeft = 36
	const marginAxisX = 20
	const barWidth = Math.round(Math.max((width - marginLeft - marginRight) / (cData.data.length) - (pData.data.length ? 2 : 5)), 4)

	const MIN_VALUE = d3.min([...cData.data.map(s => s.value), ...pData.data?.map(s => s.value)])
	const MAX_VALUE = d3.max([...cData.data.map(s => s.value), ...pData.data?.map(s => s.value)])

	/** Scales */
	const x0 = d3.scaleUtc(
		d3.extent(cData.data, (d) => new Date(d.date)),
		[marginLeft, width - marginRight - barWidth],
	)

	const x1 = d3.scaleBand(
		['prev', 'current'],
		[0, barWidth],
	)

	let data = cData.data.map((d, i) => ({
		date: new Date(d.date),
		value: d.value,
		color: cData.color,
		group: 'current',
		index: i,
	}))
	if (pData.data.length) {
		data = data.concat(pData.data.map((d, i) => ({
			date: new Date(d.date),
			realDate: new Date(d.realDate),
			value: d.value,
			color: pData.color,
			group: 'prev',
			index: i,
		})))
	}

	const y = d3.scaleLinear([MIN_VALUE, MAX_VALUE], [height - marginBottom, marginTop])
	
	function formatDate(date) {
		if (props.series.timeframe === 'hour') {
			return DateTime.fromJSDate(date).toFormat("LLL dd, HH:mm")
		}

		return DateTime.fromJSDate(date).toFormat("LLL dd, yyyy")
	}

	function formatValue(value) {
		switch (props.series.units) {
			case 'bytes':
				return formatBytes(value)
			case 'utia':
				if (props.series.name === 'gas_price') {
					return `${truncateDecimalPart(value, 4)} UTIA`
				}

				return `${tia(value, 2)} TIA`
			case 'seconds':
				return `${truncateDecimalPart(value / 1_000, 1)}s`
			default:
				return comma(value)
		}
	}

	function formatScaleValue(value) {
		if (props.series.units) {
			return formatValue(value)
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
		.on("pointerenter pointermove", onPointerMoved)
		.on("pointerleave", onPointerLeft)
		.on("touchstart", (event) => event.preventDefault())

	/** Add axes */
	svg.append("g")
	.attr("transform", `translate( ${barWidth / 2 - 3}, ${height - marginAxisX} )`)
	.attr("color", "var(--op-20)")
	.call(d3.axisBottom(x0).ticks(6).tickFormat(d3.timeFormat(props.series.timeframe === 'hour' ? "%H:%M" : "%b %d")))
	.selectAll(".tick line")
		.filter(function(d) { return d === 0; })
		.remove();
	
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

	// This allows to find the closest X index of the mouse:
	const bisect = d3.bisector(function(d) { return d.date }).center

	function onPointerMoved(event) {
		onEnter()
		// Recover coordinate we need
		let idx = bisect(cData.data, x0.invert(d3.pointer(event)[0] - barWidth / 2))
		const elements = document.querySelectorAll('[data-index]')
		elements.forEach(el => {
			if (+el.getAttribute('data-index') === idx) {
				el.style.filter = "brightness(1.2)"
			} else {
				el.style.filter = "brightness(0.6)"
			}
			
		})

		let selectedCData = cData.data[idx]
		
		tooltip.value.x = x0(selectedCData.date)
		tooltip.value.y = y(selectedCData.value)
		tooltip.value.data[0] = {
			date: formatDate(selectedCData.date),
			value: formatValue(selectedCData.value),
			color: cData.color,
		}
		tooltip.value.data.splice(1, 1)
		if (pData.data.length) {
			let selectedPData = pData.data[idx]

			tooltip.value.data[1] = {
				date: formatDate(selectedPData.realDate),
				value: formatValue(selectedPData.value),
				color: pData.color,
			}
		}
	}

	function onPointerLeft() {
		onLeave()

		const elements = document.querySelectorAll('[data-index]')
		elements.forEach(el => {
			el.style.filter = ""
		})
	}

	/** Draw bars */
	if (pData.data.length) {
		svg.append('g')
			.selectAll('g')
			.data(data)
			.enter().append('g')
			.attr('transform', d => `translate(${x0(new Date(d.date))}, 0)`)
			.selectAll('rect')
			.data(d => [d])
			.enter().append('rect')
			.attr("class", "bar")
			.attr('data-index', d => d.index)
			.attr('x', d => x1(d.group))
			.attr('y', d => y(d.value) - marginAxisX)
			.attr('width', barWidth / 4)
			.attr('height', 0)
			.attr('fill', d => d.color)
			.transition()
			.duration(1_000)
			.attr('height', d => height - y(d.value))
	} else {
		svg.append('g')
			.selectAll("g")
			.data(data)
			.enter().append("rect")
			.attr("class", "bar")
			.attr('data-index', d => d.index)
			.attr("x", d => x0(new Date(d.date)))
			.attr('y', d => y(d.value) - marginAxisX)
			.attr("width", barWidth)
			.attr('height', 0)
			.attr('fill', d => d.color)
			.transition()
			.duration(1_000)
			.attr('height', d => height - y(d.value))
	}

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())
}

const drawChart = () => {
	currentData.value.color = "var(--mint)"
	prevData.value.color = "var(--txt-tertiary)"

	buildChart(
		chartEl.value.wrapper,
		currentData.value,
		prevData.value,
		() => (tooltip.value.show = true),
		() => (tooltip.value.show = false),
	)
}

watch(
	() => [currentData.value, prevData.value],
	() => {
		drawChart()
	},
)

onMounted(async () => {
	drawChart()
})
</script>

<template>
    <Flex direction="column" justify="between" gap="16" wide :class="$style.wrapper">
        <Flex :class="$style.chart_wrapper">
			<Transition name="fastfade">
				<div v-if="tooltip.show" :class="$style.tooltip_wrapper">
					<Flex
						align="center"
						direction="column"
						:style="{ transform: `translate(${tooltip.x + 30}px, ${tooltip.y - 60}px)` }"
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
							<Flex align="center" justify="between" wide gap="12">
								<Flex align="center" direction="column" gap="10">
									<Flex align="center" justify="start" wide>
										<Text size="12" weight="600" color="primary"> {{ d.value }} </Text>
									</Flex>
									
									<Flex align="center" justify="start" wide>
										<Text size="12" weight="500" color="tertiary"> {{ d.date }} </Text>
									</Flex>
								</Flex>

								<div
									:class="$style.legend"
									:style="{
										background: d.color
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

.tooltip_wrapper {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	& .tooltip {
		min-width: 200px;
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

.chart {
	height: 100%;
	position: absolute;

	overflow: hidden;

	& svg {
		overflow: visible;
	}
}
</style>