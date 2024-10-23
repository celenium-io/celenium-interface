<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownDivider, DropdownItem, DropdownTitle } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Components */
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { formatBytes, comma, truncateDecimalPart, abbreviate } from "@/services/utils"

/** API */
import { fetchRollups, fetchRollupsCount } from "@/services/api/rollup"

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

definePageMeta({
	layout: "widgets",
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

const getRollupsCount = async () => {
	const { data: rollupsCount } = await fetchRollupsCount()
	count.value = rollupsCount.value
}

await getRollupsCount()

const limit = ref(10)
const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.ceil(count.value / limit.value))

const getRollups = async () => {
	isRefetching.value = true

	const data = await fetchRollups({
		limit: limit.value,
		offset: (page.value - 1) * limit.value,
		sort: sort.dir,
		sort_by: sort.by,
	})

	rollups.value = data

	rollups.value.forEach(r => {
		r.size_graph = Math.max(Math.round(r.size_pct * 100, 2), 1)
		r.blobs_count_graph = Math.max(Math.round(r.blobs_count_pct * 100, 2), 1)
		r.fee_graph = Math.max(Math.round(r.fee_pct * 100, 2), 1)
	})

	isRefetching.value = false
}

getRollups()

/** Refetch rollups */
watch(
	() => page.value,
	async () => {
		getRollups()

		router.replace({ query: { page: page.value } })
	},
)

const expanded = ref({})
const expand = (rollup) => {
	if (expanded.value.slug === rollup.slug) {
		expanded.value = {}
	} else {
		expanded.value = rollup
	}
}
const share = (r, metric) => {
	return {
		name: expanded.value.name,
		value: Math.round(r[`${metric}_pct`] * 100, 2),
	}
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
	expanded.value = {}
	if (page.value !== 1) {
		page.value = 1
	} else {
		getRollups()
	}
}

const handleOpenLink = (link) => {
	window.open(link, '_blank')
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

const headerEl = ref(null)
const headerWidth = ref(0)
const barWidth = ref(0)

const barWidthCalculation = () => {
	headerWidth.value = headerEl.value.wrapper.offsetWidth
	barWidth.value = Math.round(headerWidth.value - 100)
}

onMounted(() => {
	barWidthCalculation()

	window.addEventListener("resize", barWidthCalculation)
})

onBeforeUnmount(() => {
	window.removeEventListener("resize", barWidthCalculation)
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper" gap="16">
		<Flex ref="headerEl" align="center" justify="between" :class="$style.actions">
			<Flex align="center" gap="6">
				<!-- <Flex align="center" gap="4" :class="$style.chip">
					<Flex align="center" gap="4" :class="$style.content">
						<Text size="12" weight="600" color="primary"> Size </Text>
					</Flex>
				</Flex>

				<Flex align="center" gap="4" :class="$style.chip">
					<Flex align="center" gap="4" :class="$style.content">
						<Text size="12" weight="600" color="primary"> Blobs </Text>
					</Flex>
				</Flex>

				<Flex align="center" gap="4" :class="$style.chip">
					<Flex align="center" gap="4" :class="$style.content">
						<Text size="12" weight="600" color="primary"> Fee </Text>
					</Flex>
				</Flex> -->
			</Flex>

			<Flex align="center" gap="12">
				<Dropdown>
					<Button type="secondary" size="mini">
						<Icon :name="`sort-${sort.dir}`" size="16" color="primary" />
					</Button>

					<template #popup>
						<DropdownTitle>Sort by</DropdownTitle>

						<DropdownDivider />

						<DropdownItem @click="handleSort('size')">
							<Flex align="center" justify="between" gap="16" wide>
								<Flex align="center" gap="8">
									<!-- <Icon v-if="sort.by === 'size'" name="check" size="12" color="brand" /> -->
									<Icon name="check" size="12" color="brand" :class="[sort.by === 'size' && $style.show, sort.by !== 'size' && $style.hide]" />

									<Text size="12" color="primary">Size</Text>
								</Flex>

								<Icon v-if="sort.by === 'size'" :name="`sort-${sort.dir}`" size="12" color="tertiary" />
							</Flex>
						</DropdownItem>

						<DropdownItem @click="handleSort('blobs_count')">
							<Flex align="center" justify="between" gap="16" wide>
								<Flex align="center" gap="8">
									<!-- <Icon v-if="sort.by === 'blobs_count'" name="check" size="12" color="brand" /> -->
									<Icon name="check" size="12" color="brand" :class="[sort.by === 'blobs_count' && $style.show, sort.by !== 'blobs_count' && $style.hide]" />

									<Text size="12" color="primary">Blobs</Text>
								</Flex>

								<Icon v-if="sort.by === 'blobs_count'" :name="`sort-${sort.dir}`" size="12" color="tertiary" />
							</Flex>
						</DropdownItem>

						<DropdownItem @click="handleSort('fee')">
							<Flex align="center" justify="between" gap="16" wide>
								<Flex align="center" gap="8">
									<!-- <Icon v-if="sort.by === 'fee'" name="check" size="12" color="brand" /> -->
									<Icon name="check" size="12" color="brand" :class="[sort.by === 'fee' && $style.show, sort.by !== 'fee' && $style.hide]" />

									<Text size="12" color="primary">Fee</Text>
								</Flex>

								<Icon v-if="sort.by === 'fee'" :name="`sort-${sort.dir}`" size="12" color="tertiary" />
							</Flex>
						</DropdownItem>
					</template>
				</Dropdown>

				<Flex align="center" gap="6">
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>
		</Flex>

		<Flex
			v-if="rollups"
			v-for="r in rollups"
			align="start"
			direction="column"
			gap="24"
			:class="[$style.row, expanded.slug === r.slug && $style.row_expanded]"
		>
			<Flex ref="rowEl" @click="expand(r)" align="center" justify="between" wide>
				<Flex align="center" gap="12">
					<Flex align="center" justify="center" :class="$style.avatar_container">
						<img :src="r.logo" :class="$style.avatar_image" />
					</Flex>

					<Flex direction="column" gap="12">
						<Flex align="center" gap="6">
							<Text size="13" weight="600" color="primary" mono>
								{{ r.name }}
							</Text>
						</Flex>

						<Flex align="center" :class="$style.rollup_subtitle">
							<Flex align="center" gap="8" :class="[expanded.slug === r.slug && $style.hide, expanded.slug !== r.slug && $style.show]">
								<Text size="13" weight="500" color="tertiary">Size</Text>
								<Text size="13" weight="600" color="primary">{{ formatBytes(r.size) }}</Text>

								<div :class="$style.dot" />

								<Text size="13" weight="500" color="tertiary">Blobs</Text>
								<Text size="13" weight="600" color="primary">{{ abbreviate(r.blobs_count) }}</Text>

								<div :class="$style.dot" />

								<Text size="13" weight="500" color="tertiary">Fee</Text>
								<Text size="13" weight="600" color="primary">{{ `${abbreviate(Math.round(r.fee / 1_000_000))} TIA` }}</Text>
							</Flex>

							<Flex align="center" gap="12" :class="[expanded.slug !== r.slug && $style.hide, expanded.slug === r.slug && $style.show]">
								<Icon v-if="r.website" @click.prevent.stop=handleOpenLink(r.website) name="globe" size="13" color="secondary" />

								<Icon v-if="r.twitter" @click.prevent.stop=handleOpenLink(r.twitter) name="twitter" size="13" color="secondary" />

								<Icon v-if="r.github" @click.prevent.stop=handleOpenLink(r.github) name="github" size="13" color="secondary" />

								<Icon v-if="r.l2_beat" @click.prevent.stop=handleOpenLink(r.l2_beat) name="l2beat" size="13" color="secondary" />

								<Icon v-if="r.explorer" @click.prevent.stop=handleOpenLink(r.explorer) name="search" size="13" color="secondary" />
							</Flex>
						</Flex>
					</Flex>
				</Flex>

				<Flex align="center" gap="8">
					<Icon
						name="chevron"
						size="16"
						color="secondary"
						:style="{ transform: `rotate(${expanded.slug === r.slug ? '180' : '0'}deg)`, transition: 'all 0.3s ease' }"
					/>
				</Flex>
			</Flex>

			<Flex
				v-show="expanded.slug === r.slug"
				align="center"
				direction="column"
				gap="16"
				:class="[$style.rollup_info, expanded.slug === r.slug && $style.show]"
			>
			<!-- :class="[$style.rollup_info, expanded.slug === r.slug && $style.show]" -->
				<Flex direction="column" gap="12">
					<Flex align="center" justify="between">
						<Flex align="center" gap="8">
							<Text size="13" weight="500" color="tertiary">Size</Text>
							<Text size="13" weight="600" color="primary">{{ formatBytes(r.size) }}</Text>
						</Flex>

						<Text size="11" weight="500" color="tertiary">{{ `~${r.size_graph}% of total` }}</Text>
					</Flex>

					<Flex :style="`width: ${barWidth}px`">
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${r.size_graph}%`,
								background: 'var(--mint)',
								marginRight: '4px',
							}"
						></div>
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${100 - r.size_graph}%`,
								background: 'var(--op-20)',
							}"
						></div>
					</Flex>
				</Flex>

				<Flex direction="column" gap="12">
					<Flex align="center" justify="between">
						<Flex align="center" gap="8">
							<Text size="13" weight="500" color="tertiary">Blobs</Text>
							<Text size="13" weight="600" color="primary">{{ comma(r.blobs_count) }}</Text>
						</Flex>

						<Text size="11" weight="500" color="tertiary">{{ `~${r.blobs_count_graph}% of total` }}</Text>
					</Flex>

					<Flex :style="`width: ${barWidth}px`">
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${r.blobs_count_graph}%`,
								background: 'var(--mint)',
								marginRight: '4px',
							}"
						></div>
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${100 - r.blobs_count_graph}%`,
								background: 'var(--op-20)',
							}"
						></div>
					</Flex>
				</Flex>

				<Flex direction="column" gap="12">
					<Flex align="center" justify="between">
						<Flex align="center" gap="8">
							<Text size="13" weight="500" color="tertiary">Fee Paid</Text>
							<Text size="13" weight="600" color="primary">{{ `${comma(Math.round(r.fee / 1_000_000))} TIA` }}</Text>
						</Flex>

						<Text size="11" weight="500" color="tertiary">{{ `~${r.fee_graph}% of total` }}</Text>
					</Flex>

					<Flex :style="`width: ${barWidth}px`">
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${r.fee_graph}%`,
								background: 'var(--mint)',
								marginRight: '4px',
							}"
						></div>
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${100 - r.fee_graph}%`,
								background: 'var(--op-20)',
							}"
						></div>
					</Flex>
				</Flex>

				<Flex align="center" justify="end" wide>
					<NuxtLink :to="`/rollup/${r.slug}`" target="_blank">
						<Flex align="center" gap="4">
							<Text size="11" color="tertiary">View Details</Text>
							<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
						</Flex>
					</NuxtLink>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

.row {
	height: 60px;

	border-top: 1px solid var(--op-5);

	cursor: pointer;

	padding: 16px 16px;

	transition: all 0.5s ease;
}

.row_expanded {
	height: 240px;

	transition: all 0.5s ease;
}

.dot {
	width: 4px;
	height: 4px;

	border-radius: 50%;
	background: var(--op-10);
}

.avatar_container {
	position: relative;
	width: 40px;
	height: 40px;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.rollup_subtitle {
	max-width: 350px;

	text-wrap: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	transition: all 0.5s ease;
}

.rollup_info {
	padding-left: 52px;

	transition: all 0.2s ease;
}

.validator_bar {
	height: 4px;

	border-radius: 2px;

	margin-bottom: 4px;
}

.actions {
	padding: 0px 12px;
}

.chip {
    box-shadow: inset 0 0 0 1px var(--op-15);
    border-radius: 10px;
}

.content {
    padding: 6px 10px;
}

.show {
	opacity: 1;

	transition: all 0.2s ease;
}

.hide {
	width: 0;
	opacity: 0;

	transition: all 0.2s ease;
}

a {
	& :active {
		color: var(--txt-secondary);

		& svg:first-of-type {
			fill: var(--txt-secondary);
		}		
	}
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
