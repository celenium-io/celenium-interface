<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { space } from "@/services/utils"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

const emit = defineEmits(["onPrevPage", "onNextPage", "updatePage"])
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
</script>

<template>
	<Flex direction="column" :class="[$style.wrapper, isLoadingVotes && $style.disabled]">
		<Flex v-if="votes.length" :class="$style.scroller">
			<table>
				<thead>
					<tr>
						<th><Text size="12" weight="600" color="tertiary">Vote</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Voter</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Validator</Text></th>
					</tr>
				</thead>

				<tbody>
					<tr v-for="vote in votes">
						<td>
							<NuxtLink :to="`/address/${vote.voter.hash}`">
								<Flex align="center" gap="4">
									<Icon :name="getVoteIcon(vote.status)" size="12" :color="getVoteIconColor(vote.status)" />
									<Text size="13" weight="600" color="primary" style="text-transform: capitalize">
										{{ vote.status.replaceAll("_", " ") }}
									</Text>
								</Flex>
							</NuxtLink>
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
							<NuxtLink :to="`/address/${vote.voter.hash}`">
								<Flex justify="center" direction="column" gap="4">
									<Text size="12" weight="600" color="primary">
										{{ DateTime.fromISO(vote.deposit_time).toRelative({ locale: "en", style: "short" }) }}
									</Text>
									<Text size="12" weight="500" color="tertiary">
										{{ DateTime.fromISO(vote.deposit_time).setLocale("en").toFormat("LLL d, t") }}
									</Text>
								</Flex>
							</NuxtLink>
						</td>
						<td>
							<NuxtLink :to="`/address/${vote.voter.hash}`">
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
							</NuxtLink>
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
			padding-top: 8px;
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
