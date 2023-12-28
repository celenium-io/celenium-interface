<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"
import Badge from "@/components/ui/Badge.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { tia, comma, space, formatBytes } from "@/services/utils"

/** API */
import { fetchTransactionsByBlock } from "@/services/api/tx"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const MapTabsTypes = {
	PFBs: "MsgPayForBlobs",
	Transfers: "MsgSend",
	Register: "MsgRegisterEVMAddress",
	Delegate: "MsgDelegate",
}

const router = useRouter()

const props = defineProps({
	block: {
		type: Object,
		required: true,
	},
	transactions: {
		type: Array,
	},
})

const tabs = ref(["PFBs", "Transfers", "Register", "Delegate", "Other"])
const activeTab = ref(tabs.value[0])

const isRefetching = ref(false)
const transactions = ref([])

const page = ref(1)
const pages = computed(() => Math.ceil(props.block.stats.messages_counts[MapTabsTypes[activeTab.value]] / 10))
const handleNext = () => {
	if (page.value === pages.value) return
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

const getTransactions = async () => {
	isRefetching.value = true

	const { data } = await fetchTransactionsByBlock({
		height: props.block.height,
		limit: 10,
		offset: (page.value - 1) * 10,
		sort: "desc",
		type: MapTabsTypes[activeTab.value],
		excluded_types: activeTab.value === "Other" && "MsgSend,MsgDelegate,MsgPayForBlobs,MsgRegisterEVMAddress",
	})
	if (data.value?.length) {
		transactions.value = data.value
		cacheStore.current.transactions = transactions.value
	}

	isRefetching.value = false
}
await getTransactions()

/** Refetch transactions */
watch(
	() => page.value,
	() => {
		getTransactions()
	},
)

watch(
	() => activeTab.value,
	() => {
		page.value = 1

		getTransactions()
	},
)

const filteredTransactions = computed(() => {
	const supportedTypes = Object.values(MapTabsTypes)

	if (activeTab.value === "Other") {
		return transactions.value.filter((t) => {
			let f = false

			t.message_types.forEach((type) => {
				if (!supportedTypes.includes(type)) f = true
			})

			return f
		})
	}

	return transactions.value.filter((t) => t.message_types.includes(MapTabsTypes[activeTab.value]))
})

const getTxnsCountByTab = (tab) => {
	if (tab !== "Other") {
		return props.block.stats.messages_counts[MapTabsTypes[tab]]
	} else {
		let unsupportedCounter = 0
		const unsupportedTypes = []

		Object.keys(props.block.stats.messages_counts).forEach((type) => {
			if (!Object.values(MapTabsTypes).includes(type)) unsupportedTypes.push(type)
		})

		unsupportedTypes.forEach((type) => {
			unsupportedCounter += props.block.stats.messages_counts[type]
		})

		return unsupportedCounter
	}
}

const handleViewRawBlock = () => {
	cacheStore.current._target = "block"
	modalsStore.open("rawData")
}

const handleViewRawTransactions = () => {
	cacheStore.current._target = "transactions"
	modalsStore.open("rawData")
}
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="block" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Block </Text>
			</Flex>

			<Dropdown>
				<Button type="tertiary" size="mini">
					<Icon name="dots" size="16" color="secondary" />
				</Button>

				<template #popup>
					<DropdownItem @click="handleViewRawBlock"> View Raw Block </DropdownItem>
					<DropdownItem @click="handleViewRawTransactions"> View Raw Transactions </DropdownItem>
				</template>
			</Dropdown>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex wide direction="column" gap="12" :class="$style.top">
					<Flex align="center" justify="between" wide>
						<Flex align="center" gap="6">
							<Icon name="block" size="14" color="secondary" />

							<Flex tag="h1" align="center" gap="4">
								<Text size="12" weight="600" color="secondary"> Height </Text>
								<Text size="12" weight="600" color="primary">{{ comma(block.height) }}</Text>
							</Flex>
						</Flex>

						<Text size="12" weight="600" color="tertiary">
							{{ DateTime.fromISO(block.time).setLocale("en").toFormat("ff") }}
						</Text>
					</Flex>

					<Badge>
						<Flex align="center" justify="between" wide>
							<Text size="12" weight="600" color="secondary">
								{{
									DateTime.fromISO(block.time)
										.minus({ milliseconds: block.stats.block_time })
										.setLocale("en")
										.toFormat("TT")
								}}
							</Text>

							<div v-for="dot in 5" class="dot" />

							<Flex align="center" gap="6">
								<Icon name="time" size="12" color="secondary" />
								<Text size="12" weight="600" color="primary"> {{ (block.stats.block_time / 1_000).toFixed(2) }}s </Text>
							</Flex>

							<div v-for="dot in 5" class="dot" />

							<Text size="12" weight="600" color="secondary" align="right">
								{{ DateTime.fromISO(block.time).setLocale("en").toFormat("TT") }}</Text
							>
						</Flex>
					</Badge>
				</Flex>

				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="12">
						<Text size="12" weight="600" color="tertiary">Proposer</Text>

						<Flex direction="column" gap="8">
							<Text size="13" weight="600" color="primary">
								{{ block.proposer.moniker }}
							</Text>

							<Flex align="center" gap="6">
								<Text size="12" weight="600" color="tertiary" mono>{{ block.proposer.cons_address.slice(0, 4) }}</Text>

								<Flex align="center" gap="3">
									<div v-for="dot in 3" class="dot" />
								</Flex>

								<Text size="12" weight="600" color="tertiary" mono>
									{{
										block.proposer.cons_address.slice(
											block.proposer.cons_address.length - 4,
											block.proposer.cons_address.length,
										)
									}}
								</Text>

								<CopyButton :text="block.proposer.cons_address" size="10" />
							</Flex>
						</Flex>
					</Flex>

					<Flex v-if="block.hash" direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Hash</Text>

						<BadgeValue :text="block.hash" />
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Blobs Size</Text>
							<Text size="12" weight="600" color="secondary"> {{ formatBytes(block.stats.blobs_size) }} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Events</Text>
							<Text size="12" weight="600" color="secondary"> {{ block.stats.events_count }} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Transactions</Text>
							<Text size="12" weight="600" color="secondary"> {{ block.stats.tx_count }} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Total Fees </Text>
							<Text size="12" weight="600" color="secondary"> {{ tia(block.stats.fee) }} TIA</Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Bytes in block </Text>
							<Text size="12" weight="600" color="secondary"> {{ formatBytes(block.stats.bytes_in_block) }}</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="4" wide :class="$style.txs_wrapper">
				<Flex align="center" justify="between" :class="$style.tabs_wrapper">
					<Flex gap="4" :class="$style.tabs">
						<Flex
							@click="activeTab = tab"
							v-for="tab in tabs"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === tab && $style.active]"
						>
							<Text size="13" weight="600">{{ tab }}</Text>

							<Text v-if="getTxnsCountByTab(tab)" size="11" height="110" weight="600" :class="$style.badge">
								{{ getTxnsCountByTab(tab) }}
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" justify="center" gap="8" :class="[$style.table, isRefetching && $style.disabled]">
					<div v-if="filteredTransactions.length" :class="$style.table_scroller">
						<table>
							<thead>
								<tr>
									<th><Text size="12" weight="600" color="tertiary">Hash</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Messages</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Gas</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Fee</Text></th>
								</tr>
							</thead>

							<tbody>
								<tr v-for="tx in filteredTransactions">
									<td style="width: 1px">
										<NuxtLink :to="`/tx/${tx.hash}`">
											<Tooltip position="start" delay="500">
												<Flex align="center" gap="8">
													<Icon
														:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
														size="14"
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
											<Flex align="center" gap="4">
												<Text size="13" weight="600" color="primary"> {{ tia(tx.fee) }} </Text>
												<Text size="13" weight="600" color="tertiary">TIA</Text>
											</Flex>
										</NuxtLink>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<Flex v-else-if="!isRefetching" align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
						<Text size="13" weight="600" color="secondary" align="center"> No transactions </Text>
						<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
							This block does not contain transactions of the selected type
						</Text>
					</Flex>

					<!-- Pagination -->
					<Flex v-if="filteredTransactions.length && pages > 1" align="center" gap="6" :class="$style.pagination">
						<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1"> First </Button>
						<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
							<Icon name="arrow-narrow-left" size="12" color="primary" />
						</Button>

						<Button type="secondary" size="mini" disabled>
							<Text size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
						</Button>

						<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
							<Icon name="arrow-narrow-right" size="12" color="primary" />
						</Button>
						<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages"> Last </Button>
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

	.top {
		padding: 16px;

		border-bottom: 1px solid var(--op-5);
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
	border-bottom: 2px solid transparent;

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
	border-bottom: 2px solid var(--op-10);

	& span {
		color: var(--txt-primary);
	}
}

.table_scroller {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
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
			padding-top: 16px;
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

.empty {
	padding: 16px 0;
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
