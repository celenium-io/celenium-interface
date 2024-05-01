<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"
import Spinner from "@/components/ui/Spinner.vue"

/** Services */
import { capitilize, comma, shortHex } from "@/services/utils"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const commitment = ref()

watch(
	() => props.show,
	() => {
		if (props.show) {
			commitment.value = cacheStore.current.commitment
		}
	},
)

</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="450" disable-trap>
		<Flex direction="column" gap="16">
			<Text size="14" weight="600" color="primary">Commitment Info</Text>

			<Flex direction="column" align="center" gap="12">
				<Flex align="center" justify="between" wide :class="$style.metadata">
					<Text size="12" weight="500" color="tertiary">Time:</Text>

					<Flex align="center" gap="8" :class="$style.value_wrapper">
						<Text size="13" weight="600" color="primary" :class="$style.value">
							{{ DateTime.fromISO(commitment.time).setLocale("en").toFormat("LLL, d, yyyy, H:mm:s a") }}
						</Text>
					</Flex>
				</Flex>

				<Flex align="center" justify="between" wide :class="$style.metadata">
					<Text size="12" weight="500" color="tertiary">Hash:</Text>

					<Flex align="center" gap="8" :class="$style.value_wrapper">
						<CopyButton :text="commitment.commitment" />

						<Text size="13" weight="600" color="primary" :class="$style.value">
							{{ shortHex(commitment.commitment) }}
						</Text>
					</Flex>
				</Flex>

				<Flex align="center" justify="between" wide :class="$style.metadata">
					<Text size="12" weight="500" color="tertiary">Nonce:</Text>

					<Flex align="center" gap="8" :class="$style.value_wrapper">
						<CopyButton :text="commitment.proof_nonce" />

						<Text size="13" weight="600" color="primary" :class="$style.value">
							{{ commitment.proof_nonce }}
						</Text>
					</Flex>
				</Flex>

				<Flex align="center" justify="between" wide :class="$style.metadata">
					<Text size="12" weight="500" color="tertiary">Block Range:</Text>

					<Flex align="center" gap="8" :class="$style.value_wrapper">
						<Text size="13" weight="600" color="primary" :class="$style.value">
							{{ comma(commitment.celestia_start_height) }} — {{ comma(commitment.celestia_end_height) }}
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<div :class="$style.divider" />

			<Flex align="center">
				<Text size="12" weight="600" color="secondary"> {{ capitilize(commitment.contract.network) }} </Text>
			</Flex> 

			<Flex direction="column" align="center" gap="12">
				<Flex align="center" justify="between" wide :class="$style.metadata">
					<Text size="12" weight="500" color="tertiary">Block:</Text>

					<a :href="`${commitment.contract.l1_explorer}block/${commitment.l1_info.height}`" target="_blank">
						<Flex align="center" gap="8" :class="$style.value_wrapper">
							<Flex align="center" gap="6">
								<Text size="13" weight="600" color="primary" :class="$style.value">
									{{ comma(commitment.l1_info.height) }}
								</Text>

								<Icon name="arrow-narrow-up-right" size="12" color="secondary" />
							</Flex>
						</Flex>
					</a>
				</Flex>

				<Flex align="center" justify="between" wide :class="$style.metadata">
					<Text size="12" weight="500" color="tertiary">Tx:</Text>

					<a :href="`${commitment.contract.l1_explorer}tx/0x${commitment.l1_info.tx_hash}`" target="_blank">
						<Flex align="center" gap="8" :class="$style.value_wrapper">
							<Flex align="center" gap="6">
								<CopyButton :text="commitment.l1_info.tx_hash" />

								<Text size="13" weight="600" color="primary" :class="$style.value">
									{{ shortHex(commitment.l1_info.tx_hash) }}
								</Text>

								<Icon name="arrow-narrow-up-right" size="12" color="secondary" />
							</Flex>
						</Flex>
					</a>
				</Flex>

				<Flex align="center" justify="between" wide :class="$style.metadata">
					<Text size="12" weight="500" color="tertiary">Contract:</Text>

					<a :href="`${commitment.contract.l1_explorer}address/${commitment.contract.hash}`" target="_blank">
						<Flex align="center" gap="8" :class="$style.value_wrapper">
							<Flex align="center" gap="6">
								<CopyButton :text="commitment.contract.hash" />

								<Text size="13" weight="600" color="primary" :class="$style.value">
									{{ shortHex(commitment.contract.hash) }}
								</Text>

								<Icon name="arrow-narrow-up-right" size="12" color="secondary" />
							</Flex>
						</Flex>
					</a>
				</Flex>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.data {
	max-height: 200px;
	min-height: 200px;

	user-select: text;
	border-radius: 6px;
	background: rgba(0, 0, 0, 15%);
	box-shadow: inset 0 0 0 1px var(--op-10);
	overflow-x: hidden;

	padding: 16px;

	& .field {
		min-width: 100%;
		width: 0;
		max-height: 200px;

		display: -webkit-box;
		-webkit-box-orient: vertical;
		word-wrap: break-word;

		text-overflow: ellipsis;
		overflow: hidden;
		-webkit-line-clamp: 8;

		&.full {
			overflow: initial;
		}
	}
}

.value_wrapper {
	max-width: 100%;

	& a {
		text-overflow: ellipsis;
		overflow: hidden;
	}
}

.value {
	text-overflow: ellipsis;
	overflow: hidden;
	max-width: 100%;
}

.badges {
}

.badge {
	border-radius: 6px;
	background: var(--op-5);

	padding: 8px;

	transition: all 0.2s ease;

	&.selectable:hover {
		cursor: pointer;
		background: var(--op-10);
	}
}

.buttons {
	border-top: 1px solid var(--op-5);

	padding-top: 16px;
}

.preview {
	& img {
		width: 100%;
	}
}

.load_btn {
	cursor: pointer;

	transition: all 0.2s ease;

	&:hover {
		color: var(--txt-primary);
	}
}

.divider {
	width: fill-available;
	height: 2px;

	background: var(--op-5);

	margin: 0 -16px;
}


@media (max-width: 550px) {
	.metadata {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}

	.badges {
		flex-direction: column;
	}

	.badge {
		width: 100%;
	}
}

@media (max-width: 400px) {
	.buttons {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
