<script setup>
/** Components */
import ParallelCoordinatesChart from "@/components/modules/stats/ParallelCoordinatesChart.vue"

const props = defineProps({
    rollups: {
        type: Array,
        required: true,
    },
})

const metrics = ref([
    'total_size',
    'avg_size',
    'blobs_count',
    'throughput',
    'mb_price',
])
</script>

<template>
    <Flex v-if="rollups?.length" align="center" justify="between" wide :class="$style.chart_wrapper">
        <ParallelCoordinatesChart :data="rollups" :metrics="metrics" />
    </Flex>
    <Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
        <Text size="13" weight="600" color="secondary" align="center"> No activity </Text>
        <Text size="12" weight="500" height="160" color="tertiary" align="center">
            There has been no rollup activity in the last 24 hours
        </Text>
    </Flex>
</template>

<style module>
.chart_wrapper {
    width: 100%;
    height: 900px;

    background: var(--card-background);
}

.circular_chart {
	max-width: 300px;
	max-height: 250px;
}

.empty {
    width: 100%;
    background: var(--card-background);
	padding: 16px 0;
}
</style>