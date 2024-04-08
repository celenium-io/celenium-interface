<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import Spinner from "@/components/ui/Spinner.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/Dropdown"

/** Services */
import { suggestChain, getAccounts, disconnect } from "@/services/keplr"

/** Store */
import { useAppStore } from "@/store/app"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const notificationsStore = useNotificationsStore()

const isWalletAvailable = ref(false)
const isFetchingAccounts = ref(false)
const account = ref()

const getBalance = async () => {
	const key = await window.keplr.getKey("arabica-11")

	if (key) {
		const uri = `https://api.celestia-arabica-11.com/cosmos/bank/v1beta1/balances/${key.bech32Address}?pagination.limit=1000`

		const data = await $fetch(uri)
		const celestiaBalance = data.balances.find((balance) => balance.denom === "utia")

		appStore.balance = parseFloat(celestiaBalance.amount / 1_000_000) || 0
	}
}

onMounted(async () => {
	isWalletAvailable.value = !!window.keplr
})

const handleConnect = async () => {
	try {
		await suggestChain()

		isFetchingAccounts.value = true

		const accounts = await getAccounts()
		if (accounts.length) {
			account.value = accounts[0].address
			appStore.address = accounts[0].address
		}

		getBalance()

		isFetchingAccounts.value = false
	} catch (error) {
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

	account.value = null
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

		<template #content> Insall Keplr Wallet before connection </template>
	</Tooltip>

	<Button v-else-if="!account" @click="handleConnect" type="white" size="small"> Connect </Button>

	<Dropdown v-else>
		<Button type="secondary" size="small">
			<Icon name="address" size="14" color="primary" />
			{{ appStore.balance }} TIA
		</Button>

		<template #popup>
			<DropdownItem @click="handleCopy(appStore.address)">
				<Flex direction="column" gap="6">
					<Text>Copy address</Text>
					<Text size="12" color="tertiary">celestia...{{ appStore.address.slice(-4) }}</Text>
				</Flex>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem @click="handleDisconnect">Disconnect</DropdownItem>
		</template>
	</Dropdown>
</template>
