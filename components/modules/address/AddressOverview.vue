<script setup>
/** UI */
import BookmarkButton from "@/components/BookmarkButton.vue"
import Button from "@/components/ui/Button.vue"
import Checkbox from "@/components/ui/Checkbox.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Input from "@/components/ui/Input.vue"
import Popover from "@/components/ui/Popover.vue"
import Toggle from "@/components/ui/Toggle.vue"

/** Components */
import AmountInCurrency from "@/components/AmountInCurrency.vue"
import TransactionsTable from "./tables/TransactionsTable.vue"
import MessagesTable from "@/components/modules/namespace/tables/MessagesTable.vue"
import BlobsTable from "@/components/modules/namespace/tables/BlobsTable.vue"
import DelegationsTable from "./tables/DelegationsTable.vue"
import RedelegationsTable from "./tables/RedelegationsTable.vue"
import UndelegationsTable from "./tables/UndelegationsTable.vue"
import GrantsTable from "./tables/GrantsTable.vue"
import GrantersTable from "./tables/GrantersTable.vue"
import VestingsTable from "./tables/VestingsTable.vue"

/** Services */
import { comma, splitAddress } from "@/services/utils"
import { MsgTypes } from "@/services/constants/messages"

/** API */
import {
	fetchTxsByAddressHash,
	fetchMessagesByAddressHash,
	fetchBlobsByAddressHash,
	fetchAddressDelegations,
	fetchAddressRedelegations,
	fetchAddressUndelegations,
	fetchAddressGrants,
	fetchAddressGranters,
	fetchAddressVestings,
} from "@/services/api/address"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const props = defineProps({
	address: {
		type: Object,
		required: true,
	},
})

const isRefetching = ref(false)
const transactions = ref([])
const messages = ref([])
const blobs = ref([])

/** Tabs */
const tabs = ref([
	{
		alias: "transactions",
		displayName: "Signed Transactions",
		icon: "tx",
		show: true,
	},
	{
		alias: "messages",
		displayName: "Messages",
		icon: "message",
		show: true,
	},
	{
		alias: "blobs",
		displayName: "Blobs",
		icon: "blob",
		show: true,
	},
	{
		alias: "vestings",
		displayName: "Vestings",
		icon: "vesting",
		show: true,
	},
	{
		alias: "delegations",
		displayName: "Delegations",
		icon: "coins_up",
		show: true,
	},
	{
		alias: "redelegations",
		displayName: "Redelegations",
		icon: "redelegate",
		show: true,
	},
	{
		alias: "undelegations",
		displayName: "Undelegations",
		icon: "unlock",
		show: props.address.balance.unbonding > 0,
	},
	{
		alias: "grants",
		displayName: "Grants",
		icon: "stars",
		show: true,
	},
	{
		alias: "granters",
		displayName: "Granters",
		icon: "granters",
		show: true,
	},
])

const preselectedTab =
	route.query.tab && tabs.value.map((tab) => tab.alias).includes(route.query.tab) ? route.query.tab : tabs.value[0].alias
const activeTab = ref(preselectedTab)

const tabsEl = ref(null)

const handleSelect = (tab) => {
	if (activeTab.value !== tab) {
		activeTab.value = tab

		let tabCenter = 0
		for (let i = 0; i < tabsEl.value.wrapper.children.length; i++) {
			if (tabsEl.value.wrapper.children[i].dataset.tab === tab) {
				tabCenter = tabsEl.value.wrapper.children[i].offsetLeft + tabsEl.value.wrapper.children[i].offsetWidth / 2
				break
			}
		}

		if (tabCenter) {
			const wrapperCenter = tabsEl.value.wrapper.offsetLeft + tabsEl.value.wrapper.offsetWidth / 2

			tabsEl.value.wrapper.scroll({ left: tabCenter - wrapperCenter })
		}
	}
}

/** Pagination */
const page = ref(1)
const handleNextCondition = ref(true)
const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

/** Sorting */
const sort = reactive({
	by: "time",
	dir: "desc",
})

const onSort = (by) => {
	switch (sort.dir) {
		case "desc":
			if (sort.by === by) sort.dir = "asc"
			break

		case "asc":
			sort.dir = "desc"

			break
	}

	sort.by = by

	getTransactions()
}

/** Filters */
const filters = reactive({
	status: {
		success: false,
		failed: false,
	},
	// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
	message_type: MsgTypes.reduce((a, b) => ({ ...a, [b]: false }), {}),
})
const hasActiveFilters = computed(() => {
	let has = false

	for (const s of Object.keys(filters.status)) {
		if (filters.status[s]) has = true
	}
	for (const t of Object.keys(filters.message_type)) {
		if (filters.message_type[t]) has = true
	}

	return has
})
const savedFiltersBeforeChanges = ref(null)

const handleClearAllFilters = () => {
	for (const t of Object.keys(filters.status)) {
		filters.status[f] = false
	}

	for (const f of Object.keys(filters.message_type)) {
		filters.message_type[f] = false
	}

	router.replace({
		query: null,
	})

	getTransactions()
}

const searchTerm = ref("")

onMounted(() => {
	router.replace({
		query: {
			tab: activeTab.value,
		},
	})
})

/** Parse route query */
for (const key of Object.keys(route.query)) {
	if (key === "page" || key === "tab") continue

	if (route.query[key].split(",").length) {
		for (const item of route.query[key].split(",")) {
			filters[key][item] = true
		}
	} else {
		filters[key][route.query[key]] = true
	}
}

const updateRouteQuery = () => {
	router.replace({
		query: {
			status:
				Object.keys(filters.status).find((f) => filters.status[f]) &&
				Object.keys(filters.status)
					.filter((f) => filters.status[f])
					.join(","),
			message_type:
				Object.keys(filters.message_type).find((f) => filters.message_type[f]) &&
				Object.keys(filters.message_type)
					.filter((f) => filters.message_type[f])
					.join(","),
		},
	})
}

const isStatusPopoverOpen = ref(false)
const handleOpenStatusPopover = () => {
	isStatusPopoverOpen.value = true

	if (Object.keys(filters.status).find((f) => filters.status[f])) {
		savedFiltersBeforeChanges.value = { ...filters.status }
	}
}
const onStatusPopoverClose = () => {
	isStatusPopoverOpen.value = false

	if (savedFiltersBeforeChanges.value) {
		filters.status = savedFiltersBeforeChanges.value
		savedFiltersBeforeChanges.value = null
	} else {
		resetFilters("status")
	}
}
const handleApplyStatusFilters = () => {
	savedFiltersBeforeChanges.value = null
	isStatusPopoverOpen.value = false

	getTransactions()

	updateRouteQuery()
}

const isMessageTypePopoverOpen = ref(false)
const handleOpenMessageTypePopover = () => {
	isMessageTypePopoverOpen.value = true

	if (Object.keys(filters.message_type).find((f) => filters.message_type[f])) {
		savedFiltersBeforeChanges.value = { ...filters.message_type }
	}
}
const onMessageTypePopoverClose = () => {
	isMessageTypePopoverOpen.value = false

	searchTerm.value = ""

	if (savedFiltersBeforeChanges.value) {
		filters.message_type = savedFiltersBeforeChanges.value
		savedFiltersBeforeChanges.value = null
	} else {
		resetFilters("message_type")
	}
}
const handleApplyMessageTypeFilters = () => {
	savedFiltersBeforeChanges.value = null
	isMessageTypePopoverOpen.value = false

	getTransactions()

	updateRouteQuery()
}

const resetFilters = (target, refetch) => {
	for (const f of Object.keys(filters[target])) {
		filters[target][f] = false
	}

	if (refetch) {
		updateRouteQuery()

		getTransactions()
	}
}

const getTransactions = async () => {
	isRefetching.value = true

	const { data } = await fetchTxsByAddressHash({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
		sort: sort.dir,
		sort_by: sort.by,
		status:
			Object.keys(filters.status).find((f) => filters.status[f]) &&
			Object.keys(filters.status)
				.filter((f) => filters.status[f])
				.join(","),
		msg_type:
			Object.keys(filters.message_type).find((f) => filters.message_type[f]) &&
			Object.keys(filters.message_type)
				.filter((f) => filters.message_type[f])
				.join(","),
	})

	transactions.value = data.value
	cacheStore.current.transactions = transactions.value
	handleNextCondition.value = transactions.value.length < 10

	isRefetching.value = false
}

const getMessages = async () => {
	isRefetching.value = true

	const { data } = await fetchMessagesByAddressHash({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
		sort: "desc",
	})

	messages.value = data.value
	cacheStore.current.messages = messages.value
	handleNextCondition.value = messages.value.length < 10

	isRefetching.value = false
}

const getBlobs = async () => {
	isRefetching.value = true

	const { data } = await fetchBlobsByAddressHash({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
		sort: "desc",
	})

	if (data.value?.length) {
		blobs.value = data.value.map((b) => ({ ...b, signer: props.address.hash }))
	}
	handleNextCondition.value = data.value.length < 10

	isRefetching.value = false
}

/** Delegation */
const isActiveDelegator = props.address.balance.delegated > 0 || props.address.balance.unbonding > 0
const collapseBalances = ref(!isActiveDelegator)
const totalBalance =
	Number.parseInt(props.address.balance.spendable) +
	Number.parseInt(props.address.balance.delegated) +
	Number.parseInt(props.address.balance.unbonding)
const delegations = ref([])
const redelegations = ref([])
const undelegations = ref([])

const getDelegations = async () => {
	isRefetching.value = true

	const { data } = await fetchAddressDelegations({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	if (data.value?.length) {
		delegations.value = data.value
	}
	handleNextCondition.value = data.value.length < 10

	isRefetching.value = false
}

const getRedelegations = async () => {
	isRefetching.value = true

	const { data } = await fetchAddressRedelegations({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	if (data.value?.length) {
		redelegations.value = data.value
	}
	handleNextCondition.value = data.value.length < 10

	isRefetching.value = false
}

const getUndelegations = async () => {
	isRefetching.value = true

	const { data } = await fetchAddressUndelegations({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	if (data.value?.length) {
		undelegations.value = data.value
	}
	handleNextCondition.value = data.value.length < 10

	isRefetching.value = false
}

/** Grants and Granters */
const grants = ref([])
const granters = ref([])

const getGrants = async () => {
	isRefetching.value = true

	const { data } = await fetchAddressGrants({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	if (data.value?.length) {
		grants.value = data.value
	}
	handleNextCondition.value = data.value.length < 10

	isRefetching.value = false
}

const getGranters = async () => {
	isRefetching.value = true

	const { data } = await fetchAddressGranters({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	if (data.value?.length) {
		granters.value = data.value
	}
	handleNextCondition.value = data.value.length < 10

	isRefetching.value = false
}

/** Vesting */
const vestings = ref([])
const showEnded = ref(false)
const getVestings = async () => {
	isRefetching.value = true

	const { data } = await fetchAddressVestings({
		hash: props.address.hash,
		showEnded: showEnded.value,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	vestings.value = data.value

	handleNextCondition.value = data.value.length < 10

	isRefetching.value = false
}

if (activeTab.value === "transactions") await getTransactions()
if (activeTab.value === "messages") await getMessages()
if (activeTab.value === "blobs") await getBlobs()
if (activeTab.value === "delegations") await getDelegations()
if (activeTab.value === "redelegations") await getRedelegations()
if (activeTab.value === "grants") await getGrants()
if (activeTab.value === "granters") await getGranters()
if (activeTab.value === "vestings") await getVestings()

/** Refetch transactions */
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
			case "transactions":
				getTransactions()
				break

			case "messages":
				getMessages()
				break

			case "blobs":
				getBlobs()
				break

			case "delegations":
				getDelegations()
				break

			case "redelegations":
				getRedelegations()
				break

			case "undelegations":
				getUndelegations()
				break

			case "grants":
				getGrants()
				break

			case "granters":
				getGranters()
				break

			case "vestings":
				getVestings()
				break
		}
	},
)

watch(
	() => page.value,
	() => {
		switch (activeTab.value) {
			case "transactions":
				getTransactions()
				break

			case "blobs":
				getBlobs()
				break

			case "messages":
				getMessages()
				break

			case "delegations":
				getDelegations()
				break

			case "redelegations":
				getRedelegations()
				break

			case "undelegations":
				getUndelegations()
				break

			case "grants":
				getGrants()
				break

			case "granters":
				getGranters()
				break

			case "vestings":
				getVestings()
				break
		}
	},
)

watch(
	() => showEnded.value,
	() => {
		if (page.value === 1) {
			getVestings()
		} else {
			page.value = 1
		}
	},
)

const handleSend = () => {
	modalsStore.open("send")
}

const handleViewRawAddress = () => {
	cacheStore.current._target = "address"
	modalsStore.open("rawData")
}

const handleViewRawTransactions = () => {
	cacheStore.current._target = "transactions"
	modalsStore.open("rawData")
}

const handleOpenQRModal = () => {
	cacheStore.qr.data = props.address.hash
	cacheStore.qr.description = "Scan QR code to get this address"
	cacheStore.qr.icon = "address"

	modalsStore.open("qr")
}
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="address" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Address</Text>
			</Flex>

			<Flex align="center" gap="12">
				<Flex align="center" gap="8">
					<Button @click="handleSend" type="secondary" size="mini">
						<Icon name="arrow-circle-broken-right" size="12" color="primary" />
						Send
					</Button>

					<BookmarkButton
						type="address"
						:id="address.hash"
					/>
				</Flex>

				<div class="divider_v"></div>

				<Dropdown>
					<Button type="secondary" size="mini">
						<Icon name="dots" size="16" color="primary" />
					</Button>

					<template #popup>
						<DropdownItem @click="handleOpenQRModal">
							<Flex align="center" gap="8">
								<Icon name="qr" size="12" color="secondary" />
								Get QR Code
							</Flex>
						</DropdownItem>
						<DropdownItem @click="handleViewRawAddress">
							<Flex align="center" gap="8">
								<Icon name="address" size="12" color="secondary" />
								View Raw Address
							</Flex>
						</DropdownItem>
					</template>
				</Dropdown>
			</Flex>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" justify="between" gap="32" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Address</Text>

						<Flex align="center" gap="10">
							<Text size="12" weight="600" color="secondary"> {{ splitAddress(address.hash) }} </Text>

							<CopyButton :text="address.hash" />
						</Flex>
					</Flex>

					<Flex direction="column" gap="16" :class="$style.key_value">
						<Flex @click="collapseBalances = !collapseBalances" align="center" justify="between" style="cursor: pointer">
							<Flex direction="column" gap="8">
								<Text size="12" weight="600" color="secondary">Total Balance</Text>
								<AmountInCurrency
									:amount="{ value: totalBalance }"
									:styles="{ amount: { size: '13' }, currency: { size: '13', color: 'primary' } }"
								/>
								<!-- <Text size="13" weight="600" color="primary" selectable>{{ tia(totalBalance).toLocaleString('en-US') }} TIA</Text> -->
							</Flex>

							<Icon
								name="chevron"
								size="14"
								color="secondary"
								:style="{
									transform: `rotate(${collapseBalances ? '0' : '180'}deg)`,
									transition: 'all 400ms ease',
								}"
							/>
						</Flex>

						<Flex v-if="!collapseBalances" direction="column" gap="12" :class="$style.key_value">
							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary"> Spendable</Text>
								<AmountInCurrency
									:amount="{ value: address.balance.spendable }"
									:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }"
								/>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary"> Delegated</Text>
								<AmountInCurrency
									:amount="{ value: address.balance.delegated }"
									:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }"
								/>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary"> Unbonding</Text>
								<AmountInCurrency
									:amount="{ value: address.balance.unbonding }"
									:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }"
								/>
							</Flex>
						</Flex>
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> First Height</Text>
							<Text size="12" weight="600" color="secondary"> {{ comma(address.first_height) }} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Last Height</Text>
							<Text size="12" weight="600" color="secondary"> {{ comma(address.last_height) }} </Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="4" wide :class="$style.txs_wrapper">
				<Flex align="center" gap="4" :class="$style.tabs_wrapper" ref="tabsEl">
					<template v-for="tab in tabs">
						<Flex
							v-if="tab.show"
							:data-tab="tab.alias"
							@click="handleSelect(tab.alias)"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === tab.alias && $style.active]"
							:style="{ transition: 'all 200ms ease' }"
						>
							<Icon :name="tab.icon" size="12" color="secondary" />

							<Text size="13" weight="600">{{ tab.displayName }}</Text>
						</Flex>
					</template>
				</Flex>

				<Flex direction="column" justify="center" :class="[$style.tables, isRefetching && $style.disabled]">
					<Flex v-if="activeTab === 'transactions'" wrap="wrap" align="center" gap="8" :class="$style.filters">
						<Popover :open="isStatusPopoverOpen" @on-close="onStatusPopoverClose" width="200">
							<Button
								@click="handleOpenStatusPopover"
								type="secondary"
								size="mini"
								:disabled="!transactions.length && !hasActiveFilters"
							>
								<Icon name="plus-circle" size="12" color="tertiary" />
								<Text color="secondary">Status</Text>

								<template v-if="Object.keys(filters.status).find((f) => filters.status[f])">
									<div :class="$style.vertical_divider" />

									<Text size="12" weight="600" color="primary" style="text-transform: capitalize">
										{{
											Object.keys(filters.status)
												.filter((f) => filters.status[f])
												.join(", ")
										}}
									</Text>

									<Icon @click.stop="resetFilters('status', true)" name="close-circle" size="12" color="secondary" />
								</template>
							</Button>

							<template #content>
								<Flex direction="column" gap="12">
									<Text size="12" weight="500" color="secondary">Filter by Status</Text>

									<Flex direction="column" gap="8">
										<Checkbox v-model="filters.status.success">
											<Text size="12" weight="500" color="primary">Success</Text>
										</Checkbox>
										<Checkbox v-model="filters.status.failed">
											<Text size="12" weight="500" color="primary">Failed</Text>
										</Checkbox>
									</Flex>

									<Button @click="handleApplyStatusFilters" type="secondary" size="mini" wide>Apply</Button>
								</Flex>
							</template>
						</Popover>

						<Popover :open="isMessageTypePopoverOpen" @on-close="onMessageTypePopoverClose" width="250">
							<Button
								@click="handleOpenMessageTypePopover"
								type="secondary"
								size="mini"
								:disabled="!transactions.length && !hasActiveFilters"
							>
								<Icon name="plus-circle" size="12" color="tertiary" />
								<Text color="secondary">Message Type</Text>

								<template v-if="Object.keys(filters.message_type).find((f) => filters.message_type[f])">
									<div :class="$style.vertical_divider" />

									<Text size="12" weight="600" color="primary">
										{{
											Object.keys(filters.message_type).filter((f) => filters.message_type[f]).length < 3
												? Object.keys(filters.message_type)
														.filter((f) => filters.message_type[f])
														.map((f) => f.replace("Msg", ""))
														.join(", ")
												: `${Object.keys(filters.message_type)
														.filter((f) => filters.message_type[f])[0]
														.replace("Msg", "")} and ${
														Object.keys(filters.message_type).filter((f) => filters.message_type[f]).length - 1
												  } more`
										}}
									</Text>

									<Icon
										@click.stop="resetFilters('message_type', true)"
										name="close-circle"
										size="12"
										color="secondary"
									/>
								</template>
							</Button>

							<template #content>
								<Flex direction="column" gap="12">
									<Text size="12" weight="500" color="secondary">Filter by Message Type</Text>

									<Input v-model="searchTerm" size="small" placeholder="Search" autofocus />

									<Flex direction="column" gap="8" :class="$style.message_types_list">
										<template
											v-if="
												Object.keys(filters.message_type).filter((t) =>
													t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
												).length
											"
										>
											<Checkbox
												v-for="msg_type in Object.keys(filters.message_type).filter((t) =>
													t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
												)"
												v-model="filters.message_type[msg_type]"
											>
												<Text size="12" weight="500" color="primary">{{ msg_type.replace("Msg", "") }}</Text>
											</Checkbox>
										</template>
										<Flex v-else direction="column" gap="8">
											<Text size="12" weight="500" color="tertiary">Nothing was found</Text>
										</Flex>
									</Flex>

									<Button @click="handleApplyMessageTypeFilters" type="secondary" size="mini" wide>Apply</Button>
								</Flex>
							</template>
						</Popover>
					</Flex>

					<Flex :class="$style.table">
						<!-- Transactions Table -->
						<template v-if="activeTab === 'transactions'">
							<TransactionsTable v-if="transactions.length" :transactions="transactions" :sort="sort" @onSort="onSort" />

							<Flex
								v-else-if="hasActiveFilters && !transactions.length"
								align="center"
								justify="center"
								direction="column"
								gap="20"
								wide
								:class="$style.empty"
							>
								<Icon name="search" size="24" color="support" />

								<Flex direction="column" gap="8">
									<Text size="13" weight="600" color="secondary" align="center"> Nothing was found </Text>
									<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
										Clear filters to see all transactions
									</Text>
								</Flex>

								<Button @click="handleClearAllFilters" type="secondary" size="small">Clear all filters</Button>
							</Flex>

							<Flex v-else direction="column" align="center" justify="center" gap="8" :class="$style.empty">
								<Text size="13" weight="600" color="secondary" align="center"> No transactions </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address did not signed any {{ page === 1 ? "" : "more" }} transactions
								</Text>
							</Flex>
						</template>

						<!-- Messages Table -->
						<template v-if="activeTab === 'messages'">
							<MessagesTable v-if="messages.length" :messages="messages" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="secondary" align="center"> No Messages </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									No {{ page === 1 ? "activity" : "more messages" }} with this address
								</Text>
							</Flex>
						</template>

						<!-- Blobs Table -->
						<template v-if="activeTab === 'blobs'">
							<BlobsTable v-if="blobs.length" :blobs="blobs" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="secondary" align="center"> No Blobs </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address did not push any {{ page === 1 ? "" : "more" }} blobs
								</Text>
							</Flex>
						</template>

						<!-- Delegations Table -->
						<template v-if="activeTab === 'delegations'">
							<DelegationsTable v-if="delegations.length" :delegations="delegations" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="secondary" align="center"> No Delegations </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address doesn't have any {{ page === 1 ? "" : "more" }} delegations
								</Text>
							</Flex>
						</template>

						<!-- Redelegations Table -->
						<template v-if="activeTab === 'redelegations'">
							<RedelegationsTable v-if="redelegations.length" :redelegations="redelegations" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="secondary" align="center"> No Redelegations </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address doesn't have any {{ page === 1 ? "" : "more" }} redelegations
								</Text>
							</Flex>
						</template>

						<!-- Undelegations Table -->
						<template v-if="activeTab === 'undelegations'">
							<UndelegationsTable v-if="undelegations.length" :undelegations="undelegations" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="secondary" align="center"> No Undelegations </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address doesn't have any {{ page === 1 ? "" : "more" }} undelegations
								</Text>
							</Flex>
						</template>

						<!-- Grants Table -->
						<template v-if="activeTab === 'grants'">
							<GrantsTable v-if="grants.length" :grants="grants" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="secondary" align="center"> No Grants </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address doesn't have any {{ page === 1 ? "" : "more" }} grants
								</Text>
							</Flex>
						</template>

						<!-- Granters Table -->
						<template v-if="activeTab === 'granters'">
							<GrantersTable v-if="granters.length" :granters="granters" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="secondary" align="center"> No Granters </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address doesn't have any {{ page === 1 ? "" : "more" }} granters
								</Text>
							</Flex>
						</template>

						<!-- Vestings Table -->
						<template v-if="activeTab === 'vestings'">
							<VestingsTable v-if="vestings.length" :vestings="vestings" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="secondary" align="center"> No Vestings </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address doesn't have any {{ page === 1 ? "" : "more" }} {{ !showEnded ? "active" : "" }} vestings
								</Text>
							</Flex>
						</template>
					</Flex>

					<!-- Pagination -->
					<Flex align="center" justify="between">
						<Flex align="center" gap="6" :class="$style.pagination">
							<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
								<Icon name="arrow-left-stop" size="12" color="primary" />
							</Button>
							<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
								<Icon name="arrow-left" size="12" color="primary" />
							</Button>

							<Button type="secondary" size="mini" disabled>
								<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
							</Button>

							<Button @click="handleNext" type="secondary" size="mini" :disabled="handleNextCondition">
								<Icon name="arrow-right" size="12" color="primary" />
							</Button>
						</Flex>

						<Flex v-if="activeTab === 'vestings'" align="center">
							<Text size="12" color="secondary"> {{ showEnded ? "Hide completed" : "Show completed" }} </Text>

							<Toggle v-model="showEnded" :class="$style.toggle" />
						</Flex>
					</Flex>
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
}

.txs_wrapper {
	min-width: 0;
}

.message_types_list {
	height: 200px;

	overflow-y: auto;
	overflow-x: hidden;
}

.tabs_wrapper {
	min-height: 44px;
	overflow-x: auto;

	border-radius: 4px;
	background: var(--card-background);

	padding: 0 8px;

	scroll-behavior: smooth;
}

.tabs_wrapper::-webkit-scrollbar {
	display: none;
}

.tab {
	height: 28px;

	white-space: nowrap;

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

.tables {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);
}

.tables.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.table {
	flex: 1;
}

.filters {
	border-bottom: 1px dashed var(--op-8);

	padding: 12px 8px 12px 8px;
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

.empty {
	flex: 1;

	padding-top: 16px;
	padding-bottom: 16px;
}

.pagination {
	padding: 16px;
}

.toggle {
	margin: 16px;
}

.qrcode {
	max-width: 60px;

	filter: invert(1);
	opacity: 0.2;

	transition: all 0.2s ease;

	&:hover {
		opacity: 1;

		transform: scale(1.2);
	}
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

		scroll-behavior: smooth;

		&::-webkit-scrollbar {
			display: none;
		}
	}

	.hint {
		display: none;
	}
}
</style>
