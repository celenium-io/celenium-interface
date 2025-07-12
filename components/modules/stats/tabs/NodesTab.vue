<script setup>
/** Stats Components */
import GeoMap from "@/components/modules/stats/GeoMap.vue"
import BarplotChartCard from "@/components/modules/stats/BarplotChartCard.vue"

/** Constants */
import { getSeriesByGroupAndType } from "@/services/constants/stats.js"

/** Services */
import { capitilize, sortArrayOfObjects } from "@/services/utils"

/** API */
import { fetchNodeStats, fetchNodeVersionStats } from "@/services/api/stats"

/** Store */
import { useEnumStore } from "@/store/enums.store"
const enumStore = useEnumStore()

const isLoading = ref(true)
const series = reactive(getSeriesByGroupAndType("Nodes"))
const filters = computed(() => {
	let f = {}
	series.forEach(s => {
		switch (s.name) {
			case "version":
				f[s.name] = {
					data: nodeTypes.value,
					selected: selectedNodeType.value,
				}
				break;
		
			default:
				break;
		}
	})

	return f
})

const nodeTypeMap = {
  "celestia-celestia": "Celestia",
  "unknown": "Other"
}
function getNodeTypeName(nodeType, reverse = false) {
	if (!reverse) {
		return nodeTypeMap[nodeType] || capitilize(nodeType)
	} else {
		const entry = Object.entries(nodeTypeMap).find(([, display]) => display === nodeType)
		return entry ? entry[0] : nodeType.toLowerCase()
	}
}
const nodeTypes = computed(() => [...new Set(enumStore?.enums?.nodeType?.map(nt => getNodeTypeName(nt))?.sort())])
const selectedNodeType = ref(nodeTypes.value[0])

async function getNodeTypeData() {
	let data = await fetchNodeStats({ name: "nodetype" })

	let otherEntry = null
	data = data.reduce((acc, d) => {
		const name = getNodeTypeName(d.name)

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

	return sortArrayOfObjects(data, "amount", true)
}
async function getNodeVersionData() {
	let data = []
	if (selectedNodeType.value === "Other") {
		const [otherData, unknownData] = await Promise.all([
			fetchNodeVersionStats({ name: "other" }),
			fetchNodeVersionStats({ name: "unknown" })
		])

		data = [...otherData, ...unknownData].reduce((acc, d) => {
			const idx = acc.findIndex(el => el.name === d.name)
			if (idx === -1) {
				acc.push(d)
			} else {
				acc[idx].amount += d.amount
			}

			return acc
		}, [])

	} else {
		data = await fetchNodeVersionStats({ name: getNodeTypeName(selectedNodeType.value, true) })
	}
	
	return data.sort((a, b) => {
		const parseVersion = (version) => version.split(".").map(Number)
		const [aMajor, aMinor, aPatch] = parseVersion(a.name)
		const [bMajor, bMinor, bPatch] = parseVersion(b.name)

		return aMajor - bMajor || aMinor - bMinor || aPatch - bPatch
	})
}

const fetchData = async (ser) => {
	if (!ser) {
		series.forEach(async (s) => {
			await fetchData(s)
		})

		return
	}

	switch (ser.name) {
		case "nodetype":
			ser.data = await getNodeTypeData()
			break;
		case "version":
			ser.data = await getNodeVersionData()
			break;
		
		default:
			break;
	}
}

async function handleFilterUpdate(event) {
	if (!event.source) return
	
	const ser = series.find(s => s.name === event.source)
	if (!ser) return

	switch (event.source) {
		case "version":
			selectedNodeType.value = event.value
			await fetchData(ser)
			
			break;
	
		default:
			break;
	}
}

onBeforeMount(async () => {
	isLoading.value = true

	await fetchData()

	isLoading.value = false
})
</script>

<template>
    <Flex align="center" direction="column" gap="16" wide :class="$style.wrapper">
        <Flex align="start" direction="column" gap="32" wide :class="$style.section">
			<Text size="16" weight="600" color="primary" justify="start">Celestia Node Distribution</Text>

			<GeoMap :class="$style.chart" />

			<Flex v-if="!isLoading" align="center" justify="between" gap="16" wide :class="$style.charts_wrapper">
				<template v-for="s in series">
					<BarplotChartCard
						@onFilterUpdate="handleFilterUpdate"
						:series="s"
						:data="s.data"
						:filter="filters[s.name]"
						:class="$style.chart_card"
					/>
				</template>
			</Flex>

			<Flex align="center" justify="end" wide>
				<Text size="12" color="tertiary" justify="start">Data provided by the 
					<NuxtLink to="https://probelab.io" target="_blank" :class="$style.link">ProbeLab</NuxtLink>
					 team
				</Text>
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

.link {
	color: var(--brand);
	font-weight: 600;
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
