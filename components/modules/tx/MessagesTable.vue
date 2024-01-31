<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { comma, space } from "@/services/utils"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const router = useRouter()

const props = defineProps({
	messages: {
		type: Array,
		required: true,
	},
})

const handleViewRawMessage = (message) => {
	cacheStore.current._target = "message"
	cacheStore.current.message = message
	modalsStore.open("rawData")
}
</script>

<template>
	<div :class="$style.wrapper_tx_messages">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Type</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="message in messages" @click="handleViewRawMessage(message)">
					<td style="width: 1px">
						<Flex align="center">
							<MessageTypeBadge :types="[message.type]" />
						</Flex>
					</td>
					<td>
						<Flex align="center">
							<Text size="13" weight="600" color="primary">
								{{ DateTime.fromISO(message.time).toRelative({ locale: "en", style: "short" }) }}
							</Text>
						</Flex>
					</td>
					<td>
						<Flex align="center">
							<Outline @click.prevent="router.push(`/block/${message.height}`)">
								<Flex align="center" gap="6">
									<Icon name="block" size="14" color="secondary" />

									<Text size="13" weight="600" color="primary" tabular>{{ comma(message.height) }}</Text>
								</Flex>
							</Outline>
						</Flex>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_tx_messages {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;

	& .table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		padding-bottom: 8px;

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

			&:first-child {
				padding-left: 16px;
			}

			& span {
				display: flex;
			}
		}

		& tr td {
			padding: 0;
			padding-right: 24px;
			padding-top: 7px;
			padding-bottom: 7px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
}
</style>
