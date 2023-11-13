<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma } from "@/services/utils"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const lastBlock = computed(() => appStore.latestBlocks[0])

let blockProgressInterval = null
let delayInterval = null

const delay = ref(0)
const isDelayed = ref(false)

const offsetSinceLastBlock = Math.abs(
	DateTime.fromISO(lastBlock.value.time).diffNow("seconds").values.seconds + lastBlock.value.stats.block_time / 1_000,
)

if (offsetSinceLastBlock > lastBlock.value.stats.block_time / 1_000) {
	isDelayed.value = true
	delay.value = Math.floor(offsetSinceLastBlock - lastBlock.value.stats.block_time / 1_000)
	delayInterval = setInterval(() => {
		delay.value += 1
	}, 1_000)
}

const blockProgress = ref(Math.floor(offsetSinceLastBlock))
const fillOffset = computed(() => {
	const offset = -(100 - (100 * blockProgress.value) / (lastBlock.value.stats.block_time / 1_000))
	return offset < 0 ? offset : 0
})

const startBlockProgress = () => {
	blockProgressInterval = setInterval(() => {
		blockProgress.value += 1

		if (blockProgress.value > lastBlock.value.stats.block_time / 1_000 + 1) {
			isDelayed.value = true
			clearInterval(blockProgressInterval)

			delayInterval = setInterval(() => {
				delay.value += 1
			}, 1_000)
		}
	}, 1_000)
}
if (!isDelayed.value) startBlockProgress()

watch(
	() => lastBlock.value,
	() => {
		isDelayed.value = false

		clearInterval(blockProgressInterval)
		clearInterval(delayInterval)

		blockProgress.value = 0
		delay.value = 0

		startBlockProgress()
	},
)

onBeforeUnmount(() => {
	clearInterval(blockProgressInterval)
})
</script>

<template>
	<NuxtLink :to="`/block/${lastBlock.height}`" :class="$style.wrapper">
		<Flex justify="between">
			<Flex direction="column" gap="10">
				<Flex align="center" gap="4">
					<Text size="16" weight="600" color="primary"> Block </Text>
					<Text size="16" weight="600" color="green"> {{ comma(lastBlock.height) }}</Text>
				</Flex>

				<Flex align="center" gap="6">
					<Icon name="time" size="12" color="tertiary" :class="$style.time_icon" />
					<Text size="12" weight="500" color="tertiary">Awaiting new block</Text>
				</Flex>
			</Flex>

			<Flex direction="column" gap="8" align="end">
				<Text size="14" weight="600" color="primary"> ~{{ Math.ceil(lastBlock.stats.block_time / 1_000) }}s </Text>
				<Text size="12" weight="500" color="tertiary"> Block Time </Text>
			</Flex>
		</Flex>

		<Flex align="center" justify="center" :class="$style.bar">
			<Transition name="fade">
				<svg v-if="isDelayed" width="100%" height="28" :class="$style.lines">
					<pattern id="diagonalHatch1" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
						<line x1="0" y1="0" x2="0" y2="20" style="stroke: var(--op-10); stroke-width: 15" />
					</pattern>
					<rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalHatch1)"></rect>
				</svg>
			</Transition>

			<Flex v-if="!isDelayed" align="center" justify="between" wide>
				<Icon name="block" size="16" color="primary" />

				<div v-for="item in 14" :class="$style.dot" />

				<Flex justify="end" :class="$style.timer">
					<Text size="13" weight="600" color="primary">{{ blockProgress }}</Text>
					<Text size="13" weight="600" color="tertiary">s</Text>
				</Flex>
			</Flex>
			<Flex v-else align="center" gap="4">
				<Text size="13" weight="600" color="secondary">Delayed by </Text>
				<Text size="13" weight="600" color="primary">{{ delay }}s</Text>
			</Flex>

			<div v-if="!isDelayed" :style="{ transform: `translateX(${fillOffset}%)` }" :class="$style.fill">
				<svg width="100%" height="28" :class="$style.lines">
					<pattern id="diagonalHatch2" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
						<line x1="0" y1="0" x2="0" y2="20" style="stroke: var(--op-20); stroke-width: 15" />
					</pattern>
					<rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalHatch2)"></rect>
				</svg>
			</div>
			<div v-else :class="[$style.fill, $style.delayed]" />
		</Flex>
	</NuxtLink>
</template>

<style module>
.wrapper {
	display: flex;
	justify-content: space-between;
	flex-direction: column;

	height: 122px;

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

	padding: 0 8px;

	.lines {
		position: absolute;

		top: 0;
		left: 0;
		bottom: 0;
	}
}

.dot {
	width: 4px;
	height: 4px;

	border-radius: 50%;
	background: var(--op-30);
}

.timer {
	width: 22px;
}

.fill {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	width: 336px;

	background: var(--neutral-green);

	z-index: -1;

	will-change: transform;
	transition: all 0.9s ease;

	&.delayed {
		background: var(--op-10);
	}
}

.time_icon {
	animation: rotation 1.5s ease infinite;
}

@keyframes rotation {
	0% {
		transform: rotate(0deg);
	}

	20% {
		transform: rotate(180deg);
	}

	30% {
		transform: rotate(-30deg);
	}

	50% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(0deg);
	}
}
</style>
