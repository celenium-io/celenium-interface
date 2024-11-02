<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Checkbox from "@/components/ui/Checkbox.vue"
import Popover from "@/components/ui/Popover.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Components */
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { formatBytes, comma, truncateDecimalPart, capitilize } from "@/services/utils"

/** API */
import { fetchRollups, fetchRollupsCount } from "@/services/api/rollup"

/** Stores */
import { useEnumStore } from "@/store/enums"
const enumStore = useEnumStore()

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

const isRefetching = ref(false)
const rollups = ref([])
const count = ref(0)

const utiaPerMB = (rollup) => {
	let totalRollupMB = rollup.size / (1024 * 1024)

	return rollup.fee / totalRollupMB
}

const sort = reactive({
	by: "size",
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

	if (page.value !== 1) {
		page.value = 1
	} else {
		getRollups()
	}
}

const resetFilters = (target) => {
	Object.keys(filters[target]).forEach((f) => {
		filters[target][f] = false
	})

	if (page.value !== 1) {
		page.value = 1
	} else {
		getRollups()
	}
}

const getRollupsCount = async () => {
	const { data: rollupsCount } = await fetchRollupsCount()
	count.value = rollupsCount.value
}

await getRollupsCount()

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.ceil(count.value / 20))

const getRollups = async () => {
	isRefetching.value = true

	const data = await fetchRollups({
		categories:
			Object.keys(filters.categories).find((f) => filters.categories[f]) &&
			Object.keys(filters.categories)
				.filter((f) => filters.categories[f])
				.map(c => c === 'other' ? 'uncategorized' : c)
				.join(","),
		limit: 20,
		offset: (page.value - 1) * 20,
		sort: sort.dir,
		sort_by: sort.by,
	})
	rollups.value = data.map((r, i) => ({...r, index: ((page.value - 1) * 20) + i + 1}))

	isRefetching.value = false
}

getRollups()

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
		getRollups()
	}
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

watch(
	() => categories.value,
	() => {
		filters.categories = categories.value?.reduce((a, b) => ({ ...a, [b]: false }), {})
	}
)

watch(
	() => page.value,
	async () => {
		getRollups()

		router.replace({ query: { page: page.value } })
	},
)
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex align="start" justify="between" :class="$style.breadcrumbs">
			<Breadcrumbs
				:items="[
					{ link: '/', name: 'Explore' },
					{ link: '/rollups', name: `Rollups Leaderboard` },
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
					<Text size="14" weight="600" color="primary">Rollups Leaderboard</Text>
				</Flex>

				<!-- Pagination -->
				<Flex v-if="pages" align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
					<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages">
						<Icon name="arrow-right-stop" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<Flex align="center" justify="between" wrap="wrap" gap="8" :class="$style.settings">
				<Flex wrap="wrap" align="center" gap="8">
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

			<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div v-if="rollups?.length" :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>#</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Rollup</Text></th>
								<th>
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Category</Text>
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
								<th @click="handleSort('blobs_count')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Blobs</Text>
										<Icon
											v-if="sort.by === 'blobs_count'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th @click="handleSort('fee')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Blob Fees Paid</Text>
										<Icon
											v-if="sort.by === 'fee'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Paid per MB</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="r in rollups">
								<td>
									<NuxtLink :to="`/rollup/${r.slug}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ r.index }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td style="width: 1px">
									<NuxtLink :to="`/rollup/${r.slug}`">
										<Flex align="center" gap="8">
											<Flex v-if="r.logo" align="center" :class="$style.avatar_wrapper">
												<div :class="$style.avatar_container">
													<img :src="r.logo" :class="$style.avatar_image" />
												</div>

												<Tooltip :class="$style.status_dot_wrapper">
													<div
														:class="$style.status_dot"
														:style="{
															background: `${Math.abs(DateTime.fromISO(r.last_message_time).diffNow('days').days) < 1
																			? ''
																			: Math.abs(DateTime.fromISO(r.last_message_time).diffNow('days').days) < 7
																				? 'var(--light-orange)'
																				: 'var(--red)'
																		}`
														}"
													/>

													<template #content>
														<Flex align="end" gap="8">
															<Text size="12" weight="600" color="tertiary"> {{
																`Was active 
																${Math.abs(DateTime.fromISO(r.last_message_time).diffNow('days').days) < 1
																	? 'less than a day ago'
																	: Math.abs(DateTime.fromISO(r.last_message_time).diffNow('days').days) < 7
																		? 'more than a day ago'
																		: 'more than a week ago'
																}`
															}} </Text>
														</Flex>
													</template>
												</Tooltip>
											</Flex>
											
											<Text size="12" weight="600" color="primary" mono>
												{{ r.name }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollup/${r.slug}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary"> {{ getCategoryDisplayName(r.category) }} </Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollup/${r.slug}`">
										<Flex align="start" justify="center" direction="column" gap="4">
											<Tooltip position="start" delay="400">
												<Flex direction="column" gap="4">
													<Text size="13" weight="600" color="primary">{{ formatBytes(r.size) }}</Text>

													<Text size="12" weight="600" color="tertiary">{{ truncateDecimalPart(r.size_pct * 100, 2) }}%</Text>
												</Flex>

												<template #content>
													<Flex align="end" gap="8">
														<Text size="12" weight="600" color="tertiary">Share of total size</Text>

														<Text size="12" weight="600" color="primary">{{ truncateDecimalPart(r.size_pct * 100, 2) }}%</Text>
													</Flex>
												</template>
											</Tooltip>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollup/${r.slug}`">
										<Flex align="start" justify="center" direction="column" gap="4">
											<Tooltip position="start" delay="400">
												<Flex direction="column" gap="4">
													<Text size="13" weight="600" color="primary">{{ comma(r.blobs_count) }}</Text>

													<Text size="12" weight="600" color="tertiary">{{ truncateDecimalPart(r.blobs_count_pct * 100, 2) }}%</Text>
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
									<NuxtLink :to="`/rollup/${r.slug}`">
										<Flex align="start" justify="center" direction="column" gap="4">
											<AmountInCurrency :amount="{ value: r.fee }" />

											<Tooltip position="start" delay="400">
												<Text size="12" weight="600" color="tertiary">{{ truncateDecimalPart(r.fee_pct * 100, 2) }}%</Text>

												<template #content>
													<Flex align="end" gap="8">
														<Text size="12" weight="600" color="tertiary">Share of total fee paid</Text>

														<Text size="12" weight="600" color="primary">{{ truncateDecimalPart(r.fee_pct * 100, 2) }}%</Text>
													</Flex>
												</template>
											</Tooltip>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollup/${r.slug}`">
										<Flex align="center">
											<AmountInCurrency :amount="{ value: utiaPerMB(r) }" />
										</Flex>
									</NuxtLink>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
					<Text size="13" weight="600" color="secondary" align="center"> No rollups found </Text>
					<Text size="12" weight="500" height="160" color="tertiary" align="center">
						This network does not contain any rollups
					</Text>
				</Flex>
			</Flex>
			<Flex justify="end" :class="$style.footer">
				<!-- Pagination -->
				<Flex v-if="pages" align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
					<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages">
						<Icon name="arrow-right-stop" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>
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
