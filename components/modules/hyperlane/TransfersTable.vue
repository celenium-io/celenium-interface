<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma } from "@/services/utils"

/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

/** Store */
import { useModalsStore } from "@/store/modals.store"
import { useCacheStore } from "@/store/cache.store"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const props = defineProps({
	transfers: {
		type: Array,
		default: [],
	},
	isLoading: {
		type: Boolean,
		default: false,
	},
})

const handleOpenTransferModal = (transfer) => {
	cacheStore.current.hyperlaneTransfer = transfer
	modalsStore.open("hyperlaneTransfer")
}
</script>

<template>
	<Flex direction="column" :class="[$style.wrapper, isLoading && $style.disabled]">
		<Flex v-if="transfers.length" :class="$style.scroller">
			<table>
				<thead>
					<tr>
						<th><Text size="12" weight="600" color="tertiary">Source Hash</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Amount</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Address</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Counterparty</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Height</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
					</tr>
				</thead>

				<tbody>
					<tr v-for="transfer in transfers" @click="handleOpenTransferModal(transfer)">
						<td>
							<Flex align="center">
								<NuxtLink @click.stop :to="`/tx/${transfer.tx_hash}`">
									<Flex align="center" gap="8">
										<Icon name="check-circle" size="13" color="brand" />

										<Text size="13" weight="600" color="primary" mono>
											{{ transfer.tx_hash.slice(0, 4).toUpperCase() }}
										</Text>

										<Flex align="center" gap="3">
											<div v-for="dot in 3" class="dot" />
										</Flex>

										<Text size="13" weight="600" color="primary" mono>
											{{ transfer.tx_hash.slice(-4).toUpperCase() }}
										</Text>

										<CopyButton :text="transfer.tx_hash" />
									</Flex>
								</NuxtLink>
							</Flex>
						</td>
						<td>
							<Flex align="center" gap="6">
								<Icon
									name="arrow-narrow-up-right-circle"
									size="14"
									:color="transfer.type === 'send' ? 'purple' : 'brand'"
									:style="{ transform: `scale(1, ${transfer.type === 'receive' ? '-' : ''}1)` }"
								/>
								<Text size="13" weight="600" color="primary" mono>
									{{ comma(transfer.received / 1_000_000) }} <Text color="tertiary">TIA</Text>
								</Text>
							</Flex>
						</td>
						<td>
							<Flex align="center">
								<NuxtLink @click.stop :to="`/address/${transfer.address.hash}`">
									<Flex align="center" gap="6">
										<Text size="13" weight="600" color="primary" mono>
											{{ transfer.address.hash.slice(0, 8) }}
										</Text>
										<Flex align="center" gap="3">
											<div v-for="_ in 3" class="dot" />
										</Flex>
										<Text size="13" weight="600" color="primary" mono>
											{{ transfer.address.hash.slice(-4) }}
										</Text>
									</Flex>
								</NuxtLink>
							</Flex>
						</td>
						<td>
							<NuxtLink>
								<Flex align="center" gap="6">
									<Text size="13" weight="600" color="primary" mono>
										{{ transfer.counterparty.chain_metadata.name }}
									</Text>
								</Flex>
							</NuxtLink>
						</td>
						<td>
							<Flex align="center">
								<Outline @click.prevent="router.push(`/block/${transfer.height}`)">
									<Flex align="center" gap="6">
										<Icon name="block" size="14" color="secondary" />
										<Text size="13" weight="600" color="primary" tabular>{{ comma(transfer.height) }}</Text>
									</Flex>
								</Outline>
							</Flex>
						</td>
						<td>
							<NuxtLink>
								<Flex align="center" gap="6">
									<Text size="13" weight="600" color="primary">
										{{ DateTime.fromISO(transfer.time).toRelative({ style: "short" }) }}
									</Text>
								</Flex>
							</NuxtLink>
						</td>
					</tr>
				</tbody>
			</table>
		</Flex>

		<TablePlaceholderView
			v-else
			title="There's no transfers"
			description="Probably something went wrong... ?"
			icon="hyperlane"
			subIcon="warning"
			:descriptionWidth="260"
			style="height: 100%"
		/>
	</Flex>
</template>

<style module>
.wrapper {
	border-radius: 4px 4px 8px 8px;
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
			padding-top: 12px;
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
			padding-top: 8px;
			padding-bottom: 8px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
}

.scroller {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.pagination {
	padding: 8px 16px 16px 16px;
}

@media (max-width: 800px) {
	.table {
		border-radius: 4px 4px 8px 8px;
	}
}
</style>
