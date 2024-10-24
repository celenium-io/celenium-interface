<script setup>
/** Stats Components */
import PieChartCard from "@/components/modules/stats/PieChartCard.vue"
import RollupsBubbleChart from "@/components/modules/stats/RollupsBubbleChart.vue"
import RollupsActivity from "~/components/modules/stats/RollupsActivity.vue"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Constants */
import { getSeriesByGroupAndType } from "@/services/constants/stats.js"

/** Services */
import { capitalizeAndReplaceUnderscore } from "@/services/utils";

/** API */
import { fetchRollups, fetchRollupsDailyStats } from "@/services/api/rollup.js"

const isLoading = ref(false)
const rollupsDailyStats = ref([])
const series = ref()

const getRollups = async () => {
	isLoading.value = true

	series.value = getSeriesByGroupAndType('Rollups')

	fetchRollups({ limit: 100 })
	.then((res) => {
		series.value.data = res
	})
	.finally(() => {
		isLoading.value = false
	})

}

const getRollupsDailyStats = async () => {
	isLoading.value = true

	const data = await fetchRollupsDailyStats({
		limit: 100,
	})
	
	rollupsDailyStats.value = data

    isLoading.value = false
}

const tabs = ref(['overview', 'daily_stats'])
const selectedTab = ref(tabs.value[0])

watch(
	() => selectedTab.value,
	async () => {
		switch (selectedTab.value) {
			case 'overview':
				if (!series.value.data.length) {
					await getRollups()
				}

				break
			case 'daily_stats':
				if (!rollupsDailyStats.value.length) {
						await getRollupsDailyStats()
					}

				break
			default:
				break
		}
	}
)

await getRollups()
</script>

<template>
    <Flex align="center" direction="column" gap="12" wide :class="$style.wrapper">
		<Flex align="center" justify="between" wide :class="$style.section">
			<Flex align="center" gap="12">
				<Text
					v-for="t in tabs"
					@click="selectedTab = t"
					size="16"
					weight="600"
					:class="[$style.tab, t === selectedTab && $style.active]"
				>
					{{ capitalizeAndReplaceUnderscore(t) }}
				</Text>
			</Flex>

			<Button link="/rollups" type="secondary" size="mini">
				<Icon name="rollup-leaderboard" size="12" color="secondary" />
				Rollups Leaderboard
			</Button>
		</Flex>

		<Flex v-if="selectedTab === 'overview'" align="center" direction="column" gap="12" wide>
			<RollupsBubbleChart v-if="!isLoading" :series="series" />

			<template v-if="!isLoading">
				<Flex align="center" justify="between" wide :class="$style.section">
					<Text size="16" weight="600" color="primary" justify="start">Top Rollups</Text>
				</Flex>

				<Flex align="center" justify="between" gap="16" wide :class="$style.charts_wrapper">
					<PieChartCard
						v-for="s in series"
						:series="s"
						:data="series.data"
						dounut
						:class="$style.chart_card"
					/>
				</Flex>
			</template>
		</Flex>

		<RollupsActivity v-else-if="selectedTab === 'daily_stats' && !isLoading" :rollups="rollupsDailyStats" />
    </Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);
}

.tab {
	color: var(--txt-tertiary);
	cursor: pointer;

	transition: all 0.2s ease;
}

.tab.active {
	color: var(--txt-primary);
}

.section {
	margin-top: 20px;
}

.charts_wrapper {
	flex-wrap: wrap;
}

.chart_card {
	max-width: 480px;
	max-height: 200px;
}

@media (max-width: 900px) {
	/* .chart_card {
		flex: 1;
	} */
}
</style>
