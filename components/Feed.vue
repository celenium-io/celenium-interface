<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { abbreviate, capitilize, comma, formatBytes, isMainnet, roundTo } from "@/services/utils"
import { getRankCategory } from "@/services/constants/rollups"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchRollupsRanking } from "@/services/api/rollup"
import { fetchPriceSeries, fetchSummary, fetchTVS } from "@/services/api/stats"

/** Store */
import { useAppStore } from "@/store/app.store"
const appStore = useAppStore()

const head = computed(() => appStore.lastHead)
const currentPrice = computed(() => appStore.currentPrice)

const totalFees = computed(() => head.value.total_fee / 1_000_000)
const totalFeesUSD = computed(() => totalFees.value * currentPrice.value?.close)

const isLoading = ref(true)
const series = ref([])
const price = reactive({
	value: 0,
	diff: 0,
	side: null,
})
const topRollup = ref(null)
const tvs = computed(() => appStore.tvs)
const txCount24h = ref(0)
const bytesInBlocks24h = ref(0)

onMounted(async () => {
	const dataSeries = await fetchPriceSeries({ from: parseInt(DateTime.now().minus({ days: 3 }).ts / 1_000) })
	series.value = dataSeries
	appStore.currentPrice = series.value[0]
	price.value = parseFloat(series.value[0].close)

	const prevDayClosePrice = parseFloat(series.value[1].close)
	price.diff = (Math.abs(prevDayClosePrice - price.value) / ((prevDayClosePrice + price.value) / 2)) * 100
	let side = "stay"
	if (price.value - prevDayClosePrice !== 0) {
		side = price.value - prevDayClosePrice > 0 ? "rise" : "fall"
	}
	price.side = side

	const _topRollups = await fetchRollupsRanking({ limit: 1 })
	if (_topRollups.length) {
		const _r = _topRollups[0]
		topRollup.value = {
			..._r,
			category: getRankCategory(roundTo(_r.rank / 10, 0)),
			name: _r.slug.split("-").map(el => capitilize(el)).join(" "),
		}
	}
	
	
	const _tvs = await fetchTVS({ period: null })
	if (_tvs.value) {
		appStore.tvs = _tvs.value
	}

	const startTime = parseInt(DateTime.now().minus({ days: 1 }).toSeconds())
	const params = {
		table: "block_stats",
		func: "sum",
		from: startTime,
	}
	txCount24h.value = await fetchSummary({ ...params, column: "tx_count" })
	bytesInBlocks24h.value = await fetchSummary({ ...params, column: "bytes_in_block" })

	isLoading.value = false
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
								<Icon
									v-if="topRollup?.name"
									name="laurel"
									size="14"
									:color="topRollup?.category?.color"
									:style="{ marginTop: '1px' }"
								/>
								<Icon v-else name="laurel" size="14" color="tertiary" :class="$style.icon" :style="{ marginTop: '1px' }" />
								<Flex align="center" gap="4">
									<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Top Rollup:</Text>

									<Text v-if="topRollup?.name" size="12" weight="600" color="secondary" noWrap :class="$style.value">
										{{ topRollup?.name }}
									</Text>
									<Skeleton v-else w="40" h="12" />
								</Flex>
							</Flex>

							<template #content>
								<Flex direction="column" gap="8">
									<Flex align="center" justify="between" gap="8">
										<Text size="12" weight="500" color="tertiary">Rank:</Text>
										<Text size="12" weight="600" :color="topRollup?.category?.color"> {{ topRollup?.category?.name }} </Text>
									</Flex>
									<Flex align="center" justify="between" gap="8">
										<Text size="12" weight="500" color="tertiary">Score:</Text>
										<Text size="12" weight="600" color="secondary"> {{ topRollup?.rank }}% </Text>
									</Flex>
								</Flex>
							</template>
						</Tooltip>
					</NuxtLink>

					<div :class="$style.dot" />
				</template>
				
				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="coins" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Current TVS:</Text>

							<Text v-if="!isLoading" size="12" weight="600" noWrap :class="$style.value">
								{{ abbreviate(tvs, 2) }} USD
							</Text>
							<Skeleton v-else w="40" h="12" />
						</Flex>
					</Flex>

					<template #content>
						<Flex align="center" justify="between" gap="8">
							<Text size="12" weight="500" color="tertiary">Total Value Secured:</Text>
							<Text size="12" weight="600" color="secondary"> {{ comma(tvs) }} USD </Text>
						</Flex>
					</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="tx" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Txs:</Text>

							<Text v-if="!isLoading" size="12" weight="600" noWrap :class="$style.value">{{
								abbreviate(txCount24h)
							}}</Text>
							<Skeleton v-else w="40" h="12" />
						</Flex>
					</Flex>

					<template #content>
						<Flex align="center" justify="between" gap="8">
							<Text size="12" weight="500" color="tertiary">24h Tx Count:</Text>
							<Text size="12" weight="600" color="secondary"> {{ comma(txCount24h) }} </Text>
						</Flex>
					</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat">
						<Icon name="block" size="12" color="secondary" :class="$style.icon" />
						<Flex align="center" gap="4">
							<Text size="12" weight="500" color="tertiary" noWrap :class="$style.key">Bytes In Blocks:</Text>

							<Text v-if="!isLoading" size="12" weight="600" noWrap :class="$style.value">{{
								formatBytes(bytesInBlocks24h)
							}}</Text>
							<Skeleton v-else w="40" h="12" />
						</Flex>
					</Flex>

					<template #content>
						<Flex align="center" justify="between" gap="8">
							<Text size="12" weight="500" color="tertiary">24h Bytes In Blocks:</Text>
							<Text size="12" weight="600" color="secondary"> {{ comma(bytesInBlocks24h) }} Bytes </Text>
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
