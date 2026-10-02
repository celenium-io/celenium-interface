<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Services */
import { comma } from "~/services/utils/index.js"

/** API */
import { fetchValidatorVotingPowerHistory } from "~/services/api/validator.js"

const props = defineProps({
	validator: {
		type: Object,
		required: true,
	},
})

const chartEl = ref()

const { data: votingPowerSeries, pending } = await useAsyncData(`voting-power-history-${props.validator.id}`, () =>
	fetchValidatorVotingPowerHistory({ id: props.validator.id, limit: 10, sort: "desc" }),
)

const selectedItem = ref()
const linePositionX = ref()

const highestValue = ref(Number.parseInt(votingPowerSeries.value[0]?.power))
const lowestValue = ref(Number.parseInt(votingPowerSeries.value[0]?.power))

votingPowerSeries.value.forEach((item) => {
	const value = Number.parseInt(item.power)

	if (value > highestValue.value) {
		highestValue.value = value
	}
	if (value < lowestValue.value) {
		lowestValue.value = value
	}
})

onMounted(() => {
	try {
		if (!votingPowerSeries.value?.length) return

		const data = votingPowerSeries.value.map((item) => {
			return { date: new Date(item.time), value: Number.parseInt(item.power) }
		})
		const dataToBisect = data.toSorted((a, b) => a.date - b.date)

		const chartRect = chartEl.value.wrapper.getBoundingClientRect()
		const width = chartRect.width
		const height = chartRect.height
		const margin = { top: 24, right: 4, bottom: 4, left: 0 }

		const x = d3.scaleUtc(
			d3.extent(data, (d) => d.date),
			[margin.left, width - margin.right],
		)
		const y = d3.scaleLinear([lowestValue.value, d3.max(data, (d) => d.value)], [height - margin.bottom, margin.top])

		const bisect = d3.bisector((d) => d.date).right
		const onPointerMoved = (event) => {
			const idx = Math.max(0, bisect(dataToBisect, x.invert(d3.pointer(event)[0])) - 1)

			selectedItem.value = dataToBisect[idx]
			linePositionX.value = x(dataToBisect[idx].date)
		}
		const onPointerLeave = () => {
			selectedItem.value = null
		}

		const area = d3
			.area()
			.x((d) => x(d.date))
			.y0(y(lowestValue.value))
			.y1((d) => y(d.value))
			.curve(d3.curveStepAfter)

		const line = d3
			.line()
			.x((d) => x(d.date))
			.y((d) => y(d.value))
			.curve(d3.curveStepAfter)

		const svg = d3
			.create("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("viewBox", [0, 0, width, height])
			.on("pointerenter pointermove", onPointerMoved)
			.on("pointerleave", onPointerLeave)

		const gradientId = `voting-power-${props.validator.id}`
		const gradient = svg
			.append("defs")
			.append("linearGradient")
			.attr("id", gradientId)
			.attr("x1", "0")
			.attr("y1", "0")
			.attr("x2", "0")
			.attr("y2", "1")
		gradient.append("stop").attr("offset", "0%").attr("stop-color", "var(--brand)").attr("stop-opacity", 0.1)
		gradient.append("stop").attr("offset", "100%").attr("stop-color", "var(--brand)").attr("stop-opacity", 0)
		svg.append("path").datum(data).attr("fill", `url(#${gradientId})`).attr("d", area)
		svg.append("path").datum(data).attr("fill", "none").attr("stroke", "var(--brand)").attr("stroke-width", 2).attr("d", line)
		svg.append("g")
			.selectAll("circle")
			.data(data)
			.join("circle")
			.attr("cx", (d) => x(d.date))
			.attr("cy", (d) => y(d.value))
			.attr("r", 3)
			.attr("fill", "var(--brand)")

		chartEl.value.wrapper.append(svg.node())
	} catch (e) {
		console.log(e)
	}
})
</script>

<template>
	<Flex direction="column" gap="4" wide>
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="bar-chart" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Voting Power History</Text>
			</Flex>

			<Text v-if="selectedItem" size="12" weight="600" color="tertiary">
				{{ DateTime.fromJSDate(selectedItem.date).setLocale("en").toLocaleString(DateTime.DATETIME_MED) }} -
				<Text color="secondary">{{ comma(selectedItem.value) }}</Text> TIA
			</Text>
		</Flex>

		<Flex gap="16" :class="$style.content">
			<template v-if="!pending && votingPowerSeries.length">
				<Flex wide direction="column">
					<Flex :class="$style.chart_wrapper">
						<Flex ref="chartEl" :class="$style.chart" />

						<div v-if="selectedItem" :style="{ transform: `translateX(${linePositionX}px)` }" :class="$style.line" />
					</Flex>

					<Flex align="center" justify="between" :class="$style.footer">
						<Text size="12" weight="600" color="tertiary">
							{{ DateTime.fromISO(votingPowerSeries.at(-1).time).setLocale("en").toFormat("dd LLL, hh:mm a") }}
						</Text>
						<Text size="12" weight="600" color="tertiary">
							{{ DateTime.fromISO(votingPowerSeries[0].time).setLocale("en").toFormat("dd LLL, hh:mm a") }}
						</Text>
					</Flex>
				</Flex>
				<Flex direction="column" justify="between" :class="$style.right">
					<Text size="12" weight="600" color="secondary">{{ comma(highestValue) }}</Text>
					<Text size="12" weight="600" color="secondary">{{ comma(lowestValue) }}</Text>
				</Flex>
			</template>
			<Flex v-else direction="column" gap="16" :class="$style.error">
				<Flex style="position: relative; width: fit-content">
					<Icon name="chart" size="24" color="support" />
					<Icon name="warning" size="16" color="orange" style="position: absolute; top: -6px; right: -6px" />
				</Flex>
				<Flex direction="column" gap="8">
					<Text size="13" weight="600" color="secondary">There is no data to plot the chart</Text>
					<Text size="13" weight="500" height="140" color="tertiary" style="text-wrap: balance">
						It looks like this validator doesn't have a single record of a voting power update; this might be a bug.
					</Text>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.header {
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
}

.content {
	min-height: 264px;
	flex: 1;

	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);
	overflow: hidden;
}

.chart_wrapper {
	flex: 1;
	position: relative;
}

.chart {
	flex: 1;
}

.line {
	position: absolute;
	top: 0;
	bottom: 0;

	width: 1px;
	background: linear-gradient(var(--op-10), transparent);
	pointer-events: none;
}

.right {
	padding: 16px 16px 44px 0;
}

.footer {
	padding: 16px 0 16px 16px;
}

.error {
	padding: 16px;
}
</style>
