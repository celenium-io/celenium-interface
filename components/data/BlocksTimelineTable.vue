<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { tia, comma, space, formatBytes } from "@/services/utils"

/** API */
import { fetchBlockNamespaces } from "@/services/api/block"
import { fetchTransactionsByBlock } from "@/services/api/tx"

/** Store */
import { useAppStore } from "@/store/app"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const notificationsStore = useNotificationsStore()

const blocks = computed(() => appStore.latestBlocks)
const preview = reactive({
	block: blocks.value[0],
	transactions: [],
	pfbs: [],
})

const handleSelectBlock = (b) => {
	preview.block = b
}

watch(
	() => preview.block,
	async () => {
		if (preview.block.stats.tx_count) {
			const { data } = await fetchTransactionsByBlock({ height: preview.block.height })
			preview.transactions = data.value
		}
	},
)

watch(
	() => preview.transactions,
	async () => {
		const hasPFB = !!preview.transactions.filter((t) => t.message_types.includes("MsgPayForBlobs"))
		if (!hasPFB) return

		const { data } = await fetchBlockNamespaces({ height: preview.block.height })
		preview.pfbs = data.value
	},
)

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
	<Flex wide direction="column" gap="4">
		<Flex align="center" :class="$style.header">
			<Text size="14" weight="600" color="primary">Blocks Timeline</Text>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" gap="16" wide :class="$style.table">
				<div :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary">Height</Text></th>
								<th><Text size="12" weight="600" color="tertiary">When</Text></th>
								<th><Text size="12" weight="600" color="tertiary">Hash</Text></th>
								<th><Text size="12" weight="600" color="tertiary">Proposer</Text></th>
								<th><Text size="12" weight="600" color="tertiary">Fee</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="block in blocks" @click="handleSelectBlock(block)">
								<td style="width: 1px">
									<Outline>
										<Flex align="center" gap="6">
											<Icon
												:name="block.height === preview.block.height ? 'check' : 'block'"
												size="14"
												:color="block.height === preview.block.height ? 'primary' : 'tertiary'"
											/>

											<Text size="13" weight="600" color="primary">{{ comma(block.height) }}</Text>
										</Flex>
									</Outline>
								</td>
								<td>
									<Text size="13" weight="600" color="primary">
										{{ DateTime.fromISO(block.time).toRelative({ locale: "en", style: "short" }) }}
									</Text>
								</td>
								<td>
									<Tooltip delay="500">
										<template #default>
											<Flex align="center" gap="6">
												<Text size="13" weight="600" color="secondary">{{ block.hash.slice(0, 4) }}</Text>

												<Flex align="center" gap="3">
													<div v-for="dot in 3" class="dot" />
												</Flex>

												<Text size="13" weight="600" color="secondary">
													{{ block.hash.slice(block.hash.length - 4, block.hash.length) }}
												</Text>
											</Flex>
										</template>

										<template #content> {{ space(block.hash) }} </template>
									</Tooltip>
								</td>
								<td>
									<Tooltip delay="500">
										<template #default>
											<Flex align="center" gap="6">
												<Text size="13" weight="600" color="secondary">{{
													block.proposer_address.slice(0, 4)
												}}</Text>

												<Flex align="center" gap="3">
													<div v-for="dot in 3" class="dot" />
												</Flex>

												<Text size="13" weight="600" color="secondary">{{
													block.proposer_address.slice(
														block.proposer_address.length - 4,
														block.proposer_address.length,
													)
												}}</Text>
											</Flex>
										</template>

										<template #content> {{ space(block.proposer_address) }} </template>
									</Tooltip>
								</td>
								<td>
									<Flex align="center" gap="4">
										<Text size="13" weight="600" color="primary"> {{ tia(block.stats.fee) }} </Text>
										<Text size="13" weight="600" color="tertiary"> TIA </Text>
									</Flex>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<Button link="/blocks" type="secondary" size="small" wide>
					<Text size="12" weight="600" color="primary">View all blocks</Text>
					<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
				</Button>
			</Flex>

			<Flex direction="column" :class="[$style.preview]">
				<Flex wide direction="column" gap="16" :class="$style.top">
					<Flex align="center" justify="between" wide>
						<Flex align="center" gap="8">
							<Icon name="block" size="14" color="primary" />

							<Flex align="center" gap="4">
								<Text size="12" weight="600" color="secondary"> Block </Text>
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
							{{ DateTime.fromISO(preview.block.time).setLocale("en").toFormat("TT") }}</Text
						>
					</Flex>
				</Flex>

				<Flex direction="column" gap="32" :class="$style.main">
					<Flex align="center" gap="40">
						<Tooltip delay="500">
							<Flex @click="handleCopy(preview.block.hash)" direction="column" gap="12" class="copyable">
								<Text size="12" weight="600" color="tertiary">Hash</Text>

								<Flex align="center" gap="6">
									<Text size="13" weight="600" color="primary">{{ preview.block.hash.slice(0, 4) }}</Text>

									<Flex align="center" gap="3">
										<div v-for="dot in 3" class="dot" />
									</Flex>

									<Text size="13" weight="600" color="primary">{{
										preview.block.hash.slice(preview.block.hash.length - 4, preview.block.hash.length)
									}}</Text>
								</Flex>
							</Flex>

							<template #content>
								{{ space(preview.block.hash) }}
							</template>
						</Tooltip>

						<Tooltip delay="500">
							<Flex @click="handleCopy(preview.block.proposer_address)" direction="column" gap="12" class="copyable">
								<Text size="12" weight="600" color="tertiary">Proposer</Text>

								<Flex align="center" gap="6">
									<Text size="13" weight="600" color="primary">{{ preview.block.proposer_address.slice(0, 4) }}</Text>

									<Flex align="center" gap="3">
										<div v-for="dot in 3" class="dot" />
									</Flex>

									<Text size="13" weight="600" color="primary">{{
										preview.block.proposer_address.slice(
											preview.block.proposer_address.length - 4,
											preview.block.proposer_address.length,
										)
									}}</Text>
								</Flex>
							</Flex>

							<template #content>
								{{ space(preview.block.proposer_address) }}
							</template>
						</Tooltip>
					</Flex>

					<Flex direction="column" gap="12">
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Transactions</Text>
							<Text size="12" weight="600" color="secondary">
								{{ preview.block.stats.tx_count > 3 ? "3 /" : "" }} {{ preview.block.stats.tx_count }}
							</Text>
						</Flex>

						<Flex v-if="preview.block.stats.tx_count" direction="column" gap="8">
							<Outline v-for="transaction in preview.transactions.slice(0, 3)" wide height="32" padding="8" radius="6">
								<Flex justify="between" align="center" wide>
									<Flex align="center" gap="8">
										<Icon name="zap" size="12" color="green" />

										<Text size="13" weight="700" color="primary" mono>{{ transaction.hash.slice(0, 4) }}</Text>

										<Flex align="center" gap="3">
											<div v-for="dot in 3" class="dot" />
										</Flex>

										<Text size="13" weight="700" color="primary" mono>
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
						</Flex>
						<Text v-else size="12" weight="600" color="tertiary" align="center" :class="$style.empty_state">
							No transactions
						</Text>
					</Flex>

					<Flex direction="column" gap="12">
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Blobs</Text>
							<Text size="12" weight="600" color="secondary">
								{{ preview.pfbs.length > 3 ? "3 /" : "" }} {{ preview.pfbs.length }}
							</Text>
						</Flex>

						<Flex v-if="preview.pfbs.length" direction="column" gap="8">
							<Outline v-for="pfb in preview.pfbs.slice(0, 3)" wide height="32" padding="8" radius="6">
								<Flex align="center" justify="between" wide>
									<Flex align="center" gap="8">
										<Icon name="blob" size="12" color="secondary" />

										<Text size="13" weight="700" color="primary" mono>{{ pfb.namespace.hash.slice(0, 4) }}</Text>

										<Flex align="center" gap="3">
											<div v-for="dot in 3" class="dot" />
										</Flex>

										<Text size="13" weight="700" color="primary" mono>
											{{ space(pfb.namespace.hash.slice(pfb.namespace.hash.length - 8, pfb.namespace.hash.length)) }}
										</Text>
									</Flex>

									<Text size="12" weight="600" color="tertiary">{{ formatBytes(pfb.namespace.size) }}</Text>
								</Flex>
							</Outline>
						</Flex>
						<Text v-else size="12" weight="600" color="tertiary" align="center" :class="$style.empty_state"> No blobs </Text>
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
							<Text size="12" weight="600" color="tertiary"> Fee </Text>
							<Text size="12" weight="600" color="secondary"> {{ tia(preview.block.stats.fee) }} TIA </Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex :class="$style.bottom">
					<Button :link="`/block/${preview.block.height}`" type="secondary" size="small" wide>
						<Text size="12" weight="600" color="primary">View Block {{ comma(preview.block.height) }}</Text>
						<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
					</Button>
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

.table {
	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	padding: 16px;

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		& tbody {
			& tr {
				cursor: pointer;

				transition: all 0.07s ease;
			}

			&:hover {
				& tr:not(:hover) {
					opacity: 0.35;
				}
			}
		}

		& tr th {
			text-align: left;
			padding: 0;
			padding-bottom: 8px;

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

.table_scroller {
	overflow-x: auto;
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

@media (max-width: 900px) {
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
		border-radius: 4px 4px 8px 8px;
	}
}

@media (max-width: 500px) {
	.preview {
		min-width: initial;
	}
}
</style>
