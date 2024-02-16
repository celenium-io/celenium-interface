<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "~/components/ui/Tooltip.vue"
import Button from "~/components/ui/Button.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"
import MessagesTable from "@/components/modules/tx/MessagesTable.vue"

/** Services */
import { comma, tia, splitAddress } from "@/services/utils"

/** API */
import { fetchTxEvents, fetchTxMessages } from "@/services/api/tx"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
import { useBookmarksStore } from "@/store/bookmarks"
import { useNotificationsStore } from "@/store/notifications"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()
const bookmarksStore = useBookmarksStore()
const notificationsStore = useNotificationsStore()

const router = useRouter()

const props = defineProps({
	events: {
		type: Array,
		required: true,
	},
})

const EventIconMapping = {
	message: "message",
	coin_received: "coins_down",
	coin_spent: "coins_up",
	transfer: "arrow-circle-right-up",
	withdraw_rewards: "coins",
	withdraw_commission: "tag",
	tx: "zap",
}

const handleViewRawEvent = (event) => {
	cacheStore.current._target = "event"
	cacheStore.current.event = event
	modalsStore.open("rawData")
}
</script>

<template>
	<Flex v-for="(event, idx) in events" @click="handleViewRawEvent(event)" align="center" gap="12" :class="$style.event">
		<Flex
			direction="column"
			align="center"
			gap="6"
			:class="[$style.left, idx === 0 && $style.first, idx === events.length - 1 && $style.last]"
		>
			<div />
			<Icon :name="EventIconMapping[event.type] ? EventIconMapping[event.type] : 'zap'" size="12" color="tertiary" />
			<div />
		</Flex>

		<Flex wide justify="between" align="center" gap="6" :class="$style.right">
			<!-- Event: coin_spent -->
			<Flex v-if="event.type === 'coin_spent'" align="center" gap="4" color="secondary" :class="$style.text">
				<Text size="12" weight="500" color="secondary">Address</Text>

				<Tooltip :class="$style.tooltip">
					<NuxtLink :to="`/address/${event.data.spender}`" @click.stop>
						<Text size="12" weight="500" color="primary" mono>
							{{ splitAddress(event.data.spender) }}
						</Text>
					</NuxtLink>

					<template #content>
						{{ event.data.spender }}
					</template>
				</Tooltip>

				<Text size="12" weight="500" color="secondary">spent</Text>

				<Text size="12" weight="500" color="primary" mono no-wrap>
					{{ tia(event.data.amount.replace("utia", "")) }} TIA</Text
				>
			</Flex>
			<!-- Event: coin_received -->
			<Flex v-else-if="event.type === 'coin_received'" align="center" gap="4" color="secondary" :class="$style.text">
				<Text size="12" weight="500" color="secondary">Address</Text>

				<Tooltip :class="$style.tooltip">
					<NuxtLink :to="`/address/${event.data.receiver}`" @click.stop>
						<Text size="12" weight="500" color="primary" mono>
							{{ splitAddress(event.data.receiver) }}
						</Text>
					</NuxtLink>

					<template #content>
						{{ event.data.receiver }}
					</template>
				</Tooltip>

				<Text size="12" weight="500" color="secondary">received</Text>

				<Text size="12" weight="500" color="primary" mono no-wrap>
					{{ tia(event.data.amount.replace("utia", "")) }} TIA
				</Text>
			</Flex>
			<!-- Event: delegate -->
			<Flex v-else-if="event.type === 'delegate'" align="center" gap="4" color="secondary" :class="$style.text">
				<Text size="12" weight="500" color="secondary">Validator</Text>

				<Tooltip :class="$style.tooltip">
					<NuxtLink :to="`/address/${event.data.validator}`" @click.stop>
						<Text size="12" weight="500" color="primary" mono>
							{{ splitAddress(event.data.validator) }}
						</Text>
					</NuxtLink>

					<template #content>
						{{ event.data.validator }}
					</template>
				</Tooltip>

				<Text size="12" weight="500" color="secondary">for</Text>

				<Text size="12" weight="500" color="primary" mono>
					{{ event.data.amount }}
				</Text>
			</Flex>
			<!-- Event: transfer -->
			<Flex v-else-if="event.type === 'transfer'" align="center" gap="4" color="secondary" :class="$style.text">
				<Text size="12" weight="500" color="secondary">Address</Text>

				<Tooltip :class="$style.tooltip">
					<NuxtLink :to="`/address/${event.data.sender}`" @click.stop>
						<Text size="12" weight="500" color="primary" mono>
							{{ splitAddress(event.data.sender) }}
						</Text>
					</NuxtLink>

					<template #content>
						{{ event.data.sender }}
					</template>
				</Tooltip>

				<Text size="12" weight="500" color="secondary">sent</Text>

				<Text size="12" weight="500" color="primary" mono no-wrap>
					{{ tia(event.data.amount.replace("utia", "")) }} TIA</Text
				>

				<Text size="12" weight="500" color="secondary">to</Text>

				<Tooltip :class="$style.tooltip">
					<NuxtLink :to="`/address/${event.data.recipient}`" @click.stop>
						<Text size="12" weight="500" color="primary" mono>
							{{ splitAddress(event.data.recipient) }}
						</Text>
					</NuxtLink>

					<template #content>
						{{ event.data.recipient }}
					</template>
				</Tooltip>
			</Flex>
			<!-- Event: tx -->
			<Flex v-else-if="event.type === 'tx'" align="center" gap="4" color="secondary" :class="$style.text">
				<!-- Signature -->
				<template v-if="event.data.signature">
					<Text size="12" weight="500" color="secondary">Signature</Text>

					<Tooltip :class="$style.tooltip">
						<Text size="12" weight="500" color="primary" mono>
							{{ event.data.signature.slice(event.data.signature.length - 4, event.data.signature.length) }}
						</Text>

						<template #content>
							{{ event.data.signature }}
						</template>
					</Tooltip>
				</template>
				<!-- acc_seq -->
				<template v-if="event.data.acc_seq">
					<Text size="12" weight="500" color="secondary">Acc</Text>

					<Tooltip :class="$style.tooltip">
						<NuxtLink :to="`/address/${event.data.acc_seq.split('/')[0]}`" @click.stop>
							<Text size="12" weight="500" color="primary" mono>
								{{ splitAddress(event.data.acc_seq.split("/")[0]) }}
							</Text>
						</NuxtLink>

						<template #content>
							{{ event.data.acc_seq.split("/")[0] }}
						</template>
					</Tooltip>

					<template v-if="event.data.acc_seq.split('/')[1]">
						<Text size="12" weight="500" color="secondary">Seq</Text>

						<Text size="12" weight="500" color="primary" mono>
							{{ event.data.acc_seq.split("/")[1] }}
						</Text>
					</template>
				</template>
				<!-- fee -->
				<template v-if="event.data.fee">
					<Text size="12" weight="500" color="secondary">Address</Text>

					<Tooltip :class="$style.tooltip">
						<NuxtLink :to="`/address/${event.data.fee_payer}`" @click.stop>
							<Text size="12" weight="500" color="primary" mono>
								{{ splitAddress(event.data.fee_payer) }}
							</Text>
						</NuxtLink>

						<template #content>
							{{ event.data.fee_payer }}
						</template>
					</Tooltip>

					<Text size="12" weight="500" color="secondary">paid</Text>

					<Text size="12" weight="500" color="primary" mono no-wrap>
						{{ tia(event.data.fee.replace("utia", "")) }} TIA</Text
					>

					<Text size="12" weight="500" color="secondary">fee</Text>
				</template>
			</Flex>
			<!-- Event: message -->
			<Flex v-else-if="event.type === 'message'" align="center" gap="4" color="secondary" :class="$style.text">
				<!-- action -->
				<template v-if="event.data.action">
					<Text size="12" weight="500" color="secondary" no-wrap>Call action</Text>

					<Text size="12" weight="500" color="primary" mono>
						{{ event.data.action }}
					</Text>
				</template>
				<!-- sender -->
				<template v-else-if="event.data.sender">
					<Text size="12" weight="500" color="secondary">Sender</Text>

					<Tooltip :class="$style.tooltip">
						<NuxtLink :to="`/address/${event.data.sender}`" @click.stop>
							<Text size="12" weight="500" color="primary" mono>
								{{ splitAddress(event.data.sender) }}
							</Text>
						</NuxtLink>

						<template #content>
							{{ event.data.sender }}
						</template>
					</Tooltip>
				</template>
				<!-- sender -->
				<template v-else-if="event.data.module">
					<Text size="12" weight="500" color="secondary">Module</Text>

					<Text size="12" weight="500" color="primary" mono>
						{{ event.data.module }}
					</Text>
				</template>
			</Flex>
			<!-- Event: withdraw_rewards -->
			<Flex
				v-else-if="event.type === 'withdraw_rewards'"
				align="center"
				gap="4"
				color="secondary"
				:class="$style.text"
			>
				<Text size="12" weight="500" color="secondary">Delegator</Text>

				<Tooltip :class="$style.tooltip">
					<NuxtLink :to="`/address/${event.data.delegator}`" @click.stop>
						<Text size="12" weight="500" color="primary" mono>
							{{ splitAddress(event.data.delegator) }}
						</Text>
					</NuxtLink>

					<template #content>
						{{ event.data.delegator }}
					</template>
				</Tooltip>

				<Text size="12" weight="500" color="secondary">validator</Text>

				<Tooltip :class="$style.tooltip">
					<NuxtLink :to="`/address/${event.data.validator}`" @click.stop>
						<Text size="12" weight="500" color="primary" mono>
							{{ splitAddress(event.data.validator) }}
						</Text>
					</NuxtLink>

					<template #content>
						{{ event.data.validator }}
					</template>
				</Tooltip>

				<Text size="12" weight="500" color="secondary">Amount:</Text>

				<Text size="12" weight="500" color="primary" mono no-wrap>
					{{ tia(event.data.amount.replace("utia", "")) }} TIA
				</Text>
			</Flex>
			<!-- Event: withdraw_commission -->
			<Flex
				v-else-if="event.type === 'withdraw_commission'"
				align="center"
				gap="4"
				color="secondary"
				:class="$style.text"
			>
				<Text size="12" weight="500" color="secondary">Commission</Text>

				<Text size="12" weight="500" color="primary" mono no-wrap>
					{{ tia(event.data.amount.replace("utia", "")) }} TIA
				</Text>
			</Flex>

			<Text size="12" weight="600" color="tertiary" mono>
				{{ event.type }}
			</Text>
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
		background: var(--green);
		box-shadow: 0 0 6px rgba(10, 222, 112, 80%);

		&.error {
			background: var(--red);
			box-shadow: 0 0 6px var(--red);
		}
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
