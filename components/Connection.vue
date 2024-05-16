<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import Spinner from "@/components/ui/Spinner.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/Dropdown"

/** Services */
import amp from "@/services/amp"
import { suggestChain, getAccounts, disconnect } from "@/services/keplr"
import { arabica, mocha, mainnet } from "@/services/chains"

/** API */
import { fetchAddressByHash } from "@/services/api/address"

/** Store */
import { useAppStore } from "@/store/app"
import { useModalsStore } from "@/store/modals"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const modalsStore = useModalsStore()
const notificationsStore = useNotificationsStore()

const router = useRouter()

const isWalletAvailable = ref(false)
const isFetchingAccounts = ref(false)

const { hostname } = useRequestURL()

switch (hostname) {
	case "celenium.io":
	case "dev.celenium.io":
		appStore.network = mainnet
		break

	case "arabica.celenium.io":
	case "localhost":
		appStore.network = arabica
		break

	case "mocha.celenium.io":
	case "mocha-4.celenium.io":
		appStore.network = mocha
		break
}

const getBalance = async () => {
	const key = await window.keplr.getKey(appStore.network.chainId)

	if (key) {
		const { data } = await fetchAddressByHash(key.bech32Address)

		if (data.value?.balance) {
			appStore.balance = parseFloat(data.value.balance.spendable / 1_000_000) || 0
		}
	}
}

onMounted(async () => {
	isWalletAvailable.value = !!window.keplr
})

const handleConnect = async () => {
	try {
		await suggestChain(appStore.network)

		isFetchingAccounts.value = true

		const accounts = await getAccounts(appStore.network)
		if (accounts.length) {
			appStore.address = accounts[0].address
		}

		getBalance()

		isFetchingAccounts.value = false

		amp.log("connect")
	} catch (error) {
		amp.log("rejectConnect")

		switch (error.message) {
			case "Request rejected":
				notificationsStore.create({
					notification: {
						type: "info",
						icon: "close",
						title: "Request rejected",
						description: "You canceled the Keplr wallet request",
						autoDestroy: true,
					},
				})
				break
		}
	}
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
	<Tooltip v-if="isFetchingAccounts" position="end">
		<Button type="secondary" size="small" disabled>
			<Spinner size="14" />
			Fetching
		</Button>

		<template #content>
			<Flex direction="column" align="end" gap="6">
				<Text>Receiving your accounts </Text>
				<Text color="tertiary" height="120" align="right" style="max-width: 200px">
					It's stuck? Try disabling the connection through your wallet and refresh the page
				</Text>
				<Text color="tertiary" height="120" align="right" style="max-width: 200px">
					Sometimes the wallet pop-up may hide behind the browser window
				</Text>
			</Flex>
		</template>
	</Tooltip>

	<Tooltip v-else-if="!isWalletAvailable" position="end">
		<Button type="white" size="small" disabled> Connect </Button>

		<template #content> Install Keplr Wallet before connection </template>
	</Tooltip>

	<Button v-else-if="!appStore.address" @click="handleConnect" type="white" size="small"> Connect </Button>

	<Dropdown v-else>
		<Button type="secondary" size="small">
			<Icon name="address" size="14" color="primary" />
			{{ appStore.balance }} TIA
		</Button>

		<template #popup>
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
			<DropdownItem @click="handleDisconnect">Disconnect</DropdownItem>
		</template>
	</Dropdown>
</template>
