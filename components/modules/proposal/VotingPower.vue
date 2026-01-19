<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma, roundTo } from "@/services/utils"

/** Store */
import { useAppStore } from "@/store/app.store"
import { useEnumStore } from "@/store/enums.store"
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

const voteKinds = {
	yes: {
		name: "Yes",
		color: "var(--brand)",
	},
	no: {
		name: "No",
		color: "var(--red)",
	},
	no_with_veto: {
		name: "No with veto",
		color: "var(--red)",
	},
	abstain: {
		name: "Abstain",
		color: "var(--op-40)",
	},
}
const voteDistribution = computed(() => {
	const distribution = {}

	Object.keys(voteKinds).forEach((kind) => {
		distribution[kind] = {
			...voteKinds[kind],
			power: Number(props.proposal[`${kind}_voting_power`] / 1_000_000 || 0),
			shareOfTotal: Number(props.proposal[`${kind}_voting_power`] / 1_000_000 * 100 || 0) / totalVotingPower.value,
		}

		const shareOfVotes = roundTo(Number(props.proposal[`${kind}_voting_power`] / 1_000_000 * 100 || 0) / (props.proposal.voting_power / 1_000_000), 0)
		distribution[kind].shareOfVotes = shareOfVotes === 0 && props.proposal[kind]
			? "< 1%"
			: shareOfVotes === 100 && props.proposal[kind] < props.proposal.votes_count
				? "> 99%"
				: `${shareOfVotes}%`
	})

	return distribution
})

const quorum = props.proposal.status === "active" ? Number(appStore.constants?.gov.quorum) : Number(props.proposal.quorum)

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

			<template v-for="v in Object.keys(voteDistribution)">
				<Tooltip
					v-if="voteDistribution[v].power"
					wide
					:trigger-width="`${voteDistribution[v].power ? Math.max(5, voteDistribution[v].shareOfTotal) : 0}%`"
				>
					<div
						:style="{
							background: voteDistribution[v].color,
						}"
						:class="$style.voting_bar"
					/>
					<template #content>
						{{ voteDistribution[v].name }}:
						<Text color="primary">
							{{ comma(voteDistribution[v].power) }}
						</Text>
						TIA
					</template>
				</Tooltip>
			</template>
		</Flex>

		<Flex v-if="expand" direction="column" gap="16">
			<Flex v-for="vote in votes" align="center" justify="between">
				<Flex align="center" gap="6">
					<div :class="[$style.dot, $style[vote]]" />
					<Text size="12" weight="600" color="secondary">{{ voteDistribution[vote].name }}</Text>
					<Text v-if="voteDistribution[vote].power" size="12" weight="600" color="tertiary">
						{{ comma(voteDistribution[vote].power) }} TIA
					</Text>
				</Flex>

				<Text size="12" weight="600" :color="!proposal[vote] || voteDistribution[vote].shareOfVotes === '< 1%' ? 'tertiary' : 'secondary'">
					{{ voteDistribution[vote].shareOfVotes }}
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
