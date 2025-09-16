<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"

/** Services */
import { comma } from "@/services/utils"
import { IbcChainLogo } from "@/services/constants/ibc"

/** Stores */
import { useAppStore } from "@/store/app.store"
import { useCacheStore } from "@/store/cache.store"
const appStore = useAppStore()
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const transfer = computed(() => cacheStore.current.transfer)

const currentPrice = computed(() => appStore.currentPrice.close)

const getChainLogo = (target) => {
	return transfer.value[target].hash.startsWith("celestia")
		? IbcChainLogo["_celestia"]
		: IbcChainLogo[transfer.value.chain_id] ?? IbcChainLogo["_unknown"]
}

const handleNavigate = (target) => {
	emit("onClose")
	navigateTo(target)
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="500" disable-trap>
		<Flex align="center" direction="column" gap="16">
			<Flex wide align="center" gap="6">
				<Icon name="arrow-narrow-up-right-circle" size="14" color="primary" />
				<Text size="14" weight="600" color="primary">IBC Transfer</Text>
			</Flex>

			<Flex wide direction="column" gap="4">
				<Flex direction="column" gap="8" :class="[$style.card, $style.sender]">
					<Text size="12" weight="600" color="secondary">Sender</Text>
					<Flex align="center" gap="8">
						<img :src="getChainLogo('sender')" width="24px" height="24px" />
						<Text size="13" weight="600" color="primary" mono :class="['overflow_ellipsis', $style.address_text]">
							{{ transfer.sender.hash }}
						</Text>
						<CopyButton :text="transfer.sender.hash" />
					</Flex>
				</Flex>

				<Flex justify="between" align="center" :class="[$style.card, $style.amount]">
					<Flex direction="column" gap="8">
						<Text size="12" weight="600" color="secondary">Amount</Text>

						<Flex align="center" gap="8">
							<Icon name="arrow-down-circle" size="16" color="brand" :class="$style.receipient_icon" />

							<Text v-if="transfer.amount / 1_000_000 < 0.01" size="13" weight="600" color="primary" mono>
								< 0.01 TIA <Text color="tertiary">({{ transfer.amount }} {{ transfer.denom }})</Text>
							</Text>
							<Text v-else size="13" weight="600" color="primary" mono>
								{{ comma(transfer.amount / 1_000_000) }} TIA
								<Text color="tertiary"> (${{ ((transfer.amount / 1_000_000) * currentPrice).toFixed(2) }}) </Text>
							</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex wide direction="column" gap="8" :class="$style.card">
				<Text size="12" weight="600" color="secondary">Recipient</Text>

				<Flex align="center" gap="8">
					<img :src="getChainLogo('receiver')" width="24px" height="24px" />

					<Text size="13" weight="600" color="primary" mono :class="['overflow_ellipsis', $style.address_text]">
						{{ transfer.receiver.hash }}
					</Text>
					<CopyButton :text="transfer.receiver.hash" />
				</Flex>
			</Flex>

			<Flex wide direction="column" gap="16" :class="$style.card">
				<Text size="12" weight="600" color="secondary">Details</Text>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Time</Text>
					<Text size="12" weight="600" color="primary">
						{{ DateTime.fromISO(transfer.time).setLocale("en").toFormat("LLL d, t") }}
						<Text color="tertiary"> ({{ DateTime.fromISO(transfer.time).toRelative({ style: "short" }) }})</Text>
					</Text>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Hash</Text>

					<Flex align="center" gap="6">
						<Text size="12" weight="600" color="primary" mono>
							{{ transfer.tx_hash.slice(0, 4).toUpperCase() }}
						</Text>

						<Flex align="center" gap="3">
							<div v-for="dot in 3" class="dot" />
						</Flex>

						<Text size="12" weight="600" color="primary" mono>
							{{ transfer.tx_hash.slice(-4).toUpperCase() }}
						</Text>

						<CopyButton :text="transfer.tx_hash" size="12" />
					</Flex>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Channel</Text>
					<Text size="12" weight="600" :color="transfer.channel_id.length ? 'primary' : 'tertiary'" mono>
						{{ transfer.channel_id.length ? transfer.channel_id : "Unknown" }}
					</Text>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Connection</Text>
					<Text size="12" weight="600" :color="transfer.connection_id.length ? 'primary' : 'tertiary'" mono>
						{{ transfer.connection_id.length ? transfer.connection_id : "Unknown" }}
					</Text>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Height</Text>

					<Text
						@click="handleNavigate(`/block/${transfer.height}`)"
						size="12"
						weight="600"
						color="primary"
						mono
						class="clickable"
					>
						{{ comma(transfer.height) }}
					</Text>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Sequence</Text>

					<Text size="12" weight="600" color="primary" mono>
						{{ comma(transfer.sequence) }}
					</Text>
				</Flex>
			</Flex>

			<Flex wide direction="column" gap="8">
				<Button @click="emit('onClose')" :link="`/tx/${transfer.tx_hash}`" type="secondary" size="small" wide>
					View transaction
				</Button>
				<Button @click="emit('onClose')" type="tertiary" size="small" wide>Close</Button>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.card {
	border-radius: 8px;
	background: var(--op-5);

	padding: 8px 12px 8px 8px;

	&.sender {
		border-radius: 8px 8px 2px 2px;
	}

	&.amount {
		border-radius: 2px 2px 8px 8px;
	}
}

.address_text {
	flex: 1;
}

.receipient_icon {
	border-radius: 50px;
	border: 2px solid var(--op-5);
	box-sizing: content-box;

	padding: 2px;
}
</style>
