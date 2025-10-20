<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Badge from "@/components/ui/Badge.vue"
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Components */
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Tables */
import SignalsTable from "./SignalsTable.vue"

/** Services */
import { capitilize, comma, isValidQueryParam, roundTo } from "@/services/utils"

/** API */
import { fetchSignals } from "@/services/api/validator"

/** Store */
import { useAppStore } from "@/store/app.store"
import { useCacheStore } from "@/store/cache.store"
import { useModalsStore } from "@/store/modals.store"
const appStore = useAppStore()
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

const route = useRoute()
const router = useRouter()

const props = defineProps({
	upgrade: {
		type: Object,
		required: true,
	},
})

const tabs = ref([
	{
		name: "signals",
		icon: "bell-ringing",
	},
])
const preselectedTab = route.query.tab && tabs.value.map((tab) => tab.name).includes(route.query.tab) ? route.query.tab : tabs.value[0].name
const activeTab = ref(preselectedTab)

const isRefetching = ref(false)
const signals = ref([])
const totalStake = computed(() => (props.upgrade?.voting_power && props.upgrade?.voting_power !== "0") ? props.upgrade.voting_power : appStore.lastHead?.total_voting_power)
const votingShare = computed(() => parseFloat(props.upgrade.voted_power) * 100 / parseFloat(totalStake.value))

const page = ref(route.query.page && isValidQueryParam(route.query.page) ? parseInt(route.query.page) : 1)
const limit = 10
const handleNextCondition = ref(true)

const handleNext = () => {
	if (!handleNextCondition.value) return

	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const getSignals = async () => {
	isRefetching.value = true

	const { data } = await fetchSignals({
		version: props.upgrade.version,
		limit: limit,
		offset: (page.value - 1) * limit,
	})

	signals.value = data.value
	cacheStore.current.signals = signals.value

	handleNextCondition.value = signals.value?.length === limit

	isRefetching.value = false
}

const handleViewRawUpgrade = () => {
	cacheStore.current._target = "upgrade"
	modalsStore.open("rawData")
}
const handleViewRawSignals = () => {
	cacheStore.current._target = "signals"
	modalsStore.open("rawData")
}

/** Initital fetch */
if (activeTab.value?.toLowerCase() === "signals") await getSignals()

onMounted(() => {
	router.replace({
		query: {
			tab: activeTab.value?.toLowerCase(),
			page: page.value,
		},
	})
})

watch(
	() => page.value,
	async () => {
		await getSignals()

		router.replace({ query: { page: page.value } })
	},
)
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="node" size="14" color="primary" />
				<Text as="h1" size="13" weight="600" color="primary"> Upgrade v{{ upgrade.version }} </Text>
			</Flex>

			<Flex align="center" gap="12">
				<Dropdown>
					<Button type="secondary" size="mini">
						<Icon name="dots" size="16" color="primary" />
					</Button>

					<template #popup>
						<DropdownItem @click="handleViewRawUpgrade"> View Raw Upgrade </DropdownItem>
						<DropdownItem @click="handleViewRawSignals"> View Raw Signals </DropdownItem>
					</template>
				</Dropdown>
			</Flex>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex wide direction="column" gap="8" :class="$style.timeline_wrapper">
					<Text size="12" weight="600" color="secondary">Timeline</Text>

					<Badge>
						<Flex align="center" justify="between" wide>
							<Text size="12" weight="600" color="secondary">
								{{ DateTime.fromISO(upgrade.time).setLocale("en").toLocaleString(DateTime.DATE_MED) }}
							</Text>

							<div v-for="dot in 12" class="dot" />

							<Text size="12" weight="600" color="secondary" align="right">
								{{ upgrade.end_time
									? DateTime.fromISO(upgrade.end_time).setLocale("en").toLocaleString(DateTime.DATE_MED)
									: 'In progress'
								}}
							</Text>
						</Flex>
					</Badge>

					<Flex align="center" justify="between">
						<Text size="12" weight="600" color="tertiary">Upgrade start</Text>
						<Text size="12" weight="600" color="tertiary">Upgrade end</Text>
					</Flex>
				</Flex>

				<Flex direction="column" gap="24" :class="$style.main">
					<Flex gap="40">
						<Flex direction="column" gap="10" :class="$style.key_value">
							<Text size="12" weight="600" color="secondary">Status</Text>

							<Flex v-if="upgrade.end_time" align="center" gap="6">
								<Icon name="check-circle" size="14" color="brand" />
								<Text size="13" weight="600" color="primary">Applied</Text>
							</Flex>
							<Flex v-else-if="votingShare > 83.3" align="center" gap="6">
								<Icon name="zap-circle" size="14" color="brand" />
								<Text size="13" weight="600" color="primary">Ready for upgrade</Text>
							</Flex>
							<Flex v-else align="center" gap="6">
								<Icon name="zap-circle" size="14" color="tertiary" />
								<Text size="13" weight="600" color="primary">In Progress</Text>
							</Flex>
						</Flex>

						<NuxtLink v-if="upgrade.tx_hash" :to="`/tx/${upgrade.tx_hash}`">
							<Flex direction="column" gap="10" :class="$style.key_value">
								<Text size="12" weight="600" color="secondary">Upgrade Tx</Text>

								<Flex align="center" gap="6">
									<Icon name="check-circle" size="14" color="brand" />
									<Text size="12" weight="600" color="primary" mono>
										{{ $getDisplayName('txs', upgrade.tx_hash) }}
									</Text>
								</Flex>
							</Flex>
						</NuxtLink>
					</Flex>

					<Flex justify="center" direction="column" gap="10" wide>
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
								<Text :color="votingShare > 83.3 ? 'brand' : 'tertiary'"> {{ roundTo(votingShare, 2) }}% </Text> / 83.3%
							</Text>
						</Flex>
						<Flex align="center" gap="4" :class="$style.voting_wrapper">
							<div :style="{ left: `83.33%` }" :class="$style.threshold" />

							<div
								:style="{
									background: 'var(--brand)',
									width: `${Math.max(2, roundTo(votingShare, 0, 'ceil'))}%`
								}"
								:class="$style.voting_bar"
							/>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Total Stake</Text>
							<AmountInCurrency :amount="{ value: totalStake, unit: 'TIA' }" />
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Total Voted</Text>
							<AmountInCurrency :amount="{ value: upgrade.voted_power, unit: 'TIA' }" />
						</Flex>
					</Flex>

					<!-- Details -->
					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Signals Count</Text>

							<Text size="12" weight="600" color="secondary"> {{ upgrade.signals_count }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Initial Block</Text>

							<NuxtLink :to="`/block/${upgrade.height}`" target="_blank">
								<Flex align="center" gap="6">
									<Text size="12" weight="600" color="secondary">{{ comma(upgrade.height) }}</Text>
									<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
								</Flex>
							</NuxtLink>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Initial Time</Text>

							<Flex gap="6">
								<Text size="12" weight="600" color="secondary">
									{{ DateTime.fromISO(upgrade.time).toRelative({ locale: "en", style: "short" }) }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ DateTime.fromISO(upgrade.time).setLocale("en").toFormat("LLL d, t") }}
								</Text>
							</Flex>
						</Flex>

						<Flex v-if="upgrade.end_height" align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">End Block</Text>

							<NuxtLink :to="`/block/${upgrade.end_height}`" target="_blank">
								<Flex align="center" gap="6">
									<Text size="12" weight="600" color="secondary">{{ comma(upgrade.end_height) }}</Text>
									<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
								</Flex>
							</NuxtLink>
						</Flex>

						<Flex v-if="upgrade.end_time" align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">End Time</Text>

							<Flex gap="6">
								<Text size="12" weight="600" color="secondary">
									{{ DateTime.fromISO(upgrade.end_time).toRelative({ locale: "en", style: "short" }) }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ DateTime.fromISO(upgrade.end_time).setLocale("en").toFormat("LLL d, t") }}
								</Text>
							</Flex>
						</Flex>

						<Flex v-if="upgrade.signer" align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Tx Signer</Text>
							<Flex gap="6">
								<AddressBadge :account="upgrade.signer" color="tertiary" />
								<CopyButton :text="upgrade.signer.hash" />
							</Flex>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="4" wide :class="$style.txs_wrapper">
				<Flex align="center" justify="between" :class="$style.tabs_wrapper">
					<Flex gap="4" :class="$style.tabs">
						<Flex
							@click="activeTab = tab.name"
							v-for="tab in tabs"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === tab.name && $style.active]"
						>
							<Icon :name="tab.icon" size="12" color="secondary" />
							<Text size="13" weight="600">{{ capitilize(tab.name) }}</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" justify="center" gap="8" :class="[$style.table, isRefetching && $style.disabled]">
					<template v-if="activeTab === 'signals'">
						<SignalsTable v-if="signals.length" :signals="signals" :totalStake="totalStake" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No signals </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								No {{ page === 1 ? "" : "more" }} signals for this upgrade
							</Text>
						</Flex>
					</template>

					<!-- Pagination -->
					<Flex align="center" gap="6" :class="$style.pagination">
						<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
							<Icon name="arrow-left-stop" size="12" color="primary" />
						</Button>
						<Button @click="handlePrev" type="secondary" size="mini" :disabled="page === 1">
							<Icon name="arrow-left" size="12" color="primary" />
						</Button>

						<Button type="secondary" size="mini" disabled>
							<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
						</Button>

						<Button @click="handleNext" type="secondary" size="mini" :disabled="!handleNextCondition">
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

	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	.timeline_wrapper {
		border-bottom: 1px solid var(--op-5);

		padding: 16px;
	}

	.main {
		padding: 16px;

		& .key_value {
			max-width: 100%;
		}

		.voting_wrapper {
			position: relative;
			width: 100%;

			border-radius: 50px;
			background: var(--op-8);

			padding: 4px;
		}

		.threshold {
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

		.voting_bar {
			height: 4px;

			border-radius: 50px;
		}
	}

	.memo {
		max-width: 352px;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.horizontal_divider {
		width: 100%;
		height: 2px;
		background: var(--op-5);

		margin-top: 4px;
		margin-bottom: 4px;
	}
}

.txs_wrapper {
	min-width: 0;
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

.table {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.empty {
	flex: 1;

	padding-top: 16px;
	padding-bottom: 16px;
}

.pagination {
	padding: 0 16px 16px 16px;
}

@media (max-width: 800px) {
	.content {
		flex-direction: column;
	}

	.data {
		min-width: initial;

		border-radius: 4px;
	}

	.table {
		border-radius: 4px 4px 8px 8px;
	}
}

@media (max-width: 550px) {
	/* .header {
		height: initial;
	} */
}

@media (max-width: 400px) {
	.tabs_wrapper {
		overflow-x: auto;

		&::-webkit-scrollbar {
			display: none;
		}
	}

	.hint {
		display: none;
	}
}
</style>
