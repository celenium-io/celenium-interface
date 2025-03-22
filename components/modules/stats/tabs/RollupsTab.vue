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
import { capitilize, capitalizeAndReplaceUnderscore, isMainnet } from "@/services/utils"

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
	if (enumStore.enums.rollupCategories.length) {
		res = enumStore.enums.rollupCategories.slice(1)
		res.push('other')
	}
	
	return res	
})
const getCategoryDisplayName = (category) => {
	switch (category) {
		case 'nft':
			return 'NFT'

		case 'uncategorized':
			return 'Other'

		default:
			return capitilize(category)
	}
}

const filters = reactive({
	categories: categories.value?.reduce((a, b) => ({ ...a, [b]: false }), {}),
})
const filterRollupByCategories = () => {
	let categories = Object.entries(filters.categories)
						.filter(([key, value]) => value === true)
						.map(([key]) => key === 'other' ? 'uncategorized' : key)
	
	filteredRollups.value = categories.length > 0 ? series.value?.data.filter(el => categories.includes(el.category)) : series.value?.data
	filteredRollupsDailyStats.value = categories.length > 0 ? rollupsDailyStats.value?.filter(el => categories.includes(el.category)) : rollupsDailyStats.value
}
const savedFiltersBeforeChanges = ref(null)
const isCategoriesPopoverOpen = ref(false)
const handleOpenCategoriesPopover = () => {
	isCategoriesPopoverOpen.value = true

	if (Object.keys(filters.categories).find((f) => filters.categories[f])) {
		savedFiltersBeforeChanges.value = { ...filters.categories }
	}
}
const onCategoriesPopoverClose = () => {
	isCategoriesPopoverOpen.value = false

	if (savedFiltersBeforeChanges.value) {
		filters.categories = savedFiltersBeforeChanges.value
		savedFiltersBeforeChanges.value = null
	} else {
		resetFilters("categories")
	}
}
const handleApplyCategoriesFilters = () => {
	savedFiltersBeforeChanges.value = null
	isCategoriesPopoverOpen.value = false

	filterRollupByCategories()
}
const resetFilters = (target) => {
	Object.keys(filters[target]).forEach((f) => {
		filters[target][f] = false
	})

	filterRollupByCategories()
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
			filterRollupByCategories()

			break
		case 'daily_stats':
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
				}

				break
			case 'daily_stats':
				if (!rollupsDailyStats.value.length && !isLoading.value) {
					await getRollupsDailyStats()
				}

				break
			default:
				break
		}
	}
)

watch(
	() => categories.value,
	() => {
		filters.categories = categories.value?.reduce((a, b) => ({ ...a, [b]: false }), {})
	}
)
</script>

<template>
    <Flex align="center" direction="column" gap="12" wide :class="$style.wrapper">
		<Flex align="center" justify="between" wide :class="$style.segment">
			<Flex align="center" gap="12">
				<Text
					v-for="s in sections"
					@click="activeSection = s"
					size="16"
					weight="600"
					:class="[$style.section, s === activeSection && $style.active]"
				>
					{{ capitalizeAndReplaceUnderscore(s) }}
				</Text>
			</Flex>

			<Flex align="center" gap="12">
				<Popover :open="isCategoriesPopoverOpen" @on-close="onCategoriesPopoverClose" width="200">
					<Button @click="handleOpenCategoriesPopover" type="secondary" size="mini">
						<Icon name="plus-circle" size="12" color="tertiary" />
						<Text color="secondary">Category</Text>

						<template v-if="Object.keys(filters.categories).find((c) => filters.categories[c])">
							<div :class="$style.vertical_divider" />

							<Text size="12" weight="600" color="primary" style="text-transform: capitalize">
								{{ Object.keys(filters.categories)
									.filter((c) => filters.categories[c])
									.map(c => getCategoryDisplayName(c))
									.join(", ")
								}}
							</Text>

							<Icon @click.stop="resetFilters('categories', true)" name="close-circle" size="12" color="secondary" />
						</template>
					</Button>

					<template #content>
						<Flex direction="column" gap="12">
							<Text size="12" weight="500" color="secondary">Filter by Category</Text>

							<Flex direction="column" gap="8" :class="$style.filters_list">
								<Checkbox
									v-for="c in Object.keys(filters.categories)"
									v-model="filters.categories[c]"
								>
									<Text size="12" weight="500" color="primary">
										{{ getCategoryDisplayName(c) }}
									</Text>
								</Checkbox>
							</Flex>

							<Button @click="handleApplyCategoriesFilters" type="secondary" size="mini" wide>Apply</Button>
						</Flex>
					</template>
				</Popover>
			</Flex>
		</Flex>

		<Flex v-if="activeSection === 'overview'" align="center" direction="column" gap="12" wide>
			<RollupsBubbleChart v-if="!isLoading" :data="filteredRollups" />

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

		<RollupsActivity v-else-if="activeSection === 'daily_stats' && !isLoading" :rollups="filteredRollupsDailyStats" />
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
	max-height: 200px;
}

@media (max-width: 900px) {
	/* .chart_card {
		flex: 1;
	} */
}
</style>
