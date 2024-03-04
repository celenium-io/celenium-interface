<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { abbreviate, capitilize, numToPercent, shareOfTotal } from "@/services/utils"

/** API */
import { fetchValidatorsCount } from "@/services/api/validator";

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()
const lastHead = computed(() => appStore.lastHead)
const stakingShare = computed(() => shareOfTotal(lastHead?.value.total_stake, lastHead?.value.total_supply, 2))

const isRefetching = ref(false)
const totalValidators = ref(0)
const activeValidators = ref(0)
const validatorsStats = ref({})
const validatorsGraph = ref([
	{
		title: "active",
		count: 0,
		width: 0,
		color: "var(--validator-active)",
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
	validatorsStats.value = data.value

	isRefetching.value = false
}

const fillValidatorsGraph = () => {
	totalValidators.value = validatorsStats.value["total"]
	activeValidators.value = validatorsStats.value["active"]

	for (let item of validatorsGraph.value) {
		let value = validatorsStats.value[item.title]

		if (value) {
			item.count = value
			item.width = (value / totalValidators.value * 100).toFixed(2)
		}
	}
}

await getValidatorsStats()
fillValidatorsGraph()

</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex direction="column" gap="20" :class="$style.top">
			<Text size="16" weight="600" color="primary">Staking</Text>

			<template v-if="lastHead.total_supply">
				<Tooltip side="top">
					<div
						:class="$style.staking_bar"
						:style="`--percentStaking: ${stakingShare}%`"
					></div>

					<template #content>
						<Flex align="center" justify="between" gap="8">
							<Text color="secondary">Staking Share</Text>
							<Text color="primary">{{ stakingShare }}%</Text>
						</Flex>
					</template>
				</Tooltip>

				<Flex direction="column" gap="12">
					<Flex align="center" justify="between">
						<Text size="12" weight="600" color="tertiary">
							Total Supply
						</Text>

						<Text size="12" weight="600" color="secondary">
							{{ abbreviate(lastHead.total_supply) }} TIA
						</Text>
					</Flex>

					<Flex align="center" justify="between">
						<Text size="12" weight="600" color="tertiary">
							Voting Power
						</Text>
						
						<Text size="12" weight="600" color="secondary">
							{{ abbreviate(lastHead.total_voting_power) }} TIA
						</Text>
					</Flex>
				</Flex>
			</template>

			<Flex v-else direction="column" gap="20">
				<Skeleton w="180" h="5" />

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
				<Flex :class="$style.validator_bars_wrapper">
					<div
						v-for="v in validatorsGraph.filter(item => item.width !== 0)"
						:class="$style.validator_bar"
						:style="{
							width: `${v.width}%`,
							background: v.color
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
							<Text color="primary">{{ numToPercent((activeValidators / totalValidators), 2) }}</Text>
						</Flex>
					</Flex>
				</template>
			</Tooltip>
			<Skeleton v-else w="180" h="5" />

			<Flex v-if="!isRefetching" direction="column" gap="6">
				<Flex v-for="v in validatorsGraph" justify="between" gap="4">
					<Text size="12" weight="500" color="tertiary"> {{ capitilize(v.title) }} </Text>

					<Flex align="center" gap="4">
						<Text size="12" weight="500" color="secondary"> {{ v.count }} </Text>

						<div
							:class="$style.validator_legend"
							:style="{
								background: v.color,
							}">
						</div>
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

.bars {
	width: fit-content;
	height: 20px;

	border-radius: 5px;
	border: 1px solid var(--txt-secondary);

	padding: 2px;

	.bar {
		min-width: 16px;
		height: 14px;

		background: linear-gradient(var(--txt-primary), var(--txt-support));
		border-radius: 2px;
		opacity: 0.2;

		transition: all 0.5s ease;

		&.active {
			background: linear-gradient(var(--txt-primary), var(--txt-support));
			opacity: 1;
		}
	}
}

.staking_bar {
	width: 184px;
	height: 4px;

	border-radius: 2px;

	background: linear-gradient(90deg, var(--staking) var(--percentStaking), var(--supply) var(--percentStaking));
}

.validator_bars_wrapper {
	width: 184px;
}

.validator_bar {
	height: 4px;

	border-radius: 2px;
	cursor: pointer;

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
	.wrapper {
		flex-direction: row;
	}

	.top {
		flex: 1;
	}

	.bottom {
		height: auto;

		border-top: initial;
		border-left: 2px solid var(--op-5);
	}

	.validator_bars_wrapper {
		width: 365px;
	}

	.staking_bar {
		width: 365px;
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

	.validator_bars_wrapper {
		width: 365px;
	}

	.staking_bar {
		width: 365px;
	}
}
</style>
