<script setup>
/** UI */
import AmountInCurrency from "@/components/AmountInCurrency.vue"
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"


/** Stats Components */
import BlocksFeed from "@/components/modules/stats/BlocksFeed.vue"
import ChartCardPreview from "@/components/modules/stats/ChartCardPreview.vue"
import HighlightCard from "@/components/modules/stats/HighlightCard.vue"

/** Constants */
import { getSeriesByGroupAndType, STATS_PERIODS } from "@/services/constants/stats.js"

/** Services */
import { comma, tia } from "@/services/utils"

/** API */
import { fetch24hDiffs } from "@/services/api/stats.js"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

useHead({
	title: "Statistics - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/stats",
		},
	],
	meta: [
		{
			name: "description",
			content: "Celestia Blockchain statistics. Explore data on blocks, transactions, rollups, blobs and more.",
		},
		{
			property: "og:title",
			content: "Statistics - Celestia Explorer",
		},
		{
			property: "og:description",
			content: "Celestia Blockchain statistics. Explore data on blocks, transactions, rollups, blobs and more.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/addresses`,
		},
		{
			property: "og:image",
			content: "/img/seo/stats.png",
		},
		{
			name: "twitter:title",
			content: "Statistics - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content: "Celestia Blockchain statistics. Explore data on blocks, transactions, rollups, blobs and more.",
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

const route = useRoute()
const router = useRouter()

const lastHead = computed(() => appStore.lastHead)
const diffs24h = ref({})
const highlights = computed(() => {
	return [
		{
			name: 'blocks',
			title: 'Blocks',
			value: lastHead.value.last_height,
		},
		{
			name: 'txs',
			title: 'Transactions',
			value: lastHead.value.total_tx,
			diff: diffs24h.value.tx_count_24h,
		},
		{
			name: 'blobs_size',
			title: 'Blobs Size',
			units: 'bytes',
			value: lastHead.value.total_blobs_size,
			diff: diffs24h.value.blobs_size_24h,
		},
		{
			name: 'fee',
			title: 'Total Fees',
			units: 'utia',
			value: lastHead.value.total_fee,
			diff: diffs24h.value.fee_24h,
		},
	]
})

const tabs = ref(['General', 'Blocks', 'Rollups', 'Finance'])
const activeTab = ref(tabs.value[0])

const periods = ref(STATS_PERIODS)
const selectedPeriod = ref(periods.value[1])

const series = computed(() => getSeriesByGroupAndType(activeTab.value))

const get24hDiffs = async () => {
	const data = await fetch24hDiffs()
	diffs24h.value = data
}

await get24hDiffs()
// watch(
// 	() => page.value,
// 	async () => {
// 		getAddresses()

// 		router.replace({ query: { page: page.value } })
// 	},
// )

</script>

<template>
	<Flex direction="column" gap="12" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/stats', name: `Statistics` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex align="center" gap="8" :class="$style.header">
			<!-- <Icon name="bar-chart" size="16" color="secondary" /> -->
			<Text size="16" weight="600" color="primary">Celestia Statistics</Text>
		</Flex>

		<Flex align="center" gap="16" :class="$style.tabs_wrapper">
			<Text v-for="t in tabs" @click="activeTab = t" size="14" color="tertiary" :class="[$style.tab, activeTab === t && $style.tab_active]">
				{{ t }}
			</Text>
		</Flex>

		<Flex justify="between" wide>
			<HighlightCard v-for="h in highlights" :highlight="h" />
		</Flex>

		<BlocksFeed />

		<Flex align="center" direction="column" gap="12">
			<Flex align="center" justify="between" wide :class="$style.section">
				<Text size="16" weight="600" color="primary" justify="start">Overview</Text>

				<Dropdown>
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
				</Dropdown>
			</Flex>

			<Flex align="center" justify="between" gap="16" wide :class="$style.charts_wrapper">
				<ChartCardPreview v-for="s in series"
					:series="s"
					:period="selectedPeriod"
					style="width: 320px; height: 280px"
				/>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.header {
	margin-bottom: 16px;
}

.section {
	margin-top: 20px;
}

.tabs_wrapper {
	/* padding-bottom: 16px; */

	border-bottom: solid 3px var(--op-5);
}

.tab {
	padding-bottom: 16px;
	
	cursor: pointer;
}

.tab_active {
	color: var(--txt-primary);

	border-bottom: solid 3px var(--txt-primary);
}

.charts_wrapper {
	flex-wrap: wrap;
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
