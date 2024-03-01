<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Tables */
import BlocksTable from "./tables/BlocksTable.vue"
import DelegatorsTable from "./tables/DelegatorsTable.vue"
import JailsTable from "./tables/JailsTable.vue"

/** Services */
import { comma, numToPercent, shortHex, splitAddress, tia } from "@/services/utils"

/** API */
import { fetchValidatorBlocks, fetchValidatorDelegators, fetchValidatorJails, fetchValidatorUptime } from "@/services/api/validator";

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const props = defineProps({
	validator: {
		type: Object,
		required: true,
	},
})

const tabs = ref([
{
		name: "Delegators",
		icon: "address",
	},
	{
		name: "Proposed Blocks",
		icon: "block",
	},
	{
		name: "Jails",
		icon: "grid",
	},
])
const activeTab = ref(tabs.value[0].name)

const isRefetching = ref(false)
const delegators = ref([])
const blocks = ref([])
const jails = ref([])
const uptime = ref([])

const page = ref(1)
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
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	if (data.value?.length) {
		blocks.value = data.value
		cacheStore.current.blocks = blocks.value
		handleNextCondition.value = blocks.value.length < 10
	}

	isRefetching.value = false
}

const getDelegators = async () => {
	isRefetching.value = true

	const { data } = await fetchValidatorDelegators({
		id: props.validator.id,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	delegators.value = data.value
	handleNextCondition.value = delegators.value.length < 10

	isRefetching.value = false
}

const getJails = async () => {
	isRefetching.value = true

	const { data } = await fetchValidatorJails({
		id: props.validator.id,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	jails.value = data.value
	handleNextCondition.value = jails.value.length < 10

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

/** Initital fetch for delegators and uptime */
await getDelegators()
await getUptime()

const parsedContacts = computed(() => {
	let res = []
	const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
	const emails = props.validator.contacts.match(emailRegex);

	if (emails) {
		emails.forEach(email => {
			res.push({
				type: 'email',
				value: 'mailto:' + email,
			});
		});
	}

	const telegramRegex = /https?:\/\/t\.me\/([A-Za-z0-9_]+)/g;
	const telegrams = props.validator.contacts.match(telegramRegex);

	if (telegrams) {
		telegrams.forEach(telegram => {
			res.push({
				type: 'telegram',
				value: telegram,
			});
		});
	}

	return res
})

/** Refetch Blobs/Messages on new page */
watch(
	() => page.value,
	() => {
		switch (activeTab.value) {
			case "Delegators":
				getDelegators()
				break
			case "Proposed Blocks":
				getBlocks()
				break
			case "Jails":
				getJails()
				break
		}
	},
)

watch(
	() => activeTab.value,
	() => {
		page.value = 1

		switch (activeTab.value) {
			case "Delegators":
				getDelegators()
				break
			case "Proposed Blocks":
				getBlocks()
				break
			case "Jails":
				getJails()
				break
		}
	},
)
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="validator" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Validator</Text>
			</Flex>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="8" :class="$style.key_value">
						<Flex align="center" justify="between">
							<Text v-if="validator.moniker" size="13" weight="600" color="primary">{{ validator.moniker }} </Text>
							<Text v-else size="13" weight="600" color="primary">Validator</Text>

							<Tooltip position="start" delay="500">
								<Text size="13" weight="600" :color="!validator.jailed ? 'neutral-green' : 'red'"> {{ !validator.jailed ? 'Active' : 'Jailed' }} </Text>

								<template #content>
									<Flex v-if="!validator.jailed" direction="column" gap="6">
										<Flex align="center" gap="4">
											<Text color="secondary">This validator is</Text>
											<Text color="neutral-green">Active</Text>
										</Flex>
										<Flex align="center" gap="4">
											<Text color="secondary">and can propose and sign blocks</Text>
										</Flex>
									</Flex>
									<Flex v-else direction="column" gap="6">
										<Flex align="center" gap="4">
											<Text color="secondary">This validator is</Text>
											<Text color="red">Jailed</Text>
										</Flex>
										<Flex align="center" gap="4">
											<Text color="secondary">and cannot propose or sign blocks</Text>
										</Flex>
									</Flex>
								</template>
							</Tooltip>

							
						</Flex>
						<Flex align="center" gap="6">
							<Text size="12" weight="600" color="tertiary"> {{ splitAddress(validator.address) }} </Text>

							<CopyButton :text="validator.address" />
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
					<Flex align="center" justify="start" gap="12">
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
							<Text size="12" weight="600" color="tertiary" selectable> {{ comma(validator.voting_power) }} TIA</Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Outgoing Rewards</Text>
							<Text size="12" weight="600" color="tertiary" selectable> {{ comma(tia(validator.rewards)) }} TIA</Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Commissions</Text>
							<Text size="12" weight="600" color="tertiary" selectable> {{ comma(tia(validator.commissions)) }} TIA</Text>
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
								<AddressBadge :hash="validator.delegator" color="tertiary" />
								<CopyButton :text="validator.delegator" />
							</Flex>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Consensus Address</Text>
							<Flex gap="6">
								<Text size="12" weight="600" color="tertiary"> {{ shortHex(validator.cons_address) }} </Text>
								<CopyButton :text="validator.cons_address" />
							</Flex>
						</Flex>

						<Flex align="center" justify="between">
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

						<div :class="$style.horizontal_divider" />

						<!-- Validator Uptime -->
						<Flex align="center" gap="6">
							<Text size="12" weight="600" color="secondary">Validator Uptime</Text>
							<Text size="12" weight="600" color="tertiary">(last 100 blocks)</Text>
						</Flex>

						<Flex :class="$style.uptime_wrapper">
							<Tooltip v-for="t in uptime">
								<Flex
									:class="$style.uptime"
									:style="{
										background: t.signed ? 'rgb(10, 219, 111)' : 'red',
									}"
								/>

								<template #content>
									<Flex direction="column" gap="4">
										<Text color="primary">{{ t.height }}</Text>
										<Text color="secondary">{{ t.signed ? 'Signed' : 'Missed' }}</Text>
									</Flex>
								</template>
							</Tooltip>
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
							<Text size="13" weight="600">{{ tab.name }}</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" justify="center" gap="8" :class="[$style.table, isRefetching && $style.disabled]">
					<template v-if="activeTab === 'Delegators'">
						<DelegatorsTable v-if="delegators.length" :delegators="delegators" :validator="validator" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No delegators </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								This validator does not have any {{ page === 1 ? '' : 'more' }} delegators
							</Text>
						</Flex>
					</template>

					<template v-if="activeTab === 'Proposed Blocks'">
						<BlocksTable v-if="blocks.length" :blocks="blocks" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No blocks </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								This validator did not propose any {{ page === 1 ? '' : 'more' }} blocks
							</Text>
						</Flex>
					</template>

					<template v-if="activeTab === 'Jails'">
						<JailsTable v-if="jails.length" :jails="jails" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No penalties </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								This validator doesn't have any {{ page === 1 ? '' : 'more' }} penalties
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
		max-width: 352px;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.uptime_wrapper {
		max-width: 384px;
		flex-wrap: wrap;
	}

	.uptime {
		width: 10px;
		height: 10px;

		border-radius: 2px;
		cursor: pointer;

		margin-right: 6px;
		margin-bottom: 6px;
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
