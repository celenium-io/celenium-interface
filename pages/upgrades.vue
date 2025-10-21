<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Components */
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { isValidQueryParam, roundTo } from "@/services/utils"

/** API */
import { fetchValidatorsUpgrades } from "@/services/api/validator"

/** Store */
import { useAppStore } from "@/store/app.store"
const appStore = useAppStore()

useHead({
	title: "Upgrades - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/upgrades",
		},
	],
	meta: [
		{
			name: "description",
			content:
				"Track all Celestia network upgrades in the Celestia Blockchain. View node upgrade versions, voting and voted power, validator signals, start and end blocks, and upgrade timelines.",
		},
		{
			property: "og:title",
			content: "Upgrades - Celestia Explorer",
		},
		{
			property: "og:description",
			content:
				"Track all network upgrades on the Celestia Blockchain. View node upgrade versions, voting and voted power, validator signals, start and end blocks, and upgrade timelines.",
		},
		{
			property: "og:url",
			content: "https://celenium.io/upgrades",
		},
		{
			property: "og:image",
			content: "/img/seo/upgrades.png",
		},
		{
			name: "twitter:title",
			content: "Upgrades - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content:
				"Track all network upgrades on the Celestia Blockchain. View node upgrade versions, voting and voted power, validator signals, start and end blocks, and upgrade timelines.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/upgrades.png",
		},
	],
})
const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const upgrades = ref([])

const totalStake = computed(() => (props.upgrade?.voting_power && props.upgrade?.voting_power !== "0") ? props.upgrade.voting_power : appStore.lastHead?.total_voting_power)
const votingShare = computed(() => parseFloat(props.upgrade.voted_power) * 100 / parseFloat(totalStake.value))

const getTotalStake = (upgrade) => {
	return (upgrade?.voting_power && upgrade?.voting_power !== "0") ? upgrade.voting_power : appStore.lastHead?.total_voting_power
}

const getVotingShare = (upgrade) => {
	return parseFloat(upgrade.voted_power) * 100 / parseFloat(getTotalStake(upgrade))
}

const getUpgrades = async () => {
	isLoading.value = true

	try {
		const { data } = await fetchValidatorsUpgrades({
			limit,
			offset: (page.value - 1) * limit,
		})
		upgrades.value = data.value
	} catch (error) {
		console.error(error);
	} finally {
		isLoading.value = false
	}
}

/** Pagination */
const limit = 20
const page = ref(route.query.page && isValidQueryParam(route.query.page) ? parseInt(route.query.page) : 1)
const handleNextCondition = computed(() => upgrades.value.length === limit)

const handleNext = () => {
	if (!handleNextCondition) return

	page.value += 1
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

await getUpgrades()

watch(
	() => route.query,
	() => {
		if (route.query.page && isValidQueryParam(route.query.page)) {
			page.value = parseInt(route.query.page)
		}
	},
)

/** Refetch upgrades */
watch(
	() => page.value,
	async () => {
		await getUpgrades()

		router.replace({ query: { page: page.value } })
	},
)

onMounted(() => {
	router.replace({ query: { page: page.value } })
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex align="end" justify="between" :class="$style.breadcrumbs">
			<Breadcrumbs
				:items="[
					{ link: '/', name: 'Explore' },
					{ link: '/upgrades', name: `Upgrades` },
				]"
			/>
		</Flex>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="node" size="16" color="secondary" />
					<Text as="h1" size="14" weight="600" color="primary">Upgrades</Text>
				</Flex>

				<!-- Pagination -->
				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary"> {{ `Page ${page}` }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="!handleNextCondition">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" wide :class="[$style.table, isLoading && $style.disabled]">
				<div v-if="upgrades.length" :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Upgrade</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Status</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Progress</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Total Voted</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Total Stake</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Signals</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Init Time</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>End Time</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="u in upgrades">
								<td style="width: 1px">
									<NuxtLink :to="`/upgrade/${u.version}`">
										<Flex align="center" gap="6">
											<Text size="13" weight="600" color="primary" mono>
												{{ `Version ${u.version}` }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/upgrade/${u.version}`">
										<Flex v-if="u.end_time" align="center" gap="6">
											<Icon name="check-circle" size="14" color="brand" />
											<Text size="13" weight="600" color="primary">Applied</Text>
										</Flex>
										<Flex v-else-if="getVotingShare(u) > 83.3" align="center" gap="6">
											<Icon name="zap-circle" size="14" color="brand" />
											<Text size="13" weight="600" color="primary">Ready for upgrade</Text>
										</Flex>
										<Flex v-else align="center" gap="6">
											<Icon name="zap-circle" size="14" color="tertiary" />
											<Text size="13" weight="600" color="primary">In Progress</Text>
										</Flex>
									</NuxtLink>
								</td>

								<td>
									<NuxtLink :to="`/upgrade/${u.version}`" style="align-items: center;">
										<Tooltip>
											<Flex align="center" :class="$style.voting_wrapper">
												<div
													:style="{
														background: 'var(--brand)',
														width: `${Math.max(5, roundTo(getVotingShare(u), 0, 'ceil'))}%`
													}"
													:class="$style.voting_bar"
												/>
											</Flex>

											<template #content>
												<Text size="12" weight="600" color="primary"> 
													<Text :color="getVotingShare(u) > 83.3 ? 'brand' : 'tertiary'"> {{ roundTo(getVotingShare(u), 2) }}% </Text> / 83.3%
												</Text>
											</template>
										</Tooltip>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/upgrade/${u.version}`">
										<AmountInCurrency
											:amount="{ value: u.voted_power, unit: 'TIA' }"
											:styles="{ amount: { size: '13' }, currency: { size: '13' } }"
										/>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/upgrade/${u.version}`">
										<AmountInCurrency
											:amount="{ value: getTotalStake(u), unit: 'TIA' }"
											:styles="{ amount: { size: '13' }, currency: { size: '13' } }"
										/>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/upgrade/${u.version}`">
										<Flex align="center" gap="6">
											<Text size="13" weight="600" color="primary">
												{{ u.signals_count }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/upgrade/${u.version}`">
										<Flex justify="center" direction="column" gap="4">
											<Text size="12" weight="600" color="primary">
												{{ DateTime.fromISO(u.time).toRelative({ locale: "en", style: "short" }) }}
											</Text>
											<Text size="12" weight="500" color="tertiary">
												{{ DateTime.fromISO(u.time).setLocale("en").toFormat("LLL d, t") }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink v-if="u.end_time" :to="`/upgrade/${u.version}`">
										<Flex justify="center" direction="column" gap="4">
											<Text size="12" weight="600" color="primary">
												{{ DateTime.fromISO(u.end_time).toRelative({ locale: "en", style: "short" }) }}
											</Text>
											<Text size="12" weight="500" color="tertiary">
												{{ DateTime.fromISO(u.end_time).setLocale("en").toFormat("LLL d, t") }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<Flex v-else-if="!isLoading" direction="column" gap="20" align="center" :class="$style.empty">
					<Flex direction="column" gap="8" align="center">
						<Text size="13" weight="600" color="secondary"> No upgrades found </Text>
						<Text size="12" weight="400" color="tertiary"> {{ `There are no ${page !== 1 ? 'more' : ''} upgrades for this Celestia network` }} </Text>
					</Flex>
				</Flex>
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

	transition: all 0.2s ease;

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

			& span {
				display: flex;
			}

			&:first-child {
				padding-left: 16px;
				width: 16px;
			}

			&.sortable {
				cursor: pointer;
			}

			&.sortable:hover {
				& span {
					color: var(--txt-secondary);
				}
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
	min-height: 10px;
	height: 10px;

	border-radius: 50px;
	background: var(--op-8);

	padding: 2px;
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
		gap: 4px;

		height: initial;

		padding: 8px;
	}
}

.empty {
	padding: 16px 0;
}
</style>
