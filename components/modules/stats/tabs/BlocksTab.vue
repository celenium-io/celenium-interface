<script setup>
/** Stats Components */
import BlocksFeed from "@/components/modules/stats/BlocksFeed.vue"
import ChartCardPreview from "@/components/modules/stats/ChartCardPreview.vue"
import ShareTotalBars from "~/components/modules/stats/ShareTotalBars.vue"

/** Constants */
import { getInsightsByGroup, getSeriesByGroupAndType, STATS_PERIODS } from "@/services/constants/stats.js"

const isLoading = ref(false)
const series = computed(() => getSeriesByGroupAndType('Blocks'))
const periods = ref(STATS_PERIODS)
const selectedPeriod = ref(periods.value[0])

</script>

<template>
    <Flex align="center" direction="column" gap="12" wide :class="$style.wrapper">
        <BlocksFeed />

        <ShareTotalBars />

        <Flex align="center" justify="between" gap="16" wide :class="$style.charts_wrapper">
            <ChartCardPreview v-for="s in series.filter(s => s.name !== 'square_size')"
                :series="s"
                :period="selectedPeriod"
                style="width: 320px; height: 280px"
            />
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

</style>