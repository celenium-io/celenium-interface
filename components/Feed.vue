<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma, formatBytes, abbreviate } from "@/services/utils"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchPrice, fetchPriceSeries } from "@/services/api/stats"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const head = computed(() => appStore.head)

const series = ref([])
const price = reactive({
	value: 0,
	diff: 0,
	side: null,
})

onMounted(async () => {
	const dataPrice = await fetchPrice()
	const dataSeries = await fetchPriceSeries()
	price.value = parseFloat(dataPrice.close)
	series.value = dataSeries

	const prevDayClosePrice = parseFloat(series.value[1].close)
	price.diff = (Math.abs(prevDayClosePrice - price.value) / ((prevDayClosePrice + price.value) / 2)) * 100
	price.side = price.value - prevDayClosePrice > 0 ? "rise" : "fall"
})
</script>

<template>
	<Flex tag="section" justify="center" wide :class="$style.wrapper">
		<Flex align="center" justify="between" gap="24" wide :class="$style.container">
			<Flex align="center" gap="20" :class="$style.stats">
				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="tx" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Total Txs:</Text>

							<Text v-if="head" size="12" weight="600" noWrap :class="$style.value">{{ abbreviate(head.total_tx) }}</Text>
							<Skeleton v-else w="40" h="12" />
						</Flex>
					</Flex>

					<template #content>
						{{ comma(head.total_tx) }}
					</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="coins" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Total Supply:</Text>

							<Text v-if="head" size="12" weight="600" noWrap :class="$style.value">
								{{ abbreviate(head.total_supply / 1_000_000, 2) }} TIA
							</Text>
							<Skeleton v-else w="55" h="12" />
						</Flex>
					</Flex>

					<template #content> {{ comma(head.total_supply) }} UTIA </template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="folder" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Total Blobs Size:</Text>

							<Text v-if="head" size="12" weight="600" noWrap :class="$style.value">{{
								formatBytes(head.total_blobs_size)
							}}</Text>
							<Skeleton v-else w="60" h="12" />
						</Flex>
					</Flex>

					<template #content> {{ comma(head.total_blobs_size) }} Bytes</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="tag" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Total Fees:</Text>

							<Text v-if="head" size="12" weight="600" noWrap :class="$style.value">
								{{ abbreviate(parseInt(head.total_fee / 1_000_000)) }} TIA
							</Text>
							<Skeleton v-else w="55" h="12" />
						</Flex>
					</Flex>

					<template #content> {{ comma(head.total_fee) }} UTIA </template>
				</Tooltip>
			</Flex>

			<Tooltip position="end">
				<Flex align="center" gap="6" :class="$style.stat">
					<Icon name="coin" size="12" color="secondary" :class="$style.icon" />

					<Flex align="center" gap="4">
						<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">TIA:</Text>

						<Text v-if="price.value" size="12" weight="600" noWrap :class="$style.value"> ${{ price.value.toFixed(2) }} </Text>
						<Skeleton v-else w="36" h="12" />
					</Flex>

					<Flex v-if="price.diff" align="center" gap="4">
						<Icon v-if="price.side === 'rise'" name="arrow-circle-right-up" size="12" color="neutral-green" />
						<Icon v-else name="arrow-circle-right-down" size="12" color="secondary" />

						<Text size="12" weight="600" :color="price.side === 'rise' ? 'neutral-green' : 'secondary'" noWrap>
							{{ price.diff.toFixed(2) }}%</Text
						>
					</Flex>
					<Skeleton v-else w="50" h="12" />
				</Flex>

				<template #content>
					<Flex direction="column" gap="6">
						Price diff from the previous day

						<Flex align="center" gap="4">
							<Text color="tertiary">{{ DateTime.fromISO(series[1].time).setLocale("en").toFormat("ff") }} -></Text>
							<Text color="primary">${{ series[1].close }}</Text>
						</Flex>
					</Flex>
				</template>
			</Tooltip>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 32px;

	border-top: 1px solid var(--op-5);
	border-bottom: 1px solid var(--op-5);

	background: var(--feed-background);
}

.container {
	max-width: var(--base-width);
	height: 100%;

	margin: 0 24px;

	&::-webkit-scrollbar {
		display: none;
	}
}

.dot {
	width: 4px;
	height: 4px;
	background-color: var(--op-10);
	border-radius: 50%;
}

.key,
.value,
.icon {
	transition: all 0.2s ease;
}

.value {
	color: var(--op-40);
}

.stat:hover {
	.icon {
		fill: var(--txt-primary);
	}

	.key {
		color: var(--txt-secondary);
	}

	.value {
		color: var(--txt-secondary);
	}
}

@media (max-width: 900px) {
	.wrapper {
		height: initial;

		padding: 12px 0;
	}

	.container {
		flex-direction: column;
	}

	.stats {
		width: 100%;
		justify-content: center;
		flex-wrap: wrap;
	}
}

@media (max-width: 500px) {
	.container {
		margin: 0 12px;
	}
}
</style>
