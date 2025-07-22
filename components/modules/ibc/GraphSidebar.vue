<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Components */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { abbreviate, comma } from "@/services/utils"

/** Constants */
import { IbcChainName } from "@/services/constants/ibc"

/** API */
import { fetchIbcClients, fetchIbcTransfers } from "@/services/api/ibc"

/** Store */
import { useModalsStore } from "@/store/modals.store"
import { useCacheStore } from "@/store/cache.store"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	chain: {
		type: Object,
		default: {},
	},
})

const associatedClients = ref()
const latestTransfers = ref()

const getChainClients = async () => {
	const data = await fetchIbcClients({ chain_id: props.chain.name })
	associatedClients.value = data
}

const getChainTransfers = async () => {
	const data = await fetchIbcTransfers({ limit: 3, chain_id: props.chain.name })
	latestTransfers.value = data
	latestTransfers.value.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
}

const handleOpenTransferModal = (transfer) => {
	cacheStore.current.transfer = transfer
	modalsStore.open("ibcTransfer")
}

const handleOpenClientModal = (client) => {
	cacheStore.current.client = client
	modalsStore.open("ibcClient")
}

watch(
	() => props.chain,
	() => {
		getChainClients()
		getChainTransfers()
	},
)
onMounted(() => {
	getChainClients()
	getChainTransfers()
})
</script>

<template>
	<Flex direction="column" justify="between" :class="$style.wrapper">
		<Flex direction="column" gap="24" :class="$style.body">
			<Flex align="center" gap="12">
				<img :src="chain.image" width="32" height="32" />

				<Flex direction="column" gap="6">
					<Flex align="center" gap="4">
						<Text size="13" weight="600" color="primary">
							{{ IbcChainName[chain.name] ?? "Unknown Chain" }}
						</Text>
						<Icon v-if="chain.known" name="verified" size="12" color="brand" />
					</Flex>
					<Text size="12" weight="500" color="tertiary" mono>
						{{ chain.name }}
					</Text>
				</Flex>
			</Flex>

			<Flex direction="column" gap="10">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary"> Flow </Text>
					<Text size="12" weight="600" color="secondary" mono> {{ abbreviate(chain.raw.flow / 1_000_000) }} TIA</Text>
				</Flex>

				<Flex gap="6" :class="$style.flow_bar">
					<div :style="{ width: `${(chain.raw.sent * 100) / chain.raw.flow}%` }" :class="$style.sent_bar" />
					<div :style="{ width: `${(chain.raw.received * 100) / chain.raw.flow}%` }" :class="$style.received_bar" />
				</Flex>

				<Flex align="center" justify="between">
					<Tooltip position="start">
						<Flex align="center" gap="4">
							<Icon name="arrow-narrow-up-right-circle" size="12" color="green" />
							<Text size="12" weight="600" color="secondary" mono>
								{{ Number(chain.raw.flow) ? ((chain.raw.sent * 100) / chain.raw.flow).toFixed(0) : 50 }}%
								<Text color="tertiary"> {{ abbreviate(chain.raw.sent / 1_000_000) }} TIA </Text>
							</Text>
						</Flex>

						<template #content> Sent funds </template>
					</Tooltip>

					<Tooltip>
						<Flex align="center" gap="4">
							<Text size="12" weight="600" color="secondary" mono>
								<Text color="tertiary"> {{ abbreviate(chain.raw.received / 1_000_000) }} TIA </Text>
								{{ Number(chain.raw.flow) ? ((chain.raw.received * 100) / chain.raw.flow).toFixed(0) : 50 }}%
							</Text>
							<Icon name="arrow-narrow-up-right-circle" size="12" color="purple" style="transform: scale(1, -1)" />
						</Flex>

						<template #content> Received funds </template>
					</Tooltip>
				</Flex>
			</Flex>

			<Flex direction="column" gap="10">
				<Text size="12" weight="600" color="tertiary">Latest transfers</Text>

				<template v-if="latestTransfers?.length">
					<Outline
						v-for="transfer in latestTransfers"
						@click="handleOpenTransferModal(transfer)"
						wide
						height="32"
						padding="8"
						radius="6"
					>
						<Flex wide align="center" justify="between">
							<Flex align="center" gap="8">
								<Icon name="zap" size="14" color="tertiary" />

								<Text v-if="transfer.amount / 1_000_000 < 0.01" size="13" weight="600" color="tertiary" mono>
									< 0.01 TIA
								</Text>
								<Text v-else size="13" weight="600" color="primary" mono>
									{{ comma(transfer.amount / 1_000_000) }} <Text color="tertiary">TIA</Text>
								</Text>
							</Flex>

							<Text size="12" weight="600" color="tertiary">
								{{ DateTime.fromISO(transfer.time).toRelative({ style: "short" }) }}
							</Text>
						</Flex>
					</Outline>
				</template>
				<Text v-else size="12" weight="500" color="tertiary" class="overflow_ellipsis">
					There is no transfers for {{ chain.name }}
				</Text>
			</Flex>

			<Flex direction="column" gap="10">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">Associated clients</Text>
					<Text size="12" weight="600" color="secondary">{{ associatedClients?.length }}</Text>
				</Flex>

				<template v-if="associatedClients">
					<Outline
						v-for="client in associatedClients"
						@click="handleOpenClientModal(client)"
						wide
						height="32"
						padding="8"
						radius="6"
					>
						<Flex wide align="center" justify="between">
							<Flex align="center" gap="8">
								<Icon name="address" size="14" color="tertiary" />
								<Text size="13" weight="600" color="primary">
									{{ client.id }}
								</Text>
							</Flex>

							<Text size="12" weight="600" color="tertiary">
								{{ DateTime.fromISO(client.updated_at).toRelative({ style: "short" }) }}
							</Text>
						</Flex>
					</Outline>
				</template>
				<Text v-else size="12" weight="500" color="tertiary" class="overflow_ellipsis">
					There is no clients for {{ chain.name }}
				</Text>
			</Flex>
		</Flex>

		<div :class="$style.gradient" />

		<Flex direction="column" gap="8" :class="$style.buttons">
			<Button :link="`/ibc/chain/${chain.name}`" type="secondary" size="small"> Explore more </Button>
			<Button @click="emit('onClose')" type="tertiary" size="small"> Close </Button>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;

	min-width: 350px;
	max-width: 350px;
	max-height: 500px;

	background: var(--card-background);
	border-left: 4px solid var(--app-background);

	padding: 16px;
}

.body {
	overflow: auto;

	padding-bottom: 20px;

	&::-webkit-scrollbar {
		display: none;
	}
}

.gradient {
	position: absolute;
	bottom: 92px;
	left: 0;
	right: 0;
	height: 16px;

	pointer-events: none;
	background: linear-gradient(transparent, var(--card-background));
}

.buttons {
	padding-top: 12px;
}

.flow_bar {
	width: 100%;
	height: 12px;

	border-radius: 50px;
	background: var(--op-8);

	padding: 4px;
}

.sent_bar {
	min-width: 3%;
	height: 100%;

	background: var(--green);
	border-radius: 50px;
}

.received_bar {
	min-width: 3%;
	height: 100%;

	background: var(--purple);
	border-radius: 4px;
}
</style>
