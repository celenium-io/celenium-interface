<script setup>
/** Stats Components */
import GeoMap from "@/components/modules/stats/GeoMap.vue"

/** Constants */
import { getSeriesByGroupAndType, STATS_PERIODS } from "@/services/constants/stats.js"

const series = computed(() => getSeriesByGroupAndType('Blocks'))
const periods = ref(STATS_PERIODS)
const selectedPeriod = ref(periods.value[0])

</script>

<template>
    <Flex align="center" direction="column" gap="16" wide :class="$style.wrapper">
        
		<GeoMap
			:class="$style.chart"
		/>
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

.chart {
	width: 1000px;
	height: 640px;
}

@media (max-width: 1050px) {
	.chart {
		width: 400px;
		height: 280px;
	}
}

@media (max-width: 900px) {
	.chart {
		flex: 1;
		min-width: 400px;
		height: 280px;
	}
}

@media (max-width: 420px) {
	.wrapper {
		padding: 32px 0px;
	}

	.chart {
		flex: 1;
		min-width: 340px;
		height: 380px;
	}
}
</style>