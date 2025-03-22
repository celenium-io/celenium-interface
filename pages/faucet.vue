<script setup>
/** API */
import { executeFaucet, faucetAddress, fetchBalance } from "@/services/api/faucet"

/** Services */
import { splitAddress, tia } from "@/services/utils"
import { Server, useServerURL } from "@/services/config"

/** UI */
import Input from "@/components/ui/Input.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"

/** Store */
import { useAppStore } from "@/store/app"
import { useCacheStore } from "@/store/cache"
import { useModalsStore } from "@/store/modals"
const appStore = useAppStore()
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

const route = useRoute()

useHead({
	title: `Celestia Faucet - Celenium`,
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/faucet",
		},
	],
	meta: [
		{
			name: "description",
			content: "Get free testnet TIA for the Celestia Mocha Testnet using the Celenium Faucet. Developers can claim tokens to test dApps, validators, and blockchain tools. Start testing Celestia today!",
		},
		{
			property: "og:title",
			content: `Celestia Faucet - Celenium`,
		},
		{
			property: "og:description",
			content: "Get free testnet TIA for the Celestia Mocha Testnet using the Celenium Faucet. Developers can claim tokens to test dApps, validators, and blockchain tools. Start testing Celestia today!",
		},
		{
			property: "og:url",
			content: "https://celenium.io/faucet",
		},
		{
			property: "og:image",
			content: "/img/seo/faucet.png",
		},
		{
			name: "twitter:title",
			content: `Celestia Faucet - Celenium`,
		},
		{
			name: "twitter:description",
			content: "Get free testnet TIA for the Celestia Mocha Testnet using the Celenium Faucet. Developers can claim tokens to test dApps, validators, and blockchain tools. Start testing Celestia today!",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/faucet.png",
		},
	],
})

const isLoading = ref(false)
const address = ref("")
const account = ref()
const fetchAccount = async() => {
	try {
		const url = new URL(`${Server.API.mocha}/address/${address.value}`)
		const { data, error } = await useFetch(url.href)
		if (error.value) {
			fillValidation("error", "Invalid address")
			return
		}
		
		if (!data.value) {
			fillValidation("warning", "Address not found, make sure it is correct")
			return
		} else {
			account.value = data.value
			fillValidation()
		}
	} catch (error) {
		fillValidation("error", error.message || "Unexpected error")
	}
}

const validation = ref({
	type: "",
	title: "",
})
const fillValidation = (type, title) => {
	if (type && title) {
		validation.value = {
			type,
			title,
		}
	} else {
		validation.value = {}
	}
}

const faucetBalance = ref(0)
const refreshFaucetBalance = async () => {
	const { data } = await fetchBalance()
	faucetBalance.value = data.value || faucetBalance.value
}

const executionResult = ref({
	status: "",
	message: "",
})
const fillExecutionResult = (status, message) => {
	if (status && message) {
		executionResult.value = {
			status,
			message,
		}
	} else {
		executionResult.value = {}
	}
}

const handleExecute = async () => {
	isLoading.value = true
	executionResult.value = {}

	try {
		const { data, error } = await executeFaucet(address.value)

		if (error?.value?.data) {
			fillExecutionResult("error",
				error.value.statusCode === 429
					? 'Request limit exceeded'
					: error.value?.data?.message || "Unexpected error"
			)
		} else if (data.value) {
			if (data.value?.status === 'success') {
				await refreshFaucetBalance()
				await fetchAccount()
			}

			fillExecutionResult(data.value?.status, data.value?.hash)
		}
	} catch(error) {
		fillExecutionResult("error", error || "Unexpected error")
	} finally {
		isLoading.value = false
	}
}

const handleReturnTokensClick = () => {
	if (useServerURL().includes('mocha')) {
		cacheStore.current.address = { hash: faucetAddress }
		modalsStore.open("send")
	} else {
		window.open(`https://mocha.celenium.io/address/${faucetAddress}`, "_blank")
	}
}
const openedQuestion = ref(0)
const handleOpenQuestion = (idx) => {
	const elements = document.querySelectorAll('[class*=answer]')
	elements.forEach(el => {
		el.style.height = "0px"
		el.style.marginBottom = '0px'
	})

	const element = document.getElementById(idx)
	if (openedQuestion.value !== idx) {
		openedQuestion.value = idx
		element.style.height = `${element.scrollHeight}px`
		element.style.marginBottom = '8px'
	} else {
		openedQuestion.value = null
	}
}

let timeout = null
watch(
	() => address.value,
	async () => {
		account.value = {}
		fillExecutionResult()

		if (!address.value) {
			fillValidation()
			return
		}

		if (!address.value.startsWith("celestia") || address.value.length !== 47) {
			fillValidation("error", "Invalid address")
			return
		}

		if (address.value === faucetAddress) {
			fillValidation("error", "You can't specify the faucet address")
			return
		}

		clearTimeout(timeout)
		timeout = setTimeout(async () => {
			await fetchAccount()
		}, 500);
	},
)

await refreshFaucetBalance()
onMounted(() => {
	if (useServerURL().includes('mocha') && appStore.address) {
		address.value = appStore.address
	}

	const transferEl = document.getElementById("transferWindow")
	document.documentElement.style.setProperty('--runner-distance', `${transferEl.clientWidth}px`)
})
</script>

<template>
	<Flex gap="12" align="start" direction="column" :class="$style.wrapper" wide>
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/faucet', name: `Faucet` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex direction="column" gap="6">
			<Flex align="center" gap="6">
				<Icon name="drop" size="16" color="secondary" />
				<Text size="16" weight="600" color="primary">Celenium Faucet</Text>
			</Flex>

			<Text size="14" weight="400" color="tertiary" style="line-height: 22px">
				Faucet is only available for
				<Text weight="600">Mocha</Text>
				network.
			</Text>
		</Flex>

		<Flex direction="column" justify="between" gap="24" wide :style="{maxWidth: '650px', marginTop: '24px'}">
			<Flex direction="column" gap="48" wide :style="{maxWidth: '100%'}">
				<Flex align="center" gap="6" wide>
					<Input
						v-model="address"
						label="Address"
						placeholder="celestia16etnwjxg6dsjuavjpr9tk822czfeylfm9f7x5g"
						ref="inputEl"
						:class="$style.input"
					>
						<template #rightText>
							<Tooltip v-if="validation.title" side="top">
								<Icon
									:name="validation.type === 'warning' ? 'danger' : 'close-circle'"
									:color="validation.type === 'warning' ? 'yellow' : 'red'"
									size="12"
								/>

								<template #content>
									<Text size="12" weight="600" color="secondary"> {{ validation.title }} </Text>
								</template>
							</Tooltip>

							<Icon v-else-if="address" name="check-circle" size="12" color="green" />
						</template>
					</Input>

					<Button
						@click="handleExecute"
						type="white"
						size="small"
						:class="$style.button"
						:loading="isLoading"
						:disabled="validation.type === 'error' || !address"
					>
						Recieve 0.5 TIA
					</Button>
				</Flex>
				
				<Flex direction="column" gap="4">
					<Flex id="transferWindow" align="center" gap="12" :class="[$style.transfer, !(address && validation.type !== 'error') && $style.disabled]">
						<Flex align="center" justify="between" wide>
							<Flex align="center" gap="12">
								<Icon name="faucet" size="16" color="secondary" :class="$style.icon" />

								<Flex direction="column" gap="6" :class="$style.metadata" wide>
									<Flex align="center" gap="6">
										<Text size="14" weight="500" color="secondary">
											Faucet
										</Text>

										<Text size="13" weight="400" color="secondary">
											{{ tia(faucetBalance, 2) }} TIA
										</Text>
									</Flex>

									<Flex align="center" gap="6">
										<Text size="12" weight="500" color="tertiary">
											{{ splitAddress(faucetAddress) }}
										</Text>

										<CopyButton size="11" :text="faucetAddress" />
									</Flex>									
								</Flex>
							</Flex>

							<Flex align="center" gap="12">
								<Flex direction="column" align="end" gap="6" :class="$style.metadata" wide>
									<Flex align="center" gap="6">
										<Text size="14" weight="500" color="secondary">
											{{ account?.hash
												? $getDisplayName("addresses", "", account) === splitAddress(account?.hash)
													? 'Address'
													: $getDisplayName("addresses", "", account)
												: 'Address'
											}}
										</Text>

										<Text size="13" weight="400" color="secondary">
											{{ tia(account?.balance?.spendable || 0, 2) }} TIA
										</Text>
									</Flex>

									<Text size="12" weight="500" color="tertiary">
										{{ account?.hash
											? splitAddress(account.hash)
											: 'celestia ••• celestia'
										}}
									</Text>
								</Flex>

								<Icon name="address" size="16" color="secondary" :class="$style.icon" />
							</Flex>

							<div v-if="isLoading" :class="[$style.line, $style.runner]" />
							<div
								v-else
								:class="[
									$style.status_line,
									!executionResult?.status && $style.waiting,
									executionResult.status === 'success' && $style.success,
									(executionResult.status === 'error' || executionResult.status === 'failed') && $style.error,
								]"
							/>
						</Flex>
					</Flex>

					<Flex v-if="executionResult?.status" align="center" justify="end" gap="6" wide :style="{padding: '0 8px', opacity: '0.7'}">
						<a v-if="executionResult.status === 'success'" :href="`https://mocha.celenium.io/tx/${executionResult.message}`" target="_blank">
							<Flex align="center" gap="4">
								<Text size="12" color="green">View Tx</Text>
								<Icon name="arrow-narrow-up-right" size="12" color="green" />
							</Flex>
						</a>

						<Flex v-else align="center" gap="4">
							<Text size="12" color="red"> {{ executionResult.message }} </Text>
							<Icon name="close-circle" size="12" color="red" />
						</Flex>
					</Flex>
				</Flex>

				<Flex align="center">
					<Text size="13" height="140" color="secondary">
						Please do not forget to
						<Text size="13" weight="600" color="brand" @click="handleReturnTokensClick" :class="$style.return_tokens">
							return
						</Text>
						the test tokens if you no longer need them so that they can be used by other developers and testers.
					</Text>
				</Flex>
			</Flex>
			
			<Flex direction="column" gap="20" :class="$style.qa_wrapper">
				<Text size="20" weight="500" color="primary" :class="$style.title">Frequently asked questions</Text>

				<Flex direction="column" gap="32">
					<Flex direction="column" gap="8">
						<Flex @click="() => handleOpenQuestion(1)" align="center" justify="between" gap="12" :class="$style.head">
							<Text size="14" weight="500" height="140" color="primary"> What is the Celestia Faucet?</Text>

							<Icon
								name="chevron"
								size="16"
								color="tertiary"
								:style="`transform: rotate(${openedQuestion === 1 ? '180deg' : '0deg'})`"
							/>
						</Flex>

						<Flex id="1" :class="[$style.answer, openedQuestion === 1 && $style.answer_extended]">
							<Text size="13" weight="500" color="tertiary" height="160">
								The Celestia testnet faucet is a service that provides free testnet tokens for developers and users who want to interact with the Celestia blockchain without spending real assets. These tokens have no monetary value and are solely for testing purposes.
							</Text>
						</Flex>

						<Flex @click="() => handleOpenQuestion(2)" align="center" justify="between" gap="12" :class="$style.head">
							<Text size="14" weight="500" height="140" color="primary">How can I request testnet tokens?</Text>

							<Icon
								name="chevron"
								size="16"
								color="tertiary"
								:style="`transform: rotate(${openedQuestion === 2 ? '180deg' : '0deg'})`"
							/>
						</Flex>

						<Flex id="2" :class="[$style.answer, openedQuestion === 2 && $style.answer_extended]">
							<Text size="13" weight="500" color="tertiary" height="160">
								You can request testnet tokens by entering your Celestia testnet address, and clicking the "Received 0.5 TIA" button. Tokens will be sent to your wallet within a few moments.
							</Text>
						</Flex>

						<Flex @click="() => handleOpenQuestion(3)" align="center" justify="between" gap="12" :class="$style.head">
							<Text size="14" weight="500" height="140" color="primary">What are the limitations on requesting tokens?</Text>

							<Icon
								name="chevron"
								size="16"
								color="tertiary"
								:style="`transform: rotate(${openedQuestion === 3 ? '180deg' : '0deg'})`"
							/>
						</Flex>

						<Flex id="3" :class="[$style.answer, openedQuestion === 3 && $style.answer_extended]">
							<Text size="13" weight="500" color="tertiary" height="160">
								To ensure fair distribution and prevent abuse, the faucet has the following limitations:<br>
								&nbsp;&nbsp;• You can receive <b>0.5 TIA per request</b>.<br>
								&nbsp;&nbsp;• You can request tokens <b>only once per hour</b> per <b>IP address or wallet address</b>.<br>
								&nbsp;&nbsp;• If you reach the limit, you will need to wait before requesting again.
							</Text>
						</Flex>

						<Flex @click="() => handleOpenQuestion(4)" align="center" justify="between" gap="12" :class="$style.head">
							<Text size="14" weight="500" height="140" color="primary">What should I do if I don’t receive my tokens?</Text>

							<Icon
								name="chevron"
								size="16"
								color="tertiary"
								:style="`transform: rotate(${openedQuestion === 4 ? '180deg' : '0deg'})`"
							/>
						</Flex>

						<Flex id="4" :class="[$style.answer, openedQuestion === 4 && $style.answer_extended]">
							<Text size="13" weight="500" color="tertiary" height="160">
								If you haven't received your tokens:<br>
								&nbsp;&nbsp;• Double-check that you entered <b>the correct Celestia address</b>.<br>
								&nbsp;&nbsp;• Ensure you are using <b>the Mocha network</b>.<br>
								&nbsp;&nbsp;• If the issue persists, contact support.
							</Text>
						</Flex>

						<Flex @click="() => handleOpenQuestion(5)" align="center" justify="between" gap="12" :class="$style.head">
							<Text size="14" weight="500" height="140" color="primary">Can I use testnet tokens on the mainnet?</Text>

							<Icon
								name="chevron"
								size="16"
								color="tertiary"
								:style="`transform: rotate(${openedQuestion === 5 ? '180deg' : '0deg'})`"
							/>
						</Flex>

						<Flex id="5" :class="[$style.answer, openedQuestion === 5 && $style.answer_extended]">
							<Text size="13" weight="500" color="tertiary" height="160">
								No, testnet tokens are only for testing on the Celestia Mocha network. They cannot be transferred or used on the Celestia mainnet.
							</Text>
						</Flex>

						<Flex @click="() => handleOpenQuestion(6)" align="center" justify="between" gap="12" :class="$style.head">
							<Text size="14" weight="500" height="140" color="primary">What happens if I run out of testnet tokens?</Text>

							<Icon
								name="chevron"
								size="16"
								color="tertiary"
								:style="`transform: rotate(${openedQuestion === 6 ? '180deg' : '0deg'})`"
							/>
						</Flex>

						<Flex id="6" :class="[$style.answer, openedQuestion === 6 && $style.answer_extended]">
							<Text size="13" weight="500" color="tertiary" height="160">
								If you run out of testnet tokens, you can request more from the faucet (subject to request limits). You may also check community channels for alternative ways to obtain test tokens.
							</Text>
						</Flex>

						<Flex @click="() => handleOpenQuestion(7)" align="center" justify="between" gap="12" :class="$style.head">
							<Text size="14" weight="500" height="140" color="primary">How can I contribute to the Celestia testnet?</Text>

							<Icon
								name="chevron"
								size="16"
								color="tertiary"
								:style="`transform: rotate(${openedQuestion === 7 ? '180deg' : '0deg'})`"
							/>
						</Flex>

						<Flex id="7" :class="[$style.answer, openedQuestion === 7 && $style.answer_extended]">
							<Text size="13" weight="500" color="tertiary" height="160">
								If you no longer need the testnet tokens, please return them to the faucet so that other developers and testers can use them. You can send them back to the
								<a @click="handleReturnTokensClick" :class="$style.return_tokens">
									faucet
								</a>
								.<br>
								Your contribution helps keep the testnet accessible for everyone!
							</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	width: 100%;

	padding: 20px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.input {
	flex: 1;
}

.button {
	margin-top: 18px;
}

.transfer {
	position: relative;
	opacity: 1;

	border-radius: 12px;
	box-shadow: inset 0 0 0 1px var(--op-10);
	overflow: hidden;

	padding: 16px;
	transition: all 0.5s ease;

	.metadata {
		z-index: 1;
	}

	& .icon {
		z-index: 1;
		box-sizing: content-box;

		background: var(--card-background);
		border-radius: 10px;

		padding: 12px;
	}
}

.status_line {
	position: absolute;
	bottom: 1px;
	width: 100%;

	opacity: 1;
	height: 1px;
}

.waiting {
	background: linear-gradient(90deg, rgba(10, 222, 113, 0%) 0%, var(--txt-support), rgba(10, 222, 113, 0%) 100%);
}

.success {
	background: linear-gradient(90deg, rgba(10, 222, 113, 0%) 0%, var(--green), rgba(10, 222, 113, 0%) 100%);
}

.error {
	background: linear-gradient(90deg, rgba(10, 222, 113, 0%) 0%, var(--red), rgba(10, 222, 113, 0%) 100%);
}

.runner {
	position: absolute;
	bottom: 0px;
	left: 0;

	width: 100px;
	height: 2px;

	background: linear-gradient(90deg, rgba(7, 106, 205, 0%), var(--txt-support), rgba(7, 106, 205, 0%));

	animation: runner 4s ease infinite;

	& .line {
		width: 100px;
		height: 2px;

		background: linear-gradient(90deg, rgba(7, 106, 205, 0%), var(--txt-support), rgba(7, 106, 205, 0%));
		filter: blur(5px);
	}
}

@keyframes runner {
	0% {
		transform: translateX(-60px);
	}

	50% {
		transform: translateX(calc(var(--runner-distance) - 40px));
	}

	100% {
		transform: translateX(-60px);
	}
}

.return_tokens {
	cursor: pointer;
}

.qa_wrapper {
	margin-top: 150px;
}

.head {
	cursor: pointer;
}

.answer {
	height: 0;
	overflow: hidden;
	transition: all 0.5s ease;

	& a {
		color: var(--brand);
	}

	& .code {
		padding-left: 5px;
		padding-right: 5px;
		font-size: small;
		font-family: 'Courier New', Courier, monospace;
		background-color: #2d2d2d;
		border-radius: 4px;
	}
}

.disabled {
	opacity: 0.3;
	pointer-events: none;
	cursor: default;
}
</style>
