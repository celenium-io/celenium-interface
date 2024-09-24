<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Utils */
import { connect, syncBalance, getAccounts, disconnect } from "~/services/wallet"
import { getNetworkName } from "@/services/utils/general"
import amp from "@/services/amp"

/** Store */
import { useAppStore } from "@/store/app"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const notificationsStore = useNotificationsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

watch(
	() => props.show,
	() => {},
)

const hasKeplr = ref(false)
const hasLeap = ref(false)

const address = ref("")

onMounted(() => {
	hasKeplr.value = !!window.keplr
	hasLeap.value = !!window.leap

	address.value = location.hostname
})

const handleConnect = async (target) => {
	window.wallet = window[target]

	try {
		await connect(JSON.parse(JSON.stringify(appStore.network)))

		const accounts = await getAccounts(appStore.network)
		if (accounts.length) {
			appStore.address = accounts[0].address
		}

		appStore.balance = await syncBalance(appStore.address)

		amp.log("connect")

		notificationsStore.create({
			notification: {
				type: "info",
				icon: "check",
				title: `Successfully connected via ${target.slice(0, 1).toUpperCase()}${target.slice(1)}`,
				autoDestroy: true,
			},
		})

		appStore.wallet = target

		emit("onClose")
	} catch (e) {
		amp.log("rejectConnect")

		console.log(e)
	}
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="400" disable-trap :closable="false">
		<Flex direction="column" gap="24" :class="$style.wrapper">
			<Flex align="center" direction="column" gap="12">
				<Text size="16" weight="600" color="primary">Connect Wallet</Text>

				<Flex align="center" gap="6">
					<Flex align="center" gap="4" :class="$style.network_badge">
						<Icon name="globe" size="12" color="black" />
						<Text size="12" weight="600" color="black">{{ getNetworkName() }}</Text>
					</Flex>
					<Flex align="center" gap="6" :class="$style.address_badge">
						<Text size="12" weight="600" color="primary">{{ address }}</Text>
					</Flex>
				</Flex>

				<Text size="13" weight="500" height="160" color="tertiary" align="center" style="max-width: 250px">
					By connecting your wallet, you agree to
					<a href="https://www.pklabs.me/terms" target="_blank"><Text color="secondary">Terms of Service</Text></a> and
					<a href="https://www.pklabs.me/privacy" target="_blank"><Text color="secondary">Privacy Policy</Text></a
					>.
				</Text>
			</Flex>

			<Flex direction="column" gap="8">
				<Text size="12" weight="600" color="secondary">Select Wallet</Text>

				<Flex align="center" gap="12">
					<Tooltip wide>
						<Flex @click="handleConnect('keplr')" wide align="center" justify="between" :class="$style.wallet">
							<Flex align="center" gap="12">
								<img src="@/assets/logos/keplr.png" />
								<Text size="14" weight="600" color="primary">Keplr Wallet</Text>
							</Flex>

							<Icon
								:name="hasKeplr ? 'check-circle' : 'arrow-narrow-up-right'"
								size="12"
								:color="hasKeplr ? 'brand' : 'secondary'"
							/>
						</Flex>

						<template #content>
							{{
								hasKeplr
									? "Keplr is found in your extensions and ready to connect."
									: "Keplr is not found in your extensions, install it."
							}}
						</template>
					</Tooltip>

					<Tooltip wide>
						<Flex @click="handleConnect('leap')" wide align="center" justify="between" :class="$style.wallet">
							<Flex align="center" gap="12">
								<img src="@/assets/logos/leap.png" />
								<Text size="14" weight="600" color="primary">Leap Wallet</Text>
							</Flex>

							<Icon
								:name="hasLeap ? 'check-circle' : 'arrow-narrow-up-right'"
								size="12"
								:color="hasLeap ? 'brand' : 'secondary'"
							/>
						</Flex>

						<template #content>
							{{
								hasLeap
									? "Leap is found in your extensions and ready to connect."
									: "Leap is not found in your extensions, install it."
							}}
						</template>
					</Tooltip>
				</Flex>
			</Flex>

			<Flex direction="column" gap="8">
				<Text size="12" weight="600" color="secondary">By continue</Text>

				<Flex direction="column" gap="6">
					<Flex align="center" gap="8" :class="$style.hint">
						<Icon name="check-circle" size="12" color="brand" />
						<Text size="12" weight="500" color="secondary"> You grant access to your wallet balance</Text>
					</Flex>
					<Flex align="center" gap="8" :class="$style.hint">
						<Icon name="check-circle" size="12" color="brand" />
						<Text size="12" weight="500" color="secondary">You will receive requests to sign transactions</Text>
					</Flex>
					<Flex align="center" gap="8" :class="$style.hint">
						<Icon name="close-circle" size="12" color="secondary" />
						<Text size="12" weight="500" color="secondary">We can't move funds without your permission</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex gap="8">
				<Icon name="info" size="12" color="tertiary" />

				<Flex direction="column" gap="6">
					<Text size="12" weight="500" color="tertiary"> Double-check the website address </Text>
					<Text size="12" weight="500" color="support"> before connecting your wallet on Mainnet. </Text>
				</Flex>
			</Flex>

			<Button @click="emit('onClose')" wide type="tertiary" size="small">Cancel</Button>
		</Flex>
	</Modal>
</template>

<style module>
.wrapper {
	margin-top: 8px;
}

.network_badge {
	background: var(--brand);
	border-radius: 6px;

	padding: 6px;
}
.address_badge {
	background: var(--op-5);
	border-radius: 6px;

	padding: 6px;
}

.wallet {
	background: linear-gradient(var(--op-5), var(--op-3));
	box-shadow: inset 0 0 0 1px var(--op-5);
	border-radius: 8px;
	cursor: pointer;

	padding: 8px;

	& img {
		width: 24px;
		height: 24px;
	}

	transition: all 0.2s ease;

	&:hover {
		box-shadow: inset 0 0 0 1px var(--op-10);
	}
}

.hint {
	width: fit-content;

	border-radius: 6px;
	background: var(--op-5);

	padding: 6px;
}

.field {
	display: grid;
	grid-template-columns: 1fr 1fr;
}
</style>
