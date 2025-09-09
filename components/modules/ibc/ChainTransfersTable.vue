<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** API */
import { fetchIbcTransfers } from "@/services/api/ibc"

/** Services */
import { comma } from "@/services/utils"
import { IbcChainName, IbcChainLogo } from "@/services/constants/ibc"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

/** Store */
import { useModalsStore } from "@/store/modals.store"
import { useCacheStore } from "@/store/cache.store"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const props = defineProps({
	chain: {
		type: Object,
		default: {},
	},
})

const transfers = ref([])
const isLoading = ref(true)

/** Pagination */
const page = ref(1)
const handlePrevPage = () => {
	if (page.value === 1) return
	page.value -= 1
}

const isNextPageDisabled = computed(() => {
	return !transfers.value.length || transfers.value.length !== 10
})
const handleNextPage = () => {
	if (isNextPageDisabled.value) return
	page.value += 1
}

const getTransfers = async () => {
	isLoading.value = true

	const { data } = await useAsyncData(`ibc-transfers-${props.chain.chain}-${page.value}`, () =>
		fetchIbcTransfers({
			chain_id: props.chain.chain,
			offset: (page.value - 1) * 10,
			limit: 10,
		}),
	)
	transfers.value = data.value
	transfers.value.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

	isLoading.value = false
}

await getTransfers()

/** Refetch transfers */
watch(
	() => page.value,
	async () => {
		const data = await fetchIbcTransfers({
			chain_id: props.chain.chain,
			offset: (page.value - 1) * 10,
			limit: 10,
		})
		transfers.value = data
		transfers.value.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
	},
)

const handleOpenTransferModal = (transfer) => {
	cacheStore.current.transfer = transfer
	modalsStore.open("ibcTransfer")
}

const getChainLogo = (transfer, target) => {
	return transfer[target].hash.startsWith("celestia")
		? IbcChainLogo["_celestia"]
		: IbcChainLogo[transfer.chain_id] ?? IbcChainLogo["_unknown"]
}
</script>

<template>
	<Flex wide direction="column" :class="[$style.wrapper, isLoading && $style.disabled]">
		<Flex v-if="transfers.length" :class="$style.scroller">
			<table>
				<thead>
					<tr>
						<th><Text size="12" weight="600" color="tertiary">Source Hash</Text></th>
						<th><Text size="12" weight="600" color="tertiary">From</Text></th>
						<th></th>
						<th><Text size="12" weight="600" color="tertiary">To</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Chain</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Amount</Text></th>
					</tr>
				</thead>

				<tbody>
					<tr v-for="transfer in transfers" @click="handleOpenTransferModal(transfer)">
						<td style="width: 1px">
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
						</td>
						<td style="width: 1px">
							<Flex align="center" gap="6">
								<img :src="getChainLogo(transfer, 'sender')" width="12px" height="12px" />
								<Text size="13" weight="600" color="primary" mono>
									{{ transfer.sender.hash.slice(0, 6) }}
								</Text>
								<Flex align="center" gap="3">
									<div v-for="_ in 3" class="dot" />
								</Flex>
								<Text size="13" weight="600" color="primary" mono>
									{{ transfer.sender.hash.slice(-6) }}
								</Text>
							</Flex>
						</td>
						<td style="width: 1px">
							<Text size="13" weight="600" color="tertiary">-></Text>
						</td>
						<td>
							<Flex align="center" gap="6">
								<img :src="getChainLogo(transfer, 'receiver')" width="12px" height="12px" />
								<Text size="13" weight="600" color="primary" mono>
									{{ transfer.receiver.hash.slice(0, 6) }}
								</Text>
								<Flex align="center" gap="3">
									<div v-for="_ in 3" class="dot" />
								</Flex>
								<Text size="13" weight="600" color="primary" mono>
									{{ transfer.receiver.hash.slice(-6) }}
								</Text>
							</Flex>
						</td>
						<td>
							<Flex direction="column" gap="4">
								<Text size="12" weight="600" color="primary">
									{{ IbcChainName[transfer.chain_id] ?? "Celestia" }}
								</Text>
								<Text size="12" weight="500" color="tertiary" mono>
									<template v-if="transfer.chain_id"> {{ transfer.chain_id }} ⋅ </template> {{ transfer.channel_id }}
								</Text>
							</Flex>
						</td>
						<td>
							<Flex justify="center" direction="column" gap="4">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(transfer.time).toRelative({ locale: "en", style: "short" }) }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ DateTime.fromISO(transfer.time).setLocale("en").toFormat("LLL d, t") }}
								</Text>
							</Flex>
						</td>
						<td>
							<Flex align="center" gap="6">
								<Text v-if="transfer.amount / 1_000_000 < 0.01" size="13" weight="600" color="tertiary" mono>
									< 0.01 TIA
								</Text>
								<Text v-else size="13" weight="600" color="primary" mono>
									{{ comma(transfer.amount / 1_000_000) }}
									<Text color="tertiary">TIA</Text>
								</Text>
							</Flex>
						</td>
					</tr>
				</tbody>
			</table>
		</Flex>

		<TablePlaceholderView
			v-else
			title="There's no transfers"
			description="Perhaps we haven't found them yet"
			icon="arrow-narrow-up-right-circle"
			subIcon="search"
			:descriptionWidth="260"
			style="height: 100%"
		/>

		<!-- Pagination -->
		<Flex align="center" gap="6" :class="$style.pagination">
			<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
				<Icon name="arrow-left-stop" size="12" color="primary" />
			</Button>
			<Button type="secondary" @click="handlePrevPage" size="mini" :disabled="page === 1">
				<Icon name="arrow-left" size="12" color="primary" />
			</Button>

			<Button type="secondary" size="mini" disabled>
				<Text size="12" weight="600" color="primary"> Page {{ comma(page) }} </Text>
			</Button>

			<Button @click="handleNextPage" type="secondary" size="mini" :disabled="isNextPageDisabled">
				<Icon name="arrow-right" size="12" color="primary" />
			</Button>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 100%;

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

.table.disabled {
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
