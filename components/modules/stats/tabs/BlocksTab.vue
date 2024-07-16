<script setup>
/** Stats Components */
import BlocksFeed from "@/components/modules/stats/BlocksFeed.vue"
import ChartCardPreview from "@/components/modules/stats/ChartCardPreview.vue"
import SquareSizeCard from "@/components/modules/stats/SquareSizeCard.vue"
import SquareSizeChart from "~/components/modules/stats/SquareSizeChart.vue"

/** Constants */
import { getSeriesByGroupAndType, STATS_PERIODS } from "@/services/constants/stats.js"

const series = computed(() => getSeriesByGroupAndType('Blocks'))
const periods = ref(STATS_PERIODS)
const selectedPeriod = ref(periods.value[0])

</script>

<template>
    <Flex align="center" direction="column" gap="16" wide :class="$style.wrapper">
        <BlocksFeed />

		<Flex align="center" direction="column" gap="12" wide>
			<Flex align="center" justify="between" wide :class="$style.section">
				<Text size="16" weight="600" color="primary" justify="start">Daily Insights</Text>
			</Flex>

			<Flex align="center" justify="between" gap="16" wide :class="$style.charts_wrapper">
                <ChartCardPreview v-for="s in series.filter(s => s.name !== 'square_size')"
                    :series="s"
                    :period="selectedPeriod"
                    style="width: 320px; height: 280px"
                />

                <SquareSizeCard
                    :period="selectedPeriod"
                    style="width: 320px; height: 280px"
                />
            </Flex>
		</Flex>

		<Flex align="center" direction="column" gap="12" wide>
			<Flex align="center" justify="between" wide :class="$style.section">
				<Text size="16" weight="600" color="primary" justify="start">Square Size Distribution</Text>
			</Flex>

            <SquareSizeChart />
		</Flex>

        <!-- block time (avg) | bytes in block (cumulative) | square size current day like insights -->
    </Flex>
</template>

<style module>
.charts_wrapper {
	flex-wrap: wrap;
}

.wrapper {
	max-width: calc(var(--base-width) + 48px);
}

.section {
	margin-top: 20px;
}
</style>