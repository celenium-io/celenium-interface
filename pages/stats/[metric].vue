<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Stats Components/Constants */
import { getSeriesByPage, STATS_PERIODS, STATS_TIMEFRAMES } from "@/services/constants/stats.js"
import BarChart from "@/components/modules/stats/BarChart.vue"
import LineChart from "@/components/modules/stats/LineChart.vue"
import SquareSizeChart from "@/components/modules/stats/SquareSizeChart.vue"
import TimelineSlider from "@/components/modules/stats/TimelineSlider.vue"

/** Services */
import { getStartChainDate } from "@/services/config"
import { exportSVGToPNG, exportToCSV } from "@/services/utils/export"
import { capitalizeAndReplaceUnderscore } from "@/services/utils"

/** API */
import { fetchSeries, fetchSeriesCumulative, fetchTVS } from "@/services/api/stats"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Popover from "@/components/ui/Popover.vue"
import Toggle from "@/components/ui/Toggle.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useModalsStore } from "@/store/modals"
import { useNotificationsStore } from "@/store/notifications"
import { useSettingsStore } from "@/store/settings"
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()
const notificationsStore = useNotificationsStore()
const settingsStore = useSettingsStore()

const route = useRoute()
const router = useRouter()

const series = ref(getSeriesByPage(route.params.metric, route.query.aggregate))

if (!series.value.page) {
	router.push("/stats")
}

const metricName = computed(() => {
	if (series.value.page === "tvs") return series.value.title
	return capitalizeAndReplaceUnderscore(series.value?.page)
})

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

const selectedTimeframe = ref(
	STATS_TIMEFRAMES.find((tf) => tf.timeframe === (series.value.name === "tvs" ? "day" : selectedPeriod.value.timeframe)),
)
const timeframes = computed(() => {
	let res = [...STATS_TIMEFRAMES]

	// for (const tf of STATS_TIMEFRAMES) {
	// 	const pointCount =
	// 		Math.floor(DateTime.fromSeconds(filters.to).diff(DateTime.fromSeconds(filters.from), `${tf.timeframe}s`)[`${tf.timeframe}s`]) +
	// 		1

	// 	if (pointCount > 1 && pointCount < 100) {
	// 		res.push(tf)
	// 	}
	// }

	if (series.value.name === "tvs") {
		res = res.filter((tf) => tf.timeframe === "day" || tf.timeframe === "month")
	}

	return res
})
const timeframesStyles = computed(() => {
	const len = timeframes.value.length
	if (!len) return { background: "var(--op-5)" }

	const segment = 100 / len
	const index = timeframes.value.findIndex((tf) => tf.timeframe === selectedTimeframe.value.timeframe)
	const start = segment * index
	const end = start + segment

	return {
		background: `linear-gradient(to right, transparent ${start}%, var(--op-5) ${start}%, var(--op-5) ${end}%, transparent ${end}%)`,
	}
})

const currentData = ref([])
// const prevData = ref([])

const allData = ref([])
const loadedAllData = ref(false)
const currentChartName = ref(null)

const chartView = ref("line")
// const loadPrevData = ref(true)
// const loadLastValue = ref(true)
const updateUserSettings = () => {
	settingsStore.chart = {
		...settingsStore.chart,
		view: chartView.value,
		// loadPrevData: loadPrevData.value,
		// loadLastValue: loadLastValue.value,
	}
}

const filters = reactive({})

const setDefaultFilters = () => {
	filters.timeframe = selectedPeriod.value.timeframe
	filters.periodValue = selectedPeriod.value.value
	filters.from = parseInt(
		DateTime.now()
			.startOf("day")
	)
	filters.to = parseInt(DateTime.now().endOf("day").ts / 1_000)
}

setDefaultFilters()

const handleChangeChartView = () => {
	if (chartView.value === "line") {
		chartView.value = "bar"
	} else {
		chartView.value = "line"
	}
}

const isLoading = ref(false)

const fetchData = async () => {
	loadedAllData.value = false
	let data = []

	console.trace('fetchData', series.value.name)

	if (series.value.name === "tvs") {
		data = (
			await fetchTVS({
				period: selectedTimeframe.value.timeframe,
			})
		).map((v) => {
			return { time: v.time, value: v.close }
		})
	} else if (series.value.aggregate !== "cumulative") {
		data = await fetchSeries({
			table: series.value.name,
			period: selectedTimeframe.value.timeframe,
		})
	} else {
		data = (
			await fetchSeriesCumulative({
				name: series.value.name,
				period: selectedTimeframe.value.timeframe,
			})
		).reverse()
	}

	allData.value = data
	currentChartName.value = series.value.name
	loadedAllData.value = true

	return allData.value
}

const getData = async () => {
	isLoading.value = true

	let data = []

	const isSameRequest = currentChartName.value === series.value.name &&
		loadedAllData.value && allData.value.length > 0

	if (!isSameRequest) { 
		await fetchData()
	}

	data = allData.value

	currentData.value = data
		.filter((d) => {
			const time = new Date(d.time).getTime() / 1_000
			return time >= filters.from && time <= filters.to
		})
		.map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
		.reverse()

	series.value.currentData = [...currentData.value.slice(0, -1)]

	series.value.timeframe = filters.timeframe
	isLoading.value = false
}

if (series.value.name !== "square_size") {
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
	isLoading.value = true

	if (event.from && event.to) {
		let from = event.from
		let to = event.to

		let daysDiff = Math.round(DateTime.fromSeconds(to).diff(DateTime.fromSeconds(from), "days").days)
		if (series.value.name === "tvs") {
			if (daysDiff < 50) {
				filters.timeframe = "day"
				filters.periodValue = daysDiff
			} else {
				filters.timeframe = "month"
				filters.periodValue = Math.ceil(daysDiff / 30)
			}
		} else {
			if (daysDiff < 7) {
				filters.timeframe = "hour"
				filters.periodValue = Math.round(DateTime.fromSeconds(to).diff(DateTime.fromSeconds(from), "hours").hours)
			} else if (daysDiff < 50) {
				filters.timeframe = "day"
				filters.periodValue = daysDiff
			} else {
				filters.timeframe = "week"
				filters.periodValue = Math.ceil(daysDiff / 7)
			}
		}

		// if (filters.timeframe === "hour") {
		// 	const hoursDiff = Math.round(
		// 		DateTime.fromSeconds(Math.min(to, DateTime.now().ts / 1_000)).diff(DateTime.fromSeconds(from), "hours").hours,
		// 	)
		// 	if (hoursDiff < filters.periodValue) {
		// 		from = parseInt(
		// 			DateTime.fromSeconds(Math.min(to, DateTime.now().ts / 1_000)).minus({ hours: filters.periodValue }).ts / 1_000,
		// 		)
		// 	}
		// }

		filters.from = from
		filters.to = to
		// selectedTimeframe.value = timeframes.value.find((tf) => tf.timeframe === filters.timeframe)
		console.log('selectedTimeframe', selectedTimeframe.value)
		await getData()
	} else if (event.clear) {
		setDefaultFilters()

		await getData()
	}
}

const handleTimeframeUpdate = (tf) => {
	console.log('handleTimeframeUpdate', tf)
	selectedTimeframe.value = tf
}

const handleCSVDownload = async () => {
	// let data = [...series.value.currentData, ...series.value.prevData]
	let data = [...series.value.currentData]

	let csvHeaders = "timestamp,value\n"
	let csvRow = data.map((el) => `${DateTime.fromJSDate(el.date).ts},${el.value}`).join("\n")

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
	const svgElement = document.getElementById("chart")

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
	() => selectedTimeframe.value,
	async () => {
		if (!isLoading.value) {
			allData.value = [];
			await getData()
		}
	},
)

watch(
	() => [chartView.value],
	() => {
		updateUserSettings()
	},
)

onBeforeMount(() => {
	const settings = JSON.parse(localStorage.getItem("settings"))
	chartView.value = settings?.chart?.view || "line"
	// loadPrevData.value = settings?.chart?.loadPrevData
	// loadLastValue.value = settings?.chart?.loadLastValue
})
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
											background: `linear-gradient(to ${
												chartView === 'line' ? 'right' : 'left'
											}, var(--op-5) 50%, transparent 50%)`,
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
									<Text size="12" color="secondary">Group by</Text>

									<Flex align="center" gap="12" :class="$style.groupping_selector" :style="timeframesStyles">
										<Text
											v-for="tf in timeframes"
											@click="handleTimeframeUpdate(tf)"
											size="10"
											weight="600"
											:color="selectedTimeframe.timeframe === tf.timeframe ? 'brand' : 'secondary'"
											:class="$style.item"
										>
											{{ tf.shortTitle }}
										</Text>
									</Flex>
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

		<TimelineSlider :allData="allData" :chartView="chartView" @onUpdate="handleUpdateDate" />
	</Flex>
</template>

<style module lang="scss">
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

.groupping_selector {
	padding: 4px 6px 4px 6px;
	box-shadow: inset 0 0 0 1px var(--op-10);
	border-radius: 5px;
	cursor: pointer;
	transition: all 1s ease-in-out;

	& .item {
		padding: 2px;
	}
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
