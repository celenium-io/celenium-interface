<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma } from "@/services/utils"

/** Constants */
import { IbcChainName } from "@/services/constants/ibc"

const props = defineProps({
	largestChain: {
		type: Object,
	},
})
</script>

<template>
	<Flex align="center" gap="16" :class="$style.wrapper">
		<Tooltip wide position="start">
			<Flex wide direction="column" gap="12" :class="$style.card">
				<Flex align="center" justify="between">
					<Flex align="center" gap="8">
						<Icon name="coins" size="14" color="orange" />
						<Text size="13" weight="600" color="secondary">Largest connected chain</Text>
					</Flex>

					<Icon name="info" size="14" color="support" />
				</Flex>

				<Text size="15" weight="600" color="primary">{{ IbcChainName[largestChain?.chain] ?? "Unknown" }} </Text>

				<Text size="13" weight="500" color="support">
					<Text color="tertiary" mono>{{ comma(largestChain?.flow / 1_000_000) }} TIA</Text>
				</Text>
			</Flex>

			<template #content> The amount shown is the chain flow, sent and received tokens </template>
		</Tooltip>

		<Flex wide direction="column" gap="12" :class="[$style.card, $style.hoverable]">
			<Flex align="center" justify="between">
				<Flex align="center" gap="8">
					<Icon name="arrow-circle-broken-right" size="14" color="brand" />
					<Text size="13" weight="600" color="secondary">Largest transfer today</Text>
				</Flex>

				<Icon name="arrow-narrow-up-right-circle" size="14" color="tertiary" />
			</Flex>

			<Text size="15" weight="600" color="primary">Celestia <Text color="tertiary">-></Text> Stride </Text>

			<Text size="13" weight="500" color="support">
				<Text color="tertiary" mono>{{ comma(1_360_707) }} TIA</Text>
			</Text>
		</Flex>

		<Flex wide direction="column" gap="12" :class="$style.card">
			<Flex align="center" justify="between">
				<Flex align="center" gap="8">
					<Icon name="zap" size="14" color="red" />
					<Text size="13" weight="600" color="secondary">Busiest channel</Text>
				</Flex>

				<Text size="12" weight="600" color="tertiary">July</Text>
			</Flex>

			<Text size="15" weight="600" color="primary">channel-98</Text>

			<Text size="13" weight="500" color="support">
				<Text color="tertiary" mono>582 transfers</Text>
			</Text>
		</Flex>
	</Flex>
</template>

<style module>
.card {
	border-radius: 8px;
	background: var(--card-background);

	padding: 12px;

	&.hoverable {
		cursor: pointer;

		transition: all 0.2s ease;

		&:hover {
			box-shadow: 0 0 0 2px var(--op-10);
		}
	}
}

@media (max-width: 800px) {
	.wrapper {
		flex-direction: column;
	}
}
</style>
