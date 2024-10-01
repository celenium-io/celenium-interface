<script setup>
/** Services */
import { formatBytes, comma, abbreviate, purgeNumber } from "@/services/utils"

/** UI */
import Tooltip from "@/components/ui/Tooltip"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const route = useRoute()

const currentPrice = computed(() => appStore.currentPrice)

const rollupStacks = ref([
	{
		name: "Optimism",
		price: 26.69,
		img: "op.png",
	},
	{
		name: "Polygon",
		price: 10,
		img: "polygon.png",
		disabled: true,
	},
	{
		name: "Orbit",
		price: 39.09,
		img: "orbit.png",
	},
])
const selectedRollupStack = ref(0)

const txStack = ref([
	{
		name: "ERC20 Transfer",
		description: "120 Bytes",
		img: "eth.svg",
		val: 120,
	},
	{
		name: "ERC721 Mint",
		description: "650 Bytes",
		img: "eth.svg",
		val: 650,
	},
	{
		name: "UniV3 Swap",
		description: "1,200 Bytes",
		img: "uni.svg",
		val: 1200,
	},
])
const selectedTxStack = ref(0)

const editMode = ref(null)

const percentDiff = (a, b) => {
	const val = Math.abs((a - b) / ((a + b) / 2)) * 100
	return { val, pos: a > b }
}
const normalizeAmount = (target, limit) => {
	if (target === ".") return "0."

	if (target.split(".")[1]?.length > 4) return `${target.split(".")[0]}.${target.split(".")[1].slice(0, 4)}`

	let dotCounter = 0
	for (const char of target.split("")) {
		if (char === ".") dotCounter++
	}
	if (dotCounter > 1) return target.slice(0, target.length - 1)

	if (Number.parseFloat(purgeNumber(target)) >= limit) return limit.toString()
	if (target[target.length - 1] === ".") return target
	if (!target.length) return ""
	if (target.length === 1 && !/^(0|[1-9]\d*)(\.\d+)?$/.test(target)) return ""
}

const txs = ref(100_000_000)
const txsInputEl = ref()
const handleEnableTxsEditMode = async () => {
	editMode.value = "txs"

	await nextTick()
	txsInputEl.value.focus()
}
const handleTxsInput = (e) => {
	const normalizedAmount = normalizeAmount(txs.value, 1_000_000_000)
	if (typeof normalizedAmount === "string") {
		txs.value = normalizedAmount
		return
	}

	txs.value = purgeNumber(txs.value)
}
const handleTxsBlur = () => {
	editMode.value = null

	if (txs.value < 1_000_000) {
		txs.value = 1_000_000
	}
}

const tiaPrice = ref(currentPrice.value.close)
watch(
	() => currentPrice.value,
	() => {
		if (currentPrice.value?.close) tiaPrice.value = currentPrice.value.close
	},
)
const tiaInputEl = ref()
const handleEnableTiaPriceEditMode = async () => {
	editMode.value = "tia"

	await nextTick()
	tiaInputEl.value.focus()
}
const handleTiaPriceInput = (e) => {
	const normalizedAmount = normalizeAmount(tiaPrice.value, 1000)
	if (typeof normalizedAmount === "string") {
		tiaPrice.value = normalizedAmount
		return
	}

	tiaPrice.value = purgeNumber(tiaPrice.value)
}
const handleTiaPriceBlur = () => {
	editMode.value = null
	if (tiaPrice.value < 1) {
		tiaPrice.value = 1
	}
}

const pricePerGas = ref(0.002)
const pricePerGasInputEl = ref()
const handleEnablePricePerGasEditMode = async () => {
	editMode.value = "pricePerGas"

	await nextTick()
	pricePerGasInputEl.value.focus()
}
const handlePricePerGasInput = (e) => {
	const normalizedAmount = normalizeAmount(pricePerGas.value, 0.4)
	if (typeof normalizedAmount === "string") {
		pricePerGas.value = normalizedAmount
		return
	}

	pricePerGas.value = purgeNumber(pricePerGas.value)
}
const handlePricePerGasBlur = () => {
	editMode.value = null
	if (pricePerGas.value < 0.0001) {
		pricePerGas.value = 0.0001
	}
}

const batchSize = ref(102400)
const batchSizeInputEl = ref()
const handleEnableBatchSizeEditMode = async () => {
	editMode.value = "batchSize"

	await nextTick()
	batchSizeInputEl.value.focus()
}
const handleBatchSizeInput = (e) => {
	const normalizedAmount = normalizeAmount(batchSize.value, 256_000)
	if (typeof normalizedAmount === "string") {
		batchSize.value = normalizedAmount
		return
	}

	batchSize.value = purgeNumber(batchSize.value)
}
const handleBatchSizeBlur = () => {
	editMode.value = null
	if (batchSize.value < 10_240) {
		batchSize.value = 10_240
	}
}

const isModified = computed(() => {
	return (
		Number.parseFloat(tiaPrice.value) !== Number.parseFloat(currentPrice.value.close) ||
		Number.parseFloat(pricePerGas.value) !== 0.002 ||
		Number.parseFloat(batchSize.value) !== 102_400
	)
})
const handleReset = () => {
	tiaPrice.value = currentPrice.value.close
	pricePerGas.value = 0.002
	batchSize.value = 102_400
	useEIP.value = true
}

const showComparisonBlock = useCookie("showComparisonBlock", { default: () => true })

/** calc */
const useEIP = ref(true)
const avgCallDataCostPerMb = computed(() => {
	/** EIP-4844 Prices */
	if (useEIP.value) {
		if (rollupStacks.value[selectedRollupStack.value].name === "Optimism") return 26.69
		if (rollupStacks.value[selectedRollupStack.value].name === "Orbit") return 39.09
		return 0
	}

	if (rollupStacks.value[selectedRollupStack.value].name === "Optimism") return 1_532.81
	if (rollupStacks.value[selectedRollupStack.value].name === "Orbit") return 1_984.89
	return 0
})
const getAvgCallDataCostByStack = (stack) => {
	if (useEIP.value) {
		if (stack === "Optimism") return 26.69
		if (stack === "Orbit") return 39.09
		return 0
	}

	if (stack === "Optimism") return 1_532.81
	if (stack === "Orbit") return 1_984.89
	return 0
}
const expectedCallDataSize = computed(() => {
	return (txs.value * txStack.value[selectedTxStack.value].val) / 1_024 / 1_024
})
const expectedCostL2 = computed(() => {
	return expectedCallDataSize.value * avgCallDataCostPerMb.value
})
const temp = computed(() => {
	if (rollupStacks.value[selectedRollupStack.value].name === "Optimism") return 1_532.81
	if (rollupStacks.value[selectedRollupStack.value].name === "Orbit") return 1_984.89
	return 0
})
const additionalSettlementCost = computed(() => {
	return ((((expectedCallDataSize.value * 1_024 * 1_024) / 120_000) * 41) / 1_024 / 1_024) * temp.value
})
const averageGas = ref(945_640)
const tiaPerMb = computed(() => {
	return ((averageGas.value * pricePerGas.value) / 1_000_000 / batchSize.value) * 1_024
})
const expectedCostCelestia = computed(() => {
	return expectedCallDataSize.value * tiaPerMb.value * Number.parseFloat(tiaPrice.value) + additionalSettlementCost.value
})
const savingsUsingCelestia = computed(() => {
	if (!expectedCostL2.value) return 0
	return expectedCostL2.value - expectedCostCelestia.value
})
const payLessPercentCelestia = computed(() => {
	if (!savingsUsingCelestia.value) return 0
	return (savingsUsingCelestia.value * 100) / expectedCostL2.value
})

/** celenium api */
const hideCeleniumAPIBlock = useCookie("hideCeleniumAPIBlock", { default: () => false })
const handleHide = () => {
	hideCeleniumAPIBlock.value = true
}

useHead({
	title: "Celestia Rollup Cost Saving Calculator - Celenium",
	link: [
		{
			rel: "canonical",
			href: `https://celenium.io${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Estimate your cost savings with Celestia's interactive calculator. Get instant results and optimize your budget with our intuitive tool`,
		},
		{
			property: "og:title",
			content: "Celestia Rollup Cost Saving Calculator - Celenium",
		},
		{
			property: "og:description",
			content: `Estimate your cost savings with Celestia's interactive calculator. Get instant results and optimize your budget with our intuitive tool`,
		},
		{
			property: "og:url",
			content: `https://celenium.io${route.path}`,
		},
		{
			property: "og:image",
			content: `https://celenium.io${route.path}__og_image__/og.png`,
		},
		{
			name: "twitter:title",
			content: "Celestia Rollup Cost Saving Calculator - Celenium",
		},
		{
			name: "twitter:description",
			content: `Estimate your cost savings with Celestia's interactive calculator. Get instant results and optimize your budget with our intuitive tool`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})
</script>

<template>
	<Flex gap="40" wide justify="between" :class="$style.wrapper">
		<Flex direction="column" gap="32" :class="$style.left">
			<Flex direction="column" gap="16">
				<Flex align="center" gap="8" :class="$style.title_badge">
					<Icon name="calculator" size="12" color="brand" />
					<Text size="12" weight="600" color="brand">Cost Saving Calculator</Text>
				</Flex>

				<Flex direction="column" gap="6">
					<Text size="20" weight="600" color="primary">Rollup Estimation Cost</Text>
					<Text size="14" weight="500" color="tertiary" style="line-height: 22px">
						Discover the potential cost benefits of building on Celestia, modular blockchain network.
					</Text>
				</Flex>
			</Flex>

			<!-- Rollup Stack Selector -->
			<Flex direction="column" gap="10">
				<Tooltip side="top" position="start">
					<Flex align="center" gap="6">
						<Text size="13" weight="600" color="primary"> Rollup Stack </Text>
						<Icon name="info" size="12" color="support" />
					</Flex>

					<template #content> Rollup underlying technology (SDK). </template>
				</Tooltip>

				<Flex wide align="center" gap="8" :class="$style.items">
					<Flex
						v-for="(stack, idx) in rollupStacks"
						@click="selectedRollupStack = idx"
						wide
						align="center"
						gap="10"
						justify="between"
						:class="[$style.item, stack.disabled && $style.disabled]"
					>
						<Flex align="center" gap="12">
							<img :src="`/img/calc/${stack.img}`" />

							<Flex direction="column" gap="6">
								<Text size="13" weight="600" color="primary"> {{ stack.name }} </Text>

								<Text v-if="!stack.disabled" size="12" weight="500" color="tertiary">
									${{ comma(getAvgCallDataCostByStack(stack.name)) }}
								</Text>
								<Text v-else size="12" weight="500" color="tertiary">Unavailable</Text>
							</Flex>
						</Flex>

						<Transition name="fastfade" mode="out-in">
							<Icon v-if="selectedRollupStack === idx" name="check-circle" size="16" color="brand" />
							<Text
								v-else-if="rollupStacks[idx].price && !stack.disabled"
								size="10"
								weight="700"
								color="brand"
								:class="[
									$style.diff_badge,
									percentDiff(rollupStacks[selectedRollupStack].price, rollupStacks[idx].price).pos
										? $style.green
										: $style.red,
								]"
								>{{ percentDiff(rollupStacks[selectedRollupStack].price, rollupStacks[idx].price).pos ? "-" : "+"
								}}{{ percentDiff(rollupStacks[selectedRollupStack].price, rollupStacks[idx].price).val.toFixed(2) }}%
							</Text>
						</Transition>
					</Flex>
				</Flex>
			</Flex>

			<!-- Transaction stack Selector -->
			<Flex direction="column" gap="10">
				<Tooltip side="top" position="start">
					<Flex align="center" gap="6">
						<Text size="13" weight="600" color="primary"> Transaction Type </Text>
						<Icon name="info" size="12" color="support" />
					</Flex>

					<template #content> Type of transaction used to calculate the total size of posted data. </template>
				</Tooltip>

				<Flex wide align="center" gap="8" :class="$style.items">
					<Flex
						v-for="(stack, idx) in txStack"
						@click="selectedTxStack = idx"
						wide
						align="center"
						gap="10"
						justify="between"
						:class="$style.item"
					>
						<Flex align="center" gap="12">
							<img :src="`/icons/${stack.img}`" />

							<Flex direction="column" gap="6">
								<Text size="13" weight="600" color="primary">{{ stack.name }}</Text>
								<Text size="12" weight="500" color="tertiary"> {{ stack.description }} </Text>
							</Flex>
						</Flex>

						<Transition name="fastfade">
							<Icon v-if="selectedTxStack === idx" name="check-circle" size="16" color="brand" />
						</Transition>
					</Flex>
				</Flex>
			</Flex>

			<!-- Txs count -->
			<Flex direction="column" gap="16">
				<Flex align="center" justify="between">
					<Tooltip side="top" position="start">
						<Flex align="center" gap="6">
							<Text size="13" weight="600" color="primary"> Expected transactions </Text>
							<Icon name="info" size="12" color="support" />
						</Flex>

						<template #content> Total number of posted transactions. </template>
					</Tooltip>

					<!-- <Text size="13" weight="600" color="primary"> Expected transactions </Text> -->

					<template v-if="editMode !== 'txs'">
						<Text @click="handleEnableTxsEditMode" size="13" weight="600" color="primary"> {{ comma(txs) }} </Text>
					</template>
					<template v-else>
						<Flex align="center" gap="6">
							<Icon name="edit" size="12" color="tertiary" />
							<input
								ref="txsInputEl"
								v-model="txs"
								@input="handleTxsInput"
								@blur="handleTxsBlur"
								:class="$style.txs_input"
								:style="{ width: `${txs.toString().split('').length}ch` }"
							/>
							<Icon @click="editMode = null" name="check-circle" size="12" color="brand" />
						</Flex>
					</template>
				</Flex>

				<input
					v-model="txs"
					type="range"
					min="1000000"
					max="1000000000"
					step="1000000"
					:class="$style.tx_range"
					:style="{
						background: `linear-gradient(to right, var(--brand) ${(txs * 100) / 1_000_000_000}%, var(--op-5) ${
							(txs * 100) / 1_000_000_000
						}%)`,
					}"
				/>
			</Flex>

			<Flex direction="column" gap="24">
				<Text size="14" weight="600" color="tertiary" height="160">
					Using <Text color="secondary">L2</Text> the expected cost ~<Text color="secondary"
						>${{ comma(expectedCostL2, ",", 0) }}</Text
					>, with Celestia ~<Text color="brand">${{ comma(expectedCostCelestia, ",", 0) }}</Text> for
					<Text color="secondary">{{ abbreviate(txs) }}</Text> transactions
				</Text>

				<Flex gap="48" :class="[$style.results, editMode && $style.editing]">
					<Flex direction="column" gap="24">
						<Flex direction="column" gap="12">
							<Text size="32" weight="600" :color="savingsUsingCelestia ? 'brand' : 'secondary'" tabular mono>
								${{ comma(savingsUsingCelestia, ",", 0) }}
							</Text>
							<Text size="14" weight="600" color="tertiary"> You'll save using Celestia </Text>
						</Flex>

						<Flex direction="column" gap="12">
							<Text size="24" weight="600" color="primary" tabular mono> ${{ tiaPerMb.toFixed(5) }} </Text>
							<Text size="14" weight="600" color="tertiary"> Price per Mb in Celestia </Text>
						</Flex>
					</Flex>

					<Flex direction="column" gap="24">
						<Flex direction="column" gap="12">
							<Text
								size="32"
								weight="600"
								:color="payLessPercentCelestia > 50 ? (payLessPercentCelestia ? 'brand' : 'secondary') : 'secondary'"
								tabular
								mono
							>
								~{{ payLessPercentCelestia.toFixed(2) }}%
							</Text>
							<Text size="14" weight="600" color="tertiary"> You'll pay % less </Text>
						</Flex>

						<Flex direction="column" gap="12">
							<Text size="24" weight="600" color="primary" tabular mono>
								${{ comma(additionalSettlementCost, ",", 0) }}
							</Text>
							<Text size="14" weight="600" color="tertiary"> Settlement Cost </Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="12">
				<div :class="$style.divider" />

				<Text size="13" weight="600" color="support" height="160" style="max-width: 500px">
					This estimation assumes a constant <Text color="tertiary">$TIA</Text> price. It should only be used as an estimation and
					reference to compare what-if scenarios.
				</Text>
			</Flex>
		</Flex>

		<Flex wide direction="column" gap="24" :class="$style.right">
			<Flex direction="column" gap="10">
				<Tooltip side="top" position="start" wide>
					<Flex wide align="center" justify="between">
						<Flex align="center" gap="6">
							<Text size="13" weight="600" color="primary">Constants</Text>
							<Icon name="info" size="12" color="support" />
						</Flex>

						<Text v-if="isModified" @click="handleReset" color="brand" size="12" weight="600" style="cursor: pointer"
							>Reset</Text
						>
					</Flex>

					<template #content>
						<Flex align="start" direction="column" gap="8">
							<Text> Variables used to calculate the savings of Celestia's usage. </Text>
							<Flex align="center" gap="16">
								<Flex align="center" gap="6">
									<div :class="$style.dot" style="background: var(--brand)" />
									<Text weight="600" color="secondary"> Editable variables </Text>
								</Flex>
								<Flex align="center" gap="6">
									<div :class="$style.dot" style="background: var(--txt-secondary)" />
									<Text weight="600" color="secondary"> Static </Text>
								</Flex>
							</Flex>
						</Flex>
					</template>
				</Tooltip>

				<Flex direction="column" gap="20" :class="$style.card">
					<Flex>
						<Flex direction="column" gap="16" style="flex: 1">
							<Flex direction="column" gap="8">
								<Text size="12" weight="600" color="secondary"> TIA Price </Text>

								<template v-if="editMode !== 'tia'">
									<Text @click="handleEnableTiaPriceEditMode" size="14" weight="600" color="brand">
										${{ tiaPrice }}
									</Text>
								</template>
								<template v-else>
									<Flex align="center" gap="6">
										<Icon name="edit" size="12" color="tertiary" />
										<input
											ref="tiaInputEl"
											v-model="tiaPrice"
											@input="handleTiaPriceInput"
											@blur="handleTiaPriceBlur"
											:class="$style.constant_input"
											:style="{ width: `${tiaPrice.toString().split('').length}ch` }"
										/>
										<Icon @click="editMode = null" name="check-circle" size="12" color="brand" />
									</Flex>
								</template>
							</Flex>

							<Flex direction="column" gap="8">
								<Text size="12" weight="600" color="secondary"> Average Gas </Text>
								<Text size="14" weight="600" color="primary" mono> {{ comma(averageGas) }} </Text>
							</Flex>
						</Flex>

						<Flex direction="column" gap="16" style="flex: 1">
							<Flex direction="column" gap="8">
								<Text size="12" weight="600" color="secondary"> Price per gas </Text>

								<template v-if="editMode !== 'pricePerGas'">
									<Text @click="handleEnablePricePerGasEditMode" size="14" weight="600" color="brand">
										{{ pricePerGas }} UTIA
									</Text>
								</template>
								<template v-else>
									<Flex align="center" gap="6">
										<Icon name="edit" size="12" color="tertiary" />
										<input
											ref="pricePerGasInputEl"
											v-model="pricePerGas"
											@input="handlePricePerGasInput"
											@blur="handlePricePerGasBlur"
											:class="$style.constant_input"
											:style="{ width: `${pricePerGas.toString().split('').length}ch` }"
										/>
										<Icon @click="editMode = null" name="check-circle" size="12" color="brand" />
									</Flex>
								</template>
							</Flex>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" gap="20" :class="$style.card">
					<Flex>
						<Flex direction="column" gap="16" style="flex: 1">
							<Flex direction="column" gap="8">
								<Text size="12" weight="600" color="secondary"> Avg batch size </Text>

								<template v-if="editMode !== 'batchSize'">
									<Text @click="handleEnableBatchSizeEditMode" size="14" weight="600" color="brand">
										{{ formatBytes(batchSize) }} / block
									</Text>
								</template>
								<template v-else>
									<Flex align="center" gap="6">
										<Icon name="edit" size="12" color="tertiary" />
										<input
											ref="batchSizeInputEl"
											v-model="batchSize"
											@input="handleBatchSizeInput"
											@blur="handleBatchSizeBlur"
											:class="$style.constant_input"
											:style="{ width: `${batchSize.toString().split('').length}ch` }"
										/>
										<Icon @click="editMode = null" name="check-circle" size="12" color="brand" />
									</Flex>
								</template>
							</Flex>
						</Flex>
						<Flex direction="column" gap="16" style="flex: 1">
							<Flex direction="column" gap="8">
								<Text size="12" weight="600" color="secondary"> Avg num of shares</Text>
								<Text size="14" weight="600" color="primary" mono> 215 </Text>
							</Flex>
						</Flex>
					</Flex>
				</Flex>

				<Flex @click="useEIP = !useEIP" align="center" gap="6" :class="[$style.card, $style.clickable]">
					<Icon :name="useEIP ? 'check-circle' : 'close-circle'" size="12" :color="useEIP ? 'brand' : 'secondary'" />
					<Text size="13" weight="600" color="primary"> Use EIP-4844 </Text>
				</Flex>
			</Flex>

			<!-- <Flex direction="column" gap="20" :class="$style.card">
				<Flex @click="showComparisonBlock = !showComparisonBlock" align="center" gap="8" :class="$style.head">
					<Text size="13" weight="600" color="primary">Transaction stack comparison</Text>
					<Icon
						name="chevron"
						size="12"
						color="secondary"
						:style="{ transform: `rotate(${showComparisonBlock ? '0' : '-90'}deg)` }"
					/>
				</Flex>

				<Flex v-if="showComparisonBlock" direction="column" gap="16">
					<Flex direction="column" gap="10">
						<Flex gap="4">
							<div v-for="idx in 40" :class="$style.bar" />
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="secondary">ERC20 Transfer</Text>
							<Text size="12" weight="600" color="brand">120 Bytes</Text>
						</Flex>
					</Flex>
					<Flex direction="column" gap="10">
						<Flex gap="4">
							<div v-for="idx in 40" :class="$style.bar" />
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="secondary">ERC20 Transfer</Text>
							<Text size="12" weight="600" color="primary">120 Bytes</Text>
						</Flex>
					</Flex>
					<Flex direction="column" gap="10">
						<Flex gap="4">
							<div v-for="idx in 40" :class="$style.bar" />
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="secondary">ERC20 Transfer</Text>
							<Text size="12" weight="600" color="primary">120 Bytes</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex> -->

			<NuxtLink to="https://api-plans.celenium.io" target="_blank">
				<Flex v-if="!hideCeleniumAPIBlock" direction="column" gap="12" :class="$style.ad">
					<Flex direction="column" gap="8">
						<Flex align="center" gap="6">
							<Icon name="slash" size="14" color="brand" />
							<Text size="13" weight="600" color="primary">Build with Celenium API</Text>
						</Flex>

						<Text size="13" weight="600" color="tertiary" height="140">
							Unlock the power of Celestia: Scalable, Secure and Modular Blockchain.
						</Text>
					</Flex>

					<Text size="13" weight="600" color="brand">Get started -></Text>
				</Flex>
			</NuxtLink>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

.left {
}

.right {
	max-width: 300px;

	margin-top: 120px;
}

.title_badge {
	width: fit-content;

	background: rgba(24, 210, 165, 10%);
	border-radius: 50px;

	padding: 6px 10px 6px 6px;
}

.diff_badge {
	border-radius: 50px;

	padding: 4px;

	&.green {
		color: var(--brand);
		background: rgba(24, 210, 165, 15%);
	}

	&.red {
		color: var(--red);
		background: rgba(235, 87, 87, 15%);
	}
}

.item {
	position: relative;

	min-width: 200px;
	max-width: 200px;
	height: 48px;

	border-radius: 6px;
	background: var(--card-background);
	cursor: pointer;
	user-select: none;

	padding: 0 16px 0 12px;

	transition: all 0.2s ease;

	& img {
		min-width: 24px;
		min-height: 24px;

		border-radius: 50%;
		background: var(--op-5);
	}

	&:hover {
		box-shadow: 0 0 0 2px var(--op-10);
	}

	&.disabled {
		pointer-events: none;
		opacity: 0.4;
	}
}

.tx_range {
	appearance: none;

	height: 6px;

	background-color: var(--op-10);
	border-radius: 50px;
	border-style: none;

	&::-webkit-slider-thumb {
		width: 12px;
		height: 12px;
		-webkit-appearance: none;
		border-radius: 50%;
		cursor: pointer;
		background: #fff;
	}
}

.divider {
	width: 100%;
	height: 2px;

	background: var(--op-5);
	border-radius: 50px;
}

.card {
	border-radius: 6px;
	background: var(--card-background);

	padding: 12px;

	& .head {
		cursor: pointer;

		user-select: none;
	}

	&.clickable {
		cursor: pointer;
		user-select: none;

		transition: all 0.2s ease;

		&:hover {
			box-shadow: 0 0 0 2px var(--op-10);
		}
	}
}

.dot {
	min-width: 6px;
	min-height: 6px;

	border-radius: 50%;
}

.bar {
	width: 3px;
	height: 16px;

	border-radius: 50px;
	background: var(--op-10);
}

.ad {
	position: relative;

	border-radius: 12px;
	box-shadow: inset 0 0 0 2px var(--op-10);

	padding: 16px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-3);
	}

	& .close_icon {
		position: absolute;
		top: 16px;
		right: 16px;

		cursor: pointer;

		transition: all 0.2s ease;

		&:hover {
			fill: var(--txt-secondary);
		}
	}
}

.txs_input {
	all: unset;

	font-size: 13px;
	font-weight: 600;
	color: var(--txt-primary);

	height: 13px;
}

.constant_input {
	max-width: 100%;
	all: unset;

	font-size: 14px;
	font-weight: 600;
	color: var(--txt-primary);

	height: 14px;
}

.results {
	transition: all 0.2s ease;
}

.results.editing {
	opacity: 0.3;

	filter: blur(3px);
}

@media (max-width: 1000px) {
	.items {
		flex-direction: column;
	}

	.item {
		max-width: initial;
	}
}

@media (max-width: 730px) {
	.wrapper {
		flex-direction: column;
	}

	.right {
		max-width: initial;
		margin-top: 0;
	}
}

@media (max-width: 500px) {
	.results {
		flex-direction: column;
		gap: 24px;
	}
}
</style>
