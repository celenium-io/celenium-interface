<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Checkbox from "@/components/ui/Checkbox.vue"
import DiffChip from "@/components/modules/stats/DiffChip.vue"
import Popover from "@/components/ui/Popover.vue"
import Spinner from "@/components/ui/Spinner.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Components */
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { capitilize, comma, formatBytes, roundTo, truncateDecimalPart } from "@/services/utils"
import { getLastActivityCategory, getRankCategory } from "@/services/constants/rollups"

/** API */
import { fetchRollups, fetchRollupsDailyStats } from "@/services/api/rollup"

/** Stores */
import { useEnumStore } from "@/store/enums"
import { useRollupsRankingStore } from "@/store/rollupsrank"
const enumStore = useEnumStore()
const rollupRankingStore = useRollupsRankingStore()

useHead({
	title: "Rollups - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/rollups",
		},
	],
	meta: [
		{
			name: "description",
			content: "Rollups in the Celestia Blockchain. Rollup name, description, size, blobs, social links, contacts are shown.",
		},
		{
			property: "og:title",
			content: "Rollups Leaderboard - Celestia Explorer",
		},
		{
			property: "og:description",
			content: "Rollups in the Celestia Blockchain. Rollup name, description, size, blobs, social links, contacts are shown.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/rollups`,
		},
		{
			property: "og:image",
			content: "/img/seo/rollups.png",
		},
		{
			name: "twitter:title",
			content: "Rollups Leaderboard - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content: "Rollups in the Celestia Blockchain. Rollup name, description, size, blobs, social links, contacts are shown.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/rollups.png",
		},
	],
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(true)
const rollups = ref([])
const processedRollups = ref([])
const rollupsRanking = computed(() => rollupRankingStore?.rollups_ranking?.ranking)

const utiaPerMB = (rollup) => {
	let totalRollupMB = rollup.size / (1024 * 1024)

	return rollup.fee / totalRollupMB
}

const sort = reactive({
	by: "stats.ranking.rank",
	dir: "desc",
})
const categories = computed(() => {
	let res = []
	if (enumStore.enums.rollupCategories.length) {
		res = enumStore.enums.rollupCategories.slice(1)
		res.push('other')
	}
	
	return res	
})
const types = computed(() => {
	let res = []
	if (enumStore.enums.rollupTypes.length) {
		res = enumStore.enums.rollupTypes
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
	// providers: false,
	// stacks: false,
})
const keyMap = {
	categories: 'category',
	types: 'type',
	// providers: 'provider',
	// stacks: 'stack',
}
const filters = reactive({
	categories: categories.value?.reduce((a, b) => ({ ...a, [b]: false }), {}),
	types: types.value?.reduce((a, b) => ({ ...a, [b]: false }), {}),
	// providers: {},
	// stacks: {},
})
const savedFiltersBeforeChanges = ref(null)
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

	if (page.value !== 1) {
		page.value = 1
	} else {
		getRollups()
	}
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

	if (page.value !== 1) {
		page.value = 1
	} else {
		getRollups()
	}
}

const pages = ref(1)
const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const handleNextCondition = ref(false)
const limit = ref(100)

const getRollups = async () => {
	const data = await fetchRollups({
		limit: limit.value,
		// offset: (page.value - 1) * 20,
		// sort: sort.dir,
		// sort_by: sort.by,
	})

	rollups.value = data
		.map(r => ({
				...r,
				stats: rollupsRanking.value[r.slug],
				rounded_rank: roundTo(rollupsRanking.value[r.slug]?.ranking?.rank / 10, 0),
				rank_category: getRankCategory(roundTo(rollupsRanking.value[r.slug]?.ranking?.rank / 10, 0))
			}))
	
	pages.value = roundTo(rollups.value?.length / 20, 0, "ceil")
	if (page.value > pages.value) {
		page.value = pages.value
		router.replace({ query: { page: page.value } })
	}
}
const processRollups = () => {
	isRefetching.value = true

	rollups.value = rollups.value
		.sort((a, b) => {
			const getValue = (obj, path) => path.split('.').reduce((o, key) => o?.[key], obj) ?? 0;

			const valueA = getValue(a, sort.by);
			const valueB = getValue(b, sort.by);

			return sort.dir === "asc" ? valueA - valueB : valueB - valueA;
		})
		.map((r, i) => ({ ...r, index: i + 1 }))
		
	
	processedRollups.value = rollups.value.slice((page.value - 1) * 20, Math.min((page.value) * 20, rollups.value?.length))

	isRefetching.value = false
}
if (rollupRankingStore.initialized) {
	await getRollups()
	processRollups()
}

const handleSort = (by) => {
	switch (sort.dir) {
		case "desc":
			if (sort.by == by) sort.dir = "asc"
			break

		case "asc":
			sort.dir = "desc"

			break
	}

	sort.by = by
	if (page.value !== 1) {
		page.value = 1
	} else {
		processRollups()
	}
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	page.value += 1
}

// watch(
// 	() => categories.value,
// 	() => {
// 		filters.categories = categories.value?.reduce((a, b) => ({ ...a, [b]: false }), {})
// 	}
// )
// watch(
// 	() => types.value,
// 	() => {
// 		filters.types = types.value?.reduce((a, b) => ({ ...a, [b]: false }), {})
// 	}
// )

watch(
	() => page.value,
	() => {
		processRollups()
		router.replace({ query: { page: page.value } })
	},
)
watch(
	() => rollupRankingStore.initialized,
	async () => {
		if (rollupRankingStore.initialized) {
			await getRollups()
			processRollups()
		}
	},
)
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex align="start" justify="between" :class="$style.breadcrumbs">
			<Breadcrumbs
				:items="[
					{ link: '/', name: 'Explore' },
					{ link: '/rollups', name: 'Rollups' },
					{ link: route.fullPath, name: 'Activity' },
				]"
			/>

			<Button link="https://forms.gle/nimJyQJG4Lb4BTcG7" target="_blank" type="secondary" size="mini">
				<Icon name="rollup-plus" size="12" color="secondary" /> Register rollup
			</Button>
		</Flex>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="rollup" size="16" color="secondary" />
					<Text size="14" weight="600" color="primary">Rollups Activity</Text>
				</Flex>

				<!-- Pagination -->
				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary">Page {{ comma(page) }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<!-- <Flex align="center" justify="between" wrap="wrap" gap="8" :class="$style.settings">
				<Flex wrap="wrap" align="center" gap="8">
					<Popover
						v-for="p in Object.keys(popovers)"
						:open="popovers[p]"
						@on-close="onPopoverClose(p)"
						width="200"
					>
						<Button @click="handleOpenPopover(p)" type="secondary" size="mini">
							<Icon name="plus-circle" size="12" color="tertiary" />
							<Text color="secondary"> {{ capitilize(keyMap[p]) }} </Text>

							<template v-if="Object.keys(filters[p]).find((item) => filters[p][item])">
								<div :class="$style.vertical_divider" />

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
			</Flex> -->

			<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div v-if="processedRollups?.length" :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>#</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Rollup</Text></th>
								<th @click="handleSort('stats.ranking.rank')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Icon name="laurel" size="12" color="tertiary" />
										<Text size="12" weight="600" color="tertiary" noWrap>Activity Rank</Text>
										<Icon
											v-if="sort.by === 'stats.ranking.rank'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th @click="handleSort('size')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Size</Text>
										<Icon
											v-if="sort.by === 'size'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th @click="handleSort('stats.day_blobs_count')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Today Blobs</Text>
										<Icon
											v-if="sort.by === 'stats.day_blobs_count'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th @click="handleSort('stats.commits_weekly')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Commits</Text>
										<Icon
											v-if="sort.by === 'stats.commits_weekly'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th @click="handleSort('stats.avg_pfb_size')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Avg PFB Size</Text>
										<Icon
											v-if="sort.by === 'stats.avg_pfb_size'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Latest Activity</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="r in processedRollups">
								<td>
									<NuxtLink :to="`/rollups/activity/${r?.slug}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ r.index }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td style="width: 1px">
									<NuxtLink :to="`/rollups/activity/${r?.slug}`">
										<Flex align="center" gap="8">
											<Flex v-if="r?.logo" align="center" :class="$style.avatar_wrapper">
												<div :class="$style.avatar_container">
													<img :src="r?.logo" :class="$style.avatar_image" />
												</div>
											</Flex>
											
											<Flex direction="column" gap="4">
												<Text size="12" weight="600" color="primary" mono>
													{{ r?.name }}
												</Text>
												<Text size="12" weight="600" color="tertiary">
													{{ getDisplayName(r?.category) }}
												</Text>
											</Flex>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollups/activity/${r?.slug}`">
										<Flex justify="center" direction="column" gap="4">
											<Text size="12" weight="600" :color="r?.rank_category?.color" mono>
												{{ r?.rank_category?.name }}
											</Text>
											<Flex align="center" gap="4">
												<Text size="12" weight="600" color="secondary">
													{{ `${r?.rounded_rank}/10` }}
												</Text>
												<Text size="12" weight="600" color="tertiary">
													{{ `${r?.stats?.ranking?.rank}%` }}
												</Text>
											</Flex>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollups/activity/${r?.slug}`">
										<Flex align="start" justify="center" direction="column" gap="4">
											<Tooltip position="start" delay="400">
												<Flex direction="column" gap="4">
													<Text size="13" weight="600" color="primary">{{ formatBytes(r?.size) }}</Text>

													<Text size="12" weight="600" color="tertiary">{{ truncateDecimalPart(r?.size_pct * 100, 2) }}%</Text>
												</Flex>

												<template #content>
													<Flex align="end" gap="8">
														<Text size="12" weight="600" color="tertiary">Share of total size</Text>

														<Text size="12" weight="600" color="primary">{{ truncateDecimalPart(r?.size_pct * 100, 2) }}%</Text>
													</Flex>
												</template>
											</Tooltip>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollups/activity/${r?.slug}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ comma(r?.stats?.day_blobs_count) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollups/activity/${r?.slug}`">
										<Flex align="start" justify="center" direction="column" gap="4">
											<Tooltip position="start" delay="400" :disabled="true">
												<Flex direction="column" gap="4">
													<Text size="13" weight="600" color="primary">{{ comma(r?.stats?.commits_weekly) }}</Text>
												</Flex>

												<template #content>
													<Flex align="end" gap="8">
														<Text size="12" weight="600" color="tertiary">Share of total blobs count</Text>

														<Text size="12" weight="600" color="primary">{{ truncateDecimalPart(r.blobs_count_pct * 100, 2) }}%</Text>
													</Flex>
												</template>
											</Tooltip>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollups/activity/${r?.slug}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ formatBytes(r?.stats?.avg_pfb_size) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollups/activity/${r?.slug}`">
										<Flex align="center" gap="4">
											<Icon name="clock-forward-2" size="13" :color="getLastActivityCategory(DateTime.fromISO(r?.last_message_time))" />
											<Text size="13" weight="600" color="primary">
												{{ DateTime.fromISO(r?.last_message_time).toRelative({ locale: "en" }) }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<Flex v-else-if="isRefetching" align="center" justify="center" gap="8" wide :class="$style.empty">
					<Spinner size="14" />
					<Text size="13" weight="500" color="secondary"> Loading rollups </Text>
				</Flex>

				<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
					<Text size="13" weight="600" color="secondary" align="center"> No rollups found </Text>
					<Text size="12" weight="500" height="160" color="tertiary" align="center">
						This network does not contain any rollups
					</Text>
				</Flex>
			</Flex>
			<!-- <Flex justify="end" :class="$style.footer">
				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary">Page {{ comma(page) }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="handleNextCondition">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex> -->
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.header {
	height: 46px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 16px;
}

.footer {
	height: 46px;

	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	padding: 0 16px;
}

.settings {
	border-radius: 4px;
	background: var(--card-background);

	padding: 8px 16px;
}

.vertical_divider {
	min-width: 2px;
	height: 12px;
	background: var(--op-10);
}

.filters_list {
	height: auto;
}

.table_scroller {
	overflow-x: auto;
}

.table {
	border-radius: 4px 4px 4px 4px;
	background: var(--card-background);

	transition: all 0.2s ease;

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		padding-bottom: 12px;

		& tbody {
			& tr {
				cursor: pointer;

				transition: all 0.05s ease;

				&:hover {
					background: var(--op-5);
				}

				&:active {
					background: var(--op-8);
				}
			}
		}

		& tr th {
			text-align: left;

			padding: 0;
			padding-right: 16px;
			padding-top: 16px;
			padding-bottom: 8px;

			& span {
				display: flex;
			}

			&:first-child {
				padding-left: 16px;
				width: 16px;
			}

			&.sortable {
				cursor: pointer;
			}

			&.sortable:hover {
				& span {
					color: var(--txt-secondary);
				}
			}
		}

		& tr td {
			padding: 0;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}

			& > a {
				display: flex;

				min-height: 44px;

				padding-right: 24px;
			}
		}
	}
}

.avatar_wrapper {
  position: relative;
  width: 25px;
  height: 25px;
}

.avatar_container {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.status_dot_wrapper {
	position: absolute;
	bottom: 0px;
	right: 0px;
	z-index: 1;
}

.status_dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: var(--brand);
	border: 1px solid var(--card-background);
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.message_type {
	max-width: 100px;
	text-overflow: ellipsis;
	overflow: hidden;
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

.empty {
	padding: 16px 0;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}

	.header {
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}
</style>
