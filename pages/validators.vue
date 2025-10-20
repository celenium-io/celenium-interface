<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Components */
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { capitilize, comma, numToPercent, shareOfTotalString, splitAddress } from "@/services/utils"

/** API */
import { fetchValidators, fetchValidatorsCount } from "@/services/api/validator"

/** Store */
import { useAppStore } from "@/store/app.store"
const appStore = useAppStore()

useHead({
	title: "Validators - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/validators",
		},
	],
	meta: [
		{
			name: "description",
			content:
				"View all validators in the Celestia Blockchain. Validators name, description, rates, blocks, uptime, social links, contacts are shown.",
		},
		{
			property: "og:title",
			content: "Validators - Celestia Explorer",
		},
		{
			property: "og:description",
			content:
				"View all validators in the Celestia Blockchain. Validators name, description, rates, blocks, uptime, social links, contacts are shown.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/validators`,
		},
		{
			property: "og:image",
			content: "/img/seo/validators.png",
		},
		{
			name: "twitter:title",
			content: "Validators - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content:
				"View all validators in the Celestia Blockchain. Validators name, description, rates, blocks, uptime, social links, contacts are shown.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/validators.png",
		},
	],
})

const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const validators = ref([])
const validatorsStats = ref({})
const totalVotingPower = computed(() => appStore.lastHead?.total_voting_power)

const getValidatorsStats = async () => {
	isLoading.value = true

	const { data } = await fetchValidatorsCount()
	validatorsStats.value = data.value

	isLoading.value = false
}

const getActiveValidators = async () => {
	isLoading.value = true

	const { data } = await fetchValidators({
		limit: 20,
		offset: (page.value - 1) * 20,
	})
	validators.value = data.value

	isLoading.value = false
}

const getInactiveValidators = async () => {
	isLoading.value = true

	const { data } = await fetchValidators({
		jailed: false,
		limit: 20,
		offset: validatorsStats.value.active + (page.value - 1) * 20,
	})
	validators.value = data.value

	isLoading.value = false
}

const getJailedValidators = async () => {
	isLoading.value = true

	const { data } = await fetchValidators({
		jailed: true,
		limit: 20,
		offset: (page.value - 1) * 20,
	})
	validators.value = data.value

	isLoading.value = false
}

const getValidators = async () => {
	switch (activeTab.value) {
		case "active":
			getActiveValidators()
			break
		case "inactive":
			getInactiveValidators()
			break
		case "jailed":
			getJailedValidators()
			break
		default:
			break
	}
}

/** Pagination */
const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.max(1, Math.ceil(validatorsStats.value[activeTab.value.toLowerCase()] / 20)))

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

/** Tabs */
const tabs = ref(["active", "inactive", "jailed"])
const activeTab = ref(
	route.query.status && tabs.value.filter((tab) => tab === route.query.status).length > 0 ? route.query.status.toLowerCase() : "active",
)
const dropdownItems = computed(() => tabs.value.filter((tab) => tab !== activeTab.value))

watch(
	() => route.query,
	() => {
		if (route.query.status) activeTab.value = route.query.status
	},
)

await getValidatorsStats()
await getValidators()

/** Refetch validators */
watch(
	() => page.value,
	async () => {
		getValidators()

		router.replace({ query: { status: activeTab.value, page: page.value } })
	},
)

watch(
	() => activeTab.value,
	async () => {
		page.value = 1

		getValidators()

		router.replace({ query: { status: activeTab.value, page: page.value } })
	},
)

onMounted(() => {
	router.replace({ query: { status: activeTab.value, page: page.value } })
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex align="end" justify="between" :class="$style.breadcrumbs">
			<Breadcrumbs
				:items="[
					{ link: '/', name: 'Explore' },
					{ link: '/validators', name: `Validators` },
				]"
			/>
		</Flex>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="validator" size="16" color="secondary" />
					<Text as="h1" size="14" weight="600" color="primary">Validators</Text>
				</Flex>

				<Flex align="center" gap="6">
					<Dropdown>
						<template #trigger="{ isOpen }">
							<Button type="secondary" size="mini">
								{{ capitilize(activeTab) }}
								<Icon
									name="chevron"
									size="16"
									color="secondary"
									:style="{
										transform: `rotate(${!isOpen ? '0' : '180deg'})`,
										transition: 'all 200ms ease',
									}"
								/>
							</Button>
						</template>

						<template #popup>
							<DropdownItem v-for="item in dropdownItems" @click="activeTab = item"> {{ capitilize(item) }} </DropdownItem>
						</template>
					</Dropdown>

					<!-- Pagination -->
					<Flex align="center" gap="6">
						<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
							<Icon name="arrow-left-stop" size="12" color="primary" />
						</Button>
						<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
							<Icon name="arrow-left" size="12" color="primary" />
						</Button>

						<Button type="secondary" size="mini" disabled>
							<Text size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
						</Button>

						<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
							<Icon name="arrow-right" size="12" color="primary" />
						</Button>
						<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages">
							<Icon name="arrow-right-stop" size="12" color="primary" />
						</Button>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" wide :class="[$style.table, isLoading && $style.disabled]">
				<div v-if="validators.length" :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Validator</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Voting Power</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Outgoing Rewards</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Commissions</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Rate</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Max Rate</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Max Change Rate</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Version</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="v in validators">
								<td style="width: 1px">
									<NuxtLink :to="`/validator/${v.id}`">
										<Flex align="center" gap="6">
											<Text size="13" weight="600" color="primary" mono>
												{{ v.moniker ? v.moniker : splitAddress(v.address?.hash) }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/validator/${v.id}`">
										<Flex v-if="activeTab === 'active'" align="start" justify="center" direction="column" gap="4">
											<Tooltip position="start" delay="400">
												<Text size="12" weight="600" color="primary">{{ comma(v.voting_power) }}</Text>

												<template #content>
													<Flex align="center" justify="between" gap="8">
														<Text size="12" weight="600" color="tertiary">Staking Share</Text>
														<Text size="12" weight="600" color="primary"
															>{{ shareOfTotalString(v.voting_power, totalVotingPower) }}%</Text
														>
													</Flex>
												</template>
											</Tooltip>

											<Text size="12" weight="600" color="tertiary"
												>{{ shareOfTotalString(v.voting_power, totalVotingPower) }}%</Text
											>
										</Flex>

										<Flex v-else align="center" justify="center">
											<Text size="12" weight="600" color="primary">{{ comma(v.voting_power) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/validator/${v.id}`">
										<AmountInCurrency
											:amount="{ value: v.rewards }"
											:styles="{ amount: { size: '13' }, currency: { size: '13' } }"
										/>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/validator/${v.id}`">
										<AmountInCurrency
											:amount="{ value: v.commissions }"
											:styles="{ amount: { size: '13' }, currency: { size: '13' } }"
										/>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/validator/${v.id}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ numToPercent(v.rate) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/validator/${v.id}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ numToPercent(v.max_rate) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/validator/${v.id}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ numToPercent(v.max_change_rate) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink v-if="v.version" :to="`/validator/${v.id}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ `v${v.version}` }}</Text>
										</Flex>
									</NuxtLink>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<Flex v-else direction="column" gap="20" align="center" :class="$style.empty">
					<Flex direction="column" gap="8" align="center">
						<Text size="13" weight="600" color="secondary"> No validators found </Text>
						<Text size="12" weight="400" color="tertiary"> Try to select another status </Text>
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
