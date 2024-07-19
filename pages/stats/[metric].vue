<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Stats Components/Constants */
import { getSeriesByPage, STATS_PERIODS } from "@/services/constants/stats.js"
import LineChart from "@/components/modules/stats/LineChart.vue"

/** Services */
import { abbreviate, capitilize, comma, formatBytes } from "@/services/utils"

/** API */
import { fetchSeries, fetchSeriesCumulative } from "@/services/api/stats"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const series = ref(getSeriesByPage(route.params.metric))
// const ss = getSeriesByPage('transactions')
// console.log(ss);
// console.log('route.params.metric', route.params.metric);
// console.log('getSeriesByPage(route.params.metric)', getSeriesByPage('transactions'));
// console.log('series.value', series.value);
// const { data: rawRollup } = await fetchRollupBySlug(route.params.slug)

if (!series.value.page) {
	router.push("/stats")
}
// else {
	// rollup.value = rawRollup.value
	// cacheStore.current.rollup = rollup.value
// }

// defineOgImage({
// 	title: "Rollup",
// 	rollup: rollup.value,
// 	component: "RollupImage",
// 	cacheKey: `${rollup.value?.name}`,
// })

// useHead({
// 	title: `Rollup ${rollup.value?.name} - Celestia Explorer`,
// 	link: [
// 		{
// 			rel: "canonical",
// 			href: `https://celenium.io${route.path}`,
// 		},
// 	],
// 	meta: [
// 		{
// 			name: "description",
// 			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
// 		},
// 		{
// 			property: "og:title",
// 			content: `Rollup ${rollup.value?.name} - Celestia Explorer`,
// 		},
// 		{
// 			property: "og:description",
// 			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
// 		},
// 		{
// 			property: "og:url",
// 			content: `https://celenium.io${route.path}`,
// 		},
// 		{
// 			property: "og:image",
// 			content: `https://celenium.io${route.path}__og_image__/og.png`,
// 		},
// 		{
// 			name: "twitter:title",
// 			content: `Rollup ${rollup.value?.name} - Celestia Explorer`,
// 		},
// 		{
// 			name: "twitter:description",
// 			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
// 		},
// 		{
// 			name: "twitter:card",
// 			content: "summary_large_image",
// 		},
// 	],
// })

const periods = ref(STATS_PERIODS)
const selectedPeriod = ref(periods.value[2])
const loadPrevData = ref(true)

const isLoading = ref(false)
const getData = async () => {
    isLoading.value = true

    let data = []
    data = (await fetchSeries({
        table: series.value.name,
        period: selectedPeriod.value.timeframe,
        from: parseInt(
            DateTime.now().minus({
                days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value * (loadPrevData.value ? 2 : 1) : 0,
                hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value * (loadPrevData.value ? 2 : 1) : 0,
            }).ts / 1_000)
    })).reverse()

    if (data.length) {
        if (loadPrevData.value) {
            series.value.prevData = data.slice(0, selectedPeriod.value.value).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
            series.value.currentData = data.slice(selectedPeriod.value.value, data.length).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
        } else {
            series.value.currentData = data.slice(0, selectedPeriod.value.value).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
        }
    }

    isLoading.value = false
}

await getData()
</script>

<template>
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
			<Flex align="end" justify="between" :class="$style.breadcrumbs">
				<Breadcrumbs
					v-if="series"
					:items="[
						{ link: '/', name: 'Explore' },
						{ link: '/stats', name: 'Statistics' },
						{ link: route.fullPath, name: capitilize(series.page) },
					]"
				/>

				<!-- <Button link="https://forms.gle/nimJyQJG4Lb4BTcG7" target="_blank" type="secondary" size="mini">
					<Icon name="rollup-plus" size="12" color="secondary" /> Rollup Registration
				</Button> -->
			</Flex>
			
			<!-- <RollupOverview v-if="rollup" :rollup="rollup" /> -->
		</Flex>

        <LineChart :series="series" />
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 26px 24px 60px 24px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
