<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import AmountInCurrency from "@/components/AmountInCurrency.vue"
import Button from "@/components/ui/Button.vue"
import Checkbox from "@/components/ui/Checkbox.vue"
import DatePicker from "@/components/DatePicker.vue"
import Input from "@/components/ui/Input.vue"
import Popover from "@/components/ui/Popover.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { comma, space, splitAddress, tia } from "@/services/utils"
import { MsgTypes } from "@/services/constants/messages"
import { getStartChainDate } from "@/services/config"

/** API */
import { fetchTransactions } from "@/services/api/tx"

useHead({
	title: "Transactions - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/transactions",
		},
	],
	meta: [
		{
			name: "description",
			content: "Transactions in the Celestia Blockchain. Hash, messages, timestamp, block height, gas usage, events count are shown.",
		},
		{
			property: "og:title",
			content: "Transactions - Celestia Explorer",
		},
		{
			property: "og:description",
			content: "Transactions in the Celestia Blockchain. Hash, messages, timestamp, block height, gas usage, events count are shown.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/transactions`,
		},
		{
			property: "og:image",
			content: "/img/seo/txs.png",
		},
		{
			name: "twitter:title",
			content: "Transactions - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content: "Transactions in the Celestia Blockchain. Hash, messages, timestamp, block height, gas usage, events count are shown.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/txs.png",
		},
	],
})

const route = useRoute()
const router = useRouter()

/** Filters */
const filters = reactive({
	status: {
		success: false,
		failed: false,
	},
	message_type: MsgTypes.reduce((a, b) => ({ ...a, [b]: false }), {}),
	from: "",
	to: "",
})
const savedFiltersBeforeChanges = ref(null)

const handleClearAllFilters = () => {
	Object.keys(filters.status).forEach((f) => {
		filters.status[f] = false
	})

	Object.keys(filters.message_type).forEach((f) => {
		filters.message_type[f] = false
	})

	filters.from = ""
	filters.to = ""

	router.replace({
		query: null,
	})

	getTransactions()
}

const searchTerm = ref("")

/** Parse route query */
Object.keys(route.query).forEach((key) => {
	if (key === "page") return

	if (key === "from" || key === "to") {
		filters[key] = route.query[key]
	} else if (route.query[key].split(",").length) {
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
			...(filters.from ? { from: filters.from } : {}),
			...(filters.to ? { to: filters.to } : {}),
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

	page.value = 1

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

	page.value = 1

	getTransactions()

	updateRouteQuery()
}

const handleUpdateDateFilter = (event) => {
	if (event.from && event.to) {
		filters.from = event.from
		filters.to = event.to

		page.value = 1

		getTransactions()

		updateRouteQuery()
	} else if (event.clear) {
		resetFilters("from")
		resetFilters("to", true)
	}
}

const resetFilters = (target, refetch) => {
	if (target === "from" || target === "to") {
		filters[target] = ""
	} else {
		Object.keys(filters[target]).forEach((f) => {
			filters[target][f] = false
		})
	}

	if (refetch) {
		page.value = 1

		updateRouteQuery()

		getTransactions()
	}
}

/**
 * Table Config
 */
const config = reactive({
	columns: {
		time: true,
		messages: true,
		signer: true,
		block: true,
		gas: true,
		fee: true,
		events: false,
	},
})
watch(
	() => config,
	() => {
		localStorage.setItem("page:transactions:config:columns", JSON.stringify(config.columns))
	},
	{
		deep: true,
	},
)

const isConfigurePopoverOpen = ref(false)

/** Data */
const isLoaded = ref(false)
const isRefetching = ref(false)
const transactions = ref([])

const sort = reactive({
	by: "time",
	dir: "desc",
})

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.ceil(count.value / 20))

const findPFB = ref(false)

const getTransactions = async () => {
	isRefetching.value = true

	const { data } = await fetchTransactions({
		limit: 20,
		offset: (page.value - 1) * 20,
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
		from: filters.from,
		to: filters.to,
	})
	transactions.value = data.value

	isLoaded.value = true
	isRefetching.value = false
}

getTransactions()

onBeforeMount(() => {
	if (localStorage.getItem("page:transactions:config:columns")) {
		config.columns = JSON.parse(localStorage.getItem("page:transactions:config:columns"))
	}
})

/** Refetch transactions */
watch(
	() => page.value,
	async () => {
		getTransactions()
		router.replace({ query: { page: page.value } })
	},
)

watch(
	() => findPFB.value,
	() => {
		getTransactions()
	},
)

const handleSort = (by) => {
	/** temp. only for time */
	if (!["time"].includes(by)) return

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
	}

	getTransactions()
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	page.value += 1
}
</script>

<template>
	<Flex wide direction="column" :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/txs', name: `Transactions` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="tx" size="16" color="secondary" />
					<Text size="14" weight="600" color="primary">Transactions</Text>
				</Flex>

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

					<Button @click="handleNext" type="secondary" size="mini" :disabled="!transactions.length">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<Flex align="center" justify="between" wrap="wrap" gap="8" :class="$style.settings">
				<Flex wrap="wrap" align="center" gap="8">
					<Popover :open="isStatusPopoverOpen" @on-close="onStatusPopoverClose" width="200">
						<Button @click="handleOpenStatusPopover" type="secondary" size="mini">
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
						<Button @click="handleOpenMessageTypePopover" type="secondary" size="mini">
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

								<Icon @click.stop="resetFilters('message_type', true)" name="close-circle" size="12" color="secondary" />
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

					<DatePicker @on-update="handleUpdateDateFilter" :from="filters.from" :to="filters.to" :minDate="getStartChainDate()" />
				</Flex>

				<Popover :open="isConfigurePopoverOpen" @on-close="isConfigurePopoverOpen = false" width="150" side="right">
					<Button @click="isConfigurePopoverOpen = true" type="secondary" size="mini">
						<Icon name="settings" size="12" color="tertiary" />
						Configure
					</Button>

					<template #content>
						<Flex direction="column" gap="12">
							<Text size="12" weight="500" color="secondary">Fixed columns</Text>

							<Flex direction="column" gap="8">
								<Checkbox :checked="true" :disabled="true">
									<Text size="12" weight="500" color="primary">Hash</Text>
								</Checkbox>
							</Flex>

							<div :class="$style.horizontal_divider" />

							<Text size="12" weight="500" color="secondary">Editable columns</Text>

							<Flex direction="column" gap="8">
								<Checkbox v-model="config.columns.time">
									<Text size="12" weight="500" color="primary">Time</Text>
								</Checkbox>
								<Checkbox v-model="config.columns.messages">
									<Text size="12" weight="500" color="primary">Messages</Text>
								</Checkbox>
								<Checkbox v-model="config.columns.signer">
									<Text size="12" weight="500" color="primary">Signer</Text>
								</Checkbox>
								<Checkbox v-model="config.columns.block">
									<Text size="12" weight="500" color="primary">Block</Text>
								</Checkbox>
								<Checkbox v-model="config.columns.gas">
									<Text size="12" weight="500" color="primary">Gas</Text>
								</Checkbox>
								<Checkbox v-model="config.columns.fee">
									<Text size="12" weight="500" color="primary">Fee</Text>
								</Checkbox>
								<Checkbox v-model="config.columns.events">
									<Text size="12" weight="500" color="primary">Events</Text>
								</Checkbox>
							</Flex>
						</Flex>
					</template>
				</Popover>
			</Flex>

			<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div v-if="transactions.length" :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Hash</Text></th>
								<th
									v-for="column in Object.keys(config.columns).filter((c) => config.columns[c])"
									@click="handleSort(column)"
									:class="['time'].includes(column) && $style.sortable"
								>
									<Flex v-if="['time'].includes(column)" align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap style="text-transform: capitalize">
											{{ column }}
										</Text>
										<Icon
											v-if="sort.by === column"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
									<Text v-else size="12" weight="600" color="tertiary" noWrap style="text-transform: capitalize">
										{{ column }}
									</Text>
								</th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="tx in transactions" :class="findPFB && !tx.message_types.includes('MsgPayForBlobs') && $style.hide">
								<td style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Tooltip :disabled="!tx.hash" position="start">
											<template v-if="tx.hash">
												<Flex align="center" gap="8">
													<Icon
														:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
														size="13"
														:color="tx.status === 'success' ? 'green' : 'red'"
													/>

													<Text size="13" weight="600" color="primary" mono>
														{{ tx.hash.slice(0, 4).toUpperCase() }}
													</Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" class="dot" />
													</Flex>

													<Text size="13" weight="600" color="primary" mono>
														{{ tx.hash.slice(tx.hash.length - 4, tx.hash.length).toUpperCase() }}
													</Text>

													<CopyButton :text="tx.hash" />
												</Flex>
											</template>
											<template v-else>
												<Flex align="center" gap="8">
													<Icon name="tx" size="14" color="secondary" />
													<Text size="12" weight="600" color="primary">Genesis</Text>
												</Flex>
											</template>

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
								<td v-if="config.columns.time" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex justify="center" direction="column" gap="4">
											<Text size="12" weight="600" color="primary">
												{{ DateTime.fromISO(tx.time).toRelative({ locale: "en", style: "short" }) }}
											</Text>
											<Text size="12" weight="500" color="tertiary">
												{{ DateTime.fromISO(tx.time).setLocale("en").toFormat("LLL d, t") }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td v-if="config.columns.messages" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex align="center">
											<Tooltip v-if="tx.message_types.length" position="start" textAlign="left">
												<MessageTypeBadge :types="tx.message_types" />

												<template #content>
													<Flex direction="column" gap="8">
														<Text v-for="type in tx.message_types" color="primary">
															{{ type.replace("Msg", "") }}
														</Text>
													</Flex>
												</template>
											</Tooltip>

											<Text v-else size="13" weight="600" color="tertiary">No Message Types</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td v-if="config.columns.signer" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex align="center">
											<Text size="12" weight="600" color="primary" mono class="table_column_alias">
												{{ $getDisplayName("addresses", tx.signers[0]) }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td v-if="config.columns.block" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex align="center">
											<Outline @click.prevent="router.push(`/block/${tx.height}`)">
												<Flex align="center" gap="6">
													<Icon name="block" size="14" color="secondary" />

													<Text size="13" weight="600" color="primary" tabular>{{ comma(tx.height) }}</Text>
												</Flex>
											</Outline>
										</Flex>
									</NuxtLink>
								</td>
								<td v-if="config.columns.gas" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Tooltip v-if="tx.gas_used">
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
													<Text size="13" weight="600" color="secondary">{{ comma(tx.gas_wanted) }}</Text>
												</Flex>
											</template>
										</Tooltip>
										<Flex v-else align="center">
											<Text size="13" weight="600" color="secondary">Unknown</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td v-if="config.columns.fee" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex align="center">
											<AmountInCurrency
												:amount="{ value: tx.fee, decimal: 6 }"
												:styles="{ amount: { size: '13' } }"
											/>
										</Flex>
									</NuxtLink>
								</td>
								<td v-if="config.columns.events" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">
												{{ tx.events_count }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<Flex v-else direction="column" gap="20" align="center" :class="$style.empty">
					<Icon name="search" size="24" color="support" />

					<Flex direction="column" gap="8" align="center">
						<Text size="13" weight="600" color="secondary"> Nothing was found </Text>
						<Text size="12" weight="400" color="tertiary"> Clear filters to see all transactions </Text>
					</Flex>

					<Button @click="handleClearAllFilters" type="secondary" size="small">Clear all filters</Button>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 24px 24px;
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

.horizontal_divider {
	width: 100%;
	height: 1px;
	background: var(--op-5);
}

.message_types_list {
	height: 200px;

	overflow-y: auto;
	overflow-x: hidden;
}

.table_scroller {
	overflow-x: auto;
}

.table {
	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	padding-bottom: 12px;

	transition: all 0.2s ease;

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

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
			}

			&.sortable {
				cursor: pointer;
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

				padding-right: 16px;
			}
		}
	}
}

.empty {
	padding: 40px 0;
}

.hide {
	opacity: 0.5;
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
