<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma } from "@/services/utils"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

let blockProgressInterval = null
const baseBlockTime = 12
const blockProgress = ref(0)

const isDelayed = ref(false)

const lastBlock = computed(() => appStore.latestBlocks[0])

// const checkDelay = () => {
// 	if (-DateTime.fromISO(lastBlock.value.time).diffNow("seconds").values.seconds > 12) {
// 		isDelayed.value = true
// 	}
// }

// checkDelay()

blockProgressInterval = setInterval(() => {
	blockProgress.value += 1

	if (blockProgress.value > baseBlockTime) {
		blockProgress.value = 0
	}
}, 1_000)

// watch(
// 	() => lastBlock.value,
// 	() => {
// 		isDelayed.value = false

// 	},
// )

onBeforeUnmount(() => {
	clearInterval(blockProgressInterval)
})
</script>

<template>
	<Flex direction="column" justify="between" wide :class="$style.wrapper">
		<Flex justify="between">
			<Flex direction="column" gap="8">
				<Flex align="center" gap="4">
					<Text size="16" weight="600" color="primary"> Block </Text>
					<Text size="16" weight="600" color="green"> {{ comma(lastBlock.height + 1) }}</Text>
				</Flex>

				<Text size="13" weight="500" color="tertiary"> Chain Mocha-4 </Text>
			</Flex>

			<Flex direction="column" gap="8" align="end">
				<Text size="14" weight="600" color="primary"> {{ (lastBlock.stats.block_time / 1_000).toFixed(2) }}s </Text>
				<Text size="12" weight="500" color="tertiary"> Previous Block </Text>
			</Flex>
		</Flex>

		<Flex align="center" justify="between" :class="$style.bar">
			<Icon name="block" size="16" color="primary" />

			<div v-for="item in 14" :class="$style.dot" />

			<Flex v-if="!isDelayed" justify="end" :class="$style.timer">
				<Text size="13" weight="600" color="primary">{{ blockProgress }}</Text>
				<Text size="13" weight="600" color="tertiary">s</Text>
			</Flex>
			<Text v-else size="13" weight="600" color="secondary">Delayed</Text>

			<div
				v-if="!isDelayed"
				:style="{ transform: `translateX(${-(100 - (100 * blockProgress) / baseBlockTime)}%)` }"
				:class="$style.fill"
			/>
			<div v-else :class="[$style.fill, $style.delayed]" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 122px;

	border-radius: 12px;
	background: var(--card-background);

	padding: 16px;
}

.bar {
	position: relative;
	height: 28px;
	z-index: 0;

	border-radius: 6px;
	background: var(--block-progress-background);
	overflow: hidden;

	padding: 0 8px;
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
	transition: transform 0.9s ease;

	&.delayed {
		background: var(--txt-support);
	}
}
</style>
