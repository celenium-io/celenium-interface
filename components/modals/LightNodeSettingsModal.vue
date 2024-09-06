<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"
import Toggle from "@/components/ui/Toggle.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import { Dropdown, DropdownItem, DropdownTitle } from "@/components/ui/Dropdown"

/** Services */
import amp from "@/services/amp"

/** Stores */
import { useNodeStore } from "@/store/node"
import { useNotificationsStore } from "@/store/notifications"
const nodeStore = useNodeStore()
const notificationsStore = useNotificationsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

onMounted(async () => {
	indexDBStores.value = await window.indexedDB.databases()
})

watch(
	() => nodeStore.settings.autostart,
	() => {
		amp.log(`sampling:${nodeStore.settings.autostart ? "enableAutostart" : "disableAutostart"}`)

		localStorage.setItem("nodeSettings", JSON.stringify(nodeStore.settings))
	},
)
watch(
	() => nodeStore.settings.charger,
	() => {
		amp.log(`sampling:${nodeStore.settings.charger ? "enableChargerRequirement" : "disableChargerRequirement"}`)

		localStorage.setItem("nodeSettings", JSON.stringify(nodeStore.settings))
	},
)

const handleSelectNetwork = (network) => {
	nodeStore.settings.network = network
}

const indexDBStores = ref([])

const handleDeleteIndexDBStore = (name) => {
	window.indexedDB.deleteDatabase(name)

	indexDBStores.value = indexDBStores.value.filter((s) => s.name !== name)
	notificationsStore.create({
		notification: {
			type: "success",
			icon: "check",
			title: `Request to delete ${name} sent`,
			description: "If such storage exists, the data will be deleted immediately",
			autoDestroy: true,
		},
	})
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="500" disableTrap :closeOutside="false">
		<Flex direction="column" gap="24">
			<Text size="14" weight="600" color="primary">Light Node Settings</Text>

			<Flex direction="column" gap="16">
				<Flex justify="between">
					<Flex direction="column" gap="6">
						<Text size="13" weight="600" color="primary">Light node autostart</Text>
						<Text size="12" weight="500" color="tertiary"> Automatically launch a node every time you visit the Celenium </Text>
					</Flex>

					<Toggle v-model="nodeStore.settings.autostart" />
				</Flex>

				<Flex justify="between" :class="$style.disabled">
					<Flex direction="column" gap="6">
						<Text size="13" weight="600" color="primary">Battery charger requiremenet</Text>
						<Text size="12" weight="500" color="tertiary">Prohibit node startup if no charger is connected on mobile</Text>
					</Flex>

					<Toggle v-model="nodeStore.settings.charger" :disabled="true" />
				</Flex>

				<Flex justify="between">
					<Flex direction="column" gap="6">
						<Tooltip position="start">
							<Flex align="center" gap="6">
								<Text size="13" weight="600" height="110" color="primary">Selected network</Text>
								<Icon name="info" size="12" color="tertiary" />
							</Flex>

							<template #content>
								<Flex align="start" direction="column" gap="6">
									<Text>The network change will not be saved. </Text>
									<Text> On each next visit to the site, the network is selected based on the current domain. </Text>
									<Text color="tertiary"> For example: mocha.celenium.io -> Mocha Network</Text>
								</Flex>
							</template>
						</Tooltip>
						<Text size="12" weight="500" color="tertiary">Test running a light node on other networks</Text>
					</Flex>

					<Dropdown>
						<template #trigger>
							<Button type="secondary" size="mini" style="text-transform: capitalize">
								{{ nodeStore.settings.network }}
							</Button>
						</template>

						<template #popup>
							<DropdownTitle>Networks</DropdownTitle>
							<DropdownItem v-for="network in ['Mainnet', 'Arabica', 'Mocha']" @click="handleSelectNetwork(network)">
								{{ network }}
							</DropdownItem>
						</template>
					</Dropdown>
				</Flex>

				<div :class="$style.divider" />

				<Flex justify="between">
					<Flex direction="column" gap="6">
						<Text size="13" weight="600" color="primary">Reset sync progress</Text>
						<Text size="12" weight="500" color="tertiary">Delete backward sync progress from IndexDB</Text>
					</Flex>

					<Dropdown :disabled="!indexDBStores.length">
						<template #trigger>
							<Button type="secondary" size="mini" :disabled="!indexDBStores.length">Clear Storage</Button>
						</template>

						<template #popup>
							<DropdownTitle>IndexDB Stores</DropdownTitle>
							<DropdownItem v-for="store in indexDBStores" @click="handleDeleteIndexDBStore(store.name)">
								{{ store.name }}
							</DropdownItem>
						</template>
					</Dropdown>
				</Flex>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.divider {
	width: 100%;
	height: 2px;

	background: var(--op-8);
}

.disabled {
	opacity: 0.3;
	pointer-events: none;
}
</style>
