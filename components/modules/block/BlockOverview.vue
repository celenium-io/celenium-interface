<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import AmountInCurrency from "@/components/AmountInCurrency.vue"
import Badge from "@/components/ui/Badge.vue"
import BookmarkButton from "@/components/BookmarkButton.vue"
import Button from "@/components/ui/Button.vue"
import Checkbox from "@/components/ui/Checkbox.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Input from "@/components/ui/Input.vue"
import Popover from "@/components/ui/Popover.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Shared Components */
import Events from "@/components/shared/tables/Events.vue"
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"
import UpcomingUpdate from "@/components/shared/tables/UpcomingUpdate.vue"

/** Components */
import UpcomingBlockCard from "./UpcomingBlockCard.vue"

/** Services */
import { comma, formatBytes, space, shortHex } from "@/services/utils"

/** API */
import { fetchTransactionsByBlock } from "@/services/api/tx"
import { fetchAvgBlockTime } from "@/services/api/block"

/** Store */
import { useAppStore } from "@/store/app.store"
import { useModalsStore } from "@/store/modals.store"
import { useCacheStore } from "@/store/cache.store"
const appStore = useAppStore()
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const props = defineProps({
	block: {
		type: Object,
	},
	transactions: {
		type: Array,
	},
	isUpcomingBlock: {
		type: Boolean,
		default: false,
	},
	isWaited: {
		type: Boolean,
		default: false,
	},

	/**
	 * Height from route.params.height
	 * Used when isUpcomingBlock === true
	 */
	height: {
		type: Number,
		required: true,
	},
})

const latestBlock = computed(() => appStore.latestBlocks[0])

const avgBlockTime = ref(0)
const { data } = await useAsyncData("avgBlockTime", () =>
	fetchAvgBlockTime({ from: parseInt(DateTime.now().minus({ hours: 3 }).ts / 1_000) }),
)
if (data.value) avgBlockTime.value = Number(data.value) / 1_000

const secondsToSelectedBlock = computed(() => {
	if (!latestBlock.value) return null
	return (props.height - latestBlock.value.height) * avgBlockTime.value
})

// const preselectedTab = route.query.tab && ["transactions", "events"].includes(route.query.tab) ? route.query.tab : "transactions"
// const activeTab = ref(preselectedTab)
const activeTab = ref()

const isLoading = ref(false)
const transactions = ref([])
const update = ref()

const page = ref(1)
const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

/** Filters */
const filters = reactive({
	status: {
		success: false,
		failed: false,
	},
	message_type: props.isUpcomingBlock ? [] : props.block.message_types.sort().reduce((a, b) => ({ ...a, [b]: false }), {}),
})
const hasActiveFilters = computed(() => {
	let has = false

	Object.keys(filters.status).forEach((s) => {
		if (filters.status[s]) has = true
	})
	Object.keys(filters.message_type).forEach((t) => {
		if (filters.message_type[t]) has = true
	})

	return has
})
const savedFiltersBeforeChanges = ref(null)

const handleClearAllFilters = () => {
	Object.keys(filters.status).forEach((f) => {
		filters.status[f] = false
	})

	Object.keys(filters.message_type).forEach((f) => {
		filters.message_type[f] = false
	})

	router.replace({
		query: null,
	})

	getTransactions()
}

const searchTerm = ref("")

/** Parse route query */
Object.keys(route.query).forEach((key) => {
	if (key === "page" || key === "tab") return

	if (route.query[key].split(",").length) {
		route.query[key].split(",").forEach((item) => {
			filters[key][item] = true
		})
	} else {
		filters[key][route.query[key]] = true
	}
})

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

	if (page.value > 1) {
		page.value = 1
	} else {
		getTransactions()
	}

	updateRouteQuery()
}

const resetFilters = (target, refetch) => {
	Object.keys(filters[target]).forEach((f) => {
		filters[target][f] = false
	})

	if (refetch) {
		updateRouteQuery()

		getTransactions()
	}
}

const getTransactions = async () => {
	if (props.isUpcomingBlock) return

	isLoading.value = true

	const { data } = await fetchTransactionsByBlock({
		height: props.height,
		from: parseInt(DateTime.fromISO(props.block.time) / 1000),
		to: parseInt(DateTime.fromISO(props.block.time) / 1000) + 1,
		limit: 10,
		offset: (page.value - 1) * 10,
		sort: "desc",
		status:
			Object.keys(filters.status).find((f) => filters.status[f]) &&
			Object.keys(filters.status)
				.filter((f) => filters.status[f])
				.join(","),
		type:
			Object.keys(filters.message_type).find((f) => filters.message_type[f]) &&
			Object.keys(filters.message_type)
				.filter((f) => filters.message_type[f])
				.join(","),
	})

	transactions.value = data.value
	cacheStore.current.transactions = transactions.value

	isLoading.value = false
}

await getTransactions()

onBeforeMount(async () => {
})

onMounted(async () => {
	update.value = appStore.globalUpdates.find(upd => upd.block === props.height)
	if (update.value?.kind) {
		activeTab.value = "upcoming_update"
	} else {
		const preselectedTab = route.query.tab && ["transactions", "events"].includes(route.query.tab) ? route.query.tab : "transactions"
		activeTab.value = preselectedTab
	}
	
	router.replace({
		query: {
			tab: activeTab.value,
		},
	})
})

/** Refetch transactions */
watch(
	() => page.value,
	() => {
		if (activeTab.value === "transactions") {
			getTransactions()
		}
	},
)

watch(
	() => activeTab.value,
	() => {
		router.replace({
			query: {
				tab: activeTab.value,
			},
		})

		page.value = 1

		getTransactions()
	},
)

watch(
	() => props.block,
	() => {
		getTransactions()
	},
)

watch(
	() => appStore.globalUpdates,
	() => {
		update.value = appStore.globalUpdates.find(upd => {
			return upd.block === props.height
		})
	},
)

const handleViewODSBlock = () => {
	modalsStore.open("ods")
}

const handleViewRawBlock = () => {
	cacheStore.current._target = "block"
	modalsStore.open("rawData")
}

const handleViewRawTransactions = () => {
	cacheStore.current._target = "transactions"
	modalsStore.open("rawData")
}

function triggerClientError() {
	throw new Error("Nuxt Button Error");
}
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="12">
				<Flex align="center" gap="8">
					<Icon name="block" size="14" color="primary" />
					<Text as="h1" size="13" weight="600" color="primary">
						Block <Text color="secondary">{{ comma(height) }} </Text>
					</Text>
				</Flex>

				<Flex align="center" gap="8">
					<Button @click="router.push(`/block/${height - 1}`)" type="secondary" size="mini" :disabled="height === 0">
						<Icon name="arrow-redo-right" size="16" color="secondary" :style="{ transform: 'scaleX(-1)' }" />
						<Text :class="$style.block_nav__txt">Prev</Text>
					</Button>

					<!-- <Button @click="router.push(`/block/${height + 1}`)" type="secondary" size="mini"> -->
					<Button @click="triggerClientError" type="secondary" size="mini"></Button>
						<Text :class="$style.block_nav__txt">Next</Text>
						<Icon name="arrow-redo-right" size="16" color="secondary" />
					</Button>
				</Flex>
			</Flex>

			<Flex align="center" gap="12">
				<Button
					@click="handleViewODSBlock"
					type="secondary"
					size="mini"
					:class="$style.ods_btn"
					:disabled="height === 0 || isUpcomingBlock"
				>
					<Icon name="ods" size="12" color="primary" />
					ODS
				</Button>

				<BookmarkButton type="block" :id="height" />

				<div class="divider_v" />

				<Dropdown :disabled="isUpcomingBlock">
					<Button type="secondary" size="mini" :disabled="isUpcomingBlock">
						<Icon name="dots" size="16" color="primary" />
					</Button>

					<template #popup>
						<DropdownItem @click="handleViewRawBlock"> View Raw Block </DropdownItem>
						<DropdownItem @click="handleViewRawTransactions"> View Raw Transactions </DropdownItem>
					</template>
				</Dropdown>
			</Flex>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex wide direction="column" gap="8" :class="$style.top">
					<Flex align="center" justify="between" wide>
						<Flex tag="h1" align="center" gap="6">
							<Text size="12" weight="600" color="secondary"> Height </Text>
							<Text size="12" weight="600" color="primary">{{ comma(height) }}</Text>
							<CopyButton :text="height" size="10" />
						</Flex>

						<Text v-if="block && !isUpcomingBlock" size="12" weight="600" color="tertiary">
							{{ DateTime.fromISO(block.time).setLocale("en").toFormat("ff") }}
						</Text>
						<Text
							v-else-if="secondsToSelectedBlock"
							size="12"
							weight="600"
							color="secondary"
							style="text-transform: capitalize"
						>
							~ {{ DateTime.now().plus({ seconds: secondsToSelectedBlock }).setLocale("en").toFormat("TT dd LLL yyyy") }}
						</Text>
					</Flex>

					<Badge>
						<Flex align="center" justify="between" wide>
							<Text v-if="block" size="12" weight="600" color="secondary" mono>
								{{
									DateTime.fromISO(block.time)
										.minus({ milliseconds: block.stats.block_time })
										.setLocale("en")
										.toFormat("TT")
								}}
							</Text>
							<Text v-else size="12" weight="600" color="tertiary"> TBD</Text>

							<div v-for="dot in 5" class="dot" />

							<Flex align="center" gap="6">
								<Icon name="time" size="12" color="secondary" />
								<Text v-if="block" size="12" weight="600" color="primary" mono>
									{{ (block.stats.block_time / 1_000).toFixed(2) }}s
								</Text>
								<Text v-else size="12" weight="600" color="primary">~{{ avgBlockTime.toFixed(2) }}s </Text>
							</Flex>

							<div v-for="dot in 5" class="dot" />

							<Text v-if="block" size="12" weight="600" color="secondary" align="right" mono>
								{{ DateTime.fromISO(block.time).setLocale("en").toFormat("TT") }}
							</Text>
							<Text v-else size="12" weight="600" color="tertiary" align="right"> TBD</Text>
						</Flex>
					</Badge>
				</Flex>

				<Flex direction="column" gap="24" :class="$style.main">
					<UpcomingBlockCard v-if="isWaited" :height :secondsToSelectedBlock :avgBlockTime />

					<Flex v-if="block?.proposer" direction="column" gap="12">
						<Text size="12" weight="600" color="tertiary">Proposer</Text>

						<Flex direction="column" gap="8">
							<NuxtLink :to="`/validator/${block.proposer.id}`">
								<Text size="13" weight="600" color="primary">
									{{ block.proposer.moniker }}
								</Text>
							</NuxtLink>

							<Flex align="center" gap="6">
								<Text size="12" weight="600" color="tertiary">{{ shortHex(block.proposer.cons_address) }}</Text>

								<CopyButton :text="block.proposer.cons_address" size="10" />
							</Flex>
						</Flex>
					</Flex>

					<Flex v-if="block" direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Hash</Text>

						<BadgeValue :text="block?.hash ?? ''" />
					</Flex>

					<Flex v-if="block" direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Blobs Size</Text>
							<Text v-if="block" size="12" weight="600" color="secondary">
								{{ formatBytes(block.stats.blobs_size) }}
							</Text>
							<Icon v-else name="clock" size="12" color="support" />
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Events</Text>
							<Text v-if="block" size="12" weight="600" color="secondary"> {{ block.stats.events_count }} </Text>
							<Icon v-else name="clock" size="12" color="support" />
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Transactions</Text>
							<Text v-if="block" size="12" weight="600" color="secondary"> {{ block.stats.tx_count }} </Text>
							<Icon v-else name="clock" size="12" color="support" />
						</Flex>
						<Flex v-if="block" align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Transactions Fee </Text>
							<AmountInCurrency
								:amount="{ value: block.stats.fee, decimal: 6 }"
								:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }"
							/>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Bytes in block </Text>
							<Text v-if="block" size="12" weight="600" color="secondary">
								{{ formatBytes(block.stats.bytes_in_block) }}</Text
							>
							<Icon v-else name="clock" size="12" color="support" />
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Square size </Text>
							<Text v-if="block" size="12" weight="600" color="secondary"> {{ block.stats.square_size }}</Text>
							<Icon v-else name="clock" size="12" color="support" />
						</Flex>
					</Flex>

					<Flex align="center" gap="8">
						<Button @click="router.push(`/block/${height - 1}`)" wide type="secondary" size="mini" :disabled="height === 0">
							<Icon name="arrow-redo-right" size="16" color="tertiary" :style="{ transform: 'scaleX(-1)' }" />
							<Text :class="$style.block_nav__txt"><Text color="secondary">Go to</Text> {{ comma(height - 1) }}</Text>
						</Button>

						<Button
							@click="router.push(`/block/${height + 1}`)"
							wide
							type="secondary"
							size="mini"
							:disabled="height === lastBlock?.height"
						>
							<Text :class="$style.block_nav__txt"><Text color="secondary">Go to </Text>{{ comma(height + 1) }}</Text>
							<Icon name="arrow-redo-right" size="16" color="tertiary" />
						</Button>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="4" wide :class="$style.txs_wrapper">
				<Flex align="center" justify="between" :class="$style.tabs_wrapper">
					<Flex gap="4" :class="$style.tabs">
						<Flex
							v-if="update?.kind"
							@click="activeTab = 'upcoming_update'"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === 'upcoming_update' && $style.active]"
						>
							<Icon name="clock-forward" size="12" color="secondary" />

							<Text size="13" weight="600">Upcoming Update</Text>
						</Flex>

						<Flex
							@click="activeTab = 'transactions'"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === 'transactions' && $style.active]"
						>
							<Icon name="tx" size="12" color="secondary" />

							<Text size="13" weight="600">Transactions</Text>
						</Flex>

						<Flex
							@click="activeTab = 'events'"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === 'events' && $style.active]"
						>
							<Icon name="zap" size="12" color="secondary" />

							<Text size="13" weight="600">Events</Text>
						</Flex>
					</Flex>
				</Flex>

				<UpcomingUpdate v-if="activeTab === 'upcoming_update'" :update="update" />
				<Flex v-else-if="activeTab === 'transactions'" direction="column" :class="[$style.table, isLoading && $style.disabled]">
					<Flex wrap="wrap" align="center" justify="start" gap="8" :class="$style.filters">
						<Popover :open="isStatusPopoverOpen" @on-close="onStatusPopoverClose" width="200">
							<Button @click="handleOpenStatusPopover" type="secondary" size="mini" :disabled="!transactions.length">
								<Icon
									name="plus-circle"
									size="12"
									:color="Object.keys(filters.status).find((f) => filters.status[f]) ? 'brand' : 'tertiary'"
								/>
								<Text color="secondary"
									>Status<template v-if="Object.keys(filters.status).find((f) => filters.status[f])">:</template></Text
								>

								<template v-if="Object.keys(filters.status).find((f) => filters.status[f])">
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
									<Text size="12" weight="600" color="secondary">Filter by Status</Text>

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
							<Button @click="handleOpenMessageTypePopover" type="secondary" size="mini" :disabled="!transactions.length">
								<Icon
									name="plus-circle"
									size="12"
									:color="Object.keys(filters.message_type).find((f) => filters.message_type[f]) ? 'brand' : 'tertiary'"
								/>
								<Text color="secondary"
									>Message Type<template v-if="Object.keys(filters.message_type).find((f) => filters.message_type[f])"
										>:</template
									></Text
								>

								<template v-if="Object.keys(filters.message_type).find((f) => filters.message_type[f])">
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
									<Text size="12" weight="600" color="secondary">Filter by Message Type</Text>

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

					<Flex v-if="transactions.length" :class="$style.table_scroller">
						<table v-if="height">
							<thead>
								<tr>
									<th><Text size="12" weight="600" color="tertiary">Hash</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Messages</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Gas</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Fee</Text></th>
								</tr>
							</thead>

							<tbody>
								<tr v-for="tx in transactions">
									<td style="width: 1px">
										<NuxtLink :to="`/tx/${tx.hash}`">
											<Tooltip position="start" delay="500">
												<Flex align="center" gap="8">
													<Icon
														:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
														size="13"
														:color="tx.status === 'success' ? 'green' : 'red'"
													/>

													<Text size="13" weight="600" color="primary" mono>{{
														tx.hash.slice(0, 4).toUpperCase()
													}}</Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" class="dot" />
													</Flex>

													<Text size="13" weight="600" color="primary" mono>{{
														tx.hash.slice(tx.hash.length - 4, tx.hash.length).toUpperCase()
													}}</Text>

													<CopyButton :text="tx.hash" />
												</Flex>

												<template #content>
													<Flex direction="column" gap="6">
														<Flex align="center" gap="4">
															<Icon
																:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
																size="13"
																:color="tx.status === 'success' ? 'green' : 'red'"
															/>
															<Text size="13" weight="600" color="primary">
																{{ tx.status === "success" ? "Successful" : "Failed" }} Transaction
															</Text>
														</Flex>

														{{ space(tx.hash).toUpperCase() }}

														<Text height="120" color="tertiary" style="max-width: 400px" mono align="left">
															{{ tx.error }}
														</Text>
													</Flex>
												</template>
											</Tooltip>
										</NuxtLink>
									</td>
									<td>
										<NuxtLink :to="`/tx/${tx.hash}`">
											<Flex align="center">
												<Tooltip position="start" textAlign="left">
													<MessageTypeBadge :types="tx.message_types" />

													<template #content>
														<Flex direction="column" gap="8">
															<Text v-for="type in tx.message_types" color="primary">
																{{ type.replace("Msg", "") }}
															</Text>
														</Flex>
													</template>
												</Tooltip>
											</Flex>
										</NuxtLink>
									</td>
									<td style="width: 1px">
										<NuxtLink :to="`/tx/${tx.hash}`">
											<Tooltip>
												<Flex align="center" gap="8">
													<GasBar :percent="(tx.gas_used * 100) / tx.gas_wanted" />

													<Text v-if="tx.gas_wanted > 0" size="13" weight="600" color="primary">
														{{ ((tx.gas_used * 100) / tx.gas_wanted).toFixed(2) }}%
													</Text>
												</Flex>

												<template #content>
													<Flex align="center" gap="4">
														<Text size="13" weight="600" color="primary">{{ comma(tx.gas_used) }}</Text>
														<Text size="13" weight="600" color="tertiary">/</Text>
														<Text size="13" weight="600" color="secondary">{{
															comma(tx.gas_wanted)
														}}</Text></Flex
													>
												</template>
											</Tooltip>
										</NuxtLink>
									</td>
									<td>
										<NuxtLink :to="`/tx/${tx.hash}`">
											<AmountInCurrency
												:amount="{ value: tx.fee, decimal: 6 }"
												:styles="{ amount: { size: '13' }, currency: { size: '13' } }"
											/>
										</NuxtLink>
									</td>
								</tr>
							</tbody>
						</table>

						<table v-else>
							<thead>
								<tr>
									<th><Text size="12" weight="600" color="tertiary">Hash</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Messages</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Gas</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Fee</Text></th>
								</tr>
							</thead>

							<tbody>
								<tr v-for="tx in transactions">
									<td style="width: 1px">
										<Flex align="center" gap="8" :class="$style.genesis_td">
											<Icon
												:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
												size="13"
												:color="tx.status === 'success' ? 'green' : 'red'"
											/>

											<Text size="13" weight="600" color="primary" mono>Genesis tx</Text>
										</Flex>
									</td>
									<td>
										<Flex align="center" :class="$style.genesis_td">
											<Tooltip position="start" textAlign="left">
												<MessageTypeBadge :types="tx.message_types" />

												<template #content>
													<Flex direction="column" gap="8">
														<Text v-for="type in tx.message_types" color="primary">
															{{ type.replace("Msg", "") }}
														</Text>
													</Flex>
												</template>
											</Tooltip>
										</Flex>
									</td>
									<td style="width: 1px">
										<Tooltip :class="$style.genesis_td">
											<Flex align="center" gap="8">
												<GasBar :percent="(tx.gas_used * 100) / tx.gas_wanted" />

												<Text v-if="tx.gas_wanted > 0" size="13" weight="600" color="primary">
													{{ ((tx.gas_used * 100) / tx.gas_wanted).toFixed(2) }}%
												</Text>
											</Flex>

											<template #content>
												<Flex align="center" gap="4">
													<Text size="13" weight="600" color="primary">{{ comma(tx.gas_used) }}</Text>
													<Text size="13" weight="600" color="tertiary">/</Text>
													<Text size="13" weight="600" color="secondary">{{ comma(tx.gas_wanted) }}</Text></Flex
												>
											</template>
										</Tooltip>
									</td>
									<td>
										<AmountInCurrency
											:class="$style.genesis_td"
											:amount="{ value: tx.fee, decimal: 6 }"
											:styles="{ amount: { size: '13' }, currency: { size: '13' } }"
										/>
									</td>
								</tr>
							</tbody>
						</table>
					</Flex>
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

					<TablePlaceholderView
						v-else-if="!isUpcomingBlock"
						title="There's no transactions"
						description="This block does not contain any transactions. How's that possible?"
						icon="tx"
						subIcon="search"
						:descriptionWidth="260"
					/>
					<TablePlaceholderView
						v-else-if="isUpcomingBlock"
						title="There's no transactions, yet"
						description="Let's wait for the block to arrive, then we'll know."
						icon="tx"
						subIcon="clock"
						subIconColor="yellow"
					/>

					<!-- Pagination -->
					<Flex v-if="transactions.length" align="center" gap="6" :class="$style.pagination">
						<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
							<Icon name="arrow-left-stop" size="12" color="primary" />
						</Button>
						<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
							<Icon name="arrow-left" size="12" color="primary" />
						</Button>

						<Button type="secondary" size="mini" disabled>
							<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
						</Button>

						<Button @click="handleNext" type="secondary" size="mini" :disabled="transactions.length !== 10">
							<Icon name="arrow-right" size="12" color="primary" />
						</Button>
					</Flex>
				</Flex>
				<Events v-else :block="block"> </Events>
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

	.top {
		border-bottom: 1px solid var(--op-5);

		padding: 16px;
	}

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

.tab.hide {
	display: none;
}

.table_scroller {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.inner {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);
}

.events {
	padding: 16px;
}

.table {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		padding-bottom: 8px;

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
			padding-top: 8px;
			padding-bottom: 8px;

			&:first-child {
				padding-left: 16px;
			}

			& span {
				display: flex;
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

				min-height: 40px;

				padding-right: 24px;
			}
		}
	}
}

.genesis_td {
	display: flex;

	min-height: 40px;

	padding-right: 24px;
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

.filters {
	border-bottom: 1px solid var(--op-5);

	padding: 12px 8px 12px 8px;
}

.pagination {
	padding: 8px 16px 16px 16px;
}

@media (max-width: 1000px) {
	.ods_btn {
		display: none;
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

@media (max-width: 550px) {
	.header {
		height: initial;
		flex-direction: column;
		gap: 12px;

		padding: 12px 0;
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

	.block_nav__txt {
		display: none;
	}
}
</style>
