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
    <Flex align="center" justify="between" wide :class="$style.chart_wrapper">
        <ParallelCoordinatesChart :data="rollups" :metrics="metrics" />
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
</style>