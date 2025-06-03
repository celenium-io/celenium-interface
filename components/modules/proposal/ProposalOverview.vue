<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Badge from "@/components/ui/Badge.vue"
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Shared & Local Components */
import VotesAllocation from "./VotesAllocation.vue"
import VotesTable from "./VotesTable.vue"

/** Services */
import { comma } from "@/services/utils"

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
const votesTotal = ref(0)

const defaultFilters = {
	option: null,
}
const { filters, setFilter, resetFilter } = useFilters(defaultFilters)
const handleUpdateFilter = (target, newFilter, withRefetch) => {
	setFilter(target, newFilter)
	if (withRefetch) getVotes()
}
const handleResetFilters = (target, withRefetch) => {
	resetFilter(target)
	if (withRefetch) getVotes()
}

/** Pagination */
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
		offset: (page.value - 1) * 10,
		option: filters.option,
	})
	votes.value = data.value

	cacheStore.current.votes = votes.value

	isLoading.value = false
}

await getVotes()
votesTotal.value = props.proposal.yes + props.proposal.no + props.proposal.no_with_veto + props.proposal.abstain

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
											.toObject()
											.days.toFixed(0)
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

							<Tooltip position="start" textAlign="start" delay="300">
								<Text size="12" weight="500" height="140" color="tertiary" :class="$style.proposal_description">
									{{ proposal.description }}
								</Text>

								<template #content>
									<div style="max-width: 340px">
										<Text height="140">
											{{ proposal.description }}
										</Text>
									</div>
								</template>
							</Tooltip>
						</Flex>
					</Flex>

					<VotesAllocation v-if="proposal.status !== 'removed'" :proposal />

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

						<Flex v-if="Array.isArray(proposal.changes)" align="center" justify="between">
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
							<Text size="13" weight="600" color="tertiary">{{ votesTotal }}</Text>
						</Flex>
					</Flex>
				</Flex>

				<VotesTable
					v-if="activeTab === 'votes'"
					:proposal
					:votes
					:votesTotal
					:filters
					:page
					:isLoadingVotes="isLoading"
					@onRefetch="getVotes"
					@updateFilters="handleUpdateFilter"
					@onFiltersReset="handleResetFilters"
					@onPrevPage="handlePrev"
					@onNextPage="handleNext"
					@updatePage="(newPage) => (page = newPage)"
				/>
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
		& span:first-of-type {
			color: var(--txt-secondary);
		}
	}

	&.active {
		background: var(--op-8);

		& span:first-of-type {
			color: var(--txt-primary);
		}
	}
}

.tab.hide {
	display: none;
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
