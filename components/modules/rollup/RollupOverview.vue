<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
// import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Tables */
import BlobsTable from "./tables/BlobsTable.vue"
import NamespacesTable from "./tables/NamespacesTable.vue"

/** Services */
import { comma, formatBytes } from "@/services/utils"

/** API */
import { fetchRollupBlobs, fetchRollupNamespaces } from "@/services/api/rollup"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

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
		icon: "folder",
	},
])
const activeTab = ref(tabs.value[0].name)

const isRefetching = ref(false)
const namespaces = ref([])
const blobs = ref([])

const page = ref(1)
const pages = computed(() => 1)
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
await getBlobs()

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

// const handleViewRawNamespaces = () => {
// 	cacheStore.current._target = "namespaces"
// 	modalsStore.open("rawData")
// }

// const handleViewRawBlobs = () => {
// 	cacheStore.current._target = "blobs"
// 	modalsStore.open("rawData")
// }

</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="package" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Rollup</Text>
			</Flex>

			<!-- <Dropdown>
				<Button type="tertiary" size="mini">
					<Icon name="dots" size="16" color="secondary" />
				</Button>

				<template #popup>
					<DropdownItem @click="handleViewRawNamespaces"> View Raw Namespaces </DropdownItem>
					<DropdownItem @click="handleViewRawBlobs"> View Raw Blobs </DropdownItem>
				</template>
			</Dropdown> -->
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Rollup</Text>

						<Flex align="center" gap="10">
							<Text size="13" weight="600" color="primary">{{ rollup.name }} </Text>

							<CopyButton :text="rollup.name" />
						</Flex>
					</Flex>

					<Flex align="center" justify="center">
						<img :src="rollup.logo" :class="$style.key_value" />
					</Flex>

					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Description</Text>

						<Text size="12" weight="600" color="tertiary">{{ rollup.description }} </Text>
					</Flex>

					<Flex align="center" justify="end" gap="12">
						<Tooltip position="start" delay="500">
							<a :href="rollup.website" target="_blank">
								<Icon name="globe" size="14" color="secondary" :class="$style.btn" />
							</a>

							<template #content>
								{{ rollup.website }}
							</template>
						</Tooltip>
						<Tooltip position="start" delay="500">
							<a :href="rollup.twitter" target="_blank">
								<Icon name="twitter" size="14" color="secondary" :class="$style.btn" />
							</a>

							<template #content>
								{{ rollup.twitter }}
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

						<Flex align="start" justify="between">
							<Text size="12" weight="600" color="tertiary">Last Active</Text>
							<Flex direction="column" align="end" gap="8">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(rollup.last_message_time).toRelative({ locale: "en", style: "short" }) }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ DateTime.fromISO(rollup.last_message_time).setLocale("en").toFormat("LLL d, t") }}
								</Text>
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
							<Button @click="handlePrev" type="secondary" size="mini" :disabled="page === 1">
								<Icon name="arrow-left" size="12" color="primary" />
							</Button>

							<Button type="secondary" size="mini" disabled>
								<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
							</Button>

							<Button @click="handleNext" type="secondary" size="mini" :disabled="blobs.length < 10">
								<Icon name="arrow-right" size="12" color="primary" />
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
					<!-- Pagination -->
					<!-- <Flex v-if="pages > 1" align="center" gap="6" :class="$style.pagination">
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
					</Flex> -->
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
	/* max-height: 534px; */

	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	.main {
		padding: 16px;

		& .key_value {
			max-width: 100%;
		}
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
