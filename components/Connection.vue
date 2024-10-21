<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownTitle, DropdownItem, DropdownDivider } from "@/components/ui/Dropdown"

/** Services */
import amp from "@/services/amp"
import { disconnect } from "~/services/wallet"
import { arabica, mocha, mainnet } from "@/services/chains"

/** Store */
import { useAppStore } from "@/store/app"
import { useModalsStore } from "@/store/modals"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const modalsStore = useModalsStore()
const notificationsStore = useNotificationsStore()

const router = useRouter()

const { hostname } = useRequestURL()

switch (hostname) {
	case "celenium.io":
		// case "dev.celenium.io":
		appStore.network = mainnet
		break

	case "mocha.celenium.io":
	case "mocha-4.celenium.io":
		appStore.network = mocha
		break

	// case "arabica.celenium.io":
	// case "localhost":
	default:
		appStore.network = arabica
		break
}

const handleConnect = async () => {
	modalsStore.open("connect")
}

const handleCopy = (target) => {
	window.navigator.clipboard.writeText(target)

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully copied to clipboard",
			autoDestroy: true,
		},
	})
}

const handleChangeWallet = () => {
	modalsStore.open("connect")
}

const handleDisconnect = () => {
	disconnect()

	amp.log("disconnect")

	appStore.address = ""
	appStore.balance = 0

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully disconnected",
			autoDestroy: true,
		},
	})
}
</script>

<template>
	<Button v-if="!appStore.address" @click="handleConnect" type="white" size="mini"> Connect </Button>

	<Dropdown v-else>
		<Button type="secondary" size="mini">
			<Icon name="address" size="13" color="primary" />
			{{ appStore.balance }} TIA
		</Button>

		<template #popup>
			<DropdownTitle style="text-transform: capitalize">{{ appStore.wallet }} Wallet</DropdownTitle>
			<DropdownItem @click="modalsStore.open('send')">Send TIA</DropdownItem>
			<DropdownItem @click="modalsStore.open('pfb')">Submit Blob</DropdownItem>
			<DropdownDivider />
			<DropdownItem @click="router.push(`/address/${appStore.address}`)">
				<Flex direction="column" gap="6">
					<Text>Open my address</Text>
					<Text size="12" color="tertiary">celestia...{{ appStore.address.slice(-4) }}</Text>
				</Flex>
			</DropdownItem>
			<DropdownItem @click="handleCopy(appStore.address)">
				<Text>Copy address</Text>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem @click="handleChangeWallet">Change wallet</DropdownItem>
			<DropdownItem @click="handleDisconnect">Disconnect</DropdownItem>
		</template>
	</Dropdown>
</template>
