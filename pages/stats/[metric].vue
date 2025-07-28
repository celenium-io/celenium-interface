<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Stats Components/Constants */
import { getSeriesByPage, STATS_PERIODS, STATS_TIMEFRAMES } from "@/services/constants/stats.js"
import BarChart from "@/components/modules/stats/BarChart.vue"
import BarplotStakedRollupChart from "@/components/modules/stats/BarplotStakedRollupChart.vue"
import BarplotStakedChart from "@/components/modules/stats/BarplotStakedChart.vue"
import LineChart from "@/components/modules/stats/LineChart.vue"
import SquareSizeChart from "@/components/modules/stats/SquareSizeChart.vue"
import TimelineSlider from "@/components/modules/stats/TimelineSlider.vue"

/** Services */
import { getStartChainDate } from "@/services/config"
import { exportSVGToPNG, exportToCSV } from "@/services/utils/export"
import { abbreviate, capitilize, capitalizeAndReplace, isMobile } from "@/services/utils"

/** API */
import { fetchSeries, fetchRollupsSeries, fetchSeriesCumulative, fetchTVL, fetchTVS } from "@/services/api/stats"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Popover from "@/components/ui/Popover.vue"

/** Store */
import { useAppStore } from "@/store/app.store"
import { useCacheStore } from "@/store/cache.store"
import { useModalsStore } from "@/store/modals.store"
import { useNotificationsStore } from "@/store/notifications.store"
import { useSettingsStore } from "@/store/settings.store"
const appStore = useAppStore()
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()
const notificationsStore = useNotificationsStore()
const settingsStore = useSettingsStore()

const route = useRoute()
const router = useRouter()

const series = ref(getSeriesByPage(route.params.metric, route.query.aggregate))
const metricName = ref("")
const totalValue = computed(() => {
	if (!series.value?.page) return null

	switch (series.value.page) {
		case "tvs":
			return appStore.tvs
				? {
					value: appStore.tvs,
					units: "$",
				}
				: null
		
		default:
			return null
	}
})
if (!series.value?.page) {
	router.push("/stats")
} else {
	switch (series.value?.page) {
		case "tvs":
			metricName.value = series.value?.title
			break
		case "tvl":
			metricName.value = series.value?.title
			break
		case "rollups":
			metricName.value = "Rollup Distribution"
			break
		default:
			metricName.value = capitalizeAndReplace(series.value?.page, "_")
			break
	}
}

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
			content: "/img/seo/stats.png",
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
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/stats.png",
		},
	],
})

const selectedPeriod = ref(STATS_PERIODS[2])

const selectedTimeframe = ref(STATS_TIMEFRAMES.find((tf) => isMobile() ? tf.timeframe === "month" : tf.timeframe === "week"))
const timeframes = computed(() => {
	let res = [...STATS_TIMEFRAMES]

	if (["tvs", "tvl"].includes(series.value?.name)) {
		res = res.filter((tf) => tf.timeframe !== "hour")
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
const rollupsSetting = ref([
	{
		name: "grouped_by",
		title: "Group by",
		items: ["blobs_count", "fee", "size"],
		selected: "blobs_count",
	},
	{
		name: "top",
		title: "Top",
		items: ["5", "10", "20", "all"],
		selected: "10",
	},
	{
		name: "period",
		title: "Last",
		items: ["day", "month", "year"],
		selected: "month",
	},
])
const handleRollupSettingsSelect = async (setting, value) => {
	setting.selected = value
	switch (setting.name) {
		case "grouped_by":
			series.value.metric = value
			switch (value) {
				case "fee":
					series.value.units = "utia"
					break
				case "size":
					series.value.units = "bytes"
					break
				default:
					series.value.units = ""
					break
			}
			break
		case "top":
			series.value.itemsCount = value
			break
		case "period":
			series.value.timeframe = value
			await getData()
			break
		default:
			break
	}
}

const currentData = ref([])

const allData = ref([])
const loadedAllData = ref(false)
const currentChartName = ref(null)

const chartView = ref("bar")

const updateUserSettings = () => {
	settingsStore.chart = {
		...settingsStore.chart,
		view: chartView.value,
	}
}

const filters = reactive({})
const setDefaultFilters = () => {
	if (series.value.page === "rollups") {
		if (route.query.aggregate && rollupsSetting.value[0].items.includes(route.query.aggregate)) {
			series.value.metric = route.query.aggregate
			rollupsSetting.value[0].selected = route.query.aggregate
		} else {
			series.value.metric = rollupsSetting.value[0].selected
		}
		series.value.itemsCount = rollupsSetting.value[1].selected
		series.value.timeframe = rollupsSetting.value[2].selected
	}
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

	if (series.value.name === "tvs") {
		const [ tvsData, supplyData ] = await Promise.all([
			fetchTVS({ period: selectedTimeframe.value.timeframe }),
			fetchTVL({ slug: "celestia", period: selectedTimeframe.value.timeframe }),
		])

		supplyData.forEach(d => {
			let res = {}
			const tvsValue = parseFloat(tvsData.find(s => s.time === d.time)?.close || 0)
			res.time = d.time
			res.supply = parseFloat(d.value) || 0
			res.rollupTvl = tvsValue - res.supply
			res.value = tvsValue

			data.push(res)
		})

		if (!series.value?.keys?.length) {
			series.value.keys = {
				supply: {
					name: "Supply",
					color: "var(--brand)",
				},
				rollupTvl: {
					name: "Rollups TVL",
					color: "var(--legendary)",
				},
			}
		}
	} else if (series.value.name === "tvl") {
		data = await fetchTVL({
			slug: "celestia",
			period: selectedTimeframe.value.timeframe,
		})
	} else if (series.value.page === "rollups") {
		data = await fetchRollupsSeries({
			timeframe: series.value.timeframe === "day" ? "hour" : series.value.timeframe === "month" ? "day" : "month",
		})
	} else if (series.value.aggregate !== "cumulative") {
		let to = filters?.to ? DateTime.fromSeconds(+filters?.to) : DateTime.now()
		data = await fetchSeries({
			table: series.value.name,
			period: selectedTimeframe.value.timeframe,
			from: selectedTimeframe.value.timeframe === "hour" ? parseInt(to.minus({ days: 7 }).ts / 1_000) : null,
			to: selectedTimeframe.value.timeframe === "hour" ? parseInt(to.ts / 1_000) : null,
		})
	} else {
		data = (
			await fetchSeriesCumulative({
				name: series.value.name,
				period: selectedTimeframe.value.timeframe,
			})
		).reverse()
	}

	allData.value = data.map((d) => ({ ...d, date: new Date(d.time), timestamp: new Date(d.time).getTime() / 1_000 }))

	currentChartName.value = series.value.name
	loadedAllData.value = true
	return allData.value
}

const getData = async (fetch = true) => {
	isLoading.value = true

	let data = []

	if (fetch) {
		await fetchData()
	}

	if (series.value.page !== "rollups") {
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
			.reverse()
		
		if (series.value.page !== "tvs") {
			currentData.value = currentData.value.map((s) => ({ date: DateTime.fromISO(s.time).toJSDate(), value: parseFloat(s.value) }))
			series.value.currentData = [...currentData.value]
		} else {
			series.value.data = [...currentData.value]
		}

		filters.timeframe = selectedTimeframe.value
		series.value.timeframe = filters.timeframe
	} else {
		data = allData.value

		series.value.data = data.map((d) => ({
			...d,
			items: d.items.map((item) => ({
				...item,
				fee: parseFloat(item.fee),
			})),
		}))
	}

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
}

const handleUpdateDate = async (event) => {
	isLoading.value = true

	if (event.from && event.to) {
		let from = event.from
		let to = event.to

		if (selectedTimeframe.value.timeframe !== "hour") {
			from = DateTime.fromSeconds(from).startOf("day").toSeconds()
			to = Math.floor(DateTime.fromSeconds(to).endOf("day").toSeconds())
		}

		if (filters.from === from && filters.to === to) {
			isLoading.value = false
			return
		}

		filters.from = from
		filters.to = to

		if (event.source !== "timeline") {
			if (Math.abs(DateTime.fromSeconds(from).diff(DateTime.fromSeconds(to), "days").days) < 8) {
				selectedTimeframe.value = STATS_TIMEFRAMES.find((tf) => tf.timeframe === "hour")
			}

			await getData()
		} else {
			await getData(false)
		}
	}

	isLoading.value = false
}

const handleTimeframeUpdate = (tf) => {
	selectedTimeframe.value = tf
	filters.from = null
	filters.to = null
}

const handleCSVDownload = async () => {
	let data = []
	let csvHeaders = ""
	let csvRow = ""
	if (series.value.page === "rollups") {
		data = [...series.value.data]
		csvHeaders = "timestamp,rollup,value\n"
		let csvData = []
		data.forEach((d) => {
			d.items.forEach((item) => {
				csvData.push(`${DateTime.fromISO(d.time).ts},${item.name},${item[rollupsSetting.value[0].selected]}`)
			})
		})
		csvRow = csvData.join("\n")
	} else {
		data = [...series.value.currentData]
		csvHeaders = "timestamp,value\n"
		csvRow = data.map((d) => `${DateTime.fromJSDate(d.date).ts},${d.value}`).join("\n")
	}

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
	cacheStore.chart.view = series.value.page === "tvs" ? "barplot-stacked" : series.value.page === "rollups" ? "barplot-stacked-rollups" : chartView.value

	modalsStore.open("chart")
}

const isInternalUpdate = ref(false)

watch(
	() => selectedTimeframe.value,
	async () => {
		if (!isLoading.value && !isInternalUpdate.value) {
			allData.value = []
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

watch(
	() => rollupsSetting.value[0].selected,
	() => {
		router.replace({
			query: {
				aggregate: rollupsSetting.value[0].selected,
			},
		})
	},
)

onBeforeMount(() => {
	const settings = JSON.parse(localStorage.getItem("settings"))
	chartView.value = settings?.chart?.view || "bar"
})
</script>

<template>
	<Flex direction="column" gap="32" wide :class="[$style.wrapper, isLoading && $style.disabled]">
		<Flex direction="column" gap="16">
			<Flex align="end" justify="between" :class="$style.breadcrumbs">
				<Breadcrumbs
					v-if="series?.page"
					:items="[
						{ link: '/', name: 'Explore' },
						{ link: '/stats', name: 'Statistics' },
						{ link: route.fullPath, name: metricName },
					]"
				/>
			</Flex>

			<Flex v-if="series?.name" align="center" justify="between" wide :class="$style.header">
				<Flex align="center" gap="8">
					<Text size="16" weight="600" color="primary" justify="start"> {{ `${metricName}` }} </Text>

					<Text v-if="totalValue" size="20" weight="600" color="brand" justify="start"> {{ `${abbreviate(totalValue.value, 2)} ${totalValue.units}` }} </Text>
				</Flex>

				<Flex v-if="series?.name !== 'square_size'" align="center" gap="8" :class="$style.settings">
					<Flex v-if="series?.page !== 'rollups'" align="center" gap="8">
						<DatePicker
							@on-update="handleDatePickerUpdate"
							:period="selectedPeriod"
							:from="filters?.from"
							:to="filters?.to"
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
											:class="[$style.chart_selector, series?.name === 'tvs' && $style.disabled]"
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
												:color="selectedTimeframe?.timeframe === tf?.timeframe ? 'brand' : 'secondary'"
												:class="$style.item"
											>
												{{ tf?.shortTitle }}
											</Text>
										</Flex>
									</Flex>
								</Flex>
							</template>
						</Popover>
					</Flex>
					<Flex v-else align="center" gap="8">
						<Dropdown v-for="rs in rollupsSetting">
							<Button type="secondary" size="mini">
								<Flex align="center" justify="between" gap="6">
									<Text size="12" color="secondary"> {{ rs.title }} </Text>
									<Text size="12" color="primary"> {{ capitilize(rs.selected.replace("_", " ")) }} </Text>
								</Flex>
							</Button>

							<template #popup>
								<DropdownItem
									v-for="item in rs.items"
									@click="handleRollupSettingsSelect(rs, item)"
									:style="{ minWidth: '50px' }"
								>
									<Flex align="center" justify="between" gap="12" wide>
										<Icon :name="item === rs.selected ? 'check' : ''" size="12" color="brand" />
										<Flex align="center" justify="start" wide>
											{{ capitilize(item.replace("_", " ")) }}
										</Flex>
									</Flex>
								</DropdownItem>
							</template>
						</Dropdown>
					</Flex>

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

		<Flex direction="column" gap="8">
			<template v-if="series?.page">
				<BarplotStakedRollupChart v-if="series?.page === 'rollups'" :series="series" />
				<BarplotStakedChart v-else-if="series?.name === 'tvs'" :series="series" />
				<SquareSizeChart v-else-if="series?.name === 'square_size'" />
				<LineChart v-else-if="chartView === 'line'" :series="series" />
				<BarChart v-else-if="chartView === 'bar'" :series="series" />
			</template>

			<TimelineSlider
				v-if="series?.name !== 'square_size' && series?.page !== 'rollups'"
				:allData="allData"
				:chartView="chartView"
				:from="filters.from"
				:to="filters.to"
				:selectedTimeframe="selectedTimeframe"
				@onUpdate="handleTimelineUpdate"
			/>
		</Flex>

		<Flex v-if="series?.name === 'tvs'" :class="$style.section">
			<Text :class="$style.section_title">Celenium: How We Calculate Celestia’s TVS</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">On Celenium, the Total Value Secured (TVS) of the Celestia network is calculated by aggregating the TVL of each rollup that posts data to Celestia. We consider a rollup “secured by Celestia” if it uses Celestia as its data availability (DA) layer, regardless of its execution or settlement environment.</Text>

				<Text :class="$style.section_paragraph">To determine each rollup’s TVL, we fetch data from one of the following public sources:</Text>
				<ul style="margin-top: -8px">
					<li><a href="https://l2beat.com" target="_blank" :class="$style.link">L2BEAT</a> - includes canonically and externally bridged assets, as well as natively minted tokens;</li>
					<li><a href="https://defillama.com" target="_blank" :class="$style.link">DeFiLlama</a> - focuses on assets actively engaged in dApps on the rollup.</li>
				</ul>

				<Text :class="$style.section_paragraph">In addition to the rollup TVLs, we also include the circulating supply of the Celestia (TIA) token to reflect the value secured by the base layer itself. This gives a more holistic view of the total value secured by the Celestia network.</Text>
			</Flex>
		</Flex>
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

.section {
	flex-direction: column;
	gap: 12px;

	line-height: 1.2;
}

.wrapper > .section {
	margin-top: 8px;
}

.section_title {
	color: var(--txt-primary);
	font-size: 14px;
	font-weight: 600;
}

.section_content {
	color: var(--txt-secondary);
	font-size: 14px;
}

.section_paragraph {
	line-height: 1.2;
}

li:not(li:last-child) {
	margin-bottom: 4px;
}

.link {
	color: var(--txt-secondary);

	transition: all 0.3s ease;

	&:hover {
		color: var(--brand);
	}
}

@media (max-width: 650px) {
	.header {
		flex-direction: column;
		align-items: start;
		gap: 12px;

		& .settings {
			width: 100%;
			justify-content: end;
		}
	}
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
