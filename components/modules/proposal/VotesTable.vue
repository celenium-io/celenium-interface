<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { space } from "@/services/utils"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Popover from "@/components/ui/Popover.vue"
import Radio from "@/components/ui/Radio.vue"

/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

const emit = defineEmits(["onPrevPage", "onNextPage", "updatePage", "updateFilters", "onFiltersReset"])
const props = defineProps({
	proposal: {
		type: Object,
		default: {},
	},
	votes: {
		type: Array,
		default: [],
	},
	votesTotal: {
		type: Number,
		default: 0,
	},
	filters: {
		type: Object,
	},
	page: {
		type: Number,
		default: 1,
	},
	isLoadingVotes: {
		type: Boolean,
		default: false,
	},
})

const getVoteIcon = (status) => {
	if (status === "yes") return "check-circle"
	if (status === "no") return "close-circle"
	if (status === "no_with_veto") return "close-circle"
	if (status === "abstain") return "close-circle"
}

const getVoteIconColor = (status) => {
	if (status === "yes") return "green"
	if (status === "no") return "red"
	if (status === "no_with_veto") return "red"
	if (status === "abstain") return "tertiary"
}

/** Filter by vote option */
const optionFilter = ref()

const hasActiveFilters = computed(() => !!optionFilter.value)

const isOptionPopoverOpen = ref(false)
const handleOpenOptionPopover = () => {
	isOptionPopoverOpen.value = true
}
const onOptionPopoverClose = () => {
	isOptionPopoverOpen.value = false

	optionFilter.value = null
}
const handleApplyOptionFilters = () => {
	isOptionPopoverOpen.value = false

	emit("updateFilters", "option", optionFilter.value, true)
}
const handleResetOptionFilter = () => {
	emit("onFiltersReset", "option", true)
	optionFilter.value = null
}
</script>

<template>
	<Flex direction="column" :class="[$style.wrapper, isLoadingVotes && $style.disabled]">
		<Flex wrap="wrap" align="center" gap="8" :class="$style.filters">
			<Popover :open="isOptionPopoverOpen" @on-close="onOptionPopoverClose" width="200">
				<Button @click="handleOpenOptionPopover" type="secondary" size="mini" :disabled="!votes.length && !hasActiveFilters">
					<Icon name="filter" size="12" :color="optionFilter ? 'brand' : 'tertiary'" />
					<Text color="secondary">Option<template v-if="optionFilter">:</template></Text>

					<template v-if="optionFilter">
						<Text size="12" weight="600" color="primary" style="text-transform: capitalize">
							{{ optionFilter.replaceAll("_", " ") }}
						</Text>

						<Icon @click.stop="handleResetOptionFilter" name="close-circle" size="12" color="secondary" />
					</template>
				</Button>

				<template #content>
					<Flex direction="column" gap="12">
						<Text size="12" weight="600" color="secondary">Filter by Vote Option</Text>

						<Flex direction="column" gap="8">
							<Radio v-model="optionFilter" value="yes">
								<Text size="12" weight="500" color="primary">Yes</Text>
							</Radio>
							<Radio v-model="optionFilter" value="no">
								<Text size="12" weight="500" color="primary">No</Text>
							</Radio>
							<Radio v-model="optionFilter" value="no_with_veto">
								<Text size="12" weight="500" color="primary">No with veto</Text>
							</Radio>
							<Radio v-model="optionFilter" value="abstain">
								<Text size="12" weight="500" color="primary">Abstain</Text>
							</Radio>
						</Flex>

						<Button @click="handleApplyOptionFilters" type="secondary" size="mini" wide>Apply</Button>
					</Flex>
				</template>
			</Popover>
		</Flex>

		<Flex v-if="votes.length" :class="$style.scroller">
			<table>
				<thead>
					<tr>
						<th><Text size="12" weight="600" color="tertiary">Option</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Voter</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Validator</Text></th>
					</tr>
				</thead>

				<tbody>
					<tr v-for="vote in votes" @click="navigateTo(`/address/${vote.voter.hash}`)">
						<td>
							<Flex align="center" gap="4">
								<Icon :name="getVoteIcon(vote.status)" size="12" :color="getVoteIconColor(vote.status)" />
								<Text size="13" weight="600" color="primary" style="text-transform: capitalize">
									{{ vote.status.replaceAll("_", " ") }}
								</Text>
							</Flex>
						</td>
						<td>
							<NuxtLink :to="`/address/${vote.voter.hash}`">
								<Flex align="center">
									<Text size="13" weight="600" color="primary" class="table_column_alias">
										{{ $getDisplayName("addresses", vote.voter.hash) }}
									</Text>
								</Flex>
							</NuxtLink>
						</td>
						<td>
							<Flex justify="center" direction="column" gap="4">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(vote.deposit_time).toRelative({ locale: "en", style: "short" }) }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ DateTime.fromISO(vote.deposit_time).setLocale("en").toFormat("LLL d, t") }}
								</Text>
							</Flex>
						</td>
						<td>
							<Flex v-if="vote.validator" align="center">
								<Tooltip delay="500">
									<template #default>
										<Flex direction="column" gap="4">
											<Text size="12" height="120" weight="600" color="primary">
												{{ vote.validator.moniker }}
											</Text>

											<Flex align="center" gap="6">
												<Text size="12" weight="600" color="tertiary" mono>
													{{ vote.validator.cons_address.slice(0, 4) }}
												</Text>
												<Flex align="center" gap="3">
													<div v-for="dot in 3" class="dot" />
												</Flex>
												<Text size="12" weight="600" color="tertiary" mono>
													{{
														vote.validator.cons_address.slice(
															vote.validator.cons_address.length - 4,
															vote.validator.cons_address.length,
														)
													}}
												</Text>
												<CopyButton :text="vote.validator.cons_address" size="10" />
											</Flex>
										</Flex>
									</template>

									<template #content> {{ space(vote.validator.cons_address) }} </template>
								</Tooltip>
							</Flex>
							<Text v-else size="12" weight="600" color="support">No Validator</Text>
						</td>
					</tr>
				</tbody>
			</table>
		</Flex>

		<TablePlaceholderView
			v-else
			title="There's no votes"
			description="This proposal does not contain any votes."
			icon="governance"
			subIcon="search"
			:descriptionWidth="260"
			style="height: 100%"
		/>

		<!-- Pagination -->
		<Flex align="center" gap="6" :class="$style.pagination">
			<Button @click="emit('updatePage', 1)" type="secondary" size="mini" :disabled="page === 1">
				<Icon name="arrow-left-stop" size="12" color="primary" />
			</Button>
			<Button type="secondary" @click="emit('onPrevPage')" size="mini" :disabled="page === 1">
				<Icon name="arrow-left" size="12" color="primary" />
			</Button>

			<Button type="secondary" size="mini" disabled>
				<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
			</Button>

			<Button @click="emit('onNextPage')" type="secondary" size="mini" :disabled="Math.ceil(votesTotal / 10) === page">
				<Icon name="arrow-right" size="12" color="primary" />
			</Button>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		padding-bottom: 8px;

		& tbody {
			& tr {
				cursor: pointer;

				transition: all 0.05s ease;

				&:hover {
					background: var(--op-5);
				}

				&:active {
					background: var(--op-8);
				}
			}
		}

		& tr th {
			text-align: left;
			padding: 0;
			padding-right: 16px;
			padding-top: 12px;
			padding-bottom: 8px;

			&:first-child {
				padding-left: 16px;
			}

			& span {
				display: flex;
			}
		}

		& tr td {
			padding: 0;
			padding-right: 24px;
			padding-top: 8px;
			padding-bottom: 8px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}

			& > a {
				display: flex;
			}
		}
	}
}

.filters {
	border-bottom: 1px solid var(--op-5);

	padding: 12px 8px 12px 8px;
}

.scroller {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.pagination {
	padding: 8px 16px 16px 16px;
}

@media (max-width: 800px) {
	.table {
		border-radius: 4px 4px 8px 8px;
	}
}
</style>
