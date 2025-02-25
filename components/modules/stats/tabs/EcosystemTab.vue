<script setup>
/** Stats Components */
import GeoMap from "@/components/modules/stats/GeoMap.vue"
import BarplotChartCard from "@/components/modules/stats/BarplotChartCard.vue";
// import PieChartCard from "@/components/modules/stats/PieChartCard.vue"

/** Constants */
import { getSeriesByGroupAndType, STATS_PERIODS } from "@/services/constants/stats.js"

/** Services */
import { capitilize, isMobile, sortArrayOfObjects } from "@/services/utils"

/** API */
import { fetchNodeStats } from "@/services/api/stats"

const isLoading = ref(true)
const series = computed(() => getSeriesByGroupAndType('Ecosystem'))

const getNodeStats = async (name) => {
	const data = await fetchNodeStats({ name })

	if (!data.length) return []

	return sortArrayOfObjects(data, "amount")
}

const prepareData = async () => {
	isLoading.value = true

	for (const s of series.value) {
		const data = await getNodeStats(s.name)
		
		let otherEntry = null
		s.data = data.reduce((acc, d) => {
            let name = d.name === "celestia-celestia" ? "Celestia" : capitilize(d.name);

            if (name === "Unknown" || name === "Other") {
                if (!otherEntry) {
                    otherEntry = { ...d, name: "Other" }
                    acc.push(otherEntry)
                } else {
                    otherEntry.amount += d.amount
                }
            } else {
                acc.push({ ...d, name })
            }

            return acc
        }, [])

		if (s.name === "version") {
			s.data = sortArrayOfObjects(s.data, "name")
		} else if (s.name === "nodetype") {
			s.data = sortArrayOfObjects(s.data, "amount")
		}
	}
}

onMounted(async () => {
	await prepareData()

	isLoading.value = false
})
</script>

<template>
    <Flex align="center" direction="column" gap="16" wide :class="$style.wrapper">
        <Flex align="start" direction="column" gap="32" wide :class="$style.section">
			<Text size="16" weight="600" color="primary" justify="start">Light Node Distribution</Text>

			<GeoMap :class="$style.chart" />

			<Flex v-if="!isLoading" align="center" justify="between" gap="16" wide :class="$style.charts_wrapper">
				<BarplotChartCard
					v-for="s in series"
					:series="s"
					:data="s.data"
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
	max-width: 100%;
}

.charts_wrapper {
	flex-wrap: wrap;
}

.chart {
	width: 100%;
	max-width: 1000px;
	aspect-ratio: 16 / 10;
	/* height: 640px; */
}

.chart_card {
	width: 480px;
	max-width: 480px;
	max-height: 240px;
	height: 240px;
}

@media (max-width: 1050px) {
	.chart {
		/* width: 700px; */
		/* height: 280px; */
	}
}

@media (max-width: 900px) {
	.chart {
		/* flex: 1; */
		/* max-width: 500px; */
		/* height: 280px; */
	}
}

@media (max-width: 420px) {
	.wrapper {
		padding: 32px 0px;
	}

	.chart {
		/* flex: 1; */
		/* max-width: 340px; */
		/* height: 380px; */
		aspect-ratio: 4 / 5;
	}
}
</style>