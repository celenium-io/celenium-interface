<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"

/** Services */
import { comma } from "@/services/utils"

/** Stores */
import { useCacheStore } from "@/store/cache.store"
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const mailbox = computed(() => cacheStore.current.hyperlaneMailbox)

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
				<Text size="14" weight="600" color="primary">Hyperlane Mailbox</Text>
			</Flex>

			<Flex wide gap="16">
				<Flex wide direction="column" gap="8" :class="[$style.card]">
					<Flex align="center" gap="4">
						<Icon name="arrow-narrow-up-right-circle" size="12" color="tertiary" />
						<Text size="12" weight="600" color="secondary">Sent</Text>
					</Flex>

					<Text size="13" weight="600" color="primary" mono>
						{{ mailbox.sent_messages }} <Text color="tertiary">messages</Text>
					</Text>
				</Flex>

				<Flex wide direction="column" gap="8" :class="[$style.card]">
					<Flex align="center" gap="4">
						<Icon name="arrow-narrow-up-right-circle" size="12" color="tertiary" style="transform: scale(1, -1)" />
						<Text size="12" weight="600" color="secondary">Received</Text>
					</Flex>

					<Text size="13" weight="600" color="primary" mono>
						{{ mailbox.received_messages }} <Text color="tertiary">messages</Text>
					</Text>
				</Flex>
			</Flex>

			<Flex wide justify="between" align="center" :class="[$style.card]">
				<Flex direction="column" gap="8">
					<Text size="12" weight="600" color="secondary">Owner</Text>

					<Flex align="center" gap="8">
						<Text size="13" weight="600" color="primary" mono :class="['overflow_ellipsis', $style.address_text]">
							{{ mailbox.owner.hash }}
						</Text>
						<CopyButton :text="mailbox.owner.hash" />
					</Flex>
				</Flex>
			</Flex>

			<Flex wide direction="column" gap="16" :class="$style.card">
				<Text size="12" weight="600" color="secondary">Details</Text>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">ID</Text>

					<Flex align="center" gap="6">
						<Text size="12" weight="600" color="primary" mono>
							{{ mailbox.mailbox.slice(0, 4).toUpperCase() }}
						</Text>
						<Flex align="center" gap="3">
							<div v-for="dot in 3" class="dot" />
						</Flex>
						<Text size="12" weight="600" color="primary" mono>
							{{ mailbox.mailbox.slice(-4).toUpperCase() }}
						</Text>
						<CopyButton :text="mailbox.mailbox" size="12" />
					</Flex>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Height</Text>

					<Text @click="handleNavigate(`/block/${mailbox.height}`)" size="12" weight="600" color="primary" mono class="clickable">
						{{ comma(mailbox.height) }}
					</Text>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Tx Hash</Text>

					<Flex @click="handleNavigate(`/tx/${transfer.tx_hash}`)" align="center" gap="6" class="clickable">
						<Text size="12" weight="600" color="primary" mono>
							{{ mailbox.tx_hash.slice(0, 4).toUpperCase() }}
						</Text>

						<Flex align="center" gap="3">
							<div v-for="dot in 3" class="dot" />
						</Flex>

						<Text size="12" weight="600" color="primary" mono>
							{{ mailbox.tx_hash.slice(-4).toUpperCase() }}
						</Text>

						<CopyButton :text="mailbox.tx_hash" size="12" />
					</Flex>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Created</Text>

					<Text size="12" weight="600" color="primary">
						{{ DateTime.fromISO(mailbox.time).setLocale("en").toFormat("LLL d, t") }}
						<Text color="tertiary"> ({{ DateTime.fromISO(mailbox.time).toRelative({ style: "short" }) }})</Text>
					</Text>
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
