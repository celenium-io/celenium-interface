<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchSummary } from "@/services/api/stats"
import { fetchAddressesCount } from "@/services/api/address"

/** Services */
import { abbreviate } from "@/services/utils"

const totalAccounts = ref(0)
const totalValidators = ref(0)

const { data } = await fetchAddressesCount()
totalAccounts.value = data.value

onMounted(async () => {
	const data = await fetchSummary({ table: "validator", func: "count" })
	totalValidators.value = data
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex direction="column" gap="20" :class="$style.top">
			<Text size="16" weight="600" color="primary">Accounts</Text>

			<Text size="40" weight="600" color="primary" :class="[$style.ds_font, $style.tpm_num]">
				{{ abbreviate(totalAccounts) }}
			</Text>
		</Flex>

		<Flex direction="column" gap="24" :class="$style.bottom">
			<Flex align="center" gap="6">
				<Icon name="addresses" size="12" color="secondary" />
				<Text size="13" weight="600" height="110" color="secondary">Validators</Text>
			</Flex>

			<Tooltip position="start">
				<Flex gap="2" :class="$style.bars">
					<div v-for="item in 10" :class="[$style.bar, (100 * 100) / totalValidators > item * 10 && $style.active]" />
				</Flex>

				<template #content>
					<Flex direction="column" gap="4">
						<Flex justify="between" align="center" gap="40">
							<Text color="secondary">Active / Total</Text>
							<Text color="primary"> 100 / {{ totalValidators }} </Text>
						</Flex>

						<Flex justify="between" align="center" gap="8">
							<Text color="secondary">Percentage</Text>
							<Text color="primary">{{ ((100 * 100) / totalValidators).toFixed(2) }}%</Text>
						</Flex>
					</Flex>
				</template>
			</Tooltip>

			<Flex align="center" justify="between">
				<Text size="12" weight="600" color="tertiary"> Active Validators </Text>
				<Text size="16" weight="600" color="secondary" :class="$style.ds_font">100</Text>
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

	padding: 20px 16px;
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
