<script setup>
/** Stats Components */
import PieChartCard from "@/components/modules/stats/PieChartCard.vue"
import RollupsBubbleChart from "@/components/modules/stats/RollupsBubbleChart.vue"

/** Constants */
import { getSeriesByGroupAndType } from "@/services/constants/stats.js"

/** API */
import { fetchRollups } from "@/services/api/rollup.js"

// main chart
// distribution based on rollup leaderboard

const isLoading = ref(false)
const series = computed(() => getSeriesByGroupAndType('Rollups'))
const rollups = ref([])

const getRollups = async () => {
	isLoading.value = true

	const data = await fetchRollups({})

    rollups.value = data

    isLoading.value = false
}

onBeforeMount(async () => {
    await getRollups()
})
</script>

<template>
    <Flex align="center" direction="column" gap="12" wide :class="$style.wrapper">
		<Flex align="center" direction="column" gap="12" wide>
			<Flex align="center" justify="between" wide :class="$style.section">
				<Text size="16" weight="600" color="primary" justify="start">Overview</Text>
			</Flex>
            
            <RollupsBubbleChart v-if="!isLoading" :series="series" />
		</Flex>

		<Flex align="center" direction="column" gap="12" wide>
			<Flex align="center" justify="between" wide :class="$style.section">
				<Text size="16" weight="600" color="primary" justify="start">Top Rollups</Text>
			</Flex>

			<Flex align="center" justify="between" gap="16" wide :class="$style.charts_wrapper">
                <PieChartCard
                    v-if="!isLoading"
                    v-for="s in series"
                    :series="s"
                    :data="rollups"
                    dounut
                    style="width: 480px; height: 200px"
                />
            </Flex>
		</Flex>
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
