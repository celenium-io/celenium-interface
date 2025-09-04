<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma } from "@/services/utils"

/** Constants */
import { IbcChainName } from "@/services/constants/ibc"

/** Store */
import { useModalsStore } from "@/store/modals.store"
import { useCacheStore } from "@/store/cache.store"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const props = defineProps({
	ibcData: {
		type: Object,
	},
})

const largestChain = ref(props.ibcData.rawChainsStats[0])
props.ibcData.rawChainsStats.forEach((chainStats) => {
	if (Number(chainStats.flow) > Number(largestChain.value.flow)) {
		largestChain.value = chainStats
	}
})
const largestTransfer = props.ibcData.rawSummary?.largest_transfer
const busiestChannel = props.ibcData.rawSummary?.busiest_channel

const handleOpenTransferModal = (transfer) => {
	cacheStore.current.transfer = transfer
	modalsStore.open("ibcTransfer")
}

const getChainName = (target) => {
	return largestTransfer[target]?.hash?.startsWith("celestia")
		? "Celestia"
		: IbcChainName[largestTransfer?.chain_id] ?? largestTransfer?.chain_id
}
</script>

<template>
	<Flex align="center" gap="16" :class="$style.wrapper">
		<Tooltip wide position="start">
			<Flex wide direction="column" gap="12" :class="$style.card">
				<Flex align="center" justify="between">
					<Flex align="center" gap="8">
						<Icon name="coins" size="14" color="orange" />
						<Text size="13" weight="600" color="secondary">Largest connected chain</Text>
					</Flex>

					<Icon name="info" size="14" color="support" />
				</Flex>

				<Text size="15" weight="600" color="primary">{{ IbcChainName[largestChain?.chain] ?? "Unknown" }} </Text>

				<Text size="13" weight="500" color="support">
					<Text color="tertiary" mono>{{ comma(largestChain?.flow / 1_000_000) }} TIA</Text>
				</Text>
			</Flex>

			<template #content> The amount shown is the chain flow, sent and received tokens </template>
		</Tooltip>

		<Flex v-if="largestTransfer" @click="handleOpenTransferModal(largestTransfer)" wide direction="column" gap="12" :class="[$style.card, $style.hoverable]">
			<Flex align="center" justify="between">
				<Flex align="center" gap="8">
					<Icon name="arrow-circle-broken-right" size="14" color="brand" />
					<Text size="13" weight="600" color="secondary">Largest transfer today</Text>
				</Flex>

				<Icon name="arrow-narrow-up-right-circle" size="14" color="tertiary" />
			</Flex>

			<Text size="15" weight="600" color="primary"
				>{{ getChainName("sender") }} <Text color="tertiary">-></Text> {{ getChainName("receiver") }}
			</Text>

			<Text size="13" weight="500" color="support">
				<Text color="tertiary" mono>{{ comma(largestTransfer.amount / 1_000_000) }} TIA</Text>
			</Text>
		</Flex>

		<Flex wide direction="column" gap="12" :class="$style.card">
			<Flex align="center" justify="between">
				<Flex align="center" gap="8">
					<Icon name="zap" size="14" color="red" />
					<Text size="13" weight="600" color="secondary">Busiest channel</Text>
				</Flex>

				<Text size="12" weight="600" color="tertiary">30 days</Text>
			</Flex>

			<Text size="15" weight="600" color="primary">
				{{ busiestChannel ? busiestChannel.channel_id : "" }}
				<Text size="12" color="tertiary">{{ busiestChannel ? IbcChainName[busiestChannel.chain_id] ?? "Unknown" : "Unknown" }}</Text>
			</Text>

			<Text size="13" weight="500" color="support">
				<Text color="tertiary" mono>{{ comma(busiestChannel?.transfers_count ?? "") }} transfers</Text>
			</Text>
		</Flex>
	</Flex>
</template>

<style module>
.card {
	border-radius: 8px;
	background: var(--card-background);

	padding: 12px;

	&.hoverable {
		cursor: pointer;

		transition: all 0.2s ease;

		&:hover {
			box-shadow: 0 0 0 2px var(--op-10);
		}
	}
}

@media (max-width: 800px) {
	.wrapper {
		flex-direction: column;
	}
}
</style>
