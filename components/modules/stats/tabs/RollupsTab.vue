<script setup>
/** Stats Components */
import PieChartCard from "@/components/modules/stats/PieChartCard.vue"
import RollupsBubbleChart from "@/components/modules/stats/RollupsBubbleChart.vue"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Constants */
import { getSeriesByGroupAndType } from "@/services/constants/stats.js"

/** API */
import { fetchRollups } from "@/services/api/rollup.js"

const isLoading = ref(false)
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

await getRollups()
</script>

<template>
    <Flex align="center" direction="column" gap="12" wide :class="$style.wrapper">
		<Flex align="center" direction="column" gap="12" wide>
			<Flex align="center" justify="between" wide :class="$style.section">
				<Flex align="center" gap="4">
					<Text size="16" weight="600" color="primary" justify="start">Overview</Text>
				</Flex>

				<Button link="/rollups" type="secondary" size="mini">
					<Icon name="rollup-leaderboard" size="12" color="secondary" />
					Rollups Leaderboard
				</Button>
			</Flex>
            
            <RollupsBubbleChart v-if="!isLoading" :series="series" />
		</Flex>

		<Flex v-if="!isLoading" align="center" direction="column" gap="12" wide>
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
		</Flex>
    </Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);
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
