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

const lastHead = computed(() => appStore.lastHead)

const votes = computed(() => enumStore.enums.voteOption)

const props = defineProps({
	proposal: {
		type: Object,
		default: {},
	},
})

const expand = ref(["active"].includes(props.proposal.status))

const totalVotingPower = computed(() => {
	if (Number(props.proposal.total_voting_power)) return Number(props.proposal.total_voting_power)
	return lastHead.value?.total_voting_power ?? 0
})

const quorum = props.proposal.status === "active" ? Number(appStore.constants.gov.quorum) : Number(props.proposal.quorum)

const isQuorumReached = computed(() => {
	return props.proposal.voting_power / 1_000_000 / totalVotingPower.value > quorum
})
</script>

<template>
	<Flex direction="column" gap="10" :class="$style.wrapper">
		<Flex @click="expand = !expand" align="center" justify="between" class="clickable">
			<Tooltip position="start" :disabled="!isQuorumReached && proposal.status === 'active'">
				<Flex align="center" gap="6">
					<Text size="12" weight="600" color="secondary">Voting power</Text>
					<Icon v-if="isQuorumReached && proposal.status !== 'active'" name="check-circle" size="12" color="secondary" />
				</Flex>

				<template #content> The quorum is reached - {{ quorum * 100 }}% </template>
			</Tooltip>

			<Icon name="chevron" size="12" color="secondary" :style="{ transform: `rotate(${expand ? '180deg' : '0deg'})` }" />
		</Flex>

		<Flex align="center" gap="4" :class="$style.voting_wrapper">
			<div :style="{ left: `${quorum * 100}%` }" :class="[$style.threshold, !isQuorumReached && $style.red]" />

			<Tooltip
				v-if="proposal.yes"
				wide
				:trigger-width="`${Math.max(5, ((proposal.yes_voting_power / 1_000_000) * 100) / totalVotingPower)}%`"
			>
				<div
					:style="{
						background: 'var(--brand)',
					}"
					:class="$style.voting_bar"
				/>
				<template #content>
					Yes:
					<Text color="primary">
						{{ comma(Number(proposal.yes_voting_power) / 1_000_000) }}
					</Text>
					TIA
				</template>
			</Tooltip>
			<Tooltip
				v-if="proposal.no"
				wide
				:trigger-width="`${Math.max(5, ((proposal.no_voting_power / 1_000_000) * 100) / totalVotingPower)}%`"
			>
				<div
					:style="{
						background: 'var(--red)',
					}"
					:class="$style.voting_bar"
				/>
				<template #content>
					No: <Text color="primary">{{ comma(Number(proposal.no_voting_power) / 1_000_000) }}</Text> TIA
				</template>
			</Tooltip>
			<Tooltip
				v-if="proposal.no_with_veto"
				wide
				:trigger-width="`${Math.max(5, ((proposal.no_with_veto_voting_power / 1_000_000) * 100) / totalVotingPower)}%`"
			>
				<div
					:style="{
						background: 'var(--red)',
					}"
					:class="$style.voting_bar"
				/>
				<template #content>
					No with veto: <Text color="primary">{{ comma(Number(proposal.no_with_veto_voting_power) / 1_000_000) }}</Text> TIA
				</template>
			</Tooltip>
			<Tooltip
				v-if="proposal.abstain"
				wide
				:trigger-width="`${Math.max(5, ((proposal.abstain_voting_power / 1_000_000) * 100) / totalVotingPower)}%`"
			>
				<div
					:style="{
						background: 'var(--op-40)',
					}"
					:class="$style.voting_bar"
				/>
				<template #content>
					Abstain: <Text color="primary">{{ comma(Number(proposal.abstain_voting_power / 1_000_000)) }}</Text> TIA
				</template>
			</Tooltip>
		</Flex>

		<Flex v-if="expand" direction="column" gap="16">
			<Flex v-for="vote in votes" align="center" justify="between">
				<Flex align="center" gap="6">
					<div :class="[$style.dot, $style[vote]]" />
					<Text size="12" weight="600" color="secondary" style="text-transform: capitalize">{{ vote.replaceAll("_", " ") }}</Text>
					<Text v-if="Number(proposal[`${vote}_voting_power`])" size="12" weight="600" color="tertiary">
						{{ comma(proposal[`${vote}_voting_power`] / 1_000_000) }} TIA
					</Text>
				</Flex>

				<Text size="12" weight="600" :color="proposal[vote] ? 'secondary' : 'tertiary'">
					<template
						v-if="
							(Number(proposal[`${vote}_voting_power`]) * 100) / (Number(proposal.voting_power) * 2) > 0 &&
							(Number(proposal[`${vote}_voting_power`]) * 100) / (Number(proposal.voting_power) * 2) < 1
						"
					>
						<Text color="tertiary">< 1%</Text>
					</template>
					<template v-else>
						{{ ((Number(proposal[`${vote}_voting_power`]) * 100) / (Number(proposal.voting_power) * 2)).toFixed(0) }}%
					</template>
				</Text>
			</Flex>

			<Flex align="center" justify="between">
				<Flex align="center" gap="6">
					<div :class="$style.dot" />
					<Text size="12" weight="600" color="secondary" style="text-transform: capitalize"> Summary </Text>
				</Flex>

				<Text size="12" weight="600" color="secondary"> {{ comma(proposal.voting_power / 1_000_000) }} TIA </Text>
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

	width: 4px;
	height: 12px;

	border-radius: 50px;
	background: #fff;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	z-index: 1;

	transform: translateX(-50%);

	&.red {
		background: var(--red);
		box-shadow: 0 0 8px rgb(235, 87, 87);
	}
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
	background: var(--txt-primary);

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
