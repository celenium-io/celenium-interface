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
	if (series.value?.page === "tvs") return series.value.title
	return capitalizeAndReplaceUnderscore(series.value?.page)
})

defineOgImage({
	title: "Statistics",
	series: series.value,
	component: "StatsMetricImage",
	cacheKey: `${series.value?.page}`,
})

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

const selectedPeriod = ref({})

const selectedTimeframe = ref(STATS_TIMEFRAMES.find((tf) => tf.timeframe === "day"))
const timeframes = computed(() => {
	let res = [...STATS_TIMEFRAMES]

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

const allData = ref([])
const loadedAllData = ref(false)
const currentChartName = ref(null)

const chartView = ref("line")

const updateUserSettings = () => {
	settingsStore.chart = {
		...settingsStore.chart,
		view: chartView.value,
	}
}

const filters = reactive({})

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

	const isSameRequest = currentChartName.value === series.value.name && loadedAllData.value && allData.value.length > 0

	if (!isSameRequest) {
		await fetchData()
	}

	data = allData.value

	if (data.length > 0 && !filters.from && !filters.to) {
		const firstDate = new Date(data[data.length - 1].time)
		const lastDate = new Date(data[0].time)

		filters.from = Math.floor(firstDate.getTime() / 1000)
		filters.to = Math.floor(lastDate.getTime() / 1000)
	}

	currentData.value = data
		.filter((d) => {
			const time = new Date(d.time).getTime() / 1_000
			return time >= filters.from && time <= filters.to
		})
		.map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
		.reverse()

	series.value.currentData = [...currentData.value]

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

const handleDatePickerUpdate = async (event) => {
	selectedTimeframe.value = STATS_TIMEFRAMES.find((tf) => tf.timeframe === "day")
	await handleUpdateDate(event)
}

const handleTimelineUpdate = async (event) => {
	await handleUpdateDate(event)
	// selectedPeriod.value = {}
}

const handleUpdateDate = async (event) => {
	isLoading.value = true

	if (event.from && event.to) {
		let from = event.from
		let to = event.to

		from = DateTime.fromSeconds(from).startOf("day").toSeconds()
		to = Math.floor(DateTime.fromSeconds(to).endOf("day").toSeconds())

		if (filters.from === from && filters.to === to) {
			isLoading.value = false
			return
		}

		filters.from = from
		filters.to = to

		await getData()
	}

	isLoading.value = false
}

const handleTimeframeUpdate = (tf) => {
	selectedTimeframe.value = tf
	filters.from = null
	filters.to = null
}

const handleCSVDownload = async () => {
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

const isInternalUpdate = ref(false)

watch(
	() => selectedTimeframe.value,
	async (newValue, oldValue) => {
		if (!isLoading.value && !isInternalUpdate.value) {
			allData.value = []
			// filters.from = null
			// filters.to = null
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
})
</script>

<template>
	<Flex direction="column" gap="32" wide :class="[$style.wrapper, isLoading && $style.disabled]">
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
						@on-update="handleDatePickerUpdate"
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

		<TimelineSlider
			v-if="series.name !== 'square_size'"
			:allData="allData"
			:chartView="chartView"
			:from="filters.from"
			:to="filters.to"
			:selectedTimeframe="selectedTimeframe" 
			@onUpdate="handleTimelineUpdate" />
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
