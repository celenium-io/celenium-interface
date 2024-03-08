<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const currentPrice = computed(() => appStore.currentPrice)

const props = defineProps({
	amount: {
		type: Object,
		required: true,
		default: {
			value: 0,
			currency: "utia"
		},
	},
	shownCurrency: {
		type: Object,
		required: false,
		default: {
			value: "TIA",
		},
	},
	exchange: {
		type: String,
		default: "USD",
	}
})

const defaultAmount = {
	decimal: 2,
	color: "primary",
	size: "12",
	weight: "600",
}

const defaultShownCurrency = {
	color: "tertiary",
	size: "13",
	weight: "600",
}

const finalShownAmount = {
	...defaultAmount,
	...props.amount
}

const finalShownCurrency = {
	...defaultShownCurrency,
	...props.shownCurrency,
}

const finalExchangeAmount = ref({})

const convertAmount = (amount, rate) => {

}

const calculateAmount = () => {
	let amountFrom = props.amount.currency === 'utia' ? props.amount.value / 1_000_000 : props.amount.value
	let amountConverted = amountFrom * currentPrice.value.close

	switch (props.shownCurrency.value) {
		case "TIA":
			finalShownAmount.value = {
				...defaultAmount,
				
			}
			
			break;
	
		case "USD":
			
			break;
		
		default:
			break;
	}
}

onMounted(() => {
	console.log(currentPrice.value);
})
</script>

<template>
	<Tooltip position="start" delay="500">
		<Flex align="center" gap="4">
			<!-- <Text
				:size="finalAmount.size"
				:weight="finalAmount.weight"
				:color="parseFloat(finalAmount.value) ? finalAmount.color : 'tertiary'"
			>
				{{ amountToString(tia(finalAmount.value)) }}
			</Text>

			<Text
				:size="finalCurrency.size"
				:weight="finalCurrency.weight"
				:color="finalCurrency.color"
			>
				{{ finalCurrency.value }}
			</Text> -->
		</Flex>
		<template #content>
			<Flex align="center" gap="4">
				<!-- <Text
					:size="finalAmount.size"
					:weight="finalAmount.weight"
					:color="parseFloat(finalAmount.value) ? finalAmount.color : 'tertiary'"
				>
					{{ amountToString(tia(finalAmount.value)) }}
				</Text>

				<Text
					:size="finalCurrency.size"
					:weight="finalCurrency.whight"
					:color="finalCurrency.color"
				>
					{{ finalCurrency.value }}
				</Text> -->
			</Flex>

			<!-- <Text size="13" weight="600" color="primary">
				{{ tia(d.amount) }}
			</Text>
			<Text size="13" weight="600" color="tertiary"> TIA </Text> -->
		</template>
	</Tooltip>
</template>

<style module>
.wrapper {
	width: fit-content;
}

.text {
	text-overflow: ellipsis;
	overflow: hidden;
}
</style>
