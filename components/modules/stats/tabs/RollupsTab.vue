<script setup>
/** Stats Components */
import ChartCardPreview from "@/components/modules/stats/ChartCardPreview.vue"
import PieChartCard from "@/components/modules/stats/PieChartCard.vue"
import RollupsBubbleChart from "@/components/modules/stats/RollupsBubbleChart.vue"
import RollupsActivity from "~/components/modules/stats/RollupsActivity.vue"

/** Stats Constants */
import { STATS_PERIODS } from "@/services/constants/stats.js"

/** UI */
import Button from "@/components/ui/Button.vue"
import Checkbox from "@/components/ui/Checkbox.vue"
import Popover from "@/components/ui/Popover.vue"

/** Constants */
import { getSeriesByGroupAndType } from "@/services/constants/stats.js"

/** Services */
import { capitilize, capitalizeAndReplace, isMainnet } from "@/services/utils"

/** API */
import { fetchRollups, fetchRollupsDailyStats } from "@/services/api/rollup.js"

/** Stores */
import { useEnumStore } from "@/store/enums"
const enumStore = useEnumStore()

const emit = defineEmits(["onUpdateSection"])

const isLoading = ref(false)
const rollupsDailyStats = ref([])
const series = ref()
const filteredRollups = ref([])
const filteredRollupsDailyStats = ref([])

const getRollups = async () => {
	isLoading.value = true

	series.value = getSeriesByGroupAndType('Rollups')

	fetchRollups({ limit: 100 })
	.then((res) => {
		series.value.data = res
		filteredRollups.value = res
	})
	.finally(() => {
		isLoading.value = false
	})

}

const getRollupsDailyStats = async () => {
	isLoading.value = true

	const data = await fetchRollupsDailyStats({
		limit: 100,
	})
	
	rollupsDailyStats.value = data
	filteredRollupsDailyStats.value = data

    isLoading.value = false
}

const categories = computed(() => {
	let res = []
	if (enumStore.enums?.rollupCategories?.length) {
		res = enumStore.enums.rollupCategories.slice(1)
		res.push('other')
	}
	
	return res	
})
const types = computed(() => {
	let res = []
	if (enumStore.enums?.rollupTypes?.length) {
		res = enumStore.enums.rollupTypes
	}
	
	return res	
})
const tags = computed(() => {
	let res = []
	if (enumStore.enums?.rollupTags?.length) {
		res = enumStore.enums.rollupTags
	}
	
	return res
})
const providers = ref([])
const stacks = ref([])

const getDisplayName = (name) => {
	switch (name) {
		case 'nft':
			return 'NFT'

		case 'uncategorized':
			return 'Other'

		default:
			return capitilize(name)
	}
}

const popovers = reactive({
	categories: false,
	types: false,
	providers: false,
	stacks: false,
	tags: false,
})
const keyMap = {
	categories: 'category',
	types: 'type',
	providers: 'provider',
	stacks: 'stack',
	tags: 'tags',
}

const filters = reactive({
	categories: categories.value?.reduce((a, b) => ({ ...a, [b]: false }), {}),
	types: types.value?.reduce((a, b) => ({ ...a, [b]: false }), {}),
	providers: {},
	stacks: {},
	tags: tags.value?.reduce((a, b) => ({ ...a, [b]: false }), {}),
})
const isFilterActive = computed(() => {
	return Object.values(filters).some((f) => Object.values(f).some((v) => v))
})
const savedFiltersBeforeChanges = ref(null)
const filterRollups = () => {
    const activeFilters = Object.entries(filters).reduce((acc, [filterName, filterValues]) => {
        const activeKeys = Object.entries(filterValues)
            .filter(([_, value]) => value === true)
            .map(([key]) => (key === 'other' ? 'uncategorized' : key))

        if (activeKeys.length > 0) {
            acc[filterName] = activeKeys
        }
        return acc
    }, {})

    const applyFilters = (data) => {
        if (Object.keys(activeFilters).length === 0) return data

        return data.filter((el) =>
            Object.entries(activeFilters).every(([filterName, values]) => {
				const elValue = el[keyMap[filterName]];

				if (Array.isArray(elValue)) {
					return values.some(value => elValue.includes(value));
				} else {
					return values.includes(elValue);
				}
			})
        )
    }

    filteredRollups.value = applyFilters(series.value?.data || [])
    filteredRollupsDailyStats.value = applyFilters(rollupsDailyStats.value || [])
}

const handleOpenPopover = (name) => {
	popovers[name] = true

	if (Object.keys(filters[name]).find((f) => filters[name][f])) {
		savedFiltersBeforeChanges.value = { ...filters[name] }
	}
}
const onPopoverClose = (name) => {
	popovers[name] = false
	
	if (savedFiltersBeforeChanges.value) {
		filters[name] = savedFiltersBeforeChanges.value
		savedFiltersBeforeChanges.value = null
	} else {
		resetFilters(name)
	}
}
const handleApplyFilters = (name) => {
	savedFiltersBeforeChanges.value = null
	popovers[name] = false

	filterRollups()
}
const resetFilters = (name) => {
	if (name) {
		Object.keys(filters[name]).forEach((f) => {
			filters[name][f] = false
		})
	} else {
		Object.keys(filters).forEach((f) => {
			Object.keys(filters[f]).forEach((k) => {
				filters[f][k] = false
			})
		})
	}

	filterRollups()
}

const route = useRoute()

const sections = ref(['overview', 'daily_stats'])
const activeSection = ref('')

const updateSection = (section) => {
	activeSection.value = section
    emit('onUpdateSection', section)
}

onMounted(async () => {
	activeSection.value = route.query.section && sections.value.includes(route.query.section) ? route.query.section : sections.value[0]

	switch (activeSection.value) {
		case 'overview':
			await getRollups()

			break
		case 'daily_stats':
			await getRollups()
			await getRollupsDailyStats()

			break
		default:
			break
	}
})

watch(
	() => activeSection.value,
	async () => {
		updateSection(activeSection.value)

		switch (activeSection.value) {
			case 'overview':
				if (!series.value?.data?.length && !isLoading.value) {
					await getRollups()
					filterRollups()
				}

				break
			case 'daily_stats':
				if (!rollupsDailyStats.value.length && !isLoading.value) {
					await getRollupsDailyStats()
					filterRollups()
				}

				break
			default:
				break
		}
	}
)

watch(
	() => series.value?.data?.length,
	() => {
		if (series.value?.data?.length) {
			series.value.data.forEach((d) => {
				if (d.stack) {
					stacks.value.push(d.stack)
				}
				if (d.provider) {
					providers.value.push(d.provider)
				}
			})
			stacks.value = [...new Set(stacks.value)]
			providers.value = [...new Set(providers.value)]

			filters.stacks = stacks.value?.reduce((a, b) => ({ ...a, [b]: false }), {})
			filters.providers = providers.value?.reduce((a, b) => ({ ...a, [b]: false }), {})
		}
	}
)
watch(
	() => categories.value,
	() => {
		filters.categories = categories.value?.reduce((a, b) => ({ ...a, [b]: false }), {})
	}
)
watch(
	() => types.value,
	() => {
		filters.types = types.value?.reduce((a, b) => ({ ...a, [b]: false }), {})
	}
)
watch(
	() => tags.value,
	() => {
		filters.tags = tags.value?.reduce((a, b) => ({ ...a, [b]: false }), {})
	}
)

</script>

<template>
    <Flex align="center" direction="column" gap="12" wide :class="$style.wrapper">
		<Flex align="start" justify="between" wide :class="$style.segment">
			<Flex align="center" gap="12" :style="{minWidth: '200px'}">
				<Text
					v-for="s in sections"
					@click="activeSection = s"
					size="16"
					weight="600"
					:class="[$style.section, s === activeSection && $style.active]"
				>
					{{ capitalizeAndReplace(s, "_") }}
				</Text>
			</Flex>

			<Flex align="center" justify="end" wide gap="12" wrap="wrap">
				<Popover
					v-for="p in Object.keys(popovers)"
					:open="popovers[p]"
					@on-close="onPopoverClose(p)"
					width="200"
				>
					<Button @click="handleOpenPopover(p)" type="secondary" size="mini">
						<template v-if="!Object.keys(filters[p]).find((item) => filters[p][item])">
							<Icon name="plus-circle" size="12" color="tertiary" />
							<Text color="secondary"> {{ capitilize(keyMap[p]) }} </Text>
						</template>

						<template v-else>
							<Text size="12" weight="600" color="primary">
								{{ Object.keys(filters[p]).filter((item) => filters[p][item]).length < 3
									? Object.keys(filters[p])
										.filter((item) => filters[p][item])
										.map(item => getDisplayName(item))
										.join(", ")
									: `${Object.keys(filters[p])
										.filter((item) => filters[p][item])
										.slice(0, 2)
										.map(item => getDisplayName(item))
										.join(", ")} and ${Object.keys(filters[p]).filter((item) => filters[p][item]).length - 2} more`
								}}
							</Text>

							<Icon @click.stop="resetFilters(p)" name="close-circle" size="12" color="secondary" />
						</template>
					</Button>

					<template #content>
						<Flex direction="column" gap="12">
							<Text size="12" weight="500" color="secondary"> {{ `Filter by ${capitilize(keyMap[p])}` }} </Text>

							<Flex direction="column" gap="8" :class="$style.filters_list">
								<Checkbox
									v-for="item in Object.keys(filters[p])"
									v-model="filters[p][item]"
								>
									<Text size="12" weight="500" color="primary">
										{{ getDisplayName(item) }}
									</Text>
								</Checkbox>
							</Flex>

							<Button @click="handleApplyFilters(p)" type="secondary" size="mini" wide>Apply</Button>
						</Flex>
					</template>
				</Popover>
			</Flex>
		</Flex>

		<Flex v-if="activeSection === 'overview'" align="center" direction="column" gap="12" wide>
			<RollupsBubbleChart v-if="!isLoading" @clearFilters="resetFilters" :data="filteredRollups" />

			<template v-if="!isLoading">
				<Flex align="center" justify="between" wide :class="$style.segment">
					<Text size="16" weight="600" color="primary" justify="start">Top Rollups</Text>
				</Flex>

				<Flex align="center" justify="between" gap="16" wide :class="$style.charts_wrapper">
					<PieChartCard
						v-for="s in series.filter(s => s.subGroup === 'top')"
						:series="s"
						:data="filteredRollups"
						dounut
						:class="$style.chart_card"
					/>
				</Flex>
			</template>

			<template v-if="!isLoading && isMainnet()">
				<Flex align="center" justify="between" wide :class="$style.segment">
					<Text size="16" weight="600" color="primary" justify="start">Economics</Text>
				</Flex>

				<Flex align="center" justify="between" gap="16" wide :class="$style.charts_wrapper">
					<ChartCardPreview v-for="s in series.filter(s => s.subGroup === 'economy')"
						:series="s"
						:period="STATS_PERIODS[2]"
						:class="$style.chart_card"
					/>
				</Flex>
			</template>
		</Flex>

		<RollupsActivity v-else-if="activeSection === 'daily_stats' && !isLoading" @clearFilters="resetFilters" :rollups="filteredRollupsDailyStats" :isFilterActive="isFilterActive" />
    </Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);
}

.section {
	color: var(--txt-tertiary);
	cursor: pointer;

	transition: all 0.2s ease;
}

.section.active {
	color: var(--txt-primary);
}

.segment {
	margin-top: 20px;
}

.charts_wrapper {
	flex-wrap: wrap;
}

.chart_card {
	max-width: 480px;
	height: 200px;
}

@media (max-width: 900px) {
	/* .chart_card {
		flex: 1;
	} */
}
</style>
