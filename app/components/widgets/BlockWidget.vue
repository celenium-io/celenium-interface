<script setup>
/** Vendor */
import { DateTime } from "luxon"
import { motion, useMotionValue, animate } from "motion-v"
import NumberFlow from "@number-flow/vue"

/** Services */
import { comma, roundTo } from "~/services/utils/index.js"

/** API */
import { fetchAvgBlockTime } from "~/services/api/block.js"

/** Store */
import { useAppStore } from "~/store/app.store.js"
const appStore = useAppStore()

const lastBlock = computed(() => appStore.latestBlocks[0])

let blockProgressInterval = null

const avgBlockTime = ref(null)

const blockProgress = ref(0)

const isInited = ref(false)
const isAwaitingNewBlock = ref(false)

const init = async () => {
	const data = await fetchAvgBlockTime({ from: parseInt(DateTime.now().minus({ hours: 3 }).ts / 1_000) })
	avgBlockTime.value = data ? data / 1_000 : 3

	isInited.value = true
}

onMounted(() => {
	if (appStore.isLatestBlocksLoaded) init()
})

watch(
	() => appStore.isLatestBlocksLoaded,
	() => {
		init()
	},
)

const scaleX = useMotionValue(0)
const controls = ref(null)
const startAnimation = () => {
	scaleX.set(0)

	if (controls.value) controls.value.stop()
	controls.value = animate(scaleX, 1.2, { duration: avgBlockTime.value, ease: "easeOut" })
}

const startBlockProgress = () => {
	blockProgressInterval = setInterval(() => {
		blockProgress.value += 1

		if (blockProgress.value > Math.ceil(avgBlockTime.value)) {
			isAwaitingNewBlock.value = true
			clearInterval(blockProgressInterval)
		}
	}, 1000)
}

watch(
	() => lastBlock.value,
	() => {
		if (!isInited.value) return

		clearInterval(blockProgressInterval)

		blockProgress.value = 0
		isAwaitingNewBlock.value = false

		startAnimation()
		startBlockProgress()
	},
)

onBeforeUnmount(() => {
	clearInterval(blockProgressInterval)
})
</script>

<template>
	<NuxtLink :to="lastBlock && `/block/${lastBlock.height}`" :class="$style.wrapper">
		<Flex align="start" justify="between">
			<Flex direction="column" gap="10">
				<Flex align="center" gap="4" style="height: 24px; margin-top: -4px">
					<Text size="16" weight="600" color="secondary"> Block </Text>

					<Text v-if="lastBlock" size="16" weight="600" color="primary" tabular>
						<NumberFlow :value="lastBlock.height" />
					</Text>
					<Skeleton v-else w="88" h="12" />
				</Flex>

				<Flex align="center" gap="6">
					<Text size="12" weight="500" color="tertiary">Average Block Time:</Text>
					<Text v-if="avgBlockTime !== null" size="12" weight="600" color="secondary">
						{{ avgBlockTime ? `${roundTo(avgBlockTime)}s` : `Unknown` }}
					</Text>
					<Skeleton v-else w="36" h="12" />
				</Flex>
			</Flex>

			<Flex gap="4" align="center">
				<Text size="12" weight="600" color="secondary">View the Block </Text>
				<Icon name="arrow-narrow-up-right-circle" size="12" color="tertiary" />
			</Flex>
		</Flex>

		<Flex align="center" justify="center" :class="$style.bar">
			<Transition name="fade">
				<svg width="200%" height="28" :class="$style.lines">
					<pattern id="diagonalHatch1" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
						<line x1="0" y1="0" x2="0" y2="20" style="stroke: var(--op-5); stroke-width: 15" />
					</pattern>
					<rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalHatch1)"></rect>
				</svg>
			</Transition>

			<Flex v-if="!isAwaitingNewBlock" align="center" justify="between" wide>
				<Flex align="center" gap="8">
					<Icon name="block" size="16" color="primary" />
					<Text v-if="lastBlock" size="12" weight="600" color="secondary" :class="$style.block_time">
						<NumberFlow :value="lastBlock.stats.block_time / 1_000" suffix="s" />
					</Text>
				</Flex>

				<div v-for="item in 16" :class="$style.dot" />
			</Flex>
			<Flex v-else align="center" gap="4">
				<Text size="13" weight="600" color="secondary">Awaiting New Block</Text>
			</Flex>

			<motion.div v-if="!isAwaitingNewBlock" :style="{ originX: 0, scaleX }" :class="$style.fill" />
			<div v-else :class="[$style.fill, $style.delayed]" />
		</Flex>
	</NuxtLink>
</template>

<style module>
.wrapper {
	display: flex;
	justify-content: space-between;
	flex-direction: column;

	min-height: 122px;

	border-radius: 12px;
	background: var(--card-background);

	padding: 16px;

	transition: all 0.2s ease;

	&:hover {
		box-shadow: inset 0 0 0 2px var(--op-5);
	}

	&:focus-visible {
		box-shadow: inset 0 0 0 2px var(--op-8);
	}

	&:active {
		box-shadow: inset 0 0 0 2px var(--op-10);
	}
}

.bar {
	position: relative;
	height: 28px;
	z-index: 0;

	box-shadow: 0 0 0 2px var(--op-5);
	border-radius: 6px;
	background: var(--block-progress-background);
	overflow: hidden;

	padding: 0 16px 0 8px;

	.lines {
		position: absolute;

		top: 0;
		left: 0;
		bottom: 0;

		transform: translateX(-50%);

		animation: lines-movement 25s linear infinite;
	}
}

@keyframes lines-movement {
	0% {
		transform: translateX(-50%);
	}

	50% {
		transform: translateX(0%);
	}

	100% {
		transform: translateX(-50%);
	}
}

.dot {
	width: 4px;
	height: 4px;

	border-radius: 50%;
	background: var(--op-30);
}

.block_time {
	min-width: 44px;

	& number-flow-vue::part(suffix) {
		color: var(--txt-tertiary);
	}
}

.fill {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;

	width: 100%;

	background: linear-gradient(90deg, var(--neutral-mint), transparent);

	z-index: -1;

	will-change: transform;
	transform-origin: left;

	&.delayed {
		background: var(--op-10);
	}
}
</style>
