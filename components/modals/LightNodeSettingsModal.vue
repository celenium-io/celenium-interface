<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"
import Toggle from "@/components/ui/Toggle.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import { Dropdown, DropdownItem, DropdownTitle } from "@/components/ui/Dropdown"

/** Services */
import amp from "@/services/amp"
import { StatusMap } from "@/services/constants/node.js"

/** Stores */
import { useNodeStore } from "@/store/node"
import { useNotificationsStore } from "@/store/notifications"
const nodeStore = useNodeStore()
const notificationsStore = useNotificationsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const status = computed(() => nodeStore.status)

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

const hasWrongBootnode = ref(false)
const bootnodesTerm = ref()
const isBootnodesChanged = ref(false)

const textareaEl = ref()
const resizeTextarea = () => {
	textareaEl.value.style.height = "auto"
	textareaEl.value.style.height = 12 + textareaEl.value.scrollHeight + "px"
}
const handleTextareaKeyup = (e) => {
	e.stopPropagation()
	resizeTextarea()
	if (!/^[a-z0-9]+$/i.test(e.key) || e.key.length !== 1) return

	const newBootnodes = bootnodesTerm.value.split("\n").filter((b) => b.length)
	newBootnodes.forEach((b) => {
		hasWrongBootnode.value = !b.startsWith("/") || b.split("/").filter((b) => b.length).length !== 4
	})

	nodeStore.bootnodes = newBootnodes

	if (!isBootnodesChanged.value) isBootnodesChanged.value = true
}

const handleRevertBootnodesChanges = () => {
	isBootnodesChanged.value = false

	nodeStore.bootnodes = nodeStore.rawBootnodes
	bootnodesTerm.value = nodeStore.bootnodes.join("\n")
	hasWrongBootnode.value = false

	setTimeout(() => resizeTextarea(), 0)
}

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

watch(
	() => props.show,
	async () => {
		if (props.show) {
			bootnodesTerm.value = nodeStore.bootnodes.join("\n")

			await nextTick()

			resizeTextarea()
		}
	},
)
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

				<!-- <Flex justify="between" :class="$style.disabled">
					<Flex direction="column" gap="6">
						<Text size="13" weight="600" color="primary">Battery charger requiremenet</Text>
						<Text size="12" weight="500" color="tertiary">Prohibit node startup if no charger is connected on mobile</Text>
					</Flex>

					<Toggle v-model="nodeStore.settings.charger" :disabled="true" />
				</Flex> -->

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

				<div :class="$style.divider" />

				<Flex direction="column" gap="12">
					<Text size="13" weight="600" color="primary">Bootnodes</Text>

					<textarea
						ref="textareaEl"
						v-model="bootnodesTerm"
						@keyup="handleTextareaKeyup"
						autocomplete="false"
						spellcheck="false"
						:class="[$style.bootnodes_container, status === StatusMap.Started && $style.disabled]"
					>
					</textarea>

					<Flex align="center" justify="between" wide>
						<Flex align="center" gap="4">
							<Icon name="info" size="12" :color="hasWrongBootnode ? 'yellow' : 'tertiary'" />

							<Text v-if="!hasWrongBootnode" size="12" weight="600" color="tertiary"> Each address on a new line. </Text>
							<Text v-else size="12" weight="600" color="yellow"> Specified bootnodes contains an error </Text>

							<Text v-if="status === StatusMap.Started" size="12" weight="600" color="tertiary"> Editing disabled. </Text>
						</Flex>

						<Flex
							v-if="isBootnodesChanged"
							@click="handleRevertBootnodesChanges"
							align="center"
							gap="4"
							style="cursor: pointer"
						>
							<Icon name="revert" size="12" color="primary" />
							<Text size="12" weight="600" color="secondary"> Revert to default</Text>
						</Flex>
					</Flex>
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

.bootnodes_container {
	all: unset;

	font-size: 12px;
	line-height: 100%;
	font-weight: 500;
	color: var(--txt-secondary);
	white-space: nowrap;

	&.disabled {
		pointer-events: none;

		color: var(--txt-tertiary);
	}
}
</style>
