<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Components */
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Tables */
import BlobsTable from "./tables/BlobsTable.vue"
import NamespacesTable from "./tables/NamespacesTable.vue"

/** Services */
import { capitilize, comma, formatBytes, truncateDecimalPart } from "@/services/utils"
import { exportToCSV } from "@/services/utils/export"

/** API */
import { fetchRollupBlobs, fetchRollupExportData, fetchRollupNamespaces } from "@/services/api/rollup"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useNotificationsStore } from "@/store/notifications"
import { capitalize } from "vue"
const cacheStore = useCacheStore()
const notificationsStore = useNotificationsStore()

const route = useRoute()
const router = useRouter()

const props = defineProps({
	rollup: {
		type: Object,
		required: true,
	},
})

const tabs = ref([
	{
		name: "Blobs",
		icon: "blob",
	},
	{
		name: "Namespaces",
		icon: "namespace",
	},
])
const preselectedTab = route.query.tab && tabs.value.map((tab) => tab.name).includes(route.query.tab) ? route.query.tab : tabs.value[0].name
const activeTab = ref(preselectedTab)

const isRefetching = ref(false)
const namespaces = ref([])
const blobs = ref([])

const tagNames = ref(["stack", "type", "vm", "provider", "category"])
const tags = computed(() =>
	tagNames.value.reduce((res, tagName) => {
		if (props.rollup[tagName]) {
			let tag = {}
			tag.name = tagName === "vm" ? "VM" : capitilize(tagName)
			switch (tagName) {
				case "vm":
					tag.value = props.rollup[tagName].toUpperCase()
					break
				case "category":
					tag.value = getCategoryDisplayName(props.rollup[tagName])
					break
				default:
					tag.value = capitalize(props.rollup[tagName])
					break
			}

			res.push(tag)
		}

		return res
	}, []),
)

const getCategoryDisplayName = (category) => {
	switch (category) {
		case "nft":
			return "NFT"

		case "uncategorized":
			return "Other"

		default:
			return capitilize(category)
	}
}

const relatedLinks = computed(() => {
	if (props.rollup.links?.length) {
		return props.rollup.links
	} else {
		return []
	}
})

const page = ref(1)
const pages = computed(() => (activeTab.value === "Blobs" ? Math.ceil(props.rollup.blobs_count / 10) : 1))

const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	page.value -= 1
}

const getBlobs = async () => {
	isRefetching.value = true

	const { data } = await fetchRollupBlobs({
		id: props.rollup.id,
		offset: (page.value - 1) * 10,
		limit: 10,
		sort_by: "time",
	})

	if (data.value?.length) {
		blobs.value = data.value
		cacheStore.current.blobs = blobs.value
	}

	isRefetching.value = false
}
const getNamespaces = async () => {
	isRefetching.value = true

	const { data } = await fetchRollupNamespaces({
		id: props.rollup.id,
		offset: (page.value - 1) * 10,
		limit: 10,
	})

	if (data.value?.length) {
		namespaces.value = data.value
		cacheStore.current.namespaces = namespaces.value
	}

	isRefetching.value = false
}

/** Initital fetch for blobs */
if (activeTab.value === "Blobs") await getBlobs()
if (activeTab.value === "Namespaces") await getNamespaces()

onMounted(() => {
	router.replace({
		query: {
			tab: activeTab.value,
		},
	})
})

/** Refetch Blobs/Messages on new page */
watch(
	() => page.value,
	() => {
		switch (activeTab.value) {
			case "Blobs":
				getBlobs()
				break

			case "Namespaces":
				getNamespaces()
				break
		}
	},
)

/** Refetch Blobs/Namespaces on tab changing */
watch(
	() => activeTab.value,
	() => {
		router.replace({
			query: {
				tab: activeTab.value,
			},
		})

		page.value = 1

		switch (activeTab.value) {
			case "Blobs":
				getBlobs()
				break

			case "Namespaces":
				getNamespaces()
				break
		}
	},
)

const periods = ref([
	{
		title: "Last 1 hour",
		value: 1,
	},
	{
		title: "Last 12 hours",
		value: 12,
	},
	{
		title: "Last 24 hours",
		value: 24,
	},
])

const handleCSVDownload = async (value) => {
	let from = parseInt(DateTime.now().minus({ hours: value }).toMillis() / 1_000)
	let to = parseInt(DateTime.now().toMillis() / 1_000)

	const { data } = await fetchRollupExportData({
		id: props.rollup.id,
		from: from,
		to: to,
	})

	if (!data.value) {
		notificationsStore.create({
			notification: {
				type: "error",
				icon: "close",
				title: "Failed to load data",
				autoDestroy: true,
			},
		})

		return
	}

	await exportToCSV(data.value, `${props.rollup.slug}-blobs-last-${value}h`)

	notificationsStore.create({
		notification: {
			type: "success",
			icon: "check",
			title: "Data successfully downloaded",
			autoDestroy: true,
		},
	})
}
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="rollup" size="14" color="primary" />

				<Text size="13" weight="600" color="primary">Rollup</Text>
			</Flex>

			<Flex align="center" gap="12">
				<Button link="/stats?tab=rollups&section=daily_stats" type="secondary" size="mini">
					<Icon name="line-chart" size="12" color="secondary" />

					<Text>Daily Stats</Text>
				</Button>

				<Dropdown>
					<Tooltip>
						<Button type="secondary" size="mini">
							<Icon name="download" size="12" color="secondary" />

							<Text>Export</Text>
						</Button>

						<template #content>
							<Text color="tertiary">Export blobs to CSV</Text>
						</template>
					</Tooltip>

					<template #popup>
						<DropdownItem v-for="period in periods" @click="handleCSVDownload(period.value)">
							{{ period.title }}
						</DropdownItem>
					</template>
				</Dropdown>
			</Flex>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex justify="between" gap="20" :class="$style.key_value">
						<Flex direction="column" gap="16" :class="$style.key_value">
							<Flex direction="column" gap="8">
								<Text size="14" weight="600" color="primary">{{ rollup.name }} </Text>

								<Tooltip position="start" textAlign="start" delay="300">
									<Text size="12" weight="500" color="tertiary" height="140" :class="$style.description">
										{{ rollup.description }}
									</Text>

									<template #content>
										<div style="max-width: 340px">
											<Text height="140">
												{{ rollup.description }}
											</Text>
										</div>
									</template>
								</Tooltip>
							</Flex>

							<Flex align="center" gap="6" wrap="wrap">
								<Flex v-for="(t, i) in tags" align="center" gap="6" :class="$style.tag_badge">
									<Text size="12" weight="600" color="tertiary"> {{ t.name }}</Text>
									<Text size="12" weight="600" color="secondary">{{ t.value }} </Text>
								</Flex>
							</Flex>
						</Flex>

						<Flex v-if="rollup.logo" align="center" justify="center" :class="$style.logo_container">
							<img :src="rollup.logo" :class="$style.rollup_logo" />
						</Flex>
					</Flex>

					<Flex v-if="rollup.provider || rollup.compression" gap="24" style="margin-bottom: 16px">
						<img
							v-if="rollup.compression?.includes('Ethereum')"
							:src="`/img/badges/settled/eth.png`"
							alt="Rollup badge"
							:class="$style.badge"
						/>
						<img
							v-else-if="rollup.compression?.includes('Base')"
							:src="`/img/badges/settled/base.png`"
							alt="Rollup badge"
							:class="$style.badge"
						/>
						<img
							v-else-if="rollup.compression?.includes('Arbitrum')"
							:src="`/img/badges/settled/arb.png`"
							alt="Rollup badge"
							:class="$style.badge"
						/>

						<img
							v-if="rollup.provider"
							:src="`/img/badges/provider/${rollup.provider.toLowerCase()}.png`"
							alt="Rollup badge"
							:class="$style.badge"
						/>
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Size</Text>

							<Tooltip position="start" delay="400">
								<Flex align="center" gap="4">
									<Text size="12" weight="600" color="secondary"> {{ formatBytes(rollup.size) }} </Text>

									<Text size="12" weight="600" color="tertiary">{{
										`(${truncateDecimalPart(rollup.size_pct * 100, 2)}%)`
									}}</Text>
								</Flex>

								<template #content>
									<Flex align="end" gap="8">
										<Text size="12" weight="600" color="tertiary">Share of total size</Text>

										<Text size="12" weight="600" color="primary">{{
											`(${truncateDecimalPart(rollup.size_pct * 100, 2)}%)`
										}}</Text>
									</Flex>
								</template>
							</Tooltip>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Blobs</Text>

							<Tooltip position="start" delay="400">
								<Flex align="center" gap="4">
									<Text size="12" weight="600" color="secondary"> {{ comma(rollup.blobs_count) }} </Text>

									<Text size="12" weight="600" color="tertiary">{{
										`(${truncateDecimalPart(rollup.blobs_count_pct * 100, 2)}%)`
									}}</Text>
								</Flex>

								<template #content>
									<Flex align="end" gap="8">
										<Text size="12" weight="600" color="tertiary">Share of total blobs count</Text>

										<Text size="12" weight="600" color="primary">{{
											`(${truncateDecimalPart(rollup.blobs_count_pct * 100, 2)}%)`
										}}</Text>
									</Flex>
								</template>
							</Tooltip>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Blob Fees Paid</Text>

							<Tooltip position="start" delay="400">
								<Flex align="center" gap="4">
									<AmountInCurrency
										:amount="{ value: rollup.fee }"
										:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }"
									/>

									<Text size="12" weight="600" color="tertiary">{{
										`(${truncateDecimalPart(rollup.fee_pct * 100, 2)}%)`
									}}</Text>
								</Flex>

								<template #content>
									<Flex align="end" gap="8">
										<Text size="12" weight="600" color="tertiary">Share of total fee paid</Text>

										<Text size="12" weight="600" color="primary">{{
											`(${truncateDecimalPart(rollup.fee_pct * 100, 2)}%)`
										}}</Text>
									</Flex>
								</template>
							</Tooltip>
						</Flex>

						<Flex align="start" justify="between">
							<Text size="12" weight="600" color="tertiary">First Seen</Text>
							<Tooltip position="start" delay="500">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(rollup.first_message_time).toRelative({ locale: "en", style: "short" }) }}
								</Text>

								<template #content>
									{{ DateTime.fromISO(rollup.first_message_time).setLocale("en").toFormat("LLL d y, t") }}
								</template>
							</Tooltip>
						</Flex>

						<Flex align="start" justify="between">
							<Text size="12" weight="600" color="tertiary">Last Active</Text>
							<Tooltip position="start" delay="500">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(rollup.last_message_time).toRelative({ locale: "en", style: "short" }) }}
								</Text>

								<template #content>
									{{ DateTime.fromISO(rollup.last_message_time).setLocale("en").toFormat("LLL d y, t") }}
								</template>
							</Tooltip>
						</Flex>
					</Flex>

					<Flex direction="column" gap="12">
						<Text size="12" weight="600" color="secondary">Links</Text>

						<Flex align="center" justify="start" gap="8" wrap="wrap">
							<Tooltip v-if="rollup.website" position="start" delay="300">
								<Button :link="rollup.website" target="_blank" type="tertiary" size="mini">
									<Icon name="globe" size="14" color="secondary" />
									Website
								</Button>

								<template #content>
									{{ rollup.website }}
								</template>
							</Tooltip>

							<Tooltip v-if="rollup.twitter" position="start" delay="300">
								<Button :link="rollup.twitter" target="_blank" type="tertiary" size="mini">
									<Icon name="twitter" size="14" color="secondary" />
									Twitter
								</Button>

								<template #content>
									{{ rollup.twitter }}
								</template>
							</Tooltip>

							<Tooltip v-if="rollup.github" position="start" delay="300">
								<Button :link="rollup.github" target="_blank" type="tertiary" size="mini">
									<Icon name="github" size="14" color="secondary" />
									Github
								</Button>

								<template #content>
									{{ rollup.github }}
								</template>
							</Tooltip>

							<Tooltip v-if="rollup.defi_lama" position="start" delay="300">
								<Button
									:link="`https://defillama.com/chain/${rollup.defi_lama}`"
									target="_blank"
									type="tertiary"
									size="mini"
								>
									<Icon name="lama" size="14" color="secondary" />
									DefiLlama
								</Button>

								<template #content>
									{{ `https://defillama.com/chain/${rollup.defi_lama}` }}
								</template>
							</Tooltip>

							<Tooltip v-if="rollup.l2_beat" position="start" delay="300">
								<Button :link="rollup.l2_beat" target="_blank" type="tertiary" size="mini">
									<Icon name="l2beat" size="14" color="secondary" />
									L2BEAT
								</Button>

								<template #content>
									{{ rollup.l2_beat }}
								</template>
							</Tooltip>

							<Tooltip v-if="rollup.explorer" position="start" delay="300">
								<Button :link="rollup.explorer" target="_blank" type="tertiary" size="mini">
									<Icon name="search" size="14" color="secondary" />
									Search
								</Button>

								<template #content>
									{{ `Explorer: ${rollup.explorer}` }}
								</template>
							</Tooltip>
						</Flex>
					</Flex>

					<Flex v-if="relatedLinks.length" direction="column" gap="6">
						<Text size="12" weight="600" color="secondary">Other Links</Text>

						<Flex align="center" direction="column" gap="2">
							<Flex v-for="link in relatedLinks" align="center" justify="start" wide>
								<a :href="link" target="_blank">
									<Text size="12" height="140" weight="600" color="tertiary" mono selectable :class="$style.link">
										{{ link }}
									</Text>
								</a>
							</Flex>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="4" wide :class="$style.txs_wrapper">
				<Flex align="center" justify="between" :class="$style.tabs_wrapper">
					<Flex gap="4" :class="$style.tabs">
						<Flex
							@click="activeTab = tab.name"
							v-for="tab in tabs"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === tab.name && $style.active]"
						>
							<Icon :name="tab.icon" size="12" color="secondary" />
							<Text size="13" weight="600">{{ tab.name }}</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" justify="center" gap="8" :class="[$style.table, isRefetching && $style.disabled]">
					<!-- Blobs Table -->
					<template v-if="activeTab === 'Blobs'">
						<BlobsTable v-if="blobs.length" :blobs="blobs" :rollup="rollup" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No blobs </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								This rollup did not push any blob
							</Text>
						</Flex>

						<!-- Pagination -->
						<Flex v-if="blobs.length" align="center" gap="6" :class="$style.pagination">
							<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
								<Icon name="arrow-left-stop" size="12" color="primary" />
							</Button>
							<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
								<Icon name="arrow-left" size="12" color="primary" />
							</Button>

							<Button type="secondary" size="mini" disabled>
								<Text size="12" weight="600" color="primary"> {{ comma(page) }} of {{ comma(pages) }} </Text>
							</Button>

							<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
								<Icon name="arrow-right" size="12" color="primary" />
							</Button>
							<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages">
								<Icon name="arrow-right-stop" size="12" color="primary" />
							</Button>
						</Flex>
					</template>
					<!-- Namespaces Table -->
					<template v-if="activeTab === 'Namespaces'">
						<NamespacesTable v-if="namespaces.length" :namespaces="namespaces" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No namespaces </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								This rollup is not linked to any namespace
							</Text>
						</Flex>

						<!-- Pagination -->
						<Flex v-if="namespaces.length" align="center" gap="6" :class="$style.pagination">
							<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
								<Icon name="arrow-left-stop" size="12" color="primary" />
							</Button>
							<Button @click="handlePrev" type="secondary" size="mini" :disabled="page === 1">
								<Icon name="arrow-left" size="12" color="primary" />
							</Button>

							<Button type="secondary" size="mini" disabled>
								<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
							</Button>

							<Button @click="handleNext" type="secondary" size="mini" :disabled="namespaces.length <= 10">
								<Icon name="arrow-right" size="12" color="primary" />
							</Button>
						</Flex>
					</template>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.header {
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
}

.data {
	min-width: 384px;

	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	.main {
		padding: 16px;

		& .key_value {
			max-width: 100%;
		}
	}

	.logo_container {
		position: relative;
		min-width: 40px;
		width: 40px;
		min-height: 40px;
		height: 40px;

		overflow: hidden;
		border-radius: 50%;
	}

	.rollup_logo {
		width: 100%;
		height: 100%;
		object-fit: cover;

		user-select: none;
		-webkit-user-drag: none;
	}

	.description {
		display: -webkit-box;
		max-width: 320px;

		text-overflow: ellipsis;
		overflow: hidden;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
	}

	.badge {
		width: 60px;
	}

	.tag_badge {
		border-radius: 6px;
		background: var(--op-5);

		padding: 6px;
	}

	.link {
		max-width: 352px;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.link:hover {
		color: var(--txt-secondary);
	}

	.dot {
		width: 4px;
		height: 4px;

		border-radius: 50%;
		background: var(--op-15);
	}
}

.txs_wrapper {
	min-width: 0;
}

.tabs_wrapper {
	min-height: 44px;
	overflow-x: auto;

	border-radius: 4px;
	background: var(--card-background);

	padding: 0 8px;
}

.tabs_wrapper::-webkit-scrollbar {
	display: none;
}

.tab {
	height: 28px;

	cursor: pointer;
	border-radius: 6px;

	padding: 0 8px;

	transition: all 0.1s ease;

	& span {
		color: var(--txt-tertiary);

		transition: all 0.1s ease;
	}

	&:hover {
		& span {
			color: var(--txt-secondary);
		}
	}
}

.tab.active {
	background: var(--op-8);

	& span {
		color: var(--txt-primary);
	}
}

.table {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.empty {
	padding-top: 16px;
}

.pagination {
	padding: 0 16px 16px 16px;
}

@media (max-width: 800px) {
	.content {
		flex-direction: column;
	}

	.data {
		min-width: initial;

		border-radius: 4px;
	}

	.table {
		border-radius: 4px 4px 8px 8px;
	}
}

@media (max-width: 400px) {
	.tabs_wrapper {
		overflow-x: auto;

		&::-webkit-scrollbar {
			display: none;
		}
	}

	.hint {
		display: none;
	}
}
</style>
