<script setup>
/** Services */
import { comma } from "@/services/utils"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const gasLimit = ref(null)
const handleGasLimitInput = () => {
	if (parseFloat(gasLimit.value.replace(/[^0-9.]/g, "")) > 999_999_999) {
		gasLimit.value = "999 999 999"
		return
	}
	gasLimit.value = comma(gasLimit.value.replace(/[^0-9.]/g, ""), " ")
}

const gasFee = computed(() => {
	const fast = appStore.gas.fast * parseFloat(gasLimit.value.replaceAll(" ", ""))
	const median = appStore.gas.median * parseFloat(gasLimit.value.replaceAll(" ", ""))
	const slow = appStore.gas.slow * parseFloat(gasLimit.value.replaceAll(" ", ""))

	return { fast, median, slow }
})

const getFixedLength = (val) => {
	if (val < 1) {
		return 6
	}

	if (val < 100) {
		return 4
	}

	return 2
}
</script>

<template>
	<Flex direction="column" :class="$style.wrapper">
		<Flex direction="column" gap="12" :class="$style.head">
			<Flex justify="between">
				<Flex direction="column" gap="6">
					<Text size="11" weight="600" color="tertiary">Fast</Text>
					<Text size="12" weight="600" color="primary">{{ appStore.gas.fast }}</Text>
				</Flex>
				<Flex direction="column" gap="6">
					<Text size="11" weight="600" color="tertiary">Median</Text>
					<Text size="12" weight="600" color="primary">{{ appStore.gas.median }} </Text>
				</Flex>
				<Flex direction="column" gap="6">
					<Text size="11" weight="600" color="tertiary">Slow</Text>
					<Text size="12" weight="600" color="primary">{{ appStore.gas.slow }}</Text>
				</Flex>
			</Flex>

			<Flex justify="between" align="center" :class="$style.input_box">
				<input v-model="gasLimit" @input="handleGasLimitInput" placeholder="Input Gas Limit" />
				<Text size="11" weight="600" color="tertiary" no-wrap>Gas Limit</Text>
			</Flex>
		</Flex>

		<Flex wide justify="center" :class="$style.mid"> <Icon name="arrow-right" size="12" color="primary" /> </Flex>

		<Flex justify="between" :class="$style.bottom">
			<Flex direction="column" gap="6">
				<Text size="11" weight="600" color="tertiary">Fast Fee</Text>

				<Flex v-if="gasLimit && gasFee.fast" align="center" gap="6">
					<Flex align="center">
						<Text size="12" weight="600" color="primary">
							{{ comma(gasFee.fast.toString().split(".")[0], " ") }}
						</Text>
						<Text size="12" weight="600" color="tertiary">
							.{{ gasFee.fast.toString().split(".")[1].slice(0, getFixedLength(gasFee.fast)) }}
						</Text>
					</Flex>
					<CopyButton :text="gasFee.fast" size="10" />
				</Flex>
				<Text v-else size="12" weight="600" color="tertiary"> 0 </Text>
			</Flex>
			<Flex direction="column" gap="6">
				<Text size="11" weight="600" color="tertiary">Median Fee</Text>

				<Flex v-if="gasLimit && gasFee.median" align="center" gap="6">
					<Flex align="center">
						<Text size="12" weight="600" color="primary">
							{{ comma(gasFee.median.toString().split(".")[0], " ") }}
						</Text>
						<Text size="12" weight="600" color="tertiary">
							.{{ gasFee.median.toString().split(".")[1].slice(0, getFixedLength(gasFee.median)) }}
						</Text>
					</Flex>
					<CopyButton :text="gasFee.median" size="10" />
				</Flex>
				<Text v-else size="12" weight="600" color="tertiary"> 0 </Text>
			</Flex>
			<Flex direction="column" gap="6">
				<Text size="11" weight="600" color="tertiary">Slow Fee</Text>

				<Flex v-if="gasLimit && gasFee.slow" align="center" gap="6">
					<Flex align="center">
						<Text size="12" weight="600" color="primary">
							{{ comma(gasFee.slow.toString().split(".")[0], " ") }}
						</Text>
						<Text size="12" weight="600" color="tertiary">
							.{{ gasFee.slow.toString().split(".")[1].slice(0, getFixedLength(gasFee.slow)) }}
						</Text>
					</Flex>
					<CopyButton :text="gasFee.slow" size="10" />
				</Flex>
				<Text v-else size="12" weight="600" color="tertiary"> 0 </Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
}

.head {
	border-radius: 6px 6px 3px 3px;
	background: var(--op-5);

	padding: 8px;
}

.mid {
	position: relative;
	height: 6px;

	& svg {
		position: absolute;
		top: 50%;
		box-sizing: content-box;

		transform: rotate(90deg) translateX(-50%);

		border-radius: 50%;
		background: var(--card-background);

		padding: 3px;
	}
}

.bottom {
	border-radius: 3px 3px 6px 6px;
	background: var(--op-5);

	padding: 8px;
	padding-top: 12px;
}

.input_box {
	border-top: 2px solid var(--op-5);

	padding-top: 8px;

	& input {
		width: 100%;

		font-size: 12px;
		font-weight: 600;
		color: var(--txt-primary);

		padding: 0;
	}
}
</style>
