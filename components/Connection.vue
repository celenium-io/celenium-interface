<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import Spinner from "@/components/ui/Spinner.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { suggestChain, getAccounts } from "@/services/keplr"

/** Store */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

const isWalletAvailable = ref(false)

const isFetchingAccounts = ref(true)
const account = ref()

onMounted(async () => {
	isWalletAvailable.value = !!window.keplr

	try {
		const accounts = await getAccounts()
		if (accounts.length) account.value = accounts[0].address
	} catch (error) {}
	isFetchingAccounts.value = false
})

const handleConnect = async () => {
	try {
		await suggestChain()
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

const test = async () => {
	const key = await window.keplr.getKey(OsmosisChainInfo.chainId)
	const protoMsgs = {
		typeUrl: "/cosmos.bank.v1beta1.MsgSend",
		value: MsgSend.encode({
			fromAddress: key.bech32Address,
			toAddress: recipient,
			amount: [
				{
					denom: "uosmo",
					amount: DecUtils.getTenExponentN(6).mul(new Dec(amount)).truncate().toString(),
				},
			],
		}).finish(),
	}

	try {
		await sendMsgs(window.keplr, OsmosisChainInfo, key.bech32Address, [protoMsgs], {
			amount: [{ denom: "uosmo", amount: "236" }],
			gas: Math.floor(gasUsed * 1.5).toString(),
		})
	} catch (e) {
		if (e instanceof Error) {
			console.log(e.message)
		}
	}
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

	<Button v-else @click="test" type="secondary" size="small">
		<Icon name="address" size="14" color="primary" />
		celestia ... {{ account.slice(-4) }}
	</Button>
</template>
