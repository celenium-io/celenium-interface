<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Popover from "@/components/ui/Popover.vue"
import Checkbox from "@/components/ui/Checkbox.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { comma, space, tia } from "@/services/utils"

/** API */
import { fetchTransactions, fetchTxsCount } from "@/services/api/tx"

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

const TypesMap = {
	send: "MsgSend",
	ibctransfer: "IBCTransfer",
	delegate: "MsgDelegate",
}

/** Filters */
const filters = reactive({
	status: {
		success: false,
		failed: false,
	},
	message_type: {
		send: false,
		ibctransfer: false,
		delegate: false,
	},
})
const savedFiltersBeforeChanges = ref(null)

/** Parse route query */
Object.keys(route.query).forEach((key) => {
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
	Object.keys(filters[target]).forEach((f) => {
		filters[target][f] = false
	})

	if (refetch) {
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
		block: true,
		gas: true,
		events: true,
		fee: false,
		memo: false,
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
const isRefetching = ref(false)
const transactions = ref([])
const count = ref(0)

const getTxsCount = async () => {
	const { data: txsCount } = await fetchTxsCount()
	count.value = txsCount.value
}

await getTxsCount()

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.ceil(count.value / 20))

const findPFB = ref(false)

const getTransactions = async () => {
	isRefetching.value = true

	const { data } = await fetchTransactions({
		limit: 20,
		offset: (page.value - 1) * 20,
		sort: "desc",
		status:
			Object.keys(filters.status).find((f) => filters.status[f]) &&
			Object.keys(filters.status)
				.filter((f) => filters.status[f])
				.join(","),
		msg_type:
			Object.keys(filters.message_type).find((f) => filters.message_type[f]) &&
			Object.keys(filters.message_type)
				.filter((f) => filters.message_type[f])
				.map((f) => TypesMap[f])
				.join(","),
	})
	transactions.value = data.value

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

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

const handleLast = async () => {
	await getTxsCount()

	page.value = pages.value
}
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
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
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1"> First </Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-narrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary"> {{ comma(page) }} of {{ comma(pages) }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
						<Icon name="arrow-narrow-right" size="12" color="primary" />
					</Button>
					<Button @click="handleLast" type="secondary" size="mini" :disabled="page === pages"> Last </Button>
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

					<Popover :open="isMessageTypePopoverOpen" @on-close="onMessageTypePopoverClose" width="200">
						<Button @click="handleOpenMessageTypePopover" type="secondary" size="mini">
							<Icon name="plus-circle" size="12" color="tertiary" />
							<Text color="secondary">Message Type</Text>

							<template v-if="Object.keys(filters.message_type).find((f) => filters.message_type[f])">
								<div :class="$style.vertical_divider" />

								<Text size="12" weight="600" color="primary" style="text-transform: capitalize">
									{{
										Object.keys(filters.message_type)
											.filter((f) => filters.message_type[f])
											.map((f) => TypesMap[f])
											.join(", ")
									}}
								</Text>

								<Icon @click.stop="resetFilters('message_type', true)" name="close-circle" size="12" color="secondary" />
							</template>
						</Button>

						<template #content>
							<Flex direction="column" gap="12">
								<Text size="12" weight="500" color="secondary">Filter by Message Type</Text>

								<Flex direction="column" gap="8">
									<Checkbox v-model="filters.message_type.send">
										<Text size="12" weight="500" color="primary">Send</Text>
									</Checkbox>
									<Checkbox v-model="filters.message_type.ibctransfer">
										<Text size="12" weight="500" color="primary">IBCTransfer</Text>
									</Checkbox>
									<Checkbox v-model="filters.message_type.delegate">
										<Text size="12" weight="500" color="primary">Delegate</Text>
									</Checkbox>
								</Flex>

								<Button @click="handleApplyMessageTypeFilters" type="secondary" size="mini" wide>Apply</Button>
							</Flex>
						</template>
					</Popover>
				</Flex>

				<Popover :open="isConfigurePopoverOpen" @on-close="isConfigurePopoverOpen = false" width="150">
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
								<Checkbox v-model="config.columns.block">
									<Text size="12" weight="500" color="primary">Block</Text>
								</Checkbox>
								<Checkbox v-model="config.columns.gas">
									<Text size="12" weight="500" color="primary">Gas</Text>
								</Checkbox>
								<Checkbox v-model="config.columns.events">
									<Text size="12" weight="500" color="primary">Events</Text>
								</Checkbox>
								<Checkbox v-model="config.columns.fee">
									<Text size="12" weight="500" color="primary">Fee</Text>
								</Checkbox>
								<Checkbox v-model="config.columns.memo">
									<Text size="12" weight="500" color="primary">Memo</Text>
								</Checkbox>
							</Flex>
						</Flex>
					</template>
				</Popover>
			</Flex>

			<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Hash</Text></th>
								<th v-for="column in Object.keys(config.columns).filter((c) => config.columns[c])">
									<Text size="12" weight="600" color="tertiary" noWrap style="text-transform: capitalize">{{
										column
									}}</Text>
								</th>
							</tr>
						</thead>

						<tbody>
							<tr
								v-for="tx in transactions"
								:class="findPFB && !tx.message_types.includes('MsgPayForBlobs') && $style.hide"
								@click="tx.hash && router.push(`/tx/${tx.hash}`)"
							>
								<td style="width: 1px">
									<Tooltip :disabled="!tx.hash" position="start">
										<template v-if="tx.hash">
											<Flex align="center" gap="8">
												<Icon
													:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
													size="14"
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
												<Text size="13" weight="600" color="primary">Genesis</Text>
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
								</td>
								<td v-if="config.columns.time" style="width: 1px">
									<Flex direction="column" gap="4">
										<Text size="12" weight="600" color="primary">
											{{ DateTime.fromISO(tx.time).toRelative({ locale: "en", style: "short" }) }}
										</Text>
										<Text size="12" weight="500" color="tertiary">
											{{ DateTime.fromISO(tx.time).setLocale("en").toFormat("LLL d, t") }}
										</Text>
									</Flex>
								</td>
								<td v-if="config.columns.messages" style="width: 1px">
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
								</td>
								<td v-if="config.columns.block" style="width: 1px">
									<Outline @click.stop="router.push(`/block/${tx.height}`)">
										<Flex align="center" gap="6">
											<Icon name="block" size="14" color="secondary" />

											<Text size="13" weight="600" color="primary" tabular>{{ comma(tx.height) }}</Text>
										</Flex>
									</Outline>
								</td>
								<td v-if="config.columns.gas" style="width: 1px">
									<Tooltip v-if="tx.gas_used">
										<Flex align="center" gap="8">
											<Text v-if="tx.gas_wanted > 0" size="13" weight="600" color="primary">
												{{ ((tx.gas_used * 100) / tx.gas_wanted).toFixed(2) }}%
											</Text>

											<GasBar :percent="(tx.gas_used * 100) / tx.gas_wanted" />
										</Flex>

										<template #content>
											<Flex align="center" gap="4">
												<Text size="13" weight="600" color="primary">{{ comma(tx.gas_used) }}</Text>
												<Text size="13" weight="600" color="tertiary">/</Text>
												<Text size="13" weight="600" color="secondary">{{ comma(tx.gas_wanted) }}</Text>
											</Flex>
										</template>
									</Tooltip>
									<Text v-else size="13" weight="600" color="secondary">Unknown</Text>
								</td>
								<td v-if="config.columns.events" style="width: 1px">
									<Text size="13" weight="600" color="primary">
										{{ tx.events_count }}
									</Text>
								</td>
								<td v-if="config.columns.fee" style="width: 1px">
									<Text size="13" weight="600" color="primary"> {{ tia(tx.fee) }} TIA </Text>
								</td>
								<td v-if="config.columns.memo" style="width: 1px">
									<Tooltip :disabled="!tx.memo">
										<Text v-if="tx.memo" size="13" weight="600" color="primary" :class="$style.memo">
											{{ tx.memo }}
										</Text>
										<Text v-else size="13" weight="600" color="support"> No Memo</Text>

										<template #content>
											{{ tx.memo }}
										</template>
									</Tooltip>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Flex>

			<Flex align="center" :class="$style.footer">
				<Button @click="findPFB = !findPFB" type="secondary" size="mini">
					<Icon v-if="findPFB" name="check" size="12" color="green" /> Find PFB
				</Button>
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

.footer {
	height: 46px;

	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	padding: 0 16px;
}

.table_scroller {
	overflow-x: auto;
}

.table {
	border-radius: 4px;
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
		}

		& tr td {
			padding: 0;
			padding-right: 40px;
			padding-top: 8px;
			padding-bottom: 8px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
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

.memo {
	display: inline-block;
	max-width: 120px;
	text-overflow: ellipsis;
	overflow: hidden;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}

	.header {
		flex-direction: column;
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}
</style>
