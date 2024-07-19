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
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Popover from "@/components/ui/Popover.vue"
import Toggle from "@/components/ui/Toggle.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

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
const chartView = ref('line')
const loadPrevData = ref(true)
const loadToday = ref(true)

const handleChangeChartView = () => {
	if (chartView.value === 'line') {
		console.log('Was line');
		chartView.value = 'bar'
	} else {
		console.log('Was bar');
		chartView.value = 'line'
	}
}

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

const isOpen = ref(false)
const handleOpen = () => {
	isOpen.value = true
}
const handleClose = () => {
	isOpen.value = false
}

watch(
	() => selectedPeriod.value,
	async () => {
		await getData()
	},
)

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

			<Flex align="center" justify="between" wide :class="$style.header">
				<Text size="16" weight="600" color="primary" justify="start">Transactions Chart</Text>

				<Flex align="center" gap="8">
					<Dropdown>
						<Button size="mini" type="secondary">
							{{ selectedPeriod.title }}
							<Icon name="chevron" size="12" color="secondary" />
						</Button>

						<template #popup>
							<DropdownItem v-for="(period, idx) in periods" @click="selectedPeriod = period">
								<Flex align="center" gap="8">
									<Icon :name="period.title === selectedPeriod.title ? 'check' : ''" size="12" color="secondary" />
									{{ period.title }}
								</Flex>
							</DropdownItem>
						</template>
					</Dropdown>
					
					<Popover :open="isOpen" @on-close="handleClose" width="200" side="right">
						<Button @click="handleOpen" type="secondary" size="mini">
							<Icon name="settings" size="12" color="tertiary" />
						</Button>

						<template #content>
							<Flex direction="column" gap="12">
								<Flex align="center" justify="between" gap="6" :class="$style.setting_item">
									<Text size="12" color="secondary">Line chart</Text>

									<Flex
										@click="handleChangeChartView"
										align="center"
										gap="12"
										:class="$style.chart_selector"
										:style="{
											background: `linear-gradient(to ${chartView === 'line' ? 'right' : 'left'}, var(--op-5) 50%, transparent 50%)`,
										}"
									>
										<Icon
											name="line-chart"
											size="14"
											:style="{ fill: `${chartView === 'line' ? 'var(--mint)' : 'var(--txt-tertiary)'}` }"
										/>

										<Icon
											name="bar-chart"
											size="14"
											:style="{ fill: `${chartView === 'bar' ? 'var(--mint)' : 'var(--txt-tertiary)'}` }"
										/>
									</Flex>
								</Flex>

								<Flex align="center" justify="between" gap="6" :class="$style.setting_item">
									<Text size="12" :color="loadPrevData ? 'secondary' : 'tertiary'">Previous period</Text>
									<Toggle v-model="loadPrevData" color="var(--mint)" />
								</Flex>

								<Flex align="center" justify="between" gap="6" :class="$style.setting_item">
									<Text size="12" :color="loadToday ? 'secondary' : 'tertiary'">Show today</Text>
									<Toggle v-model="loadToday" color="var(--mint)" />
								</Flex>
								<!-- <Button @click="handleApply" type="secondary" size="mini" wide>Apply</Button> -->
							</Flex>
						</template>
					</Popover>
				</Flex>
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

.setting_item {
	min-height: 24px;
}

.chart_selector {
	padding: 4px 6px 4px 6px;
	box-shadow: inset 0 0 0 1px var(--op-10);
	border-radius: 5px;
	cursor: pointer;
	transition: all 1s ease-in-out;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
