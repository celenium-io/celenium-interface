<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Badge from "@/components/ui/Badge.vue"

/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

/** Services */
import { comma } from "@/services/utils"
import { getProposalIcon, getProposalIconColor, getProposalType } from "@/services/utils/states"

/** API */
import { fetchProposals, fetchProposalsCount } from "@/services/api/proposal"

useHead({
	title: "Governance: Celestia Proposals - Celenium",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/proposals",
		},
	],
	meta: [
		{
			name: "description",
			content:
				"Explore current and past governance Celestia proposals, and engage with the community-driven decision-making that ensures a transparent, modular blockchain ecosystem. Stay informed on governance updates, voting participation, and how proposals impact Celestia's network.",
		},
		{
			property: "og:title",
			content: "Governance: Celestia Proposals - Celenium",
		},
		{
			property: "og:description",
			content:
				"Explore current and past governance Celestia proposals, and engage with the community-driven decision-making that ensures a transparent, modular blockchain ecosystem. Stay informed on governance updates, voting participation, and how proposals impact Celestia's network.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/proposals`,
		},
		{
			property: "og:image",
			content: "/img/seo/proposals.png",
		},
		{
			name: "twitter:title",
			content: "Governance: Celestia Proposals - Celenium",
		},
		{
			name: "twitter:description",
			content:
				"Explore current and past governance Celestia proposals, and engage with the community-driven decision-making that ensures a transparent, modular blockchain ecosystem. Stay informed on governance updates, voting participation, and how proposals impact Celestia's network.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/proposals.png",
		},
	],
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const proposals = ref([])
const count = ref(1)

const getProposalsCount = async () => {
	const { data: proposalsCount } = await fetchProposalsCount()
	count.value = proposalsCount.value
}

// await getProposalsCount()

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.ceil(count.value / 20))

const { data } = await fetchProposals({ limit: 20, offset: (page.value - 1) * 20 })
proposals.value = data.value.filter((proposal) => proposal.status !== "removed")

watch(
	() => page.value,
	async () => {
		isRefetching.value = true

		const { data } = await fetchProposals({ limit: 20, offset: (page.value - 1) * 20 })
		proposals.value = data.value

		isRefetching.value = false

		router.replace({ query: { page: page.value } })
	},
)

const handlePrev = () => {
	// if (page.value === 1) return
	// page.value -= 1
}

const handleNext = () => {
	// if (page.value === pages.value) return
	// page.value += 1
}

const handleLast = async () => {
	// await getProposalsCount()
	// page.value = pages.value
}
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/proposals', name: `Governance` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="governance" size="16" color="secondary" />
					<Text as="h1" size="14" weight="600" color="primary">Governance</Text>
				</Flex>

				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" disabled>
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click="handlePrev" size="mini" disabled>
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary"> {{ comma(page) }} of {{ comma(pages) }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" disabled>
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
					<Button @click="handleLast" type="secondary" size="mini" disabled>
						<Icon name="arrow-right-stop" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<Flex direction="column" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div v-if="proposals.length" :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Proposal</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Status</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Votes</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Type</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Block</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Result Time</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="proposal in proposals">
								<td style="width: 1px; max-width: 250px">
									<NuxtLink :to="`/proposal/${proposal.id}`">
										<Flex justify="center" direction="column" gap="4" style="min-width: 0">
											<Text size="13" weight="600" color="primary" class="overflow_ellipsis">
												{{ proposal.title }}
											</Text>
											<Text size="12" weight="500" color="tertiary" class="overflow_ellipsis">
												{{ proposal.description }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/proposal/${proposal.id}`">
										<Flex align="center" gap="6">
											<Icon
												:name="getProposalIcon(proposal.status)"
												size="12"
												:color="getProposalIconColor(proposal.status)"
											/>
											<Text size="13" weight="600" color="primary" style="text-transform: capitalize">
												{{ proposal.status }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/proposal/${proposal.id}`">
										<Flex align="center">
											<Flex align="center" gap="4" :class="$style.voting_wrapper">
												<Tooltip
													v-if="proposal.yes"
													wide
													:trigger-width="`${Math.max(10, (proposal.yes * 100) / proposal.votes_count)}%`"
												>
													<div
														:style="{
															background: 'var(--brand)',
														}"
														:class="$style.voting_bar"
													/>
													<template #content>
														Yes: <Text color="primary">{{ comma(proposal.yes) }}</Text>
													</template>
												</Tooltip>
												<Tooltip
													v-if="proposal.no"
													wide
													:trigger-width="`${Math.max(10, (proposal.no * 100) / proposal.votes_count)}%`"
												>
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
													:trigger-width="`${Math.max(
														10,
														(proposal.no_with_veto * 100) / proposal.votes_count,
													)}%`"
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
												<Tooltip
													v-if="proposal.abstain"
													wide
													:trigger-width="`${Math.max(10, (proposal.abstain * 100) / proposal.votes_count)}%`"
												>
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
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/proposal/${proposal.id}`">
										<Flex align="center">
											<Badge>
												<Text size="13" height="160" weight="600" color="primary">
													{{ getProposalType(proposal.type) }}
												</Text>
											</Badge>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/address/${proposal.proposer.hash}`">
										<Flex align="center">
											<Outline @click.prevent="router.push(`/block/${proposal.height}`)">
												<Flex align="center" gap="6">
													<Icon name="block" size="14" color="secondary" />
													<Text size="13" weight="600" color="primary" tabular>{{ comma(proposal.height) }}</Text>
												</Flex>
											</Outline>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/proposal/${proposal.id}`">
										<Flex justify="center" direction="column" gap="4">
											<Text size="12" weight="600" color="primary">
												{{ DateTime.fromISO(proposal.deposit_time).toRelative({ locale: "en", style: "short" }) }}
											</Text>
											<Text size="12" weight="500" color="tertiary">
												{{ DateTime.fromISO(proposal.deposit_time).setLocale("en").toFormat("LLL d, t") }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<TablePlaceholderView
					v-else
					title="There's no proposals"
					description="How is this possible? Apparently it's possible."
					icon="governance"
					subIcon="search"
				/>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.header {
	height: 46px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 16px;
}

.table_scroller {
	overflow-x: auto;
}

.table {
	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	padding-bottom: 12px;

	transition: all 0.2s ease;

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

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
			padding-top: 16px;
			padding-bottom: 8px;

			& span {
				display: flex;
			}

			&:first-child {
				padding-left: 16px;
			}
		}

		& tr td {
			padding: 0;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}

			& > a {
				display: flex;

				min-height: 44px;

				padding-right: 24px;
			}
		}
	}
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.voting_wrapper {
	width: 100px;
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

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}

	.header {
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}
</style>
