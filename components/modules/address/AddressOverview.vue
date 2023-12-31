<script setup>
/** UI */
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { tia, comma, space } from "@/services/utils"

/** API */
import { fetchTxsByAddressHash } from "@/services/api/address"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const router = useRouter()

const props = defineProps({
	address: {
		type: Object,
		required: true,
	},
})

const tabs = ref(["PFBs", "Transfers", "Register", "Delegate", "Other"])
const activeTab = ref(tabs.value[0])

const isRefetching = ref(false)
const transactions = ref([])

const page = ref(1)
const pages = computed(() => 1)
const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

const getTransactions = async () => {
	isRefetching.value = true

	const { data } = await fetchTxsByAddressHash({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
		sort: "desc",
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
	() => getTransactions(),
)

const MapTabsTypes = {
	PFBs: "MsgPayForBlobs",
	Transfers: "MsgSend",
	Register: "MsgRegisterEVMAddress",
	Delegate: "MsgDelegate",
}

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
	return 0
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

const handleViewRawAddress = () => {
	cacheStore.current._target = "address"
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
				<Icon name="addresses" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Address</Text>
			</Flex>

			<Dropdown>
				<Button type="tertiary" size="mini">
					<Icon name="dots" size="16" color="secondary" />
				</Button>

				<template #popup>
					<DropdownItem @click="handleViewRawAddress"> View Raw Address </DropdownItem>
					<DropdownItem @click="handleViewRawTransactions"> View Raw Transactions </DropdownItem>
				</template>
			</Dropdown>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Address</Text>

						<Flex align="center" gap="10">
							<AddressBadge :hash="address.hash" />

							<CopyButton :text="address.hash" />
						</Flex>
					</Flex>

					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Balance</Text>

						<Text size="13" weight="600" color="primary">{{ comma(tia(address.balance.value)) }} TIA</Text>
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

				<Flex direction="column" justify="center" gap="16" :class="[$style.table, isRefetching && $style.disabled]">
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
								<tr v-for="tx in filteredTransactions" @click="router.push(`/tx/${tx.hash}`)">
									<td style="width: 1px">
										<Tooltip position="start" delay="500">
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
												</Flex>
											</template>
										</Tooltip>
									</td>
									<td>
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
									</td>
									<td style="width: 1px">
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
													<Text size="13" weight="600" color="secondary">{{ comma(tx.gas_wanted) }}</Text></Flex
												>
											</template>
										</Tooltip>
									</td>
									<td>
										<Flex align="center" gap="4">
											<Text size="13" weight="600" color="primary"> {{ tia(tx.fee) }} </Text>
											<Text size="13" weight="600" color="tertiary">TIA</Text>
										</Flex>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
						<Text size="13" weight="600" color="secondary" align="center"> No transactions </Text>
						<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
							This address does not contain transactions of the selected type
						</Text>
					</Flex>

					<!-- Pagination -->
					<Flex v-if="filteredTransactions.length" align="center" gap="6" :class="$style.pagination">
						<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1"> First </Button>
						<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
							<Icon name="arrow-narrow-left" size="12" color="primary" />
						</Button>

						<Button type="secondary" size="mini" disabled>
							<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
						</Button>

						<Button @click="handleNext" type="secondary" size="mini">
							<Icon name="arrow-narrow-right" size="12" color="primary" />
						</Button>
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
			padding-right: 24px;
			padding-top: 6px;
			padding-bottom: 6px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
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
