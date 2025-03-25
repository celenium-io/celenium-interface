<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
// import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma, formatBytes } from "@/services/utils"

/** API */
import { fetchAvgBlockTime } from "@/services/api/block"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const props = defineProps({
	series: {
		type: Object,
		required: false,
	},
	period: {
		type: Object,
		required: false,
	},
	active: {
		type: Boolean,
		default: false,
	},
})

const blocks = computed(() => appStore.latestBlocks.slice(0, 80).sort((a, b) => a.height - b.height))

const timeline = computed(() => {
	let time = []
	blocks.value.forEach((b) => {
		time.push(DateTime.fromISO(b.time).toFormat("h:mm"))
	})
	time = new Set(time)

	while (chartWidth.value / time.size < 35) {
		let arr = Array.from(time)
		arr.splice(Math.round(arr.length / 2), 1)
		time = new Set(arr)
	}
	return time
})

const maxSize = computed(() => Math.max(...blocks.value?.map((b) => b.stats.bytes_in_block)))
const avgBlockTime = ref(0)

const calculateHeight = (size) => {
	if (!size) return 2
	
	return Math.max((size / maxSize.value) * 100, 1)
}

const chartBlocksEl = ref(null)
const chartWidth = ref()

const barWidth = computed(() => Math.max(Math.round(chartWidth.value / 80 - 4), 4))
const marginBar = computed(() => (chartWidth.value - barWidth.value * 80) / 79)

const debouncedRedraw = () => {
	chartWidth.value = chartBlocksEl.value?.wrapper?.offsetWidth
}

onMounted(async () => {
	chartWidth.value = chartBlocksEl.value?.wrapper?.offsetWidth

	const { data } = await fetchAvgBlockTime({ from: parseInt(DateTime.now().minus({ hours: 3 }).ts / 1_000) })
	avgBlockTime.value = data.value / 1_000

	window.addEventListener("resize", debouncedRedraw)
})

onBeforeUnmount(() => {
	window.removeEventListener("resize", debouncedRedraw)
})
</script>

<template>
	<Flex direction="column" :class="$style.card_wrapper">
		<Flex align="center" justify="between">
			<Text size="13" weight="600" height="110" color="primary"> Blocks Feed </Text>

			<Text size="13" weight="600" height="110" color="primary"> {{ `~${Math.ceil(avgBlockTime)}s` }} </Text>
		</Flex>

		<Flex ref="chartBlocksEl" align="end" :class="$style.chart">
			<Tooltip v-for="(b, index) in blocks" position="start" :style="{ max_width: '100%', width: '100%', height: '100%' }">
				<Flex align="end" :class="$style.bar_wrapper">
					<Flex
						:class="[$style.bar, b.stats.blobs_count && $style.bar_blob]"
						:style="{
							width: `${barWidth}px`,
							height: `${calculateHeight(b.stats?.bytes_in_block)}%`,
							marginLeft: index !== 0 ? `${marginBar}px` : '0px',
							animationDelay: `${index * 15}ms`,
						}"
					/>
				</Flex>

				<template #content>
					<Flex align="center" direction="column" gap="6">
						<Flex align="center" justify="between" gap="24" wide>
							<Text size="12" color="secondary"> Block </Text>

							<Text size="12" color="primary"> {{ comma(b.height) }} </Text>
						</Flex>

						<Flex align="center" justify="between" wide>
							<Text size="12" color="secondary"> Size </Text>

							<Text size="12" color="primary"> {{ formatBytes(b.stats.bytes_in_block) }} </Text>
						</Flex>

						<Flex align="center" justify="between" wide>
							<Text size="12" color="secondary"> Blobs </Text>

							<Text size="12" color="primary"> {{ b.stats.blobs_count }} </Text>
						</Flex>
					</Flex>
				</template>
			</Tooltip>
		</Flex>

		<Flex align="center" justify="between" wide :class="$style.timeline">
			<Text v-for="t in timeline" size="10" weight="600" color="tertiary" :class="$style.time"> {{ t }} </Text>
		</Flex>
	</Flex>
</template>

<style module>
.card_wrapper {
	width: 100%;
	max-width: 100%;
	height: 140px;

	background: var(--card-background);
	border-radius: 12px;

	padding: 18px 18px 18px 18px;
}

.chart {
	width: 100%;
	height: 50px;

	margin-top: 16px;
	padding-bottom: 6px;

	border-bottom: solid 3px var(--op-5);
}

.bar_wrapper {
	height: 100%;

	&:hover .bar {
		scale: 1.1;
	}
}

.bar {
	background: var(--txt-tertiary);
	border-radius: 1px;

	opacity: 0;
	transform: translateY(5px);
	animation: appear 0.5s ease forwards;
}

.bar_blob {
	background: var(--mint);
}

.time {
	padding-top: 14px;
	position: relative;
	display: inline-block;
}

.time::after {
	content: "";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translateX(-50%) translateY(-100%);
	width: 2px;
	height: 12px;
	background-color: var(--op-5);
	transform-origin: bottom;
}

.timeline {
	padding: 0px 12px 0px 12px;
}

.disabled {
	opacity: 0.5;
	pointer-events: none;
}

@keyframes appear {
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* @media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}

	.header {
		gap: 16px;

		height: initial;

		padding: 16px;
	}
} */
</style>
