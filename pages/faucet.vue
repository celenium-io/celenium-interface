<script setup>
/** Services */
import { formatBytes, comma, abbreviate, purgeNumber } from "@/services/utils"

/** UI */
import Input from "@/components/ui/Input.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const route = useRoute()

useHead({
	title: `Celestia Faucet - Celenium`,
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
			content: `Celestia Rollup Cost Saving Calculator - Celenium`,
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
			content: `Celestia Rollup Cost Saving Calculator - Celenium`,
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

const address = ref("")
console.log(appStore.address);

onMounted(() => {
	address.value = appStore.address
})
</script>

<template>
	<Flex gap="40" direction="column" :class="$style.wrapper">

		<Flex direction="column" gap="8" wide>
			<Flex align="center" justify="between" gap="8" wide>
				<Input v-model="address" :placeholder="appStore.address || 'celestia0x0x..'" ref="inputEl" wide>
					<template #rightText>
						<Flex v-if="addressError?.length" align="center" gap="4">
							<Icon name="danger" size="12" color="yellow" />
							<Text size="12" weight="600" color="yellow">{{ addressError }}</Text>
						</Flex>
						<Icon v-else-if="addressSuccess" name="check-circle" size="12" color="green" />
						<!-- <Text v-else /> -->
					</template>
				</Input>

				<Button @click="executeFaucet" type="white" size="small" wide>Send me TIA</Button>
			</Flex>

			<Flex v-if="isAddressNotFound" align="center" gap="4">
				<Icon name="danger" size="12" color="red" />
				<Text size="12" weight="500" color="tertiary"> This address is not found, you can't delegate </Text>
			</Flex>
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
