<script setup>
/** Components */
import ParallelCoordinatesChart from "@/components/modules/stats/ParallelCoordinatesChart.vue"

const emit = defineEmits(['clearFilters'])
const props = defineProps({
    rollups: {
        type: Array,
        required: true,
    },
    isFilterActive: {
        type: Boolean,
        default: false,
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
        <Text v-if="!isFilterActive" size="12" weight="500" height="160" color="tertiary" align="center">
            There has been no network activity in the last 24 hours
        </Text>
        <Text v-else size="12" weight="500" height="160" color="tertiary" align="center">
            Try to change the filters or <Text @click="emit('clearFilters')" size="12" color="secondary" :style="{cursor: 'pointer', textDecoration: 'underline'}">clear</Text> them
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