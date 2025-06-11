<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { isMainnet } from "@/services/utils"

/** UI */
import Badge from "@/components/ui/Badge.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const props = defineProps({
	proposal: {
		type: Object,
		default: {},
	},
})

const expand = ref(["inactive", "active"].includes(props.proposal.status))
</script>

<template>
	<Flex wide direction="column" gap="8" :class="$style.wrapper">
		<Flex @click="expand = !expand" align="center" justify="between" class="clickable">
			<Text size="12" weight="600" color="secondary">Timeline</Text>

			<Icon name="chevron" size="12" color="secondary" :style="{ transform: `rotate(${expand ? '180deg' : '0deg'})` }" />
		</Flex>

		<Badge>
			<Flex align="center" justify="between" wide>
				<Text size="12" weight="600" color="secondary">
					{{ DateTime.fromISO(proposal.activation_time).setLocale("en").toLocaleString(DateTime.DATE_MED) }}
				</Text>

				<div v-for="dot in 4" class="dot" />

				<Flex align="center" gap="6">
					<Icon name="time" size="12" color="secondary" />
					<Text size="12" weight="600" color="primary">
						{{
							DateTime.fromISO(proposal.end_time)
								.diff(DateTime.fromISO(proposal.activation_time), "days")
								.toObject()
								.days.toFixed(0)
						}}
						Days
					</Text>
				</Flex>

				<div v-for="dot in 4" class="dot" />

				<Text size="12" weight="600" color="secondary" align="right">
					{{
						DateTime.fromISO(proposal.end_time)

							.setLocale("en")
							.toLocaleString(DateTime.DATE_MED)
					}}
				</Text>
			</Flex>
		</Badge>

		<Flex align="center" justify="between">
			<Text size="12" weight="600" color="tertiary">Voting Start</Text>
			<Text size="12" weight="600" color="tertiary">Voting End</Text>
		</Flex>

		<template v-if="expand">
			<Flex direction="column" gap="16" :class="$style.timeline">
				<Flex gap="12">
					<div :class="$style.circle" />

					<Flex direction="column" gap="8">
						<Text size="13" weight="600" color="secondary">Proposal submitted</Text>
						<Text size="12" weight="500" color="tertiary">{{ DateTime.fromISO(proposal.created_at).toFormat("FF") }}</Text>
					</Flex>
				</Flex>
				<Flex gap="12">
					<div :class="$style.circle" />

					<Flex direction="column" gap="8">
						<Text size="13" weight="600" color="secondary">Voting started</Text>
						<Text size="12" weight="500" color="tertiary">{{ DateTime.fromISO(proposal.activation_time).toFormat("FF") }}</Text>
					</Flex>
				</Flex>
				<Flex gap="12">
					<div :class="$style.circle" />

					<Flex direction="column" gap="8">
						<Text size="13" weight="600" color="secondary">End of voting</Text>
						<Text size="12" weight="500" color="tertiary">
							{{ DateTime.fromISO(proposal.end_time).toFormat("FF") }}
						</Text>
					</Flex>
				</Flex>

				<div :class="$style.line" />
			</Flex>
		</template>
	</Flex>
</template>

<style module>
.wrapper {
	border-bottom: 1px solid var(--op-5);

	padding: 16px;
}

.timeline {
	position: relative;

	margin-top: 16px;
}

.circle {
	width: 6px;
	height: 6px;

	border-radius: 50px;
	background: var(--op-50);
	box-shadow: 0 0 0 4px var(--op-10);

	margin-top: 2px;

	&.red {
		background: var(--light-orange);
	}
}

.line {
	position: absolute;
	top: 2px;
	bottom: 26px;
	left: 2px;

	width: 2px;

	border: 1px dashed var(--op-10);
}
</style>
