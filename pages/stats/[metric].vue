<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Stats Components/Constants */
import { getSeriesByPage, STATS_PERIODS } from "@/services/constants/stats.js"
import BarChart from "@/components/modules/stats/BarChart.vue"
import LineChart from "@/components/modules/stats/LineChart.vue"
import SquareSizeChart from "@/components/modules/stats/SquareSizeChart.vue"

/** Services */
import { getStartChainDate } from "@/services/config"
import { exportSVGToPNG, exportToCSV } from "@/services/utils/export"
import { capitalizeAndReplaceUnderscore } from "@/services/utils"

/** API */
import { fetchSeries, fetchSeriesCumulative } from "@/services/api/stats"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Popover from "@/components/ui/Popover.vue"
import Toggle from "@/components/ui/Toggle.vue"

/** Store */
/** Store */
import { useModalsStore } from "@/store/modals"
import { useNotificationsStore } from "@/store/notifications"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const notificationsStore = useNotificationsStore()
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const series = ref(getSeriesByPage(route.params.metric, route.query.aggregate))

if (!series.value.page) {
	router.push("/stats")
}

const metricName = computed(() => capitalizeAndReplaceUnderscore(series.value?.page))

// defineOgImage({
// 	title: "Rollup",
// 	rollup: rollup.value,
// 	component: "RollupImage",
// 	cacheKey: `${rollup.value?.name}`,
// })

useHead({
	title: `Celestia ${metricName.value} Statistics - Celestia Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://celenium.io${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Explore Celestia ${metricName.value} statistics as well as statistics by rollups, blocks, transactions and more.`,
		},
		{
			property: "og:title",
			content: `Celestia ${metricName.value} Statistics - Celestia Explorer`,
		},
		{
			property: "og:description",
			content: `Explore Celestia ${metricName.value} statistics as well as statistics by rollups, blocks, transactions and more.`,
		},
		{
			property: "og:url",
			content: `https://celenium.io${route.path}`,
		},
		{
			property: "og:image",
			content: `https://celenium.io${route.path}__og_image__/og.png`,
		},
		{
			name: "twitter:title",
			content: `Celestia ${metricName.value} Statistics - Celestia Explorer`,
		},
		{
			name: "twitter:description",
			content: `Explore Celestia ${metricName.value} statistics as well as statistics by rollups, blocks, transactions and more.`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})

const periods = ref(STATS_PERIODS)
const selectedPeriod = ref(periods.value[2])

const currentData = ref([])
const prevData = ref([])

const chartView = ref('line')
const loadPrevData = ref(true)
const loadLastValue = ref(true)

const filters = reactive({})

const setDefaultFilters = () => {
	filters.timeframe = selectedPeriod.value.timeframe
	filters.periodValue = selectedPeriod.value.value
	filters.from = parseInt(DateTime.now().startOf('day').minus({
				days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value - 1 : 0, // ??
				hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value : 0,
			}).ts  / 1_000)
	filters.to = parseInt(DateTime.now().endOf('day').ts  / 1_000)
}

setDefaultFilters()

const handleChangeChartView = () => {
	if (chartView.value === 'line') {
		chartView.value = 'bar'
	} else {
		chartView.value = 'line'
	}
}

const isLoading = ref(false)
const getData = async () => {
    isLoading.value = true

    let data = []
	// if (series.value.aggregate !== 'cumulative') {
	// 	data = (await fetchSeries({
	// 		table: series.value.name,
	// 		period: selectedPeriod.value.timeframe,
	// 		from: parseInt(
	// 			DateTime.now().minus({
	// 				days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value * (loadPrevData.value ? 2 : 1) : 0,
	// 				hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value * (loadPrevData.value ? 2 : 1) : 0,
	// 			}).ts / 1_000)
	// 	})).reverse()
	// } else {
	// 	data = await fetchSeriesCumulative({
	// 		name: series.value.name,
	// 		period: selectedPeriod.value.timeframe,
	// 		from: parseInt(
	// 			DateTime.now().minus({
	// 				days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value * (loadPrevData.value ? 2 : 1) : 0,
	// 				hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value * (loadPrevData.value ? 2 : 1) : 0,
	// 			}).ts / 1_000)
	// 	})
	// }

	if (series.value.aggregate !== 'cumulative') {
		data = (await fetchSeries({
			table: series.value.name,
			period: filters.timeframe,
			from: loadPrevData.value ? parseInt(DateTime.fromSeconds(filters.from).minus({
				hours: filters.timeframe === "hour" ? filters.periodValue : 0,
				days: filters.timeframe === "day" ? filters.periodValue : 0,
				weeks: filters.timeframe === "week" ? filters.periodValue : 0,
			}).ts / 1_000) : filters.from,
			to: filters.to
		})).reverse()
	} else {
		data = await fetchSeriesCumulative({
			name: series.value.name,
			period: filters.timeframe,
			from: filters.from,
			to: filters.to
		})
	}

    // if (data.length) {
    //     if (loadPrevData.value) {
    //         prevData.value = data.slice(0, selectedPeriod.value.value).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
    //         currentData.value = data.slice(selectedPeriod.value.value, data.length).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
    //     } else {
	// 		prevData.value = []
    //         currentData.value = data.slice(0, selectedPeriod.value.value).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
    //     }
    // }

	if (data.length) {
        if (loadPrevData.value) {
            prevData.value = data.slice(0, filters.periodValue).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
            currentData.value = data.slice(filters.periodValue, data.length).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
        } else {
			prevData.value = []
            currentData.value = data.slice(0, filters.periodValue).map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
        }
    }

	series.value.currentData = loadLastValue.value ? currentData.value : [...currentData.value.slice(0, -1)]
	series.value.prevData = (loadLastValue.value ? prevData.value : (prevData.value.length ? [...prevData.value.slice(0, -1)] : prevData.value)).slice(-series.value.currentData.length)
	series.value.timeframe = filters.timeframe

    isLoading.value = false
}

if (series.value.name !== 'square_size') {
	await getData()
}

const isOpen = ref(false)
const handleOpen = () => {
	isOpen.value = true
}
const handleClose = () => {
	isOpen.value = false
}

const handleUpdateDate = async (event) => {
	if (event.from && event.to) {
		let daysDiff = Math.round(DateTime.fromSeconds(event.to).diff(DateTime.fromSeconds(event.from), 'days').days)
		if (daysDiff < 7) {
			filters.timeframe = 'hour'
			filters.periodValue = Math.round(DateTime.fromSeconds(event.to).diff(DateTime.fromSeconds(event.from), 'hours').hours)
		} else if (daysDiff < 50) {
			filters.timeframe = 'day'
			filters.periodValue = daysDiff
		} else {
			filters.timeframe = 'week'
			filters.periodValue = Math.round(daysDiff / 7)
		}
		
		filters.from = event.from
		filters.to = event.to

		await getData()
	} else if (event.clear) {
		setDefaultFilters()

		await getData()
	}
}

const handleCSVDownload = async () => {
	let data = [...series.value.currentData, ...series.value.prevData]
	let csvHeaders = 'timestamp,value\n'
	let csvRow = data.map(el => `${DateTime.fromJSDate(el.date).ts},${el.value}`).join('\n')

	await exportToCSV(csvHeaders + csvRow, `${series.value.name}-${filters.from}-${filters.to}`)
	
	notificationsStore.create({
		notification: {
			type: "success",
			icon: "check",
			title: "Data successfully downloaded",
			autoDestroy: true,
		},
	})
}

const handlePNGDownload = async () => {
	const svgElement = document.getElementById('chart')

	await exportSVGToPNG(svgElement, `${series.value.name}-${filters.from}-${filters.to}-${chartView.value}`)

	notificationsStore.create({
		notification: {
			type: "success",
			icon: "check",
			title: "Image successfully downloaded",
			autoDestroy: true,
		},
	})
}

const handleOpenChartModal = () => {
	cacheStore.chart.series = series.value
	cacheStore.chart.view = chartView.value

	modalsStore.open("chart")
}

watch(
	() => loadLastValue.value,
	() => {
		if (loadLastValue.value) {
			series.value.currentData = currentData.value
			series.value.prevData = loadPrevData.value ? prevData.value : []
		} else {
			series.value.currentData = [...currentData.value.slice(0, -1)]
			if (prevData.value.length && loadPrevData.value) {
				series.value.prevData = [...prevData.value.slice(0, -1)]
			}
		}
	}
)

watch(
	() => loadPrevData.value,
	async () => {
		if (loadPrevData.value) {
			if (prevData.value.length) {
				series.value.currentData = loadLastValue.value ? currentData.value : [...currentData.value.slice(0, -1)]
				series.value.prevData = loadLastValue.value ? prevData.value : [...prevData.value.slice(0, -1)]
			} else {
				await getData()
			}
		} else {
			series.value.prevData = []
		}
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
						{ link: route.fullPath, name: metricName },
					]"
				/>
			</Flex>

			<Flex align="center" justify="between" wide :class="$style.header">
				<Text size="16" weight="600" color="primary" justify="start"> {{ `${metricName} Chart` }} </Text>

				<Flex align="center" gap="8" :class="series.name === 'square_size' && $style.disabled">
					<!-- <Dropdown>
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
					</Dropdown> -->

					<DatePicker
						@on-update="handleUpdateDate"
						:period="selectedPeriod"
						:from="filters.from"
						:to="filters.to"
						:minDate="getStartChainDate()"
						:showTitle="false"
					/>
					
					<Popover :open="isOpen" @on-close="handleClose" width="200" side="right">
						<Button @click="handleOpen" type="secondary" size="mini">
							<Icon name="settings" size="12" color="tertiary" />
						</Button>

						<template #content>
							<Flex direction="column" gap="12">
								<Flex align="center" justify="between" gap="6" :class="$style.setting_item">
									<Text size="12" color="secondary">Chart view</Text>

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
									<Toggle v-model="loadPrevData" color="var(--neutral-mint)" />
								</Flex>

								<Flex align="center" justify="between" gap="6" :class="$style.setting_item">
									<Text size="12" :color="loadLastValue ? 'secondary' : 'tertiary'">Show last value</Text>
									<Toggle v-model="loadLastValue" color="var(--neutral-mint)" />
								</Flex>
							</Flex>
						</template>
					</Popover>

					<Button @click="handleOpenChartModal" type="secondary" size="mini">
						<Icon name="expand" size="12" color="tertiary" />
					</Button>

					<Dropdown>
						<Button type="secondary" size="mini">
							<Icon name="download" size="12" color="tertiary" />
						</Button>

						<template #popup>
							<DropdownItem @click="handleCSVDownload">
								<Text size="12" color="secondary">Export to CSV</Text>
							</DropdownItem>
							<DropdownItem @click="handlePNGDownload">
								<Text size="12" color="secondary">Export to PNG</Text>
							</DropdownItem>
						</template>
					</Dropdown>

				</Flex>
			</Flex>
		</Flex>

		<SquareSizeChart v-if="series.name === 'square_size'" />
        <LineChart v-else-if="chartView === 'line'" :series="series" />
		<BarChart v-else-if="chartView === 'bar'" :series="series" />
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
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

.disabled {
	opacity: 0.3;
	pointer-events: none;
	cursor: default;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
