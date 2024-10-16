<script setup>
/** Services */
import { abbreviate, formatBytes, comma, sortArrayOfObjects } from "@/services/utils"

/** Components */
import CircularChartCard from "@/components/modules/stats/CircularChartCard.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

const props = defineProps({
    rollups: {
        type: Array,
        required: true,
    },
})

console.log('props.rollups', props.rollups);

const metrics = ref(['total_size', 'blobs_count', 'avg_size', 'throughput', 'mb_price'])

const prepareDataByMetric = (metric) => {
    return props.rollups.map((r) => {
        return {
            id: r.id,
            name: r.name,
            value: r[metric],
        }
    })
}

console.log('prepareDataByMetric', prepareDataByMetric('blobs_count'));

</script>

<template>
    <Flex align="center" justify="between" wide :class="$style.circular_chart_wrapper">
        <CircularChartCard v-for="m in metrics" :data="prepareDataByMetric(m)" :class="$style.circular_chart" />
    </Flex>
</template>

<style module>
.circular_chart_wrapper {
    flex-wrap: wrap;

    width: 100%;
    height: 700px;

    background: var(--card-background);
}

.circular_chart {
	max-width: 300px;
	max-height: 250px;
}
</style>