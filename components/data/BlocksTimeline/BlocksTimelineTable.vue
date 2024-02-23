<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { tia, comma, space, formatBytes, getNamespaceID } from "@/services/utils"

/** API */
import { fetchBlockBlobs } from "@/services/api/block"
import { fetchTransactionsByBlock } from "@/services/api/tx"

/** Store */
import { useAppStore } from "@/store/app"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const notificationsStore = useNotificationsStore()

const blocks = computed(() => appStore.latestBlocks)
const lastBlock = computed(() => appStore.latestBlocks[0])
const lastHead = computed(() => appStore.lastHead)
const preview = reactive({
	block: blocks.value[0],
	transactions: [],
	pfbs: [],

	isLoadingNamespaces: true,
})

const autoSelect = ref(true)

const handleSelectBlock = (b, isUser) => {
	if (isUser) autoSelect.value = false

	if (preview.block.height === b.height) return

	preview.block = b
	preview.namespaces = []
}

const getTransactionsByBlock = async () => {
	const { data } = await fetchTransactionsByBlock({
		height: preview.block.height,
		from: parseInt(DateTime.fromISO(preview.block.time) / 1000),
	})
	preview.transactions = data.value
}
getTransactionsByBlock()

const blocksSnapshot = ref([])
const isPaused = ref(false)

const handlePause = () => {
	if (!lastHead?.value.synced) return

	isPaused.value = !isPaused.value
}

watch(
	() => isPaused.value,
	() => {
		if (isPaused.value) {
			blocksSnapshot.value = [...blocks.value]
		} else {
			const newBlocksSincePause = blocks.value[0]?.height - blocksSnapshot.value[0]?.height

			if (newBlocksSincePause)
				notificationsStore.create({
					notification: {
						type: "info",
						icon: "block",
						title: `Received ${blocks.value[0]?.height - blocksSnapshot.value[0]?.height} new blocks since the pause`,
						description: "New blocks will be added to the timeline",
						autoDestroy: true,
					},
				})

			blocksSnapshot.value = []

			handleSelectBlock(lastBlock.value, false)
		}
	},
)

/** Auto-pause for unsynced head */
if (Object.keys(lastHead.value).length !== 0 && !lastHead?.value.synced) {
	handlePause()

	notificationsStore.create({
		notification: {
			type: "warning",
			icon: "pause",
			title: `The blocks timeline on pause`,
			description: "Due to the unsynced head",
			autoDestroy: false,
		},
	})
}

watch(
	() => preview.block,
	async () => {
		if (preview.block.stats.tx_count) {
			if (preview.block.stats.blobs_size) preview.isLoadingNamespaces = true

			getTransactionsByBlock()
		}
	},
)

watch(
	() => preview.transactions,
	async () => {
		if (preview.block.stats.blobs_size === 0) {
			preview.isLoadingNamespaces = false
			return
		}

		const data = await fetchBlockBlobs({ height: preview.block.height })
		let namespaces = []

		data.forEach(blob => {
			namespaces.push(blob.namespace)
		});

		preview.namespaces = Array.from(new Map(namespaces.map(item => [item.id, item])).values());
		preview.isLoadingNamespaces = false
	},
)

watch(
	() => lastBlock.value,
	() => {
		if (autoSelect.value && !isPaused.value) handleSelectBlock(lastBlock.value, false)
	},
)

watch(
	() => autoSelect.value,
	() => {
		if (autoSelect.value) handleSelectBlock(lastBlock.value, false)
	},
)
</script>

<template>
	<Flex wide direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="timeline" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Blocks Timeline</Text>
			</Flex>

			<Flex align="center" gap="8">
				<Tooltip position="end">
					<Button @click="handlePause" type="tertiary" size="mini" :disabled="!lastHead?.synced">
						<Icon :name="isPaused ? 'resume' : 'pause'" size="14" color="secondary" />
						{{ isPaused ? "Resume" : "Pause" }}
					</Button>

					<template v-if="lastHead?.synced" #content>
						<Flex align="start" direction="column" gap="6">
							<Text>Stop receiving new blocks</Text>
							<Text color="tertiary">Resuming will update the list of recent blocks</Text>
						</Flex>
					</template>
					<template v-else #content> Can't resume yet, wait for a synced head </template>
				</Tooltip>

				<Tooltip position="end">
					<Button @click="autoSelect = !autoSelect" type="tertiary" size="mini">
						<Icon :name="!autoSelect ? 'unselect' : 'select'" size="14" :color="autoSelect ? 'primary' : 'light-orange'" />
					</Button>

					<template #content>
						<Flex direction="column" gap="6">
							<Flex align="center">
								<Text color="secondary">Auto-select new block is </Text>&nbsp;
								<Text :color="autoSelect ? 'green' : 'light-orange'">{{ autoSelect ? "On" : "Off" }}</Text>
							</Flex>

							<Text align="left" color="tertiary" height="140" style="max-width: 250px"
								>When enabled - the last received block will be selected automatically</Text
							>
						</Flex>
					</template>
				</Tooltip>
			</Flex>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" gap="16" wide :class="$style.table">
				<Flex v-if="!isPaused" align="center" justify="center" gap="6" :class="$style.status">
					<Icon name="block" size="12" color="secondary" :class="$style.block_icon" />
					<Text size="12" weight="600" color="secondary">Receiving new blocks</Text>
				</Flex>
				<Flex v-else align="center" justify="center" gap="6" :class="$style.status">
					<Icon name="pause" size="12" color="secondary" />
					<Text size="12" weight="600" color="secondary">Receiving new blocks on pause</Text>
				</Flex>

				<div :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary">Block Height</Text></th>
								<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
								<th><Text size="12" weight="600" color="tertiary">Proposer</Text></th>
								<th><Text size="12" weight="600" color="tertiary">Txs</Text></th>
								<th><Text size="12" weight="600" color="tertiary">Blobs</Text></th>
								<th><Text size="12" weight="600" color="tertiary">Total Fees</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr
								v-for="block in !isPaused ? blocks.slice(0, 15) : blocksSnapshot"
								@click="handleSelectBlock(block, true)"
								:class="preview.block.time === block.time && $style.active"
							>
								<td style="width: 1px">
									<NuxtLink :to="`/block/${block.height}`">
										<Outline>
											<Flex align="center" gap="6">
												<Icon name="block" size="14" color="primary" />

												<Text size="13" weight="600" color="primary" tabular>{{ comma(block.height) }}</Text>
											</Flex>
										</Outline>
									</NuxtLink>
								</td>
								<td>
									<Flex align="center">
										<Text size="12" weight="600" color="primary">
											{{
												DateTime.fromISO(block.time)
													.plus({ seconds: block.stats.block_time / 1_000 })
													.toRelative({ locale: "en", style: "short" })
											}}
										</Text>
									</Flex>
								</td>
								<td>
									<Tooltip delay="500">
										<template #default>
											<Flex direction="column" gap="4">
												<Text size="12" height="120" weight="600" color="primary" :class="$style.proposer_moniker">
													{{ block.proposer.moniker }}
												</Text>

												<Flex align="center" gap="6">
													<Text size="12" weight="600" color="tertiary" mono>
														{{ block.proposer.cons_address.slice(0, 4) }}
													</Text>
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
										</template>

										<template #content>
											<Flex direction="column" align="start" gap="6">
												<Text color="primary">{{ block.proposer.moniker }}</Text>
												<Text color="tertiary">{{ space(block.proposer.cons_address) }}</Text>
											</Flex>
										</template>
									</Tooltip>
								</td>
								<td>
									<Flex align="center">
										<Text size="13" weight="600" color="primary">
											{{ block.stats.tx_count }}
										</Text>
									</Flex>
								</td>
								<td>
									<Flex align="center">
										<Text size="13" weight="600" color="primary">
											{{ block.stats.blobs_count }}
										</Text>
									</Flex>
								</td>
								<td>
									<Flex align="center" gap="4">
										<Text size="13" weight="600" :color="parseFloat(block.stats.fee) ? 'primary' : 'tertiary'">
											{{ tia(block.stats.fee) }}
										</Text>

										<Text size="13" weight="600" color="tertiary"> TIA </Text>
									</Flex>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<Button link="/blocks" type="secondary" size="small" :class="$style.buttons">
					<Icon name="table" size="12" color="secondary" />
					<Text size="12" weight="600" color="primary">View all blocks</Text>
				</Button>
			</Flex>

			<Flex direction="column" :class="[$style.preview]">
				<Flex wide direction="column" gap="12" :class="$style.top">
					<Flex align="center" justify="between" wide>
						<Flex align="center" gap="6">
							<Icon name="block" size="14" color="secondary" />

							<Flex align="center" gap="4">
								<Text size="12" weight="600" color="secondary"> Height </Text>
								<Text size="12" weight="600" color="primary">{{ comma(preview.block.height) }}</Text>
							</Flex>
						</Flex>

						<Text size="12" weight="600" color="tertiary">
							{{ DateTime.fromISO(preview.block.time).setLocale("en").toFormat("ff") }}
						</Text>
					</Flex>

					<Flex align="center" justify="between" :class="$style.timing">
						<Text size="12" weight="600" color="secondary" :class="$style.fixed_width">
							{{
								DateTime.fromISO(preview.block.time)
									.minus({ milliseconds: preview.block.stats.block_time })
									.setLocale("en")
									.toFormat("TT")
							}}
						</Text>

						<div v-for="dot in 5" class="dot" />

						<Flex align="center" gap="6" :class="$style.fixed_width">
							<Icon name="time" size="12" color="secondary" />
							<Text size="12" weight="600" color="primary"> {{ (preview.block.stats.block_time / 1_000).toFixed(2) }}s </Text>
						</Flex>

						<div v-for="dot in 5" class="dot" />

						<Text size="12" weight="600" color="secondary" align="right" :class="$style.fixed_width">
							{{ DateTime.fromISO(preview.block.time).setLocale("en").toFormat("TT") }}
						</Text>
					</Flex>
				</Flex>

				<Flex direction="column" gap="24" :class="$style.main">
					<Tooltip delay="500">
						<Flex direction="column" gap="12">
							<Text size="12" weight="600" color="tertiary">Proposer</Text>

							<Flex direction="column" gap="8">
								<Text size="13" weight="600" color="primary">
									{{ preview.block.proposer.moniker }}
								</Text>

								<Flex align="center" gap="6">
									<Text size="12" weight="600" color="tertiary" mono>{{
										preview.block.proposer.cons_address.slice(0, 4)
									}}</Text>

									<Flex align="center" gap="3">
										<div v-for="dot in 3" class="dot" />
									</Flex>

									<Text size="12" weight="600" color="tertiary" mono>
										{{
											preview.block.proposer.cons_address.slice(
												preview.block.proposer.cons_address.length - 4,
												preview.block.proposer.cons_address.length,
											)
										}}
									</Text>

									<CopyButton :text="preview.block.proposer.cons_address" size="10" />
								</Flex>
							</Flex>
						</Flex>

						<template #content>
							{{ space(preview.block.proposer.cons_address) }}
						</template>
					</Tooltip>

					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="tertiary">Hash</Text>

						<BadgeValue :text="preview.block.hash" />
					</Flex>

					<Flex direction="column" gap="12">
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Transactions</Text>

							<Text v-if="preview.block.stats.tx_count > 5" size="12" weight="600" color="secondary">
								5 <Text color="tertiary">of {{ comma(preview.block.stats.tx_count) }}</Text>
							</Text>
							<Text v-else size="12" weight="600" color="secondary">
								{{ preview.block.stats.tx_count }}
							</Text>
						</Flex>

						<Flex v-if="preview.block.stats.tx_count" direction="column" gap="8">
							<NuxtLink v-for="transaction in preview.transactions.slice(0, 5)" :to="`/tx/${transaction.hash}`">
								<Outline wide height="32" padding="8" radius="6">
									<Flex justify="between" align="center" wide>
										<Flex align="center" gap="8">
											<Icon
												:name="transaction.status === 'success' ? 'check-circle' : 'close-circle'"
												size="12"
												:color="transaction.status === 'success' ? 'green' : 'red'"
											/>

											<Text size="13" weight="600" color="primary" mono>{{ transaction.hash.slice(0, 4) }}</Text>

											<Flex align="center" gap="3">
												<div v-for="dot in 3" class="dot" />
											</Flex>

											<Text size="13" weight="600" color="primary" mono>
												{{ transaction.hash.slice(transaction.hash.length - 4, transaction.hash.length) }}
											</Text>
										</Flex>

										<Flex v-if="transaction.message_types.length" align="center" gap="6">
											<Text size="12" height="160" weight="600" color="tertiary" :class="$style.message_type">
												{{ transaction.message_types[0].replace("Msg", "") }}
											</Text>
											<Text
												v-if="transaction.message_types.length > 1"
												size="12"
												weight="600"
												color="primary"
												:class="$style.badge"
											>
												+{{ transaction.message_types.length - 1 }}
											</Text>
										</Flex>
									</Flex>
								</Outline>
							</NuxtLink>

							<Flex v-if="preview.block.stats.tx_count > 5" align="center" gap="6">
								<Icon name="help" size="12" color="tertiary" />
								<Text size="12" weight="500" color="tertiary">{{ preview.block.stats.tx_count - 5 }} more.</Text>
								<Text size="12" weight="500" color="support"> View all transactions on the block page </Text>
							</Flex>
						</Flex>
						<Text v-else size="12" weight="600" color="tertiary" align="center" :class="$style.empty_state">
							No transactions
						</Text>
					</Flex>

					<Flex direction="column" gap="12">
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Namespaces</Text>
							<Text size="12" weight="600" color="secondary">
								{{ preview.namespaces?.length > 3 ? "3 /" : "" }} {{ preview.namespaces?.length }}
							</Text>
						</Flex>

						<Text
							v-if="preview.isLoadingNamespaces"
							size="12"
							weight="600"
							color="tertiary"
							align="center"
							:class="$style.empty_state"
						>
							Loading namespaces..
						</Text>
						<Flex v-else-if="preview.namespaces?.length" direction="column" gap="8">
							<NuxtLink v-for="ns in preview.namespaces.slice(0, 3)" :to="`/namespace/${ns.namespace_id}`">
								<Outline wide height="32" padding="8" radius="6">
									<Flex align="center" justify="between" wide>
										<Flex align="center" gap="8">
											<Icon name="namespace" size="12" color="secondary" />

											<Text size="13" weight="600" color="primary" mono>
												{{ getNamespaceID(ns.namespace_id).slice(0, 4) }}
											</Text>

											<Flex align="center" gap="3">
												<div v-for="dot in 3" class="dot" />
											</Flex>

											<Text size="13" weight="600" color="primary" mono>
												{{ getNamespaceID(ns.namespace_id).slice(-4) }}
											</Text>
										</Flex>

										<Text size="12" weight="600" color="tertiary">{{ formatBytes(ns.size) }}</Text>
									</Flex>
								</Outline>
							</NuxtLink>
						</Flex>
						<Text v-else size="12" weight="600" color="tertiary" align="center" :class="$style.empty_state">
							No namespaces
						</Text>
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Events</Text>
							<Text size="12" weight="600" color="secondary"> {{ preview.block.stats.events_count }} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Blobs </Text>
							<Text size="12" weight="600" color="secondary"> {{ formatBytes(preview.block.stats.blobs_size) }} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Total Fees </Text>
							<Text size="12" weight="600" color="secondary"> {{ tia(preview.block.stats.fee) }} TIA </Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex :class="$style.bottom">
					<Button :link="`/block/${preview.block.height}`" type="secondary" size="small" wide>
						<Icon name="block" size="12" color="secondary" />
						<Text size="12" weight="600" color="primary">View Block {{ comma(preview.block.height) }}</Text>
					</Button>
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

.status {
	background: linear-gradient(var(--op-8), var(--op-5));
	border-radius: 6px;

	overflow: hidden;
	padding: 8px;

	margin: 16px 16px 0 16px;
}

.block_icon {
	animation: blink 3s ease infinite;
}

@keyframes blink {
	0% {
		transform: translateY(-200%) scale(0.8);
		opacity: 0;
	}

	30% {
		transform: translateY(0) scale(1);
		opacity: 1;
	}

	60% {
		transform: translateY(0) scale(1);
		opacity: 1;
	}

	100% {
		transform: translateY(180%) scale(0.8);
		opacity: 0;
	}
}

.table {
	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		& tbody {
			& tr {
				cursor: pointer;
				opacity: 0.5;

				transition: all 0.07s ease;

				&.active {
					opacity: 1;

					background: var(--op-3);

					& td:last-child {
						border-right: 2px solid var(--op-30);
					}
				}

				&:hover {
					opacity: 1;

					background: var(--op-5);
				}
			}
		}

		& tr th {
			text-align: left;
			padding: 0;
			padding-bottom: 8px;
			padding-right: 24px;

			&:first-child {
				padding-left: 16px;
			}

			& span {
				display: flex;
			}
		}

		& tr td {
			padding: 0;
			padding-right: 16px;
			padding-top: 8px;
			padding-bottom: 8px;

			white-space: nowrap;
			overflow: hidden;
      		text-overflow: ellipsis;

			border-right: 2px solid transparent;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
}

.preview {
	min-width: 384px;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);

	.top {
		padding: 16px;
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
		flex: 1;

		border-bottom: 1px solid var(--op-5);

		padding: 16px;
	}

	.bottom {
		padding: 16px;

		& a {
			width: 100%;
		}
	}
}

.buttons {
	margin: 0 16px 16px 16px;
}

.table_scroller {
	overflow-x: auto;
}

.key_value {
	max-width: 100%;
}

.proposer_moniker {
	max-width: 150px;

	text-overflow: ellipsis;
	overflow: hidden;
}

.empty_state {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 32px;

	border-radius: 6px;
	background: var(--op-5);

	padding: 0 8px;
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

@media (max-width: 1024px) {
	.content {
		flex-direction: column-reverse;
	}

	.main {
		display: none;
	}

	.preview {
		border-radius: 4px;
	}

	.table {
		width: 604px;
		border-radius: 4px 4px 8px 8px;
	}
}

@media (max-width: 500px) {
	.preview {
		min-width: initial;
	}
}
</style>
