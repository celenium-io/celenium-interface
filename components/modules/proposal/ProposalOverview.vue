<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Badge from "@/components/ui/Badge.vue"
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma, space } from "@/services/utils"

/** API */
import { fetchProposalVotes } from "@/services/api/proposal"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const props = defineProps({
	proposal: {
		type: Object,
		required: true,
	},
})

const preselectedTab = route.query.tab && ["votes"].includes(route.query.tab) ? route.query.tab : "votes"
const activeTab = ref(preselectedTab)

const isLoading = ref(false)
const votes = ref([])

const page = ref(1)
const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

const getVotes = async () => {
	isLoading.value = true

	const { data } = await fetchProposalVotes({
		id: props.proposal.id,
	})
	votes.value = data.value

	isLoading.value = false
}

await getVotes()

onMounted(() => {
	router.replace({
		query: {
			tab: activeTab.value,
		},
	})
})

/** Refetch votes */
watch(
	() => page.value,
	() => {
		if (activeTab.value === "votes") {
			getVotes()
		}
	},
)

watch(
	() => activeTab.value,
	() => {
		router.replace({
			query: {
				tab: activeTab.value,
			},
		})

		page.value = 1

		getVotes()
	},
)

const handleViewRawProposal = () => {
	cacheStore.current._target = "proposal"
	modalsStore.open("rawData")
}
const handleViewRawVotes = () => {
	cacheStore.current._target = "votes"
	modalsStore.open("rawData")
}

const getProposalIcon = (status) => {
	if (status === "inactive") return "close-circle"
	if (status === "active") return "zap-circle"
	if (status === "removed") return "close-circle"
	if (status === "applied") return "check-circle"
	if (status === "rejected") return "close-circle"
}

const getProposalIconColor = (status) => {
	if (status === "inactive") return "tertiary"
	if (status === "active") return "blue"
	if (status === "removed") return "tertiary"
	if (status === "applied") return "brand"
	if (status === "rejected") return "red"
}

const getProposalType = (type) => {
	if (type === "param_changed") return "Update Param"
	if (type === "text") return "Text"
	if (type === "client_update") return "Update Client"
	if (type === "community_pool_spend") return "Community Pool Spend"
}

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
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="governance" size="14" color="primary" />
				<Text as="h1" size="13" weight="600" color="primary"> Proposal #{{ proposal.id }} </Text>
			</Flex>

			<Flex align="center" gap="12">
				<Dropdown>
					<Button type="secondary" size="mini">
						<Icon name="dots" size="16" color="primary" />
					</Button>

					<template #popup>
						<DropdownItem @click="handleViewRawProposal"> View Raw Proposal </DropdownItem>
						<DropdownItem @click="handleViewRawVotes"> View Raw Votes </DropdownItem>
					</template>
				</Dropdown>
			</Flex>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex wide direction="column" gap="8" :class="$style.top">
					<Text size="12" weight="600" color="secondary">Timeline</Text>

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
										DateTime.fromISO(proposal.deposit_time)
											.diff(DateTime.fromISO(proposal.activation_time), "days")
											.toObject().days
									}}
									Days
								</Text>
							</Flex>

							<div v-for="dot in 4" class="dot" />

							<Text size="12" weight="600" color="secondary" align="right">
								{{ DateTime.fromISO(proposal.deposit_time).setLocale("en").toLocaleString(DateTime.DATE_MED) }}
							</Text>
						</Flex>
					</Badge>

					<Flex align="center" justify="between">
						<Text size="12" weight="600" color="tertiary">Voting Start</Text>
						<Text size="12" weight="600" color="tertiary">Voting End</Text>
					</Flex>
				</Flex>

				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="10" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Status</Text>

						<Flex align="center" gap="6">
							<Icon :name="getProposalIcon(proposal.status)" size="14" :color="getProposalIconColor(proposal.status)" />
							<Text size="13" weight="600" color="primary" style="text-transform: capitalize">
								{{ proposal.status }}
							</Text>
						</Flex>
					</Flex>

					<Flex direction="column" gap="10" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Proposal</Text>

						<Flex direction="column" gap="4">
							<Text size="13" weight="600" height="140" color="primary" :class="$style.proposal_title">
								{{ proposal.title }}
							</Text>
							<Text size="12" weight="500" height="140" color="tertiary" :class="$style.proposal_description">
								{{ proposal.description }}
							</Text>
						</Flex>
					</Flex>

					<Flex direction="column" gap="10" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Allocation of votes</Text>

						<Flex align="center" gap="4" :class="[$style.voting_wrapper, $style[proposal.status]]">
							<Tooltip v-if="proposal.yes" wide :trigger-width="`${(proposal.yes * 100) / proposal.votes_count}%`">
								<div
									:style="{
										background: 'var(--brand)',
									}"
									:class="$style.voting_bar"
								/>
								<template #content>
									Yes: <Text color="primary">{{ proposal.yes }}</Text>
								</template>
							</Tooltip>
							<Tooltip v-if="proposal.no" wide :trigger-width="`${(proposal.no * 100) / proposal.votes_count}%`">
								<div
									:style="{
										background: 'var(--red)',
									}"
									:class="$style.voting_bar"
								/>
								<template #content>
									No: <Text color="primary">{{ proposal.no }}</Text>
								</template>
							</Tooltip>
							<Tooltip
								v-if="proposal.no_with_veto"
								wide
								:trigger-width="`${(proposal.no_with_veto * 100) / proposal.votes_count}%`"
							>
								<div
									:style="{
										background: 'var(--red)',
									}"
									:class="$style.voting_bar"
								/>
								<template #content>
									No with veto: <Text color="primary">{{ proposal.no_with_veto }}</Text>
								</template>
							</Tooltip>
							<Tooltip v-if="proposal.abstain" wide :trigger-width="`${(proposal.abstain * 100) / proposal.votes_count}%`">
								<div
									:style="{
										background: 'var(--op-40)',
									}"
									:class="$style.voting_bar"
								/>
								<template #content>
									Abstain: <Text color="primary">{{ proposal.abstain }}</Text>
								</template>
							</Tooltip>
						</Flex>
					</Flex>

					<Flex direction="column" gap="10" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Type</Text>

						<Badge style="width: fit-content">
							<Text size="13" weight="600" color="primary">
								{{ getProposalType(proposal.type) }}
							</Text>
						</Badge>
					</Flex>

					<Flex direction="column" gap="10" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Block</Text>

						<Outline @click.prevent="router.push(`/block/${proposal.height}`)" class="clickable">
							<Flex align="center" gap="6">
								<Icon name="block" size="14" color="secondary" />
								<Text size="13" weight="600" color="primary" tabular>{{ comma(proposal.height) }}</Text>
							</Flex>
						</Outline>
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex v-if="proposal.proposer" align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Proposer</Text>

							<Flex align="center" gap="6">
								<AddressBadge :account="proposal.proposer" color="secondary" />
								<CopyButton :text="proposal.proposer.hash" />
							</Flex>
						</Flex>

						<Tooltip wide side="top" position="start">
							<Flex wide align="center" justify="between">
								<Flex align="center" gap="4">
									<Text size="12" weight="600" color="tertiary"> Voting Power</Text>
									<Icon name="info" size="12" color="tertiary" />
								</Flex>

								<AmountInCurrency
									:amount="{ value: proposal.voting_power, decimal: 2 }"
									:styles="{ amount: { color: 'secondary' }, currency: { color: 'tertiary' } }"
								/>
							</Flex>

							<template #content>
								<Flex direction="column" align="end" gap="6">
									<Flex wide justify="between" gap="16">
										<Text>Yes</Text> <Text color="primary">{{ comma(proposal.yes_voting_power) }} UTIA</Text>
									</Flex>
									<Flex wide justify="between" gap="16">
										<Text>No</Text> <Text color="primary">{{ comma(proposal.no_voting_power) }} UTIA</Text>
									</Flex>
									<Flex wide justify="between" gap="16">
										No with veto <Text color="primary">{{ comma(proposal.no_with_veto_voting_power) }} UTIA</Text>
									</Flex>
									<Flex wide justify="between" gap="16">
										Abstain <Text color="primary">{{ comma(proposal.abstain_voting_power) }} UTIA</Text>
									</Flex>
								</Flex>
							</template>
						</Tooltip>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Deposit</Text>

							<AmountInCurrency
								:amount="{ value: proposal.deposit, decimal: 6 }"
								:styles="{ amount: { color: 'secondary' }, currency: { color: 'tertiary' } }"
							/>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Changes Count</Text>

							<Text size="12" weight="600" color="secondary">{{ proposal.changes.length }}</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="4" wide :class="$style.content">
				<Flex align="center" justify="between" :class="$style.tabs_wrapper">
					<Flex gap="4" :class="$style.tabs">
						<Flex
							@click="activeTab = 'votes'"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === 'votes' && $style.active]"
						>
							<Icon name="check-circle" size="12" color="secondary" />
							<Text size="13" weight="600">Votes</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex v-if="activeTab === 'votes'" direction="column" :class="[$style.table, isLoading && $style.disabled]">
					<Flex v-if="votes.length" :class="$style.table_scroller">
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
									</td>
								</tr>
							</tbody>
						</table>
					</Flex>

					<Flex v-else direction="column" align="center" justify="center" gap="8" :class="$style.empty">
						<Text size="13" weight="600" color="secondary" align="center"> No votes </Text>
						<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
							This proposal does not contain any votes
						</Text>
					</Flex>

					<!-- Pagination -->
					<Flex v-if="votes.length" align="center" gap="6" :class="$style.pagination">
						<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
							<Icon name="arrow-left-stop" size="12" color="primary" />
						</Button>
						<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
							<Icon name="arrow-left" size="12" color="primary" />
						</Button>

						<Button type="secondary" size="mini" disabled>
							<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
						</Button>

						<Button @click="handleNext" type="secondary" size="mini" :disabled="votes.length !== 10">
							<Icon name="arrow-right" size="12" color="primary" />
						</Button>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.header {
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
}

.data {
	min-width: 384px;
	max-width: 384px;

	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	.top {
		border-bottom: 1px solid var(--op-5);

		padding: 16px;
	}

	.main {
		padding: 16px;

		& .key_value {
			max-width: 100%;
		}
	}
}

.content {
	min-width: 0;
}

.proposal_title {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	text-overflow: ellipsis;
	overflow: hidden;
}

.proposal_description {
	display: -webkit-box;
	-webkit-line-clamp: 4;
	-webkit-box-orient: vertical;
	text-overflow: ellipsis;
	overflow: hidden;
}

.voting_wrapper {
	width: 100%;

	border-radius: 50px;

	padding: 4px;

	&.inactive {
		background: var(--op-8);
	}

	&.active {
		background: rgba(var(--blue-rgb), 20%);
	}

	&.removed {
		background: rgba(var(--red-rgb), 20%);
	}

	&.applied {
		background: rgba(var(--brand-rgb), 20%);
	}

	&.rejected {
		background: rgba(var(--red-rgb), 20%);
	}
}

.voting_bar {
	width: 100%;
	height: 4px;

	border-radius: 50px;
}

.tabs_wrapper {
	min-height: 44px;
	overflow-x: auto;

	border-radius: 4px;
	background: var(--card-background);

	padding: 0 8px;
}

.tabs_wrapper::-webkit-scrollbar {
	display: none;
}

.tab {
	height: 28px;

	cursor: pointer;
	border-radius: 6px;

	padding: 0 8px;

	transition: all 0.1s ease;

	& span {
		color: var(--txt-tertiary);

		transition: all 0.1s ease;
	}

	&:hover {
		& span {
			color: var(--txt-secondary);
		}
	}
}

.tab.active {
	background: var(--op-8);

	& span {
		color: var(--txt-primary);
	}
}

.tab.hide {
	display: none;
}

.table_scroller {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.inner {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);
}

.events {
	padding: 16px;
}

.table {
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

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.empty {
	flex: 1;
	padding: 16px 0;
}

.pagination {
	padding: 8px 16px 16px 16px;
}

@media (max-width: 800px) {
	.content {
		flex-direction: column;
	}

	.data {
		max-width: initial;
		min-width: 0;

		border-radius: 4px;
	}

	.table {
		border-radius: 4px 4px 8px 8px;
	}
}

@media (max-width: 550px) {
	.header {
		height: initial;
		flex-direction: column;
		gap: 12px;

		padding: 12px 0;
	}
}

@media (max-width: 400px) {
	.tabs_wrapper {
		overflow-x: auto;

		&::-webkit-scrollbar {
			display: none;
		}
	}
}
</style>
