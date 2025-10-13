<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"

/** Services */
import { comma } from "@/services/utils"

/** Stores */
import { useAppStore } from "@/store/app.store"
import { useCacheStore } from "@/store/cache.store"
import { useModalsStore } from "@/store/modals.store"
const appStore = useAppStore()
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const transfer = computed(() => cacheStore.current.hyperlaneTransfer)

const currentPrice = computed(() => appStore.currentPrice.close)

const handleNavigate = (target) => {
	emit("onClose")
	navigateTo(target)
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="500" disable-trap>
		<Flex align="center" direction="column" gap="16">
			<Flex wide align="center" gap="6">
				<Icon name="hyperlane" size="14" color="primary" />
				<Text size="14" weight="600" color="primary">Hyperlane Transfer</Text>
			</Flex>

			<Flex wide justify="between" align="center" :class="[$style.card]">
				<Flex direction="column" gap="8">
					<Text size="12" weight="600" color="secondary">Amount</Text>

					<Flex align="center" gap="8">
						<Icon
							name="arrow-narrow-up-right-circle"
							size="14"
							:color="transfer.type === 'send' ? 'purple' : 'brand'"
							:style="{ transform: `scale(1, ${transfer.type === 'receive' ? '-' : ''}1)` }"
						/>

						<Text v-if="transfer.received / 1_000_000 < 0.01" size="13" weight="600" color="primary" mono>
							< 0.01 TIA <Text color="tertiary">({{ transfer.received }} {{ transfer.denom }})</Text>
						</Text>
						<Text v-else size="13" weight="600" color="primary" mono>
							{{ comma(transfer.received / 1_000_000) }} TIA
							<Text color="tertiary"> (${{ ((transfer.received / 1_000_000) * currentPrice).toFixed(2) }}) </Text>
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex wide direction="column" gap="8" :class="[$style.card]">
				<Text size="12" weight="600" color="secondary">Address</Text>

				<Flex align="center" gap="8">
					<Text size="13" weight="600" color="primary" mono :class="['overflow_ellipsis', $style.address_text]">
						{{ transfer.address.hash }}
					</Text>
					<CopyButton :text="transfer.address.hash" />
				</Flex>
			</Flex>

			<Flex wide direction="column" gap="8" :class="$style.card">
				<Text size="12" weight="600" color="secondary">Counterparty</Text>

				<Text size="13" weight="600" color="primary" mono :class="['overflow_ellipsis', $style.address_text]">
					{{ transfer.counterparty.chain_metadata.name }}
				</Text>

				<Flex align="center" justify="between">
					<Text size="13" weight="600" color="tertiary" mono :class="['overflow_ellipsis', $style.address_text]">
						{{ transfer.counterparty.hash }}
					</Text>
					<CopyButton :text="transfer.counterparty.hash" />
				</Flex>
			</Flex>

			<Flex v-if="transfer.gas_payment?.amount" direction="column" gap="8" wide :class="$style.card">
				<Text size="12" weight="600" color="secondary">Interchain Gas Payments</Text>

				<Flex align="center" gap="48">
					<Text size="12" weight="600" color="tertiary">Fee</Text>

					<Text size="12" weight="600" color="primary" mono>
						{{ comma(transfer.gas_payment?.amount) }}
						<Text color="tertiary"> utia </Text>
					</Text>
				</Flex>

				<Flex align="center" gap="14">
					<Text size="12" weight="600" color="tertiary">Gas Limit</Text>

					<Text size="12" weight="600" color="primary" mono>
						{{ comma(transfer.gas_payment?.gas_amount) }}
					</Text>
				</Flex>
			</Flex>

			<Flex wide direction="column" gap="16" :class="$style.card">
				<Text size="12" weight="600" color="secondary">Details</Text>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Type</Text>

					<Text size="12" weight="600" color="primary" style="text-transform: capitalize">
						{{ transfer.type }}
					</Text>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Time</Text>

					<Text size="12" weight="600" color="primary">
						{{ DateTime.fromISO(transfer.time).setLocale("en").toFormat("LLL d, t") }}
						<Text color="tertiary"> ({{ DateTime.fromISO(transfer.time).toRelative({ style: "short" }) }})</Text>
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
					<Text size="12" weight="600" color="tertiary">Tx Hash</Text>

					<Flex @click="handleNavigate(`/tx/${transfer.tx_hash}`)" align="center" gap="6" class="clickable">
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
					<Text size="12" weight="600" color="tertiary">Mailbox</Text>

					<Flex align="center" gap="6">
						<Text size="12" weight="600" color="primary" mono>
							{{ transfer.mailbox.slice(0, 4).toUpperCase() }}
						</Text>
						<Flex align="center" gap="3">
							<div v-for="dot in 3" class="dot" />
						</Flex>
						<Text size="12" weight="600" color="primary" mono>
							{{ transfer.mailbox.slice(-4).toUpperCase() }}
						</Text>
						<CopyButton :text="transfer.mailbox" size="12" />
					</Flex>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Token ID</Text>

					<Flex align="center" gap="6">
						<Text size="12" weight="600" color="primary" mono>
							{{ transfer.token_id.slice(0, 4).toUpperCase() }}
						</Text>
						<Flex align="center" gap="3">
							<div v-for="dot in 3" class="dot" />
						</Flex>
						<Text size="12" weight="600" color="primary" mono>
							{{ transfer.token_id.slice(-4).toUpperCase() }}
						</Text>
						<CopyButton :text="transfer.token_id" size="12" />
					</Flex>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Body</Text>

					<Flex align="center" gap="6">
						<Text size="12" weight="600" color="secondary" mono>{{ transfer.body.length }} chars string </Text>
						<CopyButton :text="transfer.body" size="12" />
					</Flex>
				</Flex>
			</Flex>

			<Button @click="emit('onClose')" wide type="tertiary" size="small">Close</Button>
		</Flex>
	</Modal>
</template>

<style module>
.card {
	border-radius: 8px;
	background: var(--op-5);

	padding: 8px 12px 8px 8px;
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
