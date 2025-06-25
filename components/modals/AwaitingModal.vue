<script setup>
/**
 * Vendor
 */
import { DateTime } from "luxon"

/**
 * UI
 */
import Button from "@/components/ui/Button.vue"
import Spinner from "@/components/ui/Spinner.vue"
import Modal from "@/components/ui/Modal.vue"

/**
 * API
 */
import { fetchTxByHash } from "@/services/api/tx"

/**
 * Store
 */
import { useAppStore } from "@/store/app.store"
import { useCacheStore } from "@/store/cache.store"
import { useModalsStore } from "@/store/modals.store"
const appStore = useAppStore()
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

const props = defineProps({
	show: Boolean,
})

const emit = defineEmits(["onClose"])

const awaitTx = ref(false)
const isFound = ref(false)
const tx = ref()

const details = computed(() => {
	let detailsRes = []
	switch (cacheStore.tx.type) {
		case "send":
			detailsRes.processing = "Sending..."
			detailsRes.success = "Successfuly sent"
			detailsRes.destination = "Destination Wallet"
			detailsRes.icon = "address"

			return detailsRes

		case "pfb":
			detailsRes.processing = "Submiting Blob..."
			detailsRes.success = "Successfuly submited"
			detailsRes.destination = "Namespace"
			detailsRes.icon = "namespace"

			return detailsRes

		case "staking":
			detailsRes.processing = "Sending..."
			detailsRes.success = "Successfuly delegated"
			detailsRes.destination = "Validator"
			detailsRes.icon = "validator"

			return detailsRes

		default:
			detailsRes.processing = "Processing..."
			detailsRes.success = "Successfuly executed tx"
			detailsRes.destination = "Destination address"

			return detailsRes
	}
})

watch(
	() => props.show,
	() => {
		if (props.show) {
			awaitTx.value = true
		} else {
			awaitTx.value = false
		}
	},
)

watch(
	() => appStore.lastBlock,
	async () => {
		if (!awaitTx.value || tx.value) return

		const { data } = await fetchTxByHash(cacheStore.tx.hash)
		if (data.value) {
			isFound.value = true
			tx.value = data.value
		}
	},
)

const handleClose = () => {
	tx.value = null
	awaitTx.value = false
	isFound.value = false

	modalsStore.closeAll()
}
</script>

<template>
	<Modal :show="show" width="500" disable-trap z-index="1005" :closable="false">
		<Flex direction="column" gap="20">
			<Flex direction="column" align="center" gap="8" wide>
				<Flex v-if="!isFound" align="center" gap="6">
					<Spinner size="12" />
					<Text size="14" weight="600" color="primary">
						{{ details.processing }}
					</Text>
				</Flex>
				<Flex v-else align="center" gap="6">
					<Icon
						:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
						size="12"
						:color="tx.status === 'success' ? 'green' : 'red'"
					/>

					<Text v-if="tx.status === 'success'" size="14" weight="600" color="primary">
						{{ details.success }}
					</Text>
					<Text v-else size="14" weight="600" color="primary"> Failed </Text>
				</Flex>

				<Text size="13" weight="600" color="tertiary">
					{{
						DateTime.fromSeconds(cacheStore.tx.ts / 1_000)
							.setLocale("en")
							.toFormat("ff")
					}}
				</Text>
			</Flex>

			<Flex direction="column" gap="32">
				<Flex direction="column" align="center" gap="16">
					<Flex align="center" gap="12" wide :class="[$style.wallet]">
						<Icon name="address" size="16" color="secondary" />

						<Flex direction="column" gap="6" :class="$style.metadata">
							<Text size="14" weight="600" color="primary"> Your Wallet </Text>

							<Text size="12" weight="500" color="tertiary" :selectable="true"> {{ cacheStore.tx.from }} </Text>
						</Flex>

						<div v-if="!isFound" :class="$style.runner">
							<div :class="$style.line" />
						</div>

						<Flex
							direction="column"
							justify="between"
							:class="[$style.bg, !isFound ? $style.sending : tx.status === 'success' ? $style.success : $style.failed]"
						>
							<Flex v-for="i in 8" align="center" justify="between">
								<div
									v-for="j in 50"
									:class="$style.circle"
									:style="{
										'--start': `${(Math.random() * 10) / 100}`,
										'--end': `${(Math.random() * (90 - 10)) / 100}`,
										'--delay': `${Math.random() * 2}s`,
									}"
								/>
							</Flex>
						</Flex>
					</Flex>

					<Flex align="center" gap="6" :class="$style.arrow_label">
						<Icon name="arrow-right" size="16" color="secondary" />
					</Flex>

					<Flex align="center" gap="12" wide :class="[$style.wallet]">
						<Icon :name="details.icon" size="16" color="secondary" />

						<Flex direction="column" gap="6" :class="$style.metadata">
							<Text size="14" weight="600" color="primary">
								{{ details.destination }}
							</Text>

							<Text size="12" weight="500" color="tertiary" :selectable="true"> {{ cacheStore.tx.to }} </Text>
						</Flex>

						<Flex
							direction="column"
							justify="between"
							:class="[$style.bg, !isFound ? $style.sending : tx.status === 'success' ? $style.success : $style.failed]"
						>
							<Flex v-for="i in 8" align="center" justify="between">
								<div
									v-for="j in 50"
									:class="$style.circle"
									:style="{
										'--start': `${(Math.random() * 10) / 100}`,
										'--end': `${(Math.random() * (90 - 10)) / 100}`,
										'--delay': `${Math.random() * 2}s`,
									}"
								/>
							</Flex>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" gap="16" wide>
					<Flex v-if="['send', 'staking'].includes(cacheStore.tx.type)" align="center" justify="between">
						<Text size="13" weight="500" color="tertiary"> Amount: </Text>

						<Text size="13" weight="600" color="secondary">
							{{ cacheStore.tx.amount }} TIA
							<Text color="tertiary">
								~${{ (cacheStore.tx.amount * parseFloat(appStore.currentPrice.close)).toFixed(2) }}
							</Text>
						</Text>
					</Flex>

					<Flex v-if="cacheStore.tx.type === 'pfb'" align="center" justify="between">
						<Text size="13" weight="500" color="tertiary"> File Type: </Text>

						<Text size="13" weight="600" color="secondary">
							{{ cacheStore.tx.file }}
						</Text>
					</Flex>

					<Flex align="center" justify="between">
						<Text size="13" weight="500" color="tertiary"> From Address: </Text>

						<Flex align="center" gap="6">
							<Text size="13" weight="600" color="secondary">
								celestia
								<Text color="tertiary">...</Text>
								{{ cacheStore.tx.from.slice(-4) }}
							</Text>
							<CopyButton size="10" :text="cacheStore.tx.from" />
						</Flex>
					</Flex>

					<Flex v-if="cacheStore.tx.type === 'send'" align="center" justify="between">
						<Text size="13" weight="500" color="tertiary"> To Address: </Text>

						<Flex align="center" gap="6">
							<Text size="13" weight="600" color="secondary">
								celestia
								<Text color="tertiary">...</Text>
								{{ cacheStore.tx.to.slice(-4) }}
							</Text>
							<CopyButton size="10" :text="cacheStore.tx.to" />
						</Flex>
					</Flex>

					<Flex v-if="cacheStore.tx.type === 'pfb'" align="center" justify="between">
						<Text size="13" weight="500" color="tertiary"> To Namespace: </Text>

						<Flex align="center" gap="6">
							<Text size="13" weight="600" color="secondary">
								{{ cacheStore.tx.to }}
							</Text>
							<CopyButton size="10" :text="cacheStore.tx.to" />
						</Flex>
					</Flex>

					<Flex v-if="cacheStore.tx.type === 'staking'" align="center" justify="between">
						<Text size="13" weight="500" color="tertiary"> Validator: </Text>

						<Flex align="center" gap="6">
							<Text size="13" weight="600" color="secondary">
								celestiavaloper
								<Text color="tertiary">...</Text>
								{{ cacheStore.tx.to.slice(-4) }}
							</Text>
							<CopyButton size="10" :text="cacheStore.tx.to" />
						</Flex>
					</Flex>

					<Flex align="center" justify="between">
						<Text size="13" weight="500" color="tertiary"> Network: </Text>

						<Flex align="center" gap="6">
							<Text size="13" weight="600" color="secondary">
								{{ cacheStore.tx.network.chainName }}
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex v-if="tx?.status === 'failed'" direction="column" gap="8" :class="$style.error_msg">
					<Text size="12" weight="500" color="secondary" mono> Error Message </Text>
					<Text size="12" weight="500" height="120" color="tertiary" mono> {{ tx?.error }}</Text>
				</Flex>

				<Flex direction="column" gap="8">
					<Button @click="handleClose" :link="`/tx/${tx?.hash}`" type="secondary" size="small" wide :disabled="!isFound">
						View Transaction
						<Icon name="arrow-narrow-up-right" size="12" color="primary" />
					</Button>
					<Button @click="handleClose" type="tertiary" size="small" wide>Close</Button>
				</Flex>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.error_msg {
	border-radius: 6px;
	background: var(--op-5);

	padding: 8px;
}

.wallet {
	position: relative;

	border-radius: 12px;
	background: rgba(0, 0, 0, 15%);
	overflow: hidden;

	padding: 16px;

	.metadata {
		z-index: 1;
	}

	& svg {
		z-index: 1;
		box-sizing: content-box;

		background: var(--card-background);
		border-radius: 10px;

		padding: 12px;
	}
}

.runner {
	position: absolute;
	bottom: 2px;
	left: 0;

	width: 100px;
	height: 1px;

	background: linear-gradient(90deg, rgba(7, 106, 205, 0%), rgba(7, 106, 205, 100%), rgba(7, 106, 205, 0%));

	animation: runner 4s ease infinite;

	& .line {
		width: 100px;
		height: 1px;

		background: linear-gradient(90deg, rgba(7, 106, 205, 0%), rgba(7, 106, 205, 100%), rgba(7, 106, 205, 0%));
		filter: blur(5px);
	}
}

@keyframes runner {
	0% {
		transform: translateX(-100px);
	}

	50% {
		transform: translateX(500px);
	}

	100% {
		transform: translateX(-100px);
	}
}

.bg {
	position: absolute;

	top: 8px;
	bottom: 8px;
	left: 8px;
	right: 8px;

	& .circle {
		width: 2px;
		height: 2px;

		border-radius: 50%;
		opacity: 0;

		animation: blink 3s ease infinite;
		animation-delay: var(--delay);
	}

	&.sending {
		& .circle {
			background: var(--blue);
		}
	}

	&.awaiting {
		& .circle {
			background: var(--op-40);
		}
	}

	&.success {
		& .circle {
			background: var(--green);
		}
	}

	&.failed {
		& .circle {
			background: var(--red);
		}
	}
}

@keyframes blink {
	0% {
		opacity: var(--start);
	}

	50% {
		opacity: var(--end);
	}

	100% {
		opacity: var(--start);
	}
}

.arrow_label {
	background: var(--op-10);
	border-radius: 50px;

	padding: 4px;

	& svg {
		transform: rotate(90deg);
	}
}

.divider {
	width: 100%;
	height: 2px;

	background: var(--op-5);
}
</style>
