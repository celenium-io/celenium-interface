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

const expand = ref(["inactive", "active"].includes(props.proposal.status))
</script>

<template>
	<Flex direction="column" gap="10" :class="$style.wrapper">
		<Flex @click="expand = !expand" align="center" justify="between" class="clickable">
			<Tooltip position="start" :disabled="!['applied', 'rejected'].includes(proposal.status)">
				<Flex align="center" gap="6">
					<Text size="12" weight="600" color="secondary">Allocation of votes</Text>
					<Icon
						v-if="['applied', 'rejected'].includes(proposal.status)"
						:name="
							(proposal.no_with_veto / proposal.votes_count > Number(proposal.veto_quorum) && 'warning') ||
							(proposal.yes / proposal.votes_count > Number(proposal.threshold) && 'check-circle')
						"
						size="12"
						color="secondary"
					/>
				</Flex>

				<template v-if="proposal.no_with_veto / proposal.votes_count > Number(proposal.veto_quorum)" #content>
					The No With Veto vote threshold is met - {{ Number(proposal.veto_quorum) * 100 }}%
				</template>
				<template v-else-if="proposal.yes / proposal.votes_count > Number(proposal.threshold)" #content>
					The Yes vote threshold is met - {{ Number(proposal.threshold) * 100 }}%
				</template>
			</Tooltip>

			<Icon name="chevron" size="12" color="secondary" :style="{ transform: `rotate(${expand ? '180deg' : '0deg'})` }" />
		</Flex>

		<Flex align="center" gap="4" :class="$style.voting_wrapper">
			<div :style="{ left: `${Number(proposal.threshold) * 100}%` }" :class="$style.threshold" />

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
			<Flex direction="column" gap="16">
				<Flex v-for="vote in votes" align="center" justify="between">
					<Flex align="center" gap="6">
						<div :class="[$style.dot, $style[vote]]" />
						<Text size="12" weight="600" color="secondary" style="text-transform: capitalize">
							{{ vote.replaceAll("_", " ") }}
						</Text>
						<Text size="12" weight="600" color="tertiary">{{ comma(proposal[vote]) }}</Text>
					</Flex>

					<Text size="12" weight="600" :color="proposal[vote] ? 'secondary' : 'tertiary'">
						<template
							v-if="(proposal[vote] * 100) / proposal.votes_count > 0 && (proposal[vote] * 100) / proposal.votes_count < 1"
						>
							<Text color="tertiary">< 1%</Text>
						</template>
						<template v-else> {{ ((proposal[vote] * 100) / proposal.votes_count).toFixed(0) }}% </template>
					</Text>
				</Flex>
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
