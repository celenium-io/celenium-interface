<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma, tia } from "@/services/utils"
import Tooltip from "~/components/ui/Tooltip.vue"

/** API */
import { fetchTxEvents } from "@/services/api/tx"

const EventIconMapping = {
	message: "message",
	coin_received: "coins_down",
	coin_spent: "coins_up",
	transfer: "arrow-circle-right-up",
	withdraw_rewards: "coins",
	withdraw_commission: "tag",
	tx: "zap",
}

const props = defineProps({
	tx: {
		type: Object,
		required: true,
	},
})

const events = ref([])

const { data: rawEvents } = await fetchTxEvents(props.tx.hash)
events.value = rawEvents.value.sort((a, b) => a.position - b.position)
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Text size="14" weight="600" color="primary">Transaction Overview</Text>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex align="center" gap="40">
						<Flex direction="column" gap="10" :class="$style.key_value">
							<Text size="12" weight="600" color="secondary">Status</Text>

							<Flex align="center" gap="6">
								<Icon name="zap" size="12" :color="tx.status === 'success' ? 'green' : 'error'" />
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

					<Tooltip position="start" textAlign="left">
						<Flex direction="column" gap="10" :class="$style.key_value">
							<Text size="12" weight="600" color="secondary">Type</Text>

							<Flex align="center" gap="6">
								<Text size="13" weight="600" color="primary">
									{{ tx.message_types[0].replace("Msg", "") }}
								</Text>

								<Text
									v-if="tx.message_types.length > 1"
									size="11"
									height="110"
									weight="600"
									color="primary"
									:class="$style.badge"
								>
									+{{ tx.message_types.length - 1 }}
								</Text>
							</Flex>
						</Flex>

						<template #content>
							<Flex direction="column" gap="8">
								<Text v-for="type in tx.message_types" color="primary">
									{{ type.replace("Msg", "") }}
								</Text>
							</Flex>
						</template>
					</Tooltip>

					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Hash</Text>
						<BadgeValue :text="tx.hash" />
					</Flex>

					<Flex direction="column" gap="10">
						<Text size="12" weight="600" color="secondary">Gas Used</Text>

						<div :class="$style.gas_bar">
							<div :style="{ width: `${(tx.gas_used * 100) / tx.gas_wanted}%` }" :class="$style.gas_used" />
						</div>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="secondary">{{ ((tx.gas_used * 100) / tx.gas_wanted).toFixed(2) }}%</Text>
							<Text size="12" weight="600" color="tertiary">{{ comma(tx.gas_used) }} / {{ comma(tx.gas_wanted) }}</Text>
						</Flex>
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

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
							<Text size="12" weight="600" color="secondary" no-wrap> {{ tia(tx.fee) }} TIA</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" wide :class="$style.events_wrapper">
				<Text size="13" weight="600" color="primary"> Events </Text>

				<Flex direction="column">
					<Flex align="center" gap="8" :class="$style.message_types">
						<Icon name="message" size="14" color="secondary" />
						<Text size="12" weight="600" color="primary">{{ tx.message_types.join(", ") }}</Text>
					</Flex>

					<Flex v-for="(event, idx) in events" align="center" gap="12" :class="$style.event">
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
									<Text size="12" weight="500" color="primary" mono>
										{{ event.data.spender.slice(event.data.spender.length - 4, event.data.spender.length) }}
									</Text>

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
									<Text size="12" weight="500" color="primary" mono>
										{{ event.data.receiver.slice(event.data.receiver.length - 4, event.data.receiver.length) }}
									</Text>

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
									<Text size="12" weight="500" color="primary" mono>
										{{ event.data.validator.slice(event.data.validator.length - 4, event.data.validator.length) }}
									</Text>

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
									<Text size="12" weight="500" color="primary" mono>
										{{ event.data.sender.slice(event.data.sender.length - 4, event.data.sender.length) }}
									</Text>

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
									<Text size="12" weight="500" color="primary" mono>
										{{ event.data.recipient.slice(event.data.recipient.length - 4, event.data.recipient.length) }}
									</Text>

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
									<Text size="12" weight="500" color="secondary">Acc Seq</Text>

									<Tooltip :class="$style.tooltip">
										<Text size="12" weight="500" color="primary" mono>
											{{ event.data.acc_seq.slice(event.data.acc_seq.length - 4, event.data.acc_seq.length) }}
										</Text>

										<template #content>
											{{ event.data.acc_seq }}
										</template>
									</Tooltip>
								</template>
								<!-- fee -->
								<template v-if="event.data.fee">
									<Text size="12" weight="500" color="secondary">Address</Text>

									<Tooltip :class="$style.tooltip">
										<Text size="12" weight="500" color="primary" mono>
											{{ event.data.fee_payer.slice(event.data.fee_payer.length - 4, event.data.fee_payer.length) }}
										</Text>

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
										<Text size="12" weight="500" color="primary" mono>
											{{ event.data.sender.slice(event.data.sender.length - 4, event.data.sender.length) }}
										</Text>

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
									<Text size="12" weight="500" color="primary" mono>
										{{ event.data.delegator.slice(event.data.delegator.length - 4, event.data.delegator.length) }}
									</Text>

									<template #content>
										{{ event.data.delegator }}
									</template>
								</Tooltip>

								<Text size="12" weight="500" color="secondary">validator</Text>

								<Tooltip :class="$style.tooltip">
									<Text size="12" weight="500" color="primary" mono>
										{{ event.data.validator.slice(event.data.validator.length - 4, event.data.validator.length) }}
									</Text>

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

							<Text size="11" weight="600" color="support" mono>
								{{ event.type }}
							</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.header {
	height: 46px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 16px;
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
	background: var(--op-5);

	& .gas_used {
		height: 6px;

		border-radius: 50px;
		background: var(--neutral-green);
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

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);

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
</style>
