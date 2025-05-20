<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import AmountInCurrency from "@/components/AmountInCurrency.vue"
import BookmarkButton from "@/components/BookmarkButton.vue"
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Events from "@/components/shared/tables/Events.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"
import MessagesTable from "@/components/modules/tx/MessagesTable.vue"

/** Services */
import { comma } from "@/services/utils"

/** API */
import { fetchTxMessages } from "@/services/api/tx"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const props = defineProps({
	tx: {
		type: Object,
		required: true,
	},
})

const preselectedTab = route.query.tab && ["messages", "events"].includes(route.query.tab) ? route.query.tab : "messages"
const activeTab = ref(preselectedTab)
const messages = ref([])

const gasBarColor = computed(() => {
	let percent = (props.tx.gas_used * 100) / props.tx.gas_wanted

	if (percent > 100) {
		return "var(--red)"
	} else if (percent < 30) {
		return "var(--orange)"
	} else if (percent < 60) {
		return "var(--yellow)"
	} else {
		return "var(--green)"
	}
})

watch(
	() => activeTab.value,
	() =>
		router.replace({
			query: {
				tab: activeTab.value,
			},
		}),
)

onMounted(async () => {
	router.replace({
		query: {
			tab: activeTab.value,
		},
	})

	const data = await fetchTxMessages(props.tx.hash)
	messages.value = data
})

const handleViewRawTransaction = () => {
	cacheStore.current._target = "transaction"
	modalsStore.open("rawData")
}
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="tx" size="14" color="primary" />
				<Text as="h1" size="13" weight="600" color="primary">
					Transaction <Text color="secondary">{{ tx.hash.slice(0, 4) }} ••• {{ tx.hash.slice(-4) }}</Text>
				</Text>
				<CopyButton :text="tx.hash" size="12" />
			</Flex>

			<Flex align="center" gap="12">
				<BookmarkButton type="transaction" :id="tx.hash" />

				<div class="divider_v" />

				<Dropdown>
					<Button type="secondary" size="mini">
						<Icon name="dots" size="16" color="primary" />
					</Button>

					<template #popup>
						<DropdownItem @click="handleViewRawTransaction"> View Raw Transaction </DropdownItem>
					</template>
				</Dropdown>
			</Flex>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex align="center" gap="40">
						<Flex direction="column" gap="10" :class="$style.key_value">
							<Text size="12" weight="600" color="secondary">Status</Text>

							<Flex align="center" gap="6">
								<Icon
									:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
									size="14"
									:color="tx.status === 'success' ? 'green' : 'red'"
								/>
								<Text size="13" weight="600" color="primary" style="text-transform: capitalize">
									{{ tx.status }}
								</Text>
							</Flex>
						</Flex>

						<Flex direction="column" gap="10" :class="$style.key_value">
							<Text size="12" weight="600" color="secondary">Time</Text>
							<Text size="13" weight="600" color="primary">
								{{ DateTime.fromISO(tx.time).setLocale("en").toFormat("ff") }}
							</Text>
						</Flex>
					</Flex>

					<Flex v-if="tx.error" direction="column" gap="6">
						<Text size="12" weight="600" color="secondary">Error Message</Text>

						<Text size="12" height="140" weight="600" color="tertiary" mono selectable>{{ tx.error }}</Text>
					</Flex>

					<Flex direction="column" gap="10" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Type</Text>

						<Flex v-if="tx.message_types.length" align="center" gap="8" wrap="wrap">
							<MessageTypeBadge v-for="type in tx.message_types" :types="[type]" />
						</Flex>
						<Text v-else size="13" weight="600" color="tertiary">No Message Types</Text>
					</Flex>

					<Flex direction="column" gap="10" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Block</Text>

						<NuxtLink :to="`/block/${tx.height}`">
							<Outline>
								<Flex align="center" gap="6">
									<Icon name="block" size="14" color="tertiary" />

									<Text size="13" weight="600" color="primary">{{ comma(tx.height) }}</Text>
								</Flex>
							</Outline>
						</NuxtLink>
					</Flex>

					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Hash</Text>
						<BadgeValue :text="tx.hash" />
					</Flex>

					<Flex v-if="tx.memo" direction="column" gap="6">
						<Text size="12" weight="600" color="secondary">Memo</Text>

						<Flex align="center" gap="6">
							<CopyButton :text="tx.memo" />
							<Text size="12" height="140" weight="600" color="tertiary" mono selectable :class="$style.memo">
								{{ tx.memo }}
							</Text>
						</Flex>
					</Flex>

					<Flex direction="column" gap="10">
						<Text size="12" weight="600" color="secondary">Gas Used</Text>

						<div :class="$style.gas_bar">
							<div
								:style="{
									width: `${(tx.gas_used * 100) / tx.gas_wanted > 100 ? 100 : (tx.gas_used * 100) / tx.gas_wanted}%`,
									background: gasBarColor,
									boxShadow: `0 0 6px ${gasBarColor}`,
								}"
								:class="$style.gas_used"
							/>
						</div>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="secondary">{{ ((tx.gas_used * 100) / tx.gas_wanted).toFixed(2) }}%</Text>
							<Text size="12" weight="600" color="tertiary">{{ comma(tx.gas_used) }} / {{ comma(tx.gas_wanted) }}</Text>
						</Flex>
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Signer</Text>
							<Flex v-if="tx.signers" align="center" gap="6">
								<AddressBadge :account="tx.signers[0]" color="secondary" />

								<CopyButton :text="tx.signers[0].hash" />
							</Flex>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Events</Text>
							<Text size="12" weight="600" color="secondary"> {{ tx.events_count }} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Messages</Text>
							<Text size="12" weight="600" color="secondary"> {{ tx.messages_count }} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Fee </Text>
							<AmountInCurrency
								:amount="{ value: tx.fee, decimal: 6 }"
								:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }"
							/>
						</Flex>
						<Flex v-if="tx.codespace" align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Codespace</Text>
							<Text size="12" weight="600" color="secondary" no-wrap style="text-transform: capitalize">
								{{ tx.codespace }}</Text
							>
						</Flex>
						<Flex v-if="tx.timeout_height" align="center" justify="between">
							<Text size="12" weight="600" color="tertiary">Timeout Height</Text>
							<Text size="12" weight="600" color="secondary" no-wrap> {{ comma(tx.timeout_height) }}</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="4" wide :class="$style.events_wrapper">
				<Flex align="center" justify="between" :class="$style.tabs_wrapper">
					<Flex gap="4" :class="$style.tabs">
						<Flex
							@click="activeTab = 'messages'"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === 'messages' && $style.active]"
						>
							<Icon name="message" size="12" color="secondary" />

							<Text size="13" weight="600">Messages</Text>
						</Flex>

						<Flex
							@click="activeTab = 'events'"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === 'events' && $style.active]"
						>
							<Icon name="zap" size="12" color="secondary" />

							<Text size="13" weight="600">Events</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex v-if="activeTab === 'messages'" :class="$style.inner">
					<MessagesTable :messages="messages" />
				</Flex>
				<Flex v-if="activeTab === 'events'" :class="$style.inner">
					<Events :tx="tx" />
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

.content {
	display: grid;
	grid-template-columns: 384px 1fr;
}

.data {
	max-width: 384px;

	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	.main {
		min-width: 384px;

		padding: 16px;

		& .key_value {
			max-width: 100%;
		}
	}
}

.gas_bar {
	width: 100%;
	height: 6px;

	border-radius: 50px;
	background: linear-gradient(var(--op-10), var(--op-5));

	& .gas_used {
		height: 6px;

		border-radius: 50px;
	}
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

.events_wrapper {
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

.inner {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);
}

.events {
	padding: 16px;
}

.message_types {
	width: fit-content;

	border-radius: 50px;
	background: var(--op-5);
	border: 1px solid var(--op-5);

	padding: 6px 10px;
	margin-bottom: 8px;
}

.event {
	height: 36px;

	cursor: pointer;

	& .left {
		height: 100%;

		& div {
			width: 2px;
			height: 100%;
			background: var(--op-5);
		}
	}

	& .left.first {
		& div {
			&:first-child {
				background: transparent;
			}
		}
	}

	& .left.last {
		& div {
			&:last-child {
				background: transparent;
			}
		}
	}

	& .right {
		min-width: 0;
		height: 100%;

		border-bottom: 1px solid var(--op-5);

		& .text {
			display: inline-block;
			color: var(--txt-tertiary);

			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			& > * {
				margin-right: 4px;
			}

			& .tooltip {
				display: inline-block;
			}
		}
	}
}

.memo {
	text-overflow: ellipsis;
	overflow: hidden;
}

@media (max-width: 800px) {
	.content {
		grid-template-columns: 1fr;
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

@media (max-width: 500px) {
	.data {
		.main {
			min-width: initial;
		}
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
