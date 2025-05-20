<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { abbreviate, comma, formatBytes, isMainnet, roundTo } from "@/services/utils"
import { getRankCategory } from "@/services/constants/rollups"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchPriceSeries } from "@/services/api/stats"

/** Store */
import { useAppStore } from "@/store/app"
import { useRollupsRankingStore } from "@/store/rollupsrank"
const appStore = useAppStore()
const rollupRankingStore = useRollupsRankingStore()

const head = computed(() => appStore.lastHead)
const currentPrice = computed(() => appStore.currentPrice)

const totalSupply = computed(() => head.value.total_supply / 1_000_000)
const totalSupplyUSD = computed(() => totalSupply.value * currentPrice.value?.close)
const totalFees = computed(() => head.value.total_fee / 1_000_000)
const totalFeesUSD = computed(() => totalFees.value * currentPrice.value?.close)
const topRollup = computed(() => {
	let rankCategory = getRankCategory(roundTo(rollupRankingStore?.rollups_ranking?.top_rollup?.rank / 10, 0))
	return {
		slug: rollupRankingStore?.rollups_ranking?.top_rollup?.slug,
		name: rollupRankingStore?.rollups_ranking?.top_rollup?.name,
		rank: {
			name: rankCategory?.name,
			score: rollupRankingStore?.rollups_ranking?.top_rollup?.rank,
			color: rankCategory?.color,
		}
	}
})

const series = ref([])
const price = reactive({
	value: 0,
	diff: 0,
	side: null,
})

onMounted(async () => {
	const dataSeries = await fetchPriceSeries( {from: parseInt(DateTime.now().minus({ days: 3 }).ts / 1_000)})
	series.value = dataSeries
	appStore.currentPrice = series.value[0]
	price.value = parseFloat(series.value[0].close)

	const prevDayClosePrice = parseFloat(series.value[1].close)
	price.diff = (Math.abs(prevDayClosePrice - price.value) / ((prevDayClosePrice + price.value) / 2)) * 100
	let side = 'stay'
	if (price.value - prevDayClosePrice !== 0) {
		side = price.value - prevDayClosePrice > 0 ? 'rise' : 'fall'
	}
	price.side = side
})
</script>

<template>
	<Flex tag="section" justify="center" wide :class="$style.wrapper">
		<Flex align="center" justify="between" gap="24" wide :class="$style.container">
			<Flex align="center" gap="12" :class="$style.stats">
				<template v-if="isMainnet()">
					<NuxtLink :to="`/rollup/rank/${topRollup?.slug}`">
						<Tooltip>
							<Flex align="center" gap="6" :class="$style.stat">
								<Icon v-if="topRollup?.name" name="laurel" size="14" :color="topRollup?.rank?.color" :style="{marginTop: '1px'}" />
								<Icon v-else name="laurel" size="14" color="tertiary" :class="$style.icon" :style="{marginTop: '1px'}" />
								<Flex align="center" gap="4">
									<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Top Rollup:</Text>

									<Text v-if="topRollup?.name" size="12" weight="600" color="secondary" noWrap :class="$style.value"> {{ topRollup?.name }} </Text>
									<Skeleton v-else w="40" h="12" />
								</Flex>
							</Flex>

							<template #content>
								<Flex direction="column" gap="8">
									<Flex align="center" justify="between" gap="8">
										<Text size="12" weight="500" color="tertiary">Rank:</Text>
										<Text size="12" weight="600" :color="topRollup?.rank?.color"> {{ topRollup?.rank?.name }} </Text>
									</Flex>
									<Flex align="center" justify="between" gap="8">
										<Text size="12" weight="500" color="tertiary">Score:</Text>
										<Text size="12" weight="600" color="secondary"> {{ topRollup?.rank?.score }}% </Text>
									</Flex>
								</Flex>
							</template>
						</Tooltip>
					</NuxtLink>

					<div :class="$style.dot" />
				</template>

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="tx" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Txs:</Text>

							<Text v-if="head.total_tx" size="12" weight="600" noWrap :class="$style.value">{{ abbreviate(head.total_tx) }}</Text>
							<Skeleton v-else w="40" h="12" />
						</Flex>
					</Flex>

					<template #content>
						<Flex align="center" justify="between" gap="8">
							<Text size="12" weight="500" color="tertiary">Total Txs:</Text>
							<Text size="12" weight="600" color="secondary"> {{ comma(head.total_tx) }} </Text>
						</Flex>
					</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="coins" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Supply:</Text>

							<Text v-if="head.total_supply" size="12" weight="600" noWrap :class="$style.value">
								{{ abbreviate(totalSupply, 2) }} TIA
							</Text>
							<Skeleton v-else w="40" h="12" />
						</Flex>
					</Flex>

					<template #content>
						<Flex align="center" justify="between" gap="8">
							<Text size="12" weight="500" color="tertiary">Total Supply:</Text>
							<Text size="12" weight="600" color="secondary"> {{ abbreviate(totalSupplyUSD, 2) }} USD </Text>
						</Flex>
					</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="namespace" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Blobs Size:</Text>

							<Text v-if="head.total_blobs_size" size="12" weight="600" noWrap :class="$style.value">{{
								formatBytes(head.total_blobs_size)
							}}</Text>
							<Skeleton v-else w="40" h="12" />
						</Flex>
					</Flex>

					<template #content>
						<Flex align="center" justify="between" gap="8">
							<Text size="12" weight="500" color="tertiary">Total Blobs Size:</Text>
							<Text size="12" weight="600" color="secondary"> {{ comma(head.total_blobs_size) }} Bytes </Text>
						</Flex>
					</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="tag" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Fees:</Text>

							<Text v-if="head.total_fee" size="12" weight="600" noWrap :class="$style.value">
								{{ abbreviate(parseInt(totalFees)) }} TIA
							</Text>
							<Skeleton v-else w="40" h="12" />
						</Flex>
					</Flex>

					<template #content>
						<Flex align="center" justify="between" gap="8">
							<Text size="12" weight="500" color="tertiary">Total Fees:</Text>
							<Text size="12" weight="600" color="secondary"> {{ abbreviate(totalFeesUSD) }} USD </Text>
						</Flex>
					</template>
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
						<Icon v-else-if="price.side === 'fall'" name="arrow-circle-right-down" size="12" color="red" />

						<Text size="12" weight="600" :color="price.side === 'fall' ? 'red' : 'neutral-green'" noWrap>
							{{ price.diff.toFixed(2) }}%</Text
						>
					</Flex>
					<Skeleton v-else w="50" h="12" />
				</Flex>

				<template #content>
					<Flex direction="column" gap="6">
						<Flex align="center" gap="4">
							<Text color="primary">Price diff from the previous day</Text>
						</Flex>

						<Flex v-if="series.length" align="center" gap="4">
							<Text color="tertiary">{{ DateTime.fromISO(series[1].time).setLocale("en").toFormat("ff") }} -></Text>
							<Text color="primary">${{ parseFloat(series[1].close).toFixed(2) }}</Text>
						</Flex>

						<Flex align="center" gap="4">
							<Text size="11" color="tertiary">Binance quotes</Text>
						</Flex>
					</Flex>
				</template>
			</Tooltip>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	min-height: 32px;
	height: 32px;
	max-width: var(--base-width);

	border-top: 1px solid var(--op-5);
	border-bottom: 1px solid var(--op-5);
	background: var(--feed-background);
}

.container {
	max-width: var(--base-width);
	height: 100%;
	overflow: hidden;
	overflow-x: scroll;

	margin: 0 12px;

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
	color: var(--txt-secondary);
}

.stat:hover {
	.icon {
		fill: var(--txt-primary);
	}

	.key {
		color: var(--txt-secondary);
	}

	.value {
		color: var(--txt-primary);
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
