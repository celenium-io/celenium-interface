<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma } from "@/services/utils"

/** Store */
import { useAppStore } from "@/store/app"
import { useEnumStore } from "@/store/enums"
const appStore = useAppStore()
const enumStore = useEnumStore()

const votes = computed(() => enumStore.enums.voteOption)

const props = defineProps({
	proposal: {
		type: Object,
		default: {},
	},
})

const expand = ref(false)
</script>

<template>
	<Flex direction="column" gap="10" :class="$style.wrapper">
		<Flex @click="expand = !expand" align="center" justify="between" class="clickable">
			<Text size="12" weight="600" color="secondary">Allocation of votes</Text>
			<Icon name="chevron" size="12" color="secondary" :style="{ transform: `rotate(${expand ? '180deg' : '0deg'})` }" />
		</Flex>

		<Flex align="center" gap="4" :class="$style.voting_wrapper">
			<div :class="$style.threshold" />

			<Tooltip v-if="proposal.yes" wide :trigger-width="`${Math.max(5, (proposal.yes * 100) / proposal.votes_count)}%`">
				<div
					:style="{
						background: 'var(--brand)',
					}"
					:class="$style.voting_bar"
				/>
				<template #content>
					Yes:
					<Text color="primary">
						{{ comma(proposal.yes) }}
					</Text>
				</template>
			</Tooltip>
			<Tooltip v-if="proposal.no" wide :trigger-width="`${Math.max(5, (proposal.no * 100) / proposal.votes_count)}%`">
				<div
					:style="{
						background: 'var(--red)',
					}"
					:class="$style.voting_bar"
				/>
				<template #content>
					No: <Text color="primary">{{ comma(proposal.no) }}</Text>
				</template>
			</Tooltip>
			<Tooltip
				v-if="proposal.no_with_veto"
				wide
				:trigger-width="`${Math.max(5, (proposal.no_with_veto * 100) / proposal.votes_count)}%`"
			>
				<div
					:style="{
						background: 'var(--red)',
					}"
					:class="$style.voting_bar"
				/>
				<template #content>
					No with veto: <Text color="primary">{{ comma(proposal.no_with_veto) }}</Text>
				</template>
			</Tooltip>
			<Tooltip v-if="proposal.abstain" wide :trigger-width="`${Math.max(5, (proposal.abstain * 100) / proposal.votes_count)}%`">
				<div
					:style="{
						background: 'var(--op-40)',
					}"
					:class="$style.voting_bar"
				/>
				<template #content>
					Abstain: <Text color="primary">{{ comma(proposal.abstain) }}</Text>
				</template>
			</Tooltip>
		</Flex>

		<Flex v-if="expand" direction="column" gap="16">
			<Flex direction="column" gap="12">
				<Flex v-for="vote in votes" align="center" justify="between">
					<Flex align="center" gap="6">
						<div :class="[$style.dot, $style[vote]]" />
						<Text size="12" weight="600" color="secondary" style="text-transform: capitalize">{{
							vote.replaceAll("_", " ")
						}}</Text>
						<Text size="12" weight="600" color="tertiary">{{ comma(proposal[vote]) }}</Text>
					</Flex>

					<Text size="12" weight="600" :color="proposal[vote] ? 'secondary' : 'tertiary'">
						<Text v-if="Number(proposal[`${vote}_voting_power`])" color="tertiary">
							{{ comma(proposal[`${vote}_voting_power`] / 1_000_000) }} TIA
						</Text>
						{{ ((proposal[vote] * 100) / proposal.votes_count).toFixed(0) }}%
					</Text>
				</Flex>
			</Flex>

			<Flex v-if="proposal.yes / proposal.votes_count > appStore.constants.gov.threshold" align="center" gap="4">
				<Icon name="check-circle" size="12" color="tertiary" />
				<Text size="12" weight="500" color="tertiary">
					The <Text color="secondary" weight="600">Yes</Text> vote threshold of
					<Text color="secondary">{{ appStore.constants.gov.threshold * 100 }}%</Text> is met
				</Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
}

.voting_wrapper {
	position: relative;
	width: 100%;

	border-radius: 50px;
	background: var(--op-8);

	padding: 4px;
}

.threshold {
	position: absolute;
	top: 0;
	left: 50%;

	width: 4px;
	height: 12px;

	border-radius: 50px;
	background: #fff;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	z-index: 1;
}

.voting_bar {
	width: 100%;
	height: 4px;

	border-radius: 50px;
}

.dot {
	width: 6px;
	height: 6px;

	border-radius: 50%;

	&.yes {
		background: var(--brand);
	}

	&.no {
		background: var(--red);
	}

	&.no_with_veto {
		background: var(--red);
	}

	&.abstain {
		background: var(--txt-tertiary);
	}
}
</style>
