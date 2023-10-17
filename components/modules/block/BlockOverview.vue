<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"

/** Services */
import { tia, comma, space, formatBytes } from "@/services/utils"

/** API */
import { fetchTransactionsByBlock } from "@/services/api/tx"

/** Store */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

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
	})
	if (data.value?.length) {
		transactions.value = data.value
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

const handleCopy = (target) => {
	window.navigator.clipboard.writeText(target)

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully copied to clipboard",
			autoDestroy: true,
		},
	})
}
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Text size="14" weight="600" color="primary">Block Overview</Text>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex wide direction="column" gap="16" :class="$style.top">
					<Flex align="center" justify="between" wide>
						<Flex align="center" gap="8">
							<Icon name="block" size="14" color="primary" />

							<Flex tag="h1" align="center" gap="4">
								<Text size="12" weight="600" color="secondary"> Block </Text>
								<Text size="12" weight="600" color="primary">{{ comma(block.height) }}</Text>
							</Flex>
						</Flex>

						<Text size="12" weight="600" color="tertiary">
							{{ DateTime.fromISO(block.time).setLocale("en").toFormat("ff") }}
						</Text>
					</Flex>

					<Flex align="center" justify="between" :class="$style.timing">
						<Text size="12" weight="600" color="secondary" :class="$style.fixed_width">
							{{
								DateTime.fromISO(block.time).minus({ milliseconds: block.stats.block_time }).setLocale("en").toFormat("TT")
							}}
						</Text>

						<div v-for="dot in 5" class="dot" />

						<Flex align="center" gap="6" :class="$style.fixed_width">
							<Icon name="time" size="12" color="secondary" />
							<Text size="12" weight="600" color="primary"> {{ (block.stats.block_time / 1_000).toFixed(2) }}s </Text>
						</Flex>

						<div v-for="dot in 5" class="dot" />

						<Text size="12" weight="600" color="secondary" align="right" :class="$style.fixed_width">
							{{ DateTime.fromISO(block.time).setLocale("en").toFormat("TT") }}</Text
						>
					</Flex>
				</Flex>

				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Hash</Text>

						<BadgeValue :text="block.hash" />
					</Flex>

					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Proposer</Text>

						<BadgeValue :text="block.proposer_address" />
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
							<Text size="12" weight="600" color="tertiary"> Fee </Text>
							<Text size="12" weight="600" color="secondary"> {{ tia(block.stats.fee) }} TIA</Text>
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
											<Outline @click.stop="handleCopy(tx.hash)" class="copyable">
												<Flex align="center" gap="8">
													<Icon name="zap" size="12" :color="tx.status === 'success' ? 'green' : 'red'" />

													<Text size="13" weight="700" color="secondary" mono>{{
														tx.hash.slice(0, 4).toUpperCase()
													}}</Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" class="dot" />
													</Flex>

													<Text size="13" weight="700" color="secondary" mono>{{
														tx.hash.slice(tx.hash.length - 4, tx.hash.length).toUpperCase()
													}}</Text>
												</Flex>
											</Outline>

											<template #content>
												{{ space(tx.hash).toUpperCase() }}
											</template>
										</Tooltip>
									</td>
									<td>
										<Tooltip position="start" textAlign="left">
											<Flex align="center" gap="6">
												<Text size="13" height="160" weight="600" color="primary" :class="$style.message_type">
													{{ tx.message_types[0].replace("Msg", "") }}
												</Text>
												<Text
													v-if="tx.message_types.length > 1"
													size="12"
													weight="600"
													color="primary"
													:class="$style.badge"
												>
													+{{ tx.message_types.length - 1 }}
												</Text>
											</Flex>

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
											<Text v-if="tx.gas_wanted > 0" size="13" weight="600" color="primary">
												{{ ((tx.gas_used * 100) / tx.gas_wanted).toFixed(2) }}%
											</Text>

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

					<Flex v-else align="center" justify="center" direction="column" gap="8" wide>
						<Text size="13" weight="600" color="secondary" align="center"> No transactions </Text>
						<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
							This block does not contain transactions of the selected type
						</Text>
					</Flex>

					<!-- Pagination -->
					<Flex v-if="filteredTransactions.length && pages > 1" align="center" gap="6">
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
	height: 46px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 16px;
}

.data {
	min-width: 384px;

	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	.top {
		padding: 16px;

		border-bottom: 1px solid var(--op-5);
	}

	.timing {
		height: 28px;

		border-radius: 6px;
		background: linear-gradient(var(--op-8), var(--op-3));
		box-shadow: inset 0 0 0 1px var(--op-5);

		padding: 0 8px;

		.fixed_width {
			width: 60px;
		}
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
