<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { comma } from "@/services/utils"

/** Store */
import { useModalsStore } from "@/store/modals.store"
import { useCacheStore } from "@/store/cache.store"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const router = useRouter()

const props = defineProps({
	messages: {
		type: Array,
		required: true,
	},
})

function viewRawMessage(message) {
    cacheStore.current._target = "message"
	cacheStore.current.message = message
	modalsStore.open("rawData")
}
</script>

<template>
	<div :class="$style.wrapper_messages">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Type</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="message in messages">
					<td style="width: 1px">
                        <Flex @click="viewRawMessage(message)" align="center" :class="$style.td_wrapper">
                            <MessageTypeBadge :types="[message.type]" />
                        </Flex>
					</td>
					<td>
                        <Flex @click="viewRawMessage(message)" align="center" :class="$style.td_wrapper">
                            <Text size="13" weight="600" color="primary">
                                {{ DateTime.fromISO(message.time).toRelative({ locale: "en", style: "short" }) }}
                            </Text>
                        </Flex>
					</td>
					<td>
                        <Flex @click="viewRawMessage(message)" align="center" :class="$style.td_wrapper">
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
.wrapper_messages {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.table {
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

		white-space: nowrap;

		&:first-child {
			padding-left: 16px;
		}

        & .td_wrapper {
			display: flex;

			min-height: 40px;

			padding-right: 24px;
        }
	}
}
</style>
