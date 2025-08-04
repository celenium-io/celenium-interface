<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Spinner from "@/components/ui/Spinner.vue"

/** Services */
import { comma } from "@/services/utils"

/** API */
import { fetchHyperlaneTransfers } from "@/services/api/hyperlane"

/** Store */
import { useModalsStore } from "@/store/modals.store"
import { useCacheStore } from "@/store/cache.store"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const router = useRouter()

const isLoading = ref(true)
const transfers = ref([])

const getTransfers = async () => {
	isLoading.value = true

	const { data } = await useAsyncData(`hyperlane-transfers`, () =>
		fetchHyperlaneTransfers({
			offset: 0,
			limit: 10,
			sort: "desc",
		}),
	)
	transfers.value = data.value

	isLoading.value = false
}

await getTransfers()

const handleOpenTransferModal = (transfer) => {
	cacheStore.current.hyperlaneTransfer = transfer
	modalsStore.open("hyperlaneTransfer")
}
</script>

<template>
	<Flex wide direction="column" gap="4">
		<Flex align="center" gap="8" :class="$style.header">
			<Icon name="arrow-circle-broken-right" size="14" color="tertiary" />
			<Text size="13" weight="600" color="primary">Hyperlane Transfers</Text>
		</Flex>

		<Flex direction="column" gap="16" :class="$style.transfers_body">
			<div v-if="transfers?.length" :class="$style.table_scroller">
				<table>
					<thead>
						<tr>
							<th><Text size="12" weight="600" color="tertiary">Amount</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Address</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Counterparty</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Height</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Transaction</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="transfer in transfers" @click="handleOpenTransferModal(transfer)">
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
								<NuxtLink :to="`/address/${transfer.address.hash}`">
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
							</td>
							<td>
								<Flex align="center" gap="6">
									<Text size="13" weight="600" color="primary" mono>
										{{ transfer.counterparty.chain_metadata.name }}
									</Text>
								</Flex>
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
								<NuxtLink :to="`/tx/${transfer.tx_hash}`">
									<Flex align="center" gap="6">
										<Text size="13" weight="600" color="primary" mono>
											{{ transfer.tx_hash.slice(0, 4).toUpperCase() }}
										</Text>
										<Flex align="center" gap="3">
											<div v-for="_ in 3" class="dot" />
										</Flex>
										<Text size="13" weight="600" color="primary" mono>
											{{ transfer.tx_hash.slice(-4).toUpperCase() }}
										</Text>

										<CopyButton :text="transfer.tx_hash" />
									</Flex>
								</NuxtLink>
							</td>
							<td>
								<Flex align="center" gap="6">
									<Text size="13" weight="600" color="primary">
										{{ DateTime.fromISO(transfer.time).toRelative({ style: "short" }) }}
									</Text>
								</Flex>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<Flex v-else-if="isLoading" align="center" justify="center" gap="8" wide :class="$style.empty">
				<Spinner size="14" />
				<Text size="13" weight="500" color="secondary"> Loading recent transfers </Text>
			</Flex>

			<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
				<Text size="13" weight="600" color="secondary" align="center"> Recent transfers not found </Text>
				<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
					This data is temporarily unavailable
				</Text>
			</Flex>

			<div :class="$style.bottom">
				<Button link="/hyperlane/transfers" type="secondary" size="small" wide>
					<Icon name="table" size="12" color="secondary" />
					<Text size="12" weight="600" color="primary">View All Transfers</Text>
				</Button>
			</div>
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

.transfers_body {
	flex: 1;

	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	& table {
		width: 100%;

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

			&.sortable {
				cursor: pointer;
			}

			&.sortable:hover {
				& span {
					color: var(--txt-secondary);
				}
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

				padding-right: 16px;
			}
		}
	}
}

.empty {
	margin: 32px 0 16px 0;
}

.bottom {
	padding: 0 16px 16px 16px;
}

.table_scroller {
	flex: 1;

	overflow-x: auto;
}
</style>
