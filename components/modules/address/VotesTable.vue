<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

/** Services */
import { space } from "@/services/utils"

/** API */
import { fetchVotesByAddressHash } from "@/services/api/address"

const props = defineProps({
	address: Object,
})

const fetchVotes = async () => {
	const params = {
		limit: 10,
		offset: 0,
	}

	const { data } = await fetchVotesByAddressHash({ hash: props.address.hash, ...params })
	return data.value
}

const votes = ref([])
votes.value = await fetchVotes()

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
				<Icon name="check-circle" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Governance Votes</Text>
			</Flex>
		</Flex>

		<Flex wide :class="[$style.table]">
			<div v-if="votes.length" :class="$style.table_scroller">
				<table>
					<thead>
						<tr>
							<th><Text size="12" weight="600" color="tertiary">Option</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Validator</Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="vote in votes" @click="navigateTo(`/proposal/${vote.proposal_id}`)">
							<td>
								<NuxtLink :to="`/proposal/${vote.proposal_id}`">
									<Flex align="center" gap="4">
										<Icon :name="getVoteIcon(vote.status)" size="12" :color="getVoteIconColor(vote.status)" />
										<Text size="13" weight="600" color="primary" style="text-transform: capitalize">
											{{ vote.status.replaceAll("_", " ") }}
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
			</div>
			<TablePlaceholderView
				v-else
				title="There's no votes"
				description="This address does not contain any votes."
				icon="governance"
				subIcon="search"
				:descriptionWidth="260"
			/>
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

.table_scroller {
	width: 100%;

	overflow-x: auto;
}

.table {
	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		padding-bottom: 12px;

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
		}
	}
}

.avatar_container {
	position: relative;
	width: 20px;
	height: 20px;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.empty {
	padding: 16px 0;
}
</style>
