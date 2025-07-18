<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { abbreviate, capitilize, numToPercent, shareOfTotal } from "@/services/utils"

/** API */
import { fetchValidatorsCount } from "@/services/api/validator"

/** Store */
import { useAppStore } from "@/store/app.store"
const appStore = useAppStore()

const currentPrice = computed(() => appStore.currentPrice)
const lastHead = computed(() => appStore.lastHead)

const wrapperEl = ref(null)
const wrapperWidth = ref(0)
const barWidth = computed(() => Math.round(wrapperWidth.value - 32))

const totalSupply = computed(() => lastHead.value?.total_supply / 1_000_000)
const totalSupplyUSD = computed(() => totalSupply.value * currentPrice.value?.close)
const totalVotingPower = computed(() => lastHead.value?.total_voting_power)
const totalVotingPowerUSD = computed(() => totalVotingPower.value * currentPrice.value?.close)

const bondedShare = computed(() => shareOfTotal(lastHead.value?.total_voting_power * 1_000_000, lastHead.value?.total_supply, 2))

const isRefetching = ref(true)
const totalValidators = ref(0)
const activeValidators = ref(0)
const validatorsGraph = ref([
	{
		title: "active",
		count: 0,
		width: 0,
		color: "var(--brand)",
	},
	{
		title: "inactive",
		count: 0,
		width: 0,
		color: "var(--validator-inactive)",
	},
	{
		title: "jailed",
		count: 0,
		width: 0,
		color: "var(--validator-jailed)",
	},
])

const getValidatorsStats = async () => {
	isRefetching.value = true

	const { data } = await fetchValidatorsCount()
	if (data.value?.total) {
		totalValidators.value = data.value.total
		activeValidators.value = data.value.active

		for (let item of validatorsGraph.value) {
			let value = data.value[item.title]

			if (value) {
				item.count = value
				item.width = ((value / totalValidators.value) * 100).toFixed(2)
			}
		}
	}

	isRefetching.value = false
}

await getValidatorsStats()

onMounted(async () => {
	wrapperWidth.value = wrapperEl.value.wrapper.offsetWidth
})
</script>

<template>
	<Flex ref="wrapperEl" direction="column" wide :class="$style.wrapper">
		<Flex direction="column" gap="20" :class="$style.top">
			<Text size="16" weight="600" color="primary">Staking</Text>

			<template v-if="lastHead.total_supply">
				<Tooltip side="top">
					<div
						:class="$style.staking_bar"
						:style="`--percentStaking: ${bondedShare}%;
								width: ${barWidth}px`"
					/>

					<template #content>
						<Flex align="center" justify="between" gap="8">
							<Text color="secondary">Bonded Share</Text>
							<Text color="primary">{{ bondedShare }}%</Text>
						</Flex>
					</template>
				</Tooltip>

				<Flex direction="column" gap="12">
					<Flex align="center" justify="between">
						<Text size="12" weight="600" color="tertiary"> Total Supply </Text>

						<Tooltip side="top" position="end">
							<Text size="12" weight="600" color="secondary"> {{ abbreviate(totalSupply, 2) }} TIA </Text>

							<template #content>
								<Text size="12" weight="600" color="secondary"> {{ abbreviate(totalSupplyUSD, 2) }} USD </Text>
							</template>
						</Tooltip>
					</Flex>

					<Flex align="center" justify="between">
						<Text size="12" weight="600" color="tertiary"> Bonded </Text>

						<Tooltip side="top" position="end">
							<Text size="12" weight="600" color="secondary"> {{ abbreviate(totalVotingPower) }} TIA </Text>

							<template #content>
								<Text size="12" weight="600" color="secondary"> {{ abbreviate(totalVotingPowerUSD, 2) }} USD </Text>
							</template>
						</Tooltip>
					</Flex>
				</Flex>
			</template>

			<Flex v-else direction="column" gap="20">
				<Skeleton :w="barWidth" h="5" />

				<Flex direction="column" gap="12">
					<Flex justify="between">
						<Skeleton w="70" h="12" />
						<Skeleton w="70" h="12" />
					</Flex>

					<Flex justify="between">
						<Skeleton w="70" h="12" />
						<Skeleton w="70" h="12" />
					</Flex>
				</Flex>
			</Flex>
		</Flex>

		<Flex direction="column" gap="20" :class="$style.bottom">
			<Flex align="center" justify="between">
				<Flex align="center" gap="6">
					<Icon name="validator" size="12" color="secondary" />
					<Text size="13" weight="600" height="110" color="secondary">Validators</Text>
				</Flex>

				<NuxtLink :to="'/validators'" :class="$style.link">
					<Text size="11" weight="600" height="110" color="tertiary">View All</Text>
				</NuxtLink>
			</Flex>

			<Tooltip v-if="!isRefetching" position="start" side="top">
				<Flex :style="`width: ${barWidth}px`">
					<div
						v-for="v in validatorsGraph.filter((item) => item.width !== 0)"
						:class="$style.validator_bar"
						:style="{
							width: `${v.width}%`,
							background: v.color,
						}"
					></div>
				</Flex>

				<template #content>
					<Flex direction="column" gap="4">
						<Flex align="center" justify="between" gap="40">
							<Text color="secondary">Active / Total</Text>
							<Text color="primary"> {{ activeValidators }} / {{ totalValidators }} </Text>
						</Flex>

						<Flex align="center" justify="between" gap="8">
							<Text color="secondary">Percentage</Text>
							<Text color="primary">{{ numToPercent(activeValidators / totalValidators, 2) }}</Text>
						</Flex>
					</Flex>
				</template>
			</Tooltip>
			<Skeleton v-else :w="barWidth" h="5" />

			<Flex v-if="!isRefetching" direction="column" gap="6">
				<Flex v-for="v in validatorsGraph" justify="between" gap="4">
					<Text size="12" weight="500" color="tertiary"> {{ capitilize(v.title) }} </Text>

					<Flex align="center" gap="4">
						<Text size="12" weight="500" color="secondary"> {{ v.count }} </Text>

						<div
							:class="$style.validator_legend"
							:style="{
								background: v.color,
							}"
						></div>
					</Flex>
				</Flex>
			</Flex>
			<Flex v-else direction="column" gap="6">
				<Flex v-for="i in 3" justify="between" gap="4">
					<Flex gap="4">
						<Skeleton w="10" h="10" />
						<Skeleton w="45" h="12" />
					</Flex>

					<Skeleton w="15" h="12" />
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	background: var(--card-background);
	border-radius: 12px;
	overflow: hidden;
}

.top {
	padding: 16px 16px 20px 16px;
}

.tpm_num {
	background: -webkit-linear-gradient(var(--txt-primary), var(--txt-tertiary));
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.ds_font {
	font-family: "DS";
}

.bottom {
	height: 100%;

	background: var(--network-widget-background);
	border-top: 2px solid var(--op-5);

	padding: 8px 16px 12px 16px;
}

.staking_bar {
	height: 4px;

	border-radius: 2px;

	background: linear-gradient(90deg, var(--brand) var(--percentStaking), var(--supply) var(--percentStaking));
}

.validator_bar {
	height: 4px;

	border-radius: 2px;

	margin-right: 4px;
	margin-bottom: 4px;
}

.validator_legend {
	width: 6px;
	height: 6px;

	border-radius: 5px;
	cursor: pointer;

	margin-right: 6px;
}

.link {
	height: 24px;

	& span {
		transition: all 0.2s ease;

		&:hover {
			color: var(--txt-primary);
		}
	}
}

@media (max-width: 1100px) {
	.top {
		flex: 1;
	}

	.bottom {
		height: auto;

		border-top: initial;
		border-left: 2px solid var(--op-5);
	}
}

@media (max-width: 420px) {
	.wrapper {
		flex-direction: column;
	}

	.top {
		flex: initial;
	}

	.bottom {
		border-top: 2px solid var(--op-5);
		border-left: initial;
	}
}
</style>
