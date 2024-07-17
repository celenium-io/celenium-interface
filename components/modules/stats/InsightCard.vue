<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Stats Components */
import DiffChip from "@/components/modules/stats/DiffChip.vue"

/** Services */
import { abbreviate, capitilize, comma, formatBytes, shareOfTotal, shareOfTotalString } from "@/services/utils"

/** API */
import { fetch24hDiffs, fetchSummary } from "@/services/api/stats"

const props = defineProps({
	series: {
		type: Object,
		required: true,
	},
	period: {
		type: Object,
		required: false,
	},
})

const resData = ref([])
const total = ref(0)
const isLoading = ref(false)

const getSeries = async () => {
	isLoading.value = true
	
	let data = []
	if (props.series.name === 'gas') {
		const gasUsed = await fetchSummary({
			table: 'tx',
			func: 'sum',
			column: 'gas_used',
			from: parseInt(DateTime.now().minus({ hours: 24 }).ts / 1_000),
		})

		const gasWanted = await fetchSummary({
			table: 'tx',
			func: 'sum',
			column: 'gas_wanted',
			from: parseInt(DateTime.now().minus({ hours: 24 }).ts / 1_000),
		})

		let efficiency = (gasUsed / gasWanted * 100).toFixed(0)
		data = [
			{
				name: 'efficiency',
				value: `${efficiency}%`,
				share: efficiency,
				color: colors[props.series.color ? props.series.color : 'mint'][0]
			},
			{
				name: 'limit',
				value: abbreviate(gasWanted),
				share: 100 - efficiency,
				color: colors[props.series.color ? props.series.color : 'mint'][4]
			},
			{
				name: 'used',
				value: abbreviate(gasUsed),
				color: colors[props.series.color ? props.series.color : 'mint'][4]
			},
		]
	} else {
		data = await fetch24hDiffs({ name: props.series.name })	
	}
	
	switch (props.series.name) {
		case 'rollup_stats_24h':
			resData.value = data
				.filter(item => item.id !== undefined && item.id !== null)
				.map(item => {
					const { blobs_count, ...rest } = item
					return {
						...rest,
						value: blobs_count
					}
				})
			break
		case 'messages_count_24h':
			resData.value = data
				.map(item => {
					return {
						...item,
						name: item.name.replace('Msg', '')
					}
				})
			break
		default:
			resData.value = data
			break
	}

	if (props.series.name === 'gas') {
		total.value = resData.value[0].value
	} else {
		total.value = resData.value.reduce((sum, el) => {
			return sum + el.value
		}, 0)

		let startlength = resData.value.length
		resData.value = resData.value.slice(0, Math.min(startlength, 4))

		let totalOther = total.value
		let sumShares = 0
		resData.value.forEach(item => {
			let share = shareOfTotal(item.value, total.value, 2)
			totalOther -= item.value
			sumShares += share ? share : 0

			item.share = share ? share : 0
		})

		if (startlength > 4) {
			resData.value.push({
				name: "Other",
				value: totalOther,
				share: 100 - sumShares,
			})
		}

		resData.value.forEach((item, index) => {
			item.color = colors[props.series.color ? props.series.color : 'mint'][index]
		})		
	}

	isLoading.value = false
}

const barWrapperEl = ref(null)
const barWrapperWidth = ref(0)
const colors = {
	// mint: ["var(--mint)", "#46a78e", "var(--dark-mint)", "var(--op-10)"],
	mint: ["var(--mint)", "#50bfa3", "#327766", "var(--dark-mint)", "var(--op-10)"],
	white: ["var(--txt-primary)", "var(--txt-secondary)", "var(--txt-tertiary)", "var(--op-10)", "var(--op-5)"],
}

onMounted(async () => {
	barWrapperWidth.value = barWrapperEl.value.wrapper.offsetWidth

	await getSeries()
})

// watch(
// 	() => props.period,
// 	async () => {
// 		await drawChart()
// 	},
// )

</script>

<template>
	<Flex direction="column" gap="24" :class="$style.wrapper">
		<Flex align="center" direction="column" gap="16" :class="$style.header">
			<Flex align="center" gap="10" justify="start" wide>
				<Text size="14" weight="600" color="secondary"> {{ series.title }} </Text>
				<!-- <DiffChip :value="diff" /> -->
			</Flex>
			
			<Flex v-if="series.name !== 'gas'" align="end" gap="10" justify="start" wide>
				<Text size="20" weight="600" color="primary"> {{ series.units === 'bytes' ? formatBytes(total) : comma(total) }} </Text>
				<Text size="14" weight="600" color="tertiary"> new today </Text>
			</Flex>
			<Flex v-else align="end" gap="10" justify="start" wide>
				<Text size="20" weight="600" color="primary"> {{ total }} </Text>
			</Flex>
		</Flex>

		<Flex ref="barWrapperEl" :style="`width: ${barWidth}px`" :class="$style.bar_wrapper">
			<div
				v-if="series.name !== 'gas'"
				v-for="(item, index) in resData"
				:class="[$style.bar, $style.fadein]"
				:style="{
					animationDelay: `${index * 0.15}s`,
					width: `${item.share}%`,
					background: item.color,
				}"
			/>
			<div
				v-else
				v-for="(item, index) in resData.slice(0, 2)"
				:class="[$style.bar, $style.fadein]"
				:style="{
					animationDelay: `${index * 0.15}s`,
					width: `${item.share}%`,
					background: item.color,
				}"
			/>
		</Flex>

		<Flex v-if="series.name !== 'gas'" align="center" direction="column" gap="12" wide>
			<Flex v-for="(item, index) in resData" justify="between" gap="4" wide :style="{ animationDelay: `${index * 0.15}s` }" :class="$style.fadein">
				<Flex align="center" justify="start" gap="6">
					<Icon v-if="series.name === 'rollup_stats_24h' && index === 0"
						name="crown"
						size="14"
						:style="{
							marginLeft: '-2px',
							marginRight: '4px',
							fill: 'var(--mint)',
						}"
					/>
					<div v-else
						:class="$style.legend"
						:style="{
							background: item.color,
						}"
					/>

					<Text size="12" weight="600" color="primary"> {{ capitilize(item.name) }} </Text>
				</Flex>

				<Flex align="center" gap="6">
					<Text size="12" weight="500" color="tertiary"> {{ comma(item.value) }} </Text>

					<Text size="12" weight="500" color="secondary"> {{ `${item.share > 99 && resData.length > 1 ? 99 : item.share < 1 ? '<1' : item.share.toFixed(0)}%` }} </Text>
				</Flex>
			</Flex>
		</Flex>

		<Flex v-else align="center" direction="column" gap="12" wide>
			<Flex v-for="item in resData" justify="between" gap="4" wide :style="{ animationDelay: `${index * 0.15}s` }" :class="$style.fadein">
				<Flex align="center" justify="start" gap="6">
					<div
						:class="$style.legend"
						:style="{
							background: item.color,
						}"
					/>

					<Text size="12" weight="600" color="primary"> {{ capitilize(item.name) }} </Text>
				</Flex>

				<Text size="12" weight="500" color="secondary"> {{ item.value }} </Text>
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

.bar_wrapper {
	width: 100%;
}

.bar {
	min-width: 8px;
	height: 10px;

	border-radius: 5px;

	margin-right: 4px;
	margin-bottom: 4px;
}

.legend {
	width: 10px;
	height: 10px;

	border-radius: 5px;
	cursor: pointer;

	margin-right: 6px;
}

.header {

}

.fadein {
    opacity: 0;
    animation-name: fadeIn;
    animation-duration: 1s;
    animation-fill-mode: forwards;
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
