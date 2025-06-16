<script setup>
/** Vendor */
import { Dec, DecUtils } from "@keplr-wallet/unit"

/** UI */
import Modal from "@/components/ui/Modal.vue"
import Input from "@/components/ui/Input.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"

/** API */
import { search } from "@/services/api/search"

/** Services */
import amp from "@/services/amp"
import { normalizeAmount, purgeNumber, comma } from "@/services/utils/amounts"
import { SIMULATE_ADDRESS_FROM, SIMULATE_VALIDATOR, simulateMsgs, sendMsgs } from "@/services/wallet"
import { MsgDelegate } from "@/services/proto/gen/staking"

/** Store */
import { useAppStore } from "@/store/app.store"
import { useModalsStore } from "@/store/modals.store"
import { useCacheStore } from "@/store/cache.store"
import { useNotificationsStore } from "@/store/notifications.store"
const appStore = useAppStore()
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()
const notificationsStore = useNotificationsStore()

const { hostname } = useRequestURL()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const MAX_DIGITS = 6

const inputEl = ref()

const amount = ref()
const amountInUSD = computed(() => {
	if (!amount.value || !parseFloat(appStore.currentPrice.close)) return 0

	const rawAmount = parseFloat(amount.value?.replaceAll(" ", ""))
	return rawAmount * parseFloat(appStore.currentPrice.close)
})

const address = ref()
const addressError = ref("")
const addressSuccess = ref(false)
const isAddressNotFound = ref(false)

const estimatedGasLimit = ref(0)
const customGasLimit = ref(0)
const gasLimitItems = ref([
	{
		icon: "zap",
		name: "Estimated",
	},
	{
		icon: "edit",
		name: "Custom",
	},
])
const selectedGasLimit = ref(gasLimitItems.value[0].name)

const gasFeeItems = ref([
	{
		name: "Fast",
	},
	{
		name: "Median",
	},
	{
		name: "Slow",
	},
])
const selectedGasFee = ref(gasFeeItems.value[0].name)

const handleAmountInput = (e) => {
	if (!amount.value.length) amount.value = ""

	const normalizedAmount = normalizeAmount(amount.value, appStore.balance, appStore.balance.toString())
	if (typeof normalizedAmount === "string") {
		amount.value = normalizedAmount
		return
	}

	amount.value = purgeNumber(amount.value)
}

const handleAmountBlur = () => {
	amount.value = comma(amount.value, " ", MAX_DIGITS)
}

const handleGasLimitInput = (e) => {
	if (!customGasLimit.value.length) customGasLimit.value = ""

	const normalizedAmount = normalizeAmount(customGasLimit.value, 1_000_000_000, "1 000 000 000")
	if (typeof normalizedAmount === "string") {
		customGasLimit.value = normalizedAmount
		return
	}

	customGasLimit.value = comma(purgeNumber(customGasLimit.value), " ", MAX_DIGITS)
}

watch(
	() => selectedGasLimit.value,
	() => {
		switch (selectedGasLimit.value) {
			case "Estimated":
				runGasLimitEstimation()
				break

			case "Custom":
				break
		}
	},
)

watch(
	() => address.value,
	async () => {
		if (!address.value) return

		isAddressNotFound.value = false

		if (!address.value.startsWith("celestiavaloper") || address.value.length !== 54) {
			addressError.value = "Validation error"
			return
		}

		if (address.value === appStore.address) {
			addressError.value = "Destination is your own wallet"
			return
		}

		if (address.value.startsWith("celestiavaloper") && address.value.length === 54) {
			addressSuccess.value = true

			const { data } = await search(address.value)
			if (!data.value.length) {
				isAddressNotFound.value = true
				return
			}

			runGasLimitEstimation()
		} else {
			addressSuccess.value = false
		}

		addressError.value = ""
	},
)

watch(
	() => appStore.address,
	() => {
		if (props.show) {
			runGasLimitEstimation()
		}
	},
)

const calcGasFee = (target) => {
	const gasLimit = typeof estimatedGasLimit.value === "number" ? estimatedGasLimit.value : estimatedGasLimit.value.replaceAll(" ", "")
	return comma((gasLimit * appStore.gas[target.toLowerCase()]).toFixed(2))
}

const runGasLimitEstimation = async () => {
	const protoMsgs = {
		typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
		value: MsgDelegate.encode({
			delegatorAddress: appStore.address ? appStore.address : SIMULATE_ADDRESS_FROM,
			validatorAddress: address.value ? address.value : SIMULATE_VALIDATOR,
			amount: {
				denom: "utia",
				amount: DecUtils.getTenExponentN(6).mul(new Dec(1)).truncate().toString(),
			},
		}).finish(),
	}

	const gasUsed = await simulateMsgs(
		appStore.network,
		appStore.address ? appStore.address : SIMULATE_ADDRESS_FROM,
		[protoMsgs],
		[{ denom: "utia", amount: "1" }],
	)
	estimatedGasLimit.value = parseInt(gasUsed)
}

const warningBannerText = ref("")

const isAwaiting = ref(false)

watch(
	() => props.show,
	async () => {
		if (props.show) {
			amp.log("showStakingModal")

			if (!appStore.address?.length) {
				warningBannerText.value = "Wallet connection is required to delegate."
			} else if (hostname !== "celenium.io") {
				warningBannerText.value = `You are currently on ${hostname}. The transaction will be performed on the test network.`
			} else {
				warningBannerText.value = ``
			}

			if (cacheStore.current.validator) {
				address.value = cacheStore.current.validator.address?.hash
			}

			nextTick(() => {
				inputEl.value.inputEl.focus()
			})
		} else {
			amount.value = 0
			address.value = null
			selectedGasLimit.value = "Estimated"
			customGasLimit.value = 0
		}
	},
)

const handleConnect = async () => {
	modalsStore.open("connect")
}

const continueButton = computed(() => {
	if (addressError.value.length) {
		return {
			title: "Validator address is invalid",
			disable: true,
		}
	}

	if (!address.value?.length) {
		return {
			title: "Enter the validator address",
			disable: true,
		}
	}

	if (parseFloat(amount.value) === 0) {
		return {
			title: "Enter the amount",
			disable: true,
		}
	}

	if (
		!(
			(selectedGasLimit.value === "Estimated" && estimatedGasLimit.value) ||
			(selectedGasLimit.value === "Custom" && customGasLimit.value)
		)
	) {
		return {
			title: "Define the gas limit",
			disable: true,
		}
	}

	if (isAwaiting.value) {
		return {
			title: "Awating...",
			disable: true,
		}
	}
	return {
		title: "Delegate",
		disable: false,
	}
})

const handleContinue = async () => {
	const key = await window.wallet?.getKey(appStore.network.chainId)

	const proto = [
		{
			typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
			value: MsgDelegate.encode({
				delegatorAddress: appStore.address,
				validatorAddress: address.value,
				amount: {
					denom: "utia",
					amount: DecUtils.getTenExponentN(6)
						.mul(new Dec(parseFloat(amount.value)))
						.truncate()
						.toString(),
				},
			}).finish(),
		},
	]
	const stdFee = {
		amount: [
			{
				denom: "utia",
				amount: 0,
			},
		],
		gas: selectedGasLimit.value === "Custom" ? customGasLimit.value.replaceAll(" ", "") : estimatedGasLimit.value,
	}

	try {
		isAwaiting.value = true
		const txHash = await sendMsgs(appStore.network, key.bech32Address, proto, stdFee)
		isAwaiting.value = false

		amp.log("successfulDelegate")

		cacheStore.tx.hash = txHash
		cacheStore.tx.from = appStore.address
		cacheStore.tx.to = address.value
		cacheStore.tx.amount = amount.value
		cacheStore.tx.network = appStore.network
		cacheStore.tx.ts = new Date().getTime()
		cacheStore.tx.type = "staking"

		modalsStore.open("awaiting")
	} catch (e) {
		isAwaiting.value = false

		amp.log("failedDelegate")

		if (e.message.startsWith("Request rejected")) {
			notificationsStore.create({
				notification: {
					type: "warning",
					icon: "danger",
					title: `The request in Kepler was denied`,
					autoDestroy: true,
				},
			})
			return
		}

		if (e.message.startsWith("out of gas")) {
			notificationsStore.create({
				notification: {
					type: "warning",
					icon: "danger",
					title: `Not enough gas`,
					description: `Try using estimated gas or manually enter custom value`,
					autoDestroy: true,
				},
			})
			return
		}

		notificationsStore.create({
			notification: {
				type: "warning",
				icon: "danger",
				title: `Something went wrong`,
				description: e.message,
				autoDestroy: true,
			},
		})
	}
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="500" disable-trap>
		<Flex direction="column" gap="24">
			<Text size="14" weight="600" color="primary">Delegate</Text>

			<Flex direction="column" gap="24">
				<Flex align="center" gap="12" :class="$style.wallet">
					<Icon name="address" size="16" color="secondary" />

					<Flex direction="column" gap="6" :class="$style.metadata">
						<Text size="14" weight="600" color="primary">
							{{ appStore.balance }} TIA
							<Text size="13" weight="500" color="secondary">
								${{ (appStore.balance * parseFloat(appStore.currentPrice.close)).toFixed(2) }}
							</Text>
						</Text>

						<Text v-if="appStore.address" size="12" weight="500" color="tertiary" :selectable="true">
							{{ appStore.address }}
						</Text>
						<Text v-else size="12" weight="500" color="yellow" :selectable="true"> Connect with your wallet to delegate</Text>
					</Flex>

					<div :class="[$style.auth_line, appStore.address && $style.anim]" />

					<Flex direction="column" justify="between" :class="[$style.bg, !appStore.address && $style.unauth]">
						<Flex v-for="i in 8" align="center" justify="between">
							<div
								v-for="j in 50"
								:class="$style.circle"
								:style="{
									'--start': `${(Math.random() * 10) / 100}`,
									'--end': `${(Math.random() * (90 - 10)) / 100}`,
									'--delay': `${Math.random() * 2}s`,
								}"
							/>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" gap="8">
					<Input
						v-model="amount"
						@input="handleAmountInput"
						@blur="handleAmountBlur"
						label="Amount"
						placeholder="0.00"
						ref="inputEl"
						suffix="TIA"
						autofocus
						disable-paste
						:disabled="!appStore.address?.length"
					>
						<template #rightText>
							<Text size="12" weight="600" color="secondary"> ${{ comma(amountInUSD) }} </Text>
						</template>
					</Input>
				</Flex>

				<Flex direction="column" gap="8">
					<Input v-model="address" label="Validator" placeholder="Validator address" ref="inputEl">
						<template #rightText>
							<Flex v-if="addressError.length" align="center" gap="4">
								<Icon name="danger" size="12" color="yellow" />
								<Text size="12" weight="600" color="yellow">{{ addressError }}</Text>
							</Flex>
							<Icon v-else-if="addressSuccess" name="check-circle" size="12" color="green" />
							<Text v-else />
						</template>
					</Input>

					<Flex v-if="isAddressNotFound" align="center" gap="4">
						<Icon name="danger" size="12" color="red" />
						<Text size="12" weight="500" color="tertiary"> This address is not found, you can't delegate </Text>
					</Flex>
				</Flex>

				<div :class="$style.divider" />

				<Flex direction="column" gap="8">
					<Flex align="center" gap="4">
						<Text size="12" weight="600" color="secondary">Gas Limit</Text>
						<Icon name="info" size="12" color="tertiary" />
					</Flex>

					<Flex align="center" justify="between" gap="12">
						<Flex
							v-for="item in gasLimitItems"
							@click="selectedGasLimit = item.name"
							gap="8"
							align="center"
							justify="center"
							wide
							:class="[$style.select_item, selectedGasLimit === item.name && $style.active]"
						>
							<Icon :name="item.icon" size="12" color="secondary" />
							<Text size="13" weight="600" color="primary">{{ item.name }}</Text>

							<Text v-if="estimatedGasLimit && item.name === 'Estimated'" size="13" weight="600" color="secondary">
								~{{ comma(estimatedGasLimit) }}
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Input
					v-if="selectedGasLimit === 'Custom'"
					v-model="customGasLimit"
					@input="handleGasLimitInput"
					label="Custom Gas Limit"
					placeholder="0.00"
				/>

				<Flex direction="column" gap="12" style="opacity: 0.3; pointer-events: none">
					<Flex direction="column" gap="8">
						<Text size="12" weight="600" color="secondary">Gas Fees</Text>

						<Flex align="center" justify="between" gap="12">
							<Flex
								v-for="item in gasFeeItems"
								@click="selectedGasFee = item.name"
								direction="column"
								gap="8"
								wide
								:class="[$style.select_item, selectedGasFee === item.name && $style.active]"
							>
								<Text size="13" weight="600" color="primary">{{ item.name }}</Text>
								<Text size="12" weight="500" color="secondary">{{ calcGasFee(item.name) }} UTIA</Text>
							</Flex>
						</Flex>
					</Flex>

					<Flex align="center" justify="between">
						<Tooltip position="start" text-align="start">
							<Flex align="center" gap="4">
								<Icon name="gas" size="12" color="tertiary" />
								<Text size="12" weight="600" color="tertiary">Gas prices</Text>
							</Flex>

							<template #content>
								<Flex direction="column" gap="6">
									<Text color="tertiary">
										Fast: <Text color="secondary">{{ appStore.gas.fast }}</Text> UTIA
									</Text>
									<Text color="tertiary">
										Median: <Text color="secondary">{{ appStore.gas.median }}</Text> UTIA
									</Text>
									<Text color="tertiary">
										Slow: <Text color="secondary">{{ appStore.gas.slow }}</Text> UTIA
									</Text>
								</Flex>
							</template>
						</Tooltip>

						<NuxtLink to="/gas" @click="emit('onClose')">
							<Flex align="center" gap="4">
								<Text size="12" weight="600" color="tertiary">Gas Tracker</Text>
								<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
							</Flex>
						</NuxtLink>
					</Flex>
				</Flex>

				<Flex v-if="appStore.wallet === 'keplr'" gap="6">
					<Icon name="info" size="12" color="tertiary" style="margin-top: 1px" />
					<Text size="12" weight="500" height="140" color="tertiary">
						Keplr does not currently support receiving a Gas Fee from outside.<br />
						You need to select the appropriate fee in the pop-up window.
					</Text>
				</Flex>
			</Flex>

			<Flex v-if="warningBannerText.length" align="center" gap="12" :class="$style.warning_banner">
				<Icon name="danger" size="16" color="yellow" />
				<Text size="13" height="140" weight="500" color="tertiary" style="max-width: 350px">
					{{ warningBannerText }}
				</Text>
			</Flex>

			<Button v-if="!appStore.address" @click="handleConnect" type="white" size="small" wide>Connect</Button>
			<Button v-else @click="handleContinue" type="secondary" size="small" wide :disabled="continueButton.disable">
				{{ continueButton.title }}
			</Button>
		</Flex>
	</Modal>
</template>

<style module>
.wallet {
	position: relative;

	border-radius: 12px;
	background: rgba(0, 0, 0, 15%);
	overflow: hidden;

	padding: 16px;

	.metadata {
		z-index: 1;
	}

	& svg {
		z-index: 1;
		box-sizing: content-box;

		background: var(--card-background);
		border-radius: 10px;

		padding: 12px;
	}
}

.auth_line {
	position: absolute;
	bottom: 1px;
	left: 50%;
	right: 50%;

	height: 1px;
	background: linear-gradient(90deg, rgba(10, 222, 113, 0%) 0%, rgba(10, 222, 113, 100%), rgba(10, 222, 113, 0%) 100%);

	&.anim {
		animation: fadeout 1s ease;
	}
}

@keyframes fadeout {
	0% {
		opacity: 0;
	}

	30% {
		opacity: 1;
	}

	100% {
		left: -200px;
		right: -200px;

		opacity: 0;
	}
}

.bg {
	position: absolute;

	top: 8px;
	bottom: 8px;
	left: 8px;
	right: 8px;

	& .circle {
		width: 2px;
		height: 2px;

		border-radius: 50%;
		background: var(--green);
		opacity: 0;

		animation: blink 3s ease infinite;
		animation-delay: var(--delay);
	}

	&.unauth {
		& .circle {
			background: var(--op-40);
		}
	}
}

@keyframes blink {
	0% {
		opacity: var(--start);
	}

	50% {
		opacity: var(--end);
	}

	100% {
		opacity: var(--start);
	}
}

.select_item {
	border-radius: 8px;
	background: rgba(0, 0, 0, 15%);
	cursor: pointer;

	padding: 12px;

	transition: all 0.2s ease;

	&.active {
		box-shadow: inset 0 0 0 1px var(--green);
		background: transparent;
		cursor: default;
	}

	&.active:hover {
		background: transparent;
	}

	&:hover {
		background: rgba(0, 0, 0, 25%);
	}
}

.divider {
	width: -webkit-fill-available;
	height: 2px;

	background: var(--op-5);

	margin: 0 -16px;
}

.warning_banner {
	height: 60px;

	background: repeating-linear-gradient(
		45deg,
		rgba(0, 0, 0, 25%),
		rgba(0, 0, 0, 25%) 8px,
		rgba(0, 0, 0, 10%) 8px,
		rgba(0, 0, 0, 10%) 16px
	);
	box-shadow: 0 0 0 1px var(--op-5);

	margin-left: -16px;
	margin-right: -16px;

	padding: 0 16px;
}
</style>
