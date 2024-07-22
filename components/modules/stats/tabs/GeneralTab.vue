<script setup>
/** UI */
import AmountInCurrency from "@/components/AmountInCurrency.vue"
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"


/** Stats Components */
import BlocksFeed from "@/components/modules/stats/BlocksFeed.vue"
import ChartCardPreview from "@/components/modules/stats/ChartCardPreview.vue"
import HighlightCard from "@/components/modules/stats/HighlightCard.vue"
import InsightCard from "@/components/modules/stats/InsightCard.vue"

/** Constants */
import { getInsightsByGroup, getSeriesByGroupAndType, STATS_PERIODS } from "@/services/constants/stats.js"

/** Services */
import { comma, tia } from "@/services/utils"

/** API */
import { fetch24hDiffs } from "@/services/api/stats.js"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const isLoading = ref(false)
const lastHead = computed(() => appStore.lastHead)
const diffs24h = ref({})
const highlights = computed(() => {
	return [
		{
			name: 'blocks',
			title: 'Blocks',
			value: lastHead.value.last_height,
		},
		{
			name: 'txs',
			title: 'Transactions',
			value: lastHead.value.total_tx,
			diff: diffs24h.value.tx_count_24h,
		},
		{
			name: 'blobs_size',
			title: 'Blobs Size',
			units: 'bytes',
			value: lastHead.value.total_blobs_size,
			diff: diffs24h.value.blobs_size_24h,
		},
		{
			name: 'fee',
			title: 'Total Fees',
			units: 'utia',
			value: lastHead.value.total_fee,
			diff: diffs24h.value.fee_24h,
		},
	]
})

const periods = ref(STATS_PERIODS)
const selectedPeriod = ref(periods.value[1])

const series = computed(() => getSeriesByGroupAndType('General'))
const insights = computed(() => getInsightsByGroup('General'))

const get24hDiffs = async () => {
    isLoading.value = true

	const data = await fetch24hDiffs({ name: 'changes_24h' })
	diffs24h.value = data

    isLoading.value = false
}

await get24hDiffs()
</script>

<template>
	<Flex direction="column" gap="24" wide :class="$style.wrapper">
		<Flex align="center" direction="column" gap="10">
			<Flex justify="between" wide :class="$style.highlights_wrapper">
				<HighlightCard v-for="h in highlights" :highlight="h" />
			</Flex>

			<Flex align="center" justify="start" wide>
				<BlocksFeed />
			</Flex>
		</Flex>

		<Flex align="center" direction="column" gap="12">
			<Flex align="center" justify="between" wide :class="$style.section">
				<Text size="16" weight="600" color="primary" justify="start">Daily Insights</Text>
			</Flex>

			
			<Flex align="center" justify="between" gap="16" wide :class="$style.charts_wrapper">
				<InsightCard v-for="i in insights"
					:series="i"
					:class="$style.chart_card"
				/>
			</Flex>
		</Flex>

		<Flex align="center" direction="column" gap="12">
			<Flex align="center" justify="between" wide :class="$style.section">
				<Text size="16" weight="600" color="primary" justify="start">Overview</Text>

				<Dropdown>
					<Button size="mini" type="secondary">
						{{ selectedPeriod.title }}
						<Icon name="chevron" size="12" color="secondary" />
					</Button>

					<template #popup>
						<DropdownItem v-for="(period, idx) in periods" @click="selectedPeriod = period">
							<Flex align="center" gap="8">
								<Icon :name="period.title === selectedPeriod.title ? 'check' : ''" size="12" color="secondary" />
								{{ period.title }}
							</Flex>
						</DropdownItem>
					</template>
				</Dropdown>
			</Flex>

			<Flex align="center" justify="between" gap="16" wide :class="$style.charts_wrapper">
				<ChartCardPreview v-for="s in series"
					:series="s"
					:period="selectedPeriod"
					:class="$style.chart_card"
				/>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	/* padding: 40px 24px 60px 24px; */
}

.highlights_wrapper{
	flex-wrap: wrap;
}

.section {
	margin-top: 20px;
}

.charts_wrapper {
	flex-wrap: wrap;
}

.chart_card {
	width: 320px;
	height: 280px;
}

@media (max-width: 1050px) {
	.chart_card {
		width: 400px;
		height: 280px;
	}
}

@media (max-width: 900px) {
	.chart_card {
		flex: 1;
		min-width: 400px;
		height: 280px;
	}
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
