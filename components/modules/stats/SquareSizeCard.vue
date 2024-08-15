<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** Stats Components */
import DiffChip from "@/components/modules/stats/DiffChip.vue"

/** Services */
import { abbreviate, comma, formatBytes } from "@/services/utils"

/** API */
import { fetchSquareSize } from "@/services/api/stats"

const props = defineProps({
	period: {
		type: Object,
		required: true,
	},
})

const squareSize = ref([])
const squareSizeGraph = ref([])
const total = ref(0)

const getSquareSizes = async () => {
	const data = await fetchSquareSize(
		parseInt(DateTime.now().minus({
			days: props.period.timeframe === "day" ? props.period.value : 0,
			hours: props.period.timeframe === "hour" ? props.period.value + 1 : 0,
		}).ts / 1_000)
	)
	
    Object.keys(data).forEach(key => {
		squareSize.value.push({
			size: key,
			value: data[key][0].value,
		})

		total.value += +data[key][0].value
	})

	const color = d3.scaleSequential(d3.piecewise(d3.interpolateRgb, ["#65efcc", "#142f28"]))
        .domain([0, squareSize.value.length])

	let totalSquares = 0
	squareSize.value.forEach((item, index) => {
		item.color = color(index)

		let share = Math.round((item.value / total.value * 100))
		totalSquares += Math.max(share, 1)
		item.share = share
		item.squares = Math.max(share, 1)
	})

	if (totalSquares !== 100) {
		let maxSquaresIndex = squareSize.value.reduce((maxIndex, current, index, array) => {
			return (current.squares > array[maxIndex].squares) ? index : maxIndex
		}, 0)
		
		if (totalSquares > 100) {
			squareSize.value[maxSquaresIndex].squares = squareSize.value[maxSquaresIndex].squares - (totalSquares - 100)
		} else {
			squareSize.value[maxSquaresIndex].squares = squareSize.value[maxSquaresIndex].squares + (100 - totalSquares)
		}
	}
	
	squareSize.value.forEach(item => {
		for (let i = 0; i < item.squares; i++) {
			squareSizeGraph.value.push({
				size: item.size,
				color: item.color,
			})
		}
	})
}

const squareSizeEl = ref(null)
const squareSizeWidth = ref(0)
const squareWidth = computed(() => Math.floor((squareSizeWidth.value - 19) / 20))

const handleHoverEnter = (index) => {
	const elements = document.querySelectorAll(`[class*='suqare-group-']`)
	elements.forEach(el => {
		if (el.id === index) {
			el.style.filter = "brightness(120%)"
		} else {
			el.style.filter = "brightness(40%)"
		}
	})
}

const handleHoverLeave = () => {
	const elements = document.querySelectorAll(`[class*='suqare-group-']`)
	elements.forEach(el => {
		el.style.filter = "brightness(100%)"
	})
}

onMounted(async () => {
	squareSizeWidth.value = squareSizeEl.value?.wrapper?.offsetWidth

	await getSquareSizes()
})
</script>

<template>
	<Flex direction="column" justify="between" gap="16" wide :class="$style.wrapper">
		<Flex align="center" justify="between" gap="16">
			<Flex align="center" gap="10" justify="start" wide>
				<Text size="14" weight="600" color="secondary"> Square Size Distribution </Text>
				<Text size="14" weight="600" color="tertiary"> (last day) </Text>
			</Flex>

			<NuxtLink :to="`/stats/square_size`">
				<Flex align="center">
					<Icon name="expand" size="16" color="tertiary" :class="$style.link" />
					<!-- <Text size="12" color="tertiary" :class="$style.link">View Details</Text> -->
				</Flex>
			</NuxtLink>
		</Flex>

		<Flex @pointerleave="handleHoverLeave()" ref="squareSizeEl" align="center" :class="$style.square_size_wrapper">
			<div
				v-for="(s, index) in squareSizeGraph"
				@pointerenter="handleHoverEnter(s.size)"
				:id="s.size"
				:class="[
					`suqare-group-${s.size}`,
					{
						[$style.square_size]: true,
						[$style.fadein]: true,
					}
				]"
				:style="{
					transition: 'all 0.4s ease',
					animationDelay: `${index * 5}ms`,
					width: `${squareWidth}px`,
					height: `${squareWidth}px`,
					background: s.color,
					marginRight: '1px',
					marginBottom: '1px',
				}"
			/>
		</Flex>

		<Flex @pointerleave="handleHoverLeave()" align="center" direction="column" gap="8">
			<Flex
				v-for="s in squareSize"
				@pointerenter="handleHoverEnter(s.size)"
				:id="s.size"
				align="center"
				justify="between" wide
				:class="[
					`suqare-group-${s.size}`,
					{
						[$style.fadein]: true,
					}
				]"
				:style="{ transition: 'all 0.4s ease' }"
			>
				<Flex align="center" gap="6" style="flex: 4">
					<div
						:class="$style.legend"
						:style="{
							background: s.color,
						}"
					/>
					
					<Text size="12" weight="600" color="primary"> {{ `${s.size} x ${s.size}` }} </Text>
				</Flex>

				<Text size="12" weight="600" color="tertiary" style="text-align: right; flex: 1"> {{ `${s.share <= 1 ? '<1' : s.share}%` }} </Text>
				<Text size="12" weight="600" color="primary" style="text-align: right; flex: 1"> {{ comma(s.value) }} </Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	width: 100%;
	height: 280px;

	background: var(--card-background);
	border-radius: 12px;

	padding: 16px;
}

.square_size_wrapper {
	width: 100%;
	justify-content: space-between;
	flex-wrap: wrap;
}

.square_size_group {
	justify-content: space-between;
	flex-wrap: wrap;
}

.square_size {
	/* width: 12px;
	height: 12px; */

	border-radius: 2px;
	/* cursor: pointer; */

	/* margin-right: 2px;
	margin-bottom: 2px; */
}

.legend {
	width: 10px;
	height: 10px;

	border-radius: 2px;
	cursor: pointer;

	margin-right: 6px;
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

.fadein {
    opacity: 0;
    animation-name: fadeIn;
    animation-duration: 2s;
    animation-fill-mode: forwards;
}

.link:hover {
	fill: var(--txt-secondary)
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
