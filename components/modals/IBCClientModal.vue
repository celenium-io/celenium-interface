<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Components */
import ConnectionCard from "@/components/modules/ibc/ConnectionCard"

/** Services */
import { comma } from "@/services/utils"
import { IbcChainName } from "@/services/constants/ibc"

/** API */
import { fetchIbcConnections } from "@/services/api/ibc"

/** Stores */
import { useAppStore } from "@/store/app.store"
import { useCacheStore } from "@/store/cache.store"
const appStore = useAppStore()
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const client = computed(() => cacheStore.current.client)

const connections = ref([])

const getConnections = async () => {
	connections.value = await fetchIbcConnections({ client_id: client.value.id })
}

watch(
	() => props.show,
	async () => {
		if (props.show) {
			await getConnections()
		} else {
			connections.value = []
		}
	},
)

const handleNavigate = (target) => {
	emit("onClose")
	navigateTo(target)
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="500" disable-trap>
		<Flex align="center" direction="column" gap="16">
			<Flex wide align="center" gap="6">
				<Icon name="address" size="14" color="primary" />
				<Text size="14" weight="600" color="primary">IBC Client</Text>
			</Flex>

			<Flex wide gap="8" :class="$style.card">
				<Icon name="address" size="16" color="secondary" :class="$style.icon" />

				<Flex direction="column" gap="4">
					<Text size="12" weight="600" color="primary">
						{{ client.id }}
					</Text>
					<Text size="12" weight="600" color="tertiary" mono>
						{{ client.type }}
					</Text>
				</Flex>
			</Flex>

			<Flex wide direction="column" gap="16" :class="$style.card">
				<Text size="12" weight="600" color="secondary">Details</Text>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Chain</Text>
					<Text size="12" weight="600" color="primary">
						{{ IbcChainName[client.chain_id] ? IbcChainName[client.chain_id] : "Unknown Chain" }}
						<Text color="tertiary" mono>({{ client.chain_id }})</Text>
					</Text>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Updated at</Text>

					<Tooltip position="end">
						<Text size="12" weight="600" color="primary">
							{{ DateTime.fromISO(client.updated_at).toRelative() }}
						</Text>

						<template #content> {{ DateTime.fromISO(client.updated_at).setLocale("en").toFormat("LLL d, t") }}</template>
					</Tooltip>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Created at</Text>

					<Tooltip position="end">
						<Text size="12" weight="600" color="primary">
							{{ DateTime.fromISO(client.created_at).toRelative() }}
						</Text>

						<template #content> {{ DateTime.fromISO(client.created_at).setLocale("en").toFormat("LLL d, t") }}</template>
					</Tooltip>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Height</Text>
					<Text @click="handleNavigate(`/block/${client.height}`)" size="12" weight="600" color="primary" class="clickable">
						{{ comma(client.height) }}
					</Text>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Created by</Text>

					<Flex @click="handleNavigate(`/address/${client.creator.hash}`)" align="center" gap="6" class="clickable">
						<Text size="12" weight="600" color="primary" mono>celestia</Text>
						<Flex align="center" gap="4">
							<div v-for="dot in 3" class="dot" />
						</Flex>
						<Text size="12" weight="600" color="primary" mono>
							{{ client.creator.hash.slice(-4) }}
						</Text>
					</Flex>
				</Flex>

				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Known connections</Text>
					<Text size="12" weight="600" color="primary">
						{{ client.connection_count }}
					</Text>
				</Flex>
			</Flex>

			<Flex wide direction="column" gap="8">
				<Text size="12" weight="600" color="secondary">Client connections</Text>
				<ConnectionCard v-for="connection in connections" :connection @onClose="emit('onClose')" />
			</Flex>

			<Flex wide direction="column" gap="8">
				<Button @click="emit('onClose')" wide type="tertiary" size="small">Close</Button>
			</Flex>
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

.icon {
	border-radius: 50px;
	border: 2px solid var(--op-5);
	box-sizing: content-box;

	padding: 2px;
}
</style>
