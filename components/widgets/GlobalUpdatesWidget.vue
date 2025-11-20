<script setup>
/** API */
import { fetchValidatorsUpgradeByVersion } from "@/services/api/validator"

/** Components */
import TransactionsWidget from "./TransactionsWidget.vue"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { capitilize, capitalizeAndReplace, comma, roundTo } from "@/services/utils"

/** Stores */
import { useAppStore } from "@/store/app.store"
const appStore = useAppStore()

const updates = computed(() => appStore.globalUpdates)
const showingUpdate = ref(updates.value[0])
const updateMeta = computed(() => {
	switch (showingUpdate.value?.kind) {
		case "proposal":
			return {
				icon: "governance",
				main_title: "Active Celestia Proposal",
			};
		case "hardfork":
			return {
				icon: "merge",
				main_title: "Upcoming Celestia Hardfork",
			};
		case "node_upgrade":
			return {
				icon: "node",
				main_title: "Upcoming Node Upgrade",
			};
	
		default:
			return {};
	}
})
function handleClick() {
	switch (showingUpdate.value?.kind) {
		case "proposal":
			navigateTo(`/proposal/${showingUpdate.value.id}`)
			break;
		case "hardfork":
			navigateTo(`/block/${showingUpdate.value?.block}`)
			break;
		case "node_upgrade":
			navigateTo(`/upgrade/${showingUpdate.value?.version?.replace("v", "")}`)
			break;
	
		default:
			break;
	}
}

const activeIndex = ref(0)
function handleSwitchUpdate() {
	activeIndex.value = (activeIndex.value + 1) % updates.value.length
	showingUpdate.value = updates.value[activeIndex.value]
}

watch(
	() => updates.value,
	() => {
		if (!showingUpdate.value && updates.value?.length) {
			showingUpdate.value = updates.value[0]
		}
	}
)
watch(
	() => showingUpdate.value,
	async () => {
		if (showingUpdate.value.kind === "node_upgrade") {
			const { data } = await fetchValidatorsUpgradeByVersion(showingUpdate.value?.version)
			showingUpdate.value.status = data.value?.status
			showingUpdate.value.votedShare = parseFloat(data.value?.voted_power) * 100 / parseFloat(data.value?.voting_power)
		}
	}
)
</script>

<template>
	<Transition v-if="updates.length > 0" name="slide-fade" mode="out-in">
		<Flex @click="handleClick" direction="column" gap="8" :key="activeIndex" :class="$style.wrapper">
			<Flex justify="between">
				<Flex align="center" gap="6">
					<Icon
						:name="updateMeta?.icon"
						size="18"
						color="brand"
					/>
					<Text size="16" weight="600" color="primary">
						{{ updateMeta?.main_title }}
					</Text>
				</Flex>

				<Flex v-if="updates?.length > 1" @click.stop="handleSwitchUpdate" align="center" justify="center" :class="$style.switcher">
					<Icon
						name="repeat"
						size="14"
						color="brand"
						style="margin-bottom: 4; margin-left: 4;"
					/>
				</Flex>
			</Flex>

			<Flex v-if="showingUpdate?.kind === 'proposal'" justify="center" direction="column" gap="16">
				<Flex align="center" gap="8" wide>
					<Text size="12" weight="500" color="tertiary">Status</Text>
					<Text size="12" weight="600" color="brand"> {{ capitilize(showingUpdate?.status) }} </Text>
				</Flex>

				<Flex direction="column" gap="6" wide>
					<Text size="12" weight="600" color="primary" :class="$style.title"> {{ showingUpdate?.title }} </Text>
					<Text size="12" weight="500" color="secondary" :class="$style.description"> {{ showingUpdate?.description }} </Text>
				</Flex>

				<Flex direction="column" gap="6" wide>
					<Text size="12" weight="500" color="tertiary">Voting</Text>
					<Flex align="center" gap="4" :class="$style.voting_wrapper">
						<Tooltip
							v-if="showingUpdate.yes"
							wide
							:trigger-width="`${Math.max(10, (showingUpdate.yes * 100) / showingUpdate.votes_count)}%`"
						>
							<div
								:style="{
									background: 'var(--brand)',
								}"
								:class="$style.voting_bar"
							/>
							<template #content>
								Yes: <Text color="primary">{{ comma(showingUpdate.yes) }}</Text>
							</template>
						</Tooltip>
						<Tooltip
							v-if="showingUpdate.no"
							wide
							:trigger-width="`${Math.max(10, (showingUpdate.no * 100) / showingUpdate.votes_count)}%`"
						>
							<div
								:style="{
									background: 'var(--red)',
								}"
								:class="$style.voting_bar"
							/>
							<template #content>
								No: <Text color="primary">{{ comma(showingUpdate.no) }}</Text>
							</template>
						</Tooltip>
						<Tooltip
							v-if="showingUpdate.no_with_veto"
							wide
							:trigger-width="`${Math.max(
								10,
								(showingUpdate.no_with_veto * 100) / showingUpdate.votes_count,
							)}%`"
						>
							<div
								:style="{
									background: 'var(--red)',
								}"
								:class="$style.voting_bar"
							/>
							<template #content>
								No with veto: <Text color="primary">{{ comma(showingUpdate.no_with_veto) }}</Text>
							</template>
						</Tooltip>
						<Tooltip
							v-if="showingUpdate.abstain"
							wide
							:trigger-width="`${Math.max(10, (showingUpdate.abstain * 100) / showingUpdate.votes_count)}%`"
						>
							<div
								:style="{
									background: 'var(--op-40)',
								}"
								:class="$style.voting_bar"
							/>
							<template #content>
								Abstain: <Text color="primary">{{ comma(showingUpdate.abstain) }}</Text>
							</template>
						</Tooltip>
					</Flex>
				</Flex>
			</Flex>

			<Flex v-else-if="showingUpdate?.kind === 'node_upgrade'" justify="between" direction="column" gap="12" style="flex: 1;">
				<Flex direction="column" gap="16">
					<Flex align="center" gap="8" wide>
						<Text size="12" weight="500" color="tertiary">Status</Text>
						<Text v-if="showingUpdate?.status" size="12" weight="600" color="brand"> {{ capitalizeAndReplace(showingUpdate?.status, "_") }} </Text>
					</Flex>

					<Flex direction="column" gap="6" wide>
						<Text size="12" weight="600" color="primary" :class="$style.title"> {{ showingUpdate?.title }} </Text>
						<Text size="12" weight="500" color="secondary" :class="$style.description"> {{ showingUpdate?.description }} </Text>
					</Flex>
				</Flex>

				<Flex direction="column" justify="between" gap="8" wide>
					<Flex align="center" justify="between" wide>
						<Tooltip position="start">
							<Flex align="center" gap="6">
								<Text size="12" weight="600" color="secondary"> Upgrade progress </Text>
								<Icon
									name="warning"
									size="12"
									color="secondary"
								/>
							</Flex>

							<template #content>
								<Flex wide>
									<Text size="12" color="secondary" style="width: 300px; line-height: 1.2; white-space: normal; overflow-wrap: anywhere;">
										The upgrade requires at least 5/6 (83.33%) of the total stake to be voted power.
									</Text>
								</Flex>
							</template>
						</Tooltip>

						<Text size="12" weight="600" color="primary"> 
							<Text :color="showingUpdate?.votedShare > 83.3 ? 'brand' : 'tertiary'"> {{ roundTo(showingUpdate?.votedShare, 2) }}% </Text> / 83.3%
						</Text>
					</Flex>

					<Flex align="center" gap="4" :class="$style.signaling_wrapper">
						<div :style="{ left: `83.33%` }" :class="$style.signaling_threshold" />

						<div
							:style="{
								background: 'var(--brand)',
								width: `${Math.max(2, roundTo(showingUpdate?.votedShare, 0, 'ceil'))}%`
							}"
							:class="$style.signaling_bar"
						/>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Transition>

	<TransactionsWidget v-else />
</template>

<style module>
.wrapper {
	position: relative;

	height: 100%;
	min-height: 164px;

	background: var(--card-background);
	border-radius: 12px;
	overflow: hidden;

	padding: 12px;

	cursor: pointer;
}

.switcher {
	position: absolute;
	top: 0;
	right: 0;
	width: 32px;
	height: 32px;
	background: var(--op-3);
	border-bottom-left-radius: 100%;
	z-index: 999;
	cursor: pointer;

	&:hover {
		transform: scale(1.1);
	}
}

.title {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.description {
	display: -webkit-box;
	line-height: 1.2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
}

.description_four_lines {
	line-clamp: 4;
	-webkit-line-clamp: 4;
}

.voting_wrapper {
	width: 100%;
	min-height: 12px;

	border-radius: 50px;
	background: var(--op-8);

	padding: 4px;
}

.voting_bar {
	width: 100%;
	height: 4px;

	border-radius: 50px;
}

.signaling_wrapper {
	position: relative;
	width: 100%;

	border-radius: 50px;
	background: var(--op-8);

	padding: 4px;
}

.signaling_threshold {
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

.signaling_bar {
	height: 4px;

	border-radius: 50px;
}
</style>
