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
import { comma, formatBytes } from "@/services/utils"

/** API */
import { fetchRollupBlobs, fetchRollupExportData, fetchRollupNamespaces } from "@/services/api/rollup"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useNotificationsStore } from "@/store/notifications"
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
		title: "Last 24 hours",
		timeRange: "day",
	},
	{
		title: "Last 7 days",
		timeRange: "week",
	},
	{
		title: "Last 31 days",
		timeRange: "month",
	},
])

const handleCSVDownload = async (period) => {
	let from
	switch (period) {
		case "day":
			from = parseInt(DateTime.now().minus({ days: 1 }).toMillis() / 1_000)
			break
		case "week":
			from = parseInt(DateTime.now().minus({ weeks: 1 }).toMillis() / 1_000)
			break
		case "month":
			from = parseInt(DateTime.now().minus({ months: 1 }).toMillis() / 1_000)
			break
		default:
			break
	}
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

	const blob = new Blob([data.value], { type: "text/csv;charset=utf-8;" })
	const link = document.createElement("a")

	link.href = URL.createObjectURL(blob)
	link.download = `${props.rollup.slug}-blobs-last-${period}.csv`

	link.style.visibility = "hidden"
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)

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
					<DropdownItem v-for="period in periods" @click="handleCSVDownload(period.timeRange)">
						{{ period.title }}
					</DropdownItem>
				</template>
			</Dropdown>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex align="center" gap="12" :class="$style.key_value">
						<Flex v-if="rollup.logo" align="center" justify="center" :class="$style.avatar_container">
							<img :src="rollup.logo" :class="$style.avatar_image" />
						</Flex>

						<Flex direction="column" gap="8" :class="$style.key_value">
							<Text size="12" weight="600" color="secondary">Rollup</Text>

							<Flex align="center" gap="10">
								<Text size="13" weight="600" color="primary">{{ rollup.name }} </Text>

								<CopyButton :text="rollup.name" />
							</Flex>
						</Flex>
					</Flex>
					<Flex direction="column" gap="6">
						<Text size="12" weight="600" color="secondary">Description</Text>

						<Flex align="center" gap="6">
							<Text size="12" height="140" weight="600" color="tertiary" mono selectable :class="$style.memo">
								{{ rollup.description }}
							</Text>
						</Flex>
					</Flex>
					<Flex align="center" justify="start" gap="12">
						<Tooltip v-if="rollup.website" position="start" delay="500">
							<a :href="rollup.website" target="_blank">
								<Icon name="globe" size="14" color="secondary" :class="$style.btn" />
							</a>

							<template #content>
								{{ rollup.website }}
							</template>
						</Tooltip>

						<Tooltip v-if="rollup.twitter" position="start" delay="500">
							<a :href="rollup.twitter" target="_blank">
								<Icon name="twitter" size="14" color="secondary" :class="$style.btn" />
							</a>

							<template #content>
								{{ rollup.twitter }}
							</template>
						</Tooltip>

						<Tooltip v-if="rollup.github" position="start" delay="500">
							<a :href="rollup.github" target="_blank">
								<Icon name="github" size="14" color="secondary" :class="$style.btn" />
							</a>

							<template #content>
								{{ rollup.github }}
							</template>
						</Tooltip>
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Size</Text>
							<Text size="12" weight="600" color="secondary"> {{ formatBytes(rollup.size) }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Blobs</Text>
							<Text size="12" weight="600" color="secondary"> {{ comma(rollup.blobs_count) }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Blob Fees Paid</Text>
							<AmountInCurrency
								:amount="{ value: rollup.fee }"
								:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }"
							/>
						</Flex>

						<Flex align="start" justify="between">
							<Text size="12" weight="600" color="tertiary">First Seen</Text>
							<Tooltip position="start" delay="500">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(rollup.first_message_time).toRelative({ locale: "en", style: "short" }) }}
								</Text>

								<template #content>
									{{ DateTime.fromISO(rollup.first_message_time).setLocale("en").toFormat("LLL d, t") }}
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
									{{ DateTime.fromISO(rollup.last_message_time).setLocale("en").toFormat("LLL d, t") }}
								</template>
							</Tooltip>
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
						<BlobsTable v-if="blobs.length" :blobs="blobs" />

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
	.avatar_container {
		position: relative;
		width: 50px;
		height: 50px;
		overflow: hidden;
		border-radius: 50%;
	}

	.avatar_image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.memo {
		max-width: 352px;
		text-overflow: ellipsis;
		overflow: hidden;
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
