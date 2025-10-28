<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Components */
import ValidatorMetrics from "./ValidatorMetrics.vue"

/** Tables */
import BlocksTable from "./tables/BlocksTable.vue"
import DelegatorsTable from "./tables/DelegatorsTable.vue"
import JailsTable from "./tables/JailsTable.vue"
import SignalsTable from "./tables/SignalsTable.vue"
import VotesTable from "./tables/VotesTable.vue"

/** Services */
import { capitilize, comma, numToPercent, shortHex, splitAddress } from "@/services/utils"

/** API */
import {
	fetchValidatorBlocks,
	fetchValidatorDelegators,
	fetchValidatorJails,
	fetchValidatorUptime,
	fetchSignals
} from "@/services/api/validator"
import { fetchVotesByAddressHash } from "@/services/api/address"

/** Store */
import { useCacheStore } from "@/store/cache.store"
import { useModalsStore } from "@/store/modals.store"
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

const route = useRoute()
const router = useRouter()

const props = defineProps({
	validator: {
		type: Object,
		required: true,
	},
})

const tabs = ref([
	{
		name: "delegators",
		icon: "address",
	},
	{
		name: "proposed blocks",
		icon: "block",
	},
	{
		name: "jails",
		icon: "grid",
	},
	{
		name: "votes",
		icon: "check-circle",
	},
	{
		name: "signals",
		icon: "bell-ringing",
	},
])
const preselectedTab = route.query.tab && tabs.value.map((tab) => tab.name).includes(route.query.tab) ? route.query.tab : tabs.value[0].name
const activeTab = ref(preselectedTab)

const isRefetching = ref(false)
const delegators = ref([])
const blocks = ref([])
const jails = ref([])
const signals = ref([])
const votes = ref([])
const uptime = ref([])

const page = ref(1)
const limit = 10
const handleNextCondition = ref(true)

const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	page.value -= 1
}

const getBlocks = async () => {
	isRefetching.value = true

	const { data } = await fetchValidatorBlocks({
		id: props.validator.id,
		limit: limit,
		offset: (page.value - 1) * limit,
	})

	if (data.value?.length) {
		blocks.value = data.value
		cacheStore.current.blocks = blocks.value
		handleNextCondition.value = blocks.value?.length < limit
	}

	isRefetching.value = false
}

const getDelegators = async () => {
	isRefetching.value = true

	const { data } = await fetchValidatorDelegators({
		id: props.validator.id,
		limit: limit,
		offset: (page.value - 1) * limit,
	})

	delegators.value = data.value
	handleNextCondition.value = delegators.value?.length < limit

	isRefetching.value = false
}

const getJails = async () => {
	isRefetching.value = true

	const { data } = await fetchValidatorJails({
		id: props.validator.id,
		limit: limit,
		offset: (page.value - 1) * limit,
	})

	jails.value = data.value
	handleNextCondition.value = jails.value?.length < limit

	isRefetching.value = false
}

const getSignals = async () => {
	isRefetching.value = true

	const { data } = await fetchSignals({
		validatorId: props.validator.id,
		limit: limit,
		offset: (page.value - 1) * limit,
	})

	signals.value = data.value
	handleNextCondition.value = signals.value?.length < limit

	isRefetching.value = false
}

const getVotes = async () => {
	isRefetching.value = true

	const { data } = await fetchVotesByAddressHash({
		hash: props.validator.delegator?.hash,
		limit: limit,
		offset: (page.value - 1) * limit,
	})

	votes.value = data.value
	handleNextCondition.value = votes.value?.length < limit

	isRefetching.value = false
}

const getUptime = async () => {
	const { data } = await fetchValidatorUptime({
		id: props.validator.id,
		limit: 100,
	})

	if (data.value?.blocks?.length) {
		uptime.value = data.value.blocks.sort((a, b) => a.height - b.height)
	}
}

/** Initital fetch */
if (activeTab.value?.toLowerCase() === "delegators") await getDelegators()
if (activeTab.value?.toLowerCase() === "proposed blocks") await getBlocks()
if (activeTab.value?.toLowerCase() === "jails") await getJails()
if (activeTab.value?.toLowerCase() === "signals") await getSignals()
if (activeTab.value?.toLowerCase() === "votes") await getVotes()
await getUptime()

onMounted(() => {
	router.replace({
		query: {
			tab: activeTab.value?.toLowerCase(),
		},
	})
})

const validatorStatus = computed(() => {
	let res = {
		name: "",
		color: "",
		description: "",
	}

	if (!props.validator.jailed) {
		// if (uptime.value?.slice(-1)[0].signed) {
		// 	res.name = "Active"
		// 	res.color = "var(--validator-active)"
		// 	res.description = "This validator is in the active set and can|propose or sign blocks and receive rewards".split("|")
		// } else {
		// 	res.name = "Inactive"
		// 	res.color = "var(--validator-inactive)"
		// 	res.description = "This validator is not in the active set and cannot|propose or sign blocks and earn rewards".split("|")
		// }
	} else {
		res.name = "Jailed"
		res.color = "var(--validator-jailed)"
		res.description = "This validator is jailed|and cannot propose or sign blocks".split("|")
	}

	return res
})

const parsedContacts = computed(() => {
	let res = []
	const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
	const emails = props.validator.contacts.match(emailRegex)

	if (emails) {
		emails.forEach((email) => {
			res.push({
				type: "email",
				value: "mailto:" + email,
			})
		})
	}

	const telegramRegex = /https?:\/\/t\.me\/([A-Za-z0-9_]+)/g
	const telegrams = props.validator.contacts.match(telegramRegex)

	if (telegrams) {
		telegrams.forEach((telegram) => {
			res.push({
				type: "telegram",
				value: telegram,
			})
		})
	}

	return res
})

/** Refetch Blobs/Messages on new page */
watch(
	() => page.value,
	() => {
		switch (activeTab.value?.toLowerCase()) {
			case "delegators":
				getDelegators()
				break
			case "proposed blocks":
				getBlocks()
				break
			case "jails":
				getJails()
				break
			case "signals":
				getSignals()
				break
			case "votes":
				getVotes()
				break
		}
	},
)

watch(
	() => activeTab.value,
	() => {
		router.replace({
			query: {
				tab: activeTab.value?.toLowerCase(),
			},
		})

		page.value = 1

		switch (activeTab.value?.toLowerCase()) {
			case "delegators":
				getDelegators()
				break
			case "proposed blocks":
				getBlocks()
				break
			case "jails":
				getJails()
				break
			case "signals":
				getSignals()
				break
			case "votes":
				getVotes()
				break
		}
	},
)

const handleDelegate = () => {
	modalsStore.open("staking")
}
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="validator" size="14" color="primary" />
				<Text as="h1" size="13" weight="600" color="primary">
					Validator <Text color="secondary">{{ validator.moniker }}</Text>
				</Text>
			</Flex>

			<Flex align="center" gap="12">
				<Button @click="handleDelegate" type="secondary" size="mini">
					<Icon name="coins_up" size="12" color="primary" />
					Delegate
				</Button>
			</Flex>
		</Flex>

		<Flex direction="column" gap="4" :class="$style.content">
			<Flex gap="4" :class="$style.content">
				<Flex direction="column" :class="$style.data" wide>
					<Flex direction="column" gap="24" :class="$style.main">
						<Flex direction="column" gap="8" :class="$style.key_value">
							<Flex align="center" justify="between">
								<Text v-if="validator.moniker" size="13" weight="600" color="primary">{{ validator.moniker }} </Text>
								<Text v-else size="13" weight="600" color="primary">Validator</Text>

								<Tooltip v-if="validatorStatus.name" position="start" textAlign="left" delay="200">
									<Text size="13" weight="600" :style="{ color: validatorStatus.color }"> {{ validatorStatus.name }} </Text>

									<template #content>
										<Flex direction="column" gap="4">
											<Text v-for="s in validatorStatus.description" color="secondary">{{ s }}</Text>
										</Flex>
									</template>
								</Tooltip>
							</Flex>
							<Flex align="center" gap="6">
								<Text size="12" weight="600" color="tertiary"> {{ splitAddress(validator.address.hash) }} </Text>

								<CopyButton :text="validator.address.hash" />
							</Flex>
						</Flex>

						<Flex v-if="validator.details" direction="column" gap="6">
							<Text size="12" weight="600" color="secondary">Description</Text>

							<Flex align="center" gap="6">
								<Text size="12" height="140" weight="600" color="tertiary" mono selectable :class="$style.memo">
									{{ validator.details }}
								</Text>
							</Flex>
						</Flex>
						<Flex v-if="validator.website || parsedContacts.length" align="center" justify="start" gap="12">
							<Tooltip v-if="validator.website" position="start" delay="500">
								<a :href="validator.website" target="_blank">
									<Icon name="globe" size="14" color="secondary" :class="$style.btn" />
								</a>

								<template #content>
									{{ validator.website }}
								</template>
							</Tooltip>

							<template v-for="c in parsedContacts">
								<Tooltip v-if="c.type !== 'unknown'" position="start" delay="500">
									<a :href="c.value" target="_blank">
										<Icon :name="c.type" size="14" color="secondary" :class="$style.btn" />
									</a>

									<template #content>
										{{ c.value }}
									</template>
								</Tooltip>
							</template>
						</Flex>

						<!-- Staking -->
						<Flex direction="column" gap="16">
							<Text size="12" weight="600" color="secondary">Staking</Text>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Voting Power</Text>
								<AmountInCurrency
									:amount="{ value: validator.voting_power, unit: 'TIA' }"
									:styles="{ amount: { color: 'tertiary' } }"
								/>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Outgoing Rewards</Text>
								<AmountInCurrency :amount="{ value: validator.rewards }" :styles="{ amount: { color: 'tertiary' } }" />
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Commissions</Text>
								<AmountInCurrency :amount="{ value: validator.commissions }" :styles="{ amount: { color: 'tertiary' } }" />
							</Flex>
						</Flex>

						<!-- Details -->
						<Flex direction="column" gap="16">
							<Text size="12" weight="600" color="secondary">Details</Text>

							<Flex v-if="!parsedContacts.length && validator.contacts" align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Contact</Text>
								<Text size="12" weight="600" color="tertiary" selectable> {{ validator.contacts }} </Text>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Delegator Address</Text>
								<Flex gap="6">
									<AddressBadge :account="validator.delegator" color="tertiary" />
									<CopyButton :text="validator.delegator.hash" />
								</Flex>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Consensus Address</Text>
								<Flex gap="6">
									<Text size="12" weight="600" color="tertiary"> {{ shortHex(validator.cons_address) }} </Text>
									<CopyButton :text="validator.cons_address" />
								</Flex>
							</Flex>

							<Flex v-if="validator.identity" align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Identity</Text>
								<Flex gap="6">
									<Text size="12" weight="600" color="tertiary"> {{ validator.identity }} </Text>
									<CopyButton :text="validator.identity" />
								</Flex>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Rate</Text>
								<Text size="12" weight="600" color="secondary"> {{ numToPercent(validator.rate) }} </Text>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Max Rate</Text>
								<Text size="12" weight="600" color="secondary"> {{ numToPercent(validator.max_rate) }} </Text>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Max Change Rate</Text>
								<Text size="12" weight="600" color="secondary"> {{ numToPercent(validator.max_change_rate) }} </Text>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Min Self Delegation</Text>
								<Text size="12" weight="600" color="secondary"> {{ comma(validator.min_self_delegation) }} </Text>
							</Flex>

							<Flex v-if="validator.version" align="center" justify="between">
								<Text size="12" weight="600" color="tertiary">Version</Text>
								<Text size="12" weight="600" color="secondary"> {{ `v${validator.version}` }} </Text>
							</Flex>

							<div :class="$style.horizontal_divider" />

							<!-- Validator Uptime -->
							<Flex align="center" gap="6">
								<Text size="12" weight="600" color="secondary">Validator Uptime</Text>
								<Text size="12" weight="600" color="tertiary">(last 100 blocks)</Text>
							</Flex>

							<Flex :class="$style.uptime_wrapper">
								<Tooltip v-for="t in uptime" @click="navigateTo(`/block/${t.height}`)">
									<Flex
										:class="$style.uptime"
										:style="{
											background: t.signed ? 'var(--brand)' : 'var(--red)',
										}"
									/>

									<template #content>
										<Flex direction="column" gap="4">
											<Text color="primary">{{ t.height }}</Text>
											<Text color="secondary">{{ t.signed ? "Signed" : "Missed" }}</Text>
										</Flex>
									</template>
								</Tooltip>
							</Flex>
						</Flex>
					</Flex>
				</Flex>

				<Flex justify="center" :class="$style.metrics_wrapper">
					<ValidatorMetrics :validator="validator" />
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
					<template v-if="activeTab === 'delegators'">
						<DelegatorsTable v-if="delegators.length" :delegators="delegators" :validator="validator" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No delegators </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								This validator does not have any {{ page === 1 ? "" : "more" }} delegators
							</Text>
						</Flex>
					</template>

					<template v-if="activeTab === 'proposed blocks'">
						<BlocksTable v-if="blocks.length" :blocks="blocks" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No blocks </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								This validator did not propose any {{ page === 1 ? "" : "more" }} blocks
							</Text>
						</Flex>
					</template>

					<template v-if="activeTab === 'jails'">
						<JailsTable v-if="jails.length" :jails="jails" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No penalties </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								This validator doesn't have any {{ page === 1 ? "" : "more" }} penalties
							</Text>
						</Flex>
					</template>

					<template v-if="activeTab === 'votes'">
						<VotesTable v-if="votes.length" :votes="votes" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No votes </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								No {{ page === 1 ? "" : "more" }} votes from this validator on any proposals
							</Text>
						</Flex>
					</template>

					<template v-if="activeTab === 'signals'">
						<SignalsTable v-if="signals.length" :signals="signals" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No signals </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								No {{ page === 1 ? "" : "more" }} signals from this validator
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

						<Button @click="handleNext" type="secondary" size="mini" :disabled="handleNextCondition">
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

	.main {
		padding: 16px;

		& .key_value {
			max-width: 100%;
		}
	}

	.memo {
		max-width: 100%;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.uptime_wrapper {
		max-width: 384px;
		flex-wrap: wrap;
	}

	.uptime {
		width: 0.6rem;
		height: 0.6rem;

		border-radius: 2px;
		cursor: pointer;

		margin-right: 0.35rem;
		margin-bottom: 0.35rem;
	}

	.horizontal_divider {
		width: 100%;
		height: 2px;
		background: var(--op-5);

		margin-top: 4px;
		margin-bottom: 4px;
	}
}

.metrics_wrapper {
	border-radius: 4px 4px 4px 4px;

	/* min-width: 0; */

	background: var(--card-background);
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

	.hint {
		display: none;
	}
}
</style>
