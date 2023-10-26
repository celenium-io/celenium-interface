import { getNamespaceID } from '~/services/utils';
<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { tia, comma, space, formatBytes, getNamespaceID } from "@/services/utils"

/** API */
import { fetchNamespaceMessagesById } from "@/services/api/namespace"

/** Store */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

const router = useRouter()

const props = defineProps({
	namespace: {
		type: Object,
		required: true,
	},
})

const tabs = ref(["Messages"])
const activeTab = ref(tabs.value[0])

const isRefetching = ref(false)
const messages = ref([])

const page = ref(1)
const pages = computed(() => Math.ceil(props.namespace.pfb_count / 5))
const handleNext = () => {
	if (page.value === pages.value) return
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

const getMessages = async () => {
	isRefetching.value = true

	const { data } = await fetchNamespaceMessagesById({
		id: props.namespace.namespace_id,
		version: props.namespace.version,
		offset: (page.value - 1) * 5,
		limit: 5,
	})

	if (data.value?.length) {
		messages.value = data.value
	}

	isRefetching.value = false
}
await getMessages()

/** Refetch messages */
watch(
	() => page.value,
	() => getMessages(),
)

const handleCopy = (target) => {
	window.navigator.clipboard.writeText(target)

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully copied to clipboard",
			autoDestroy: true,
		},
	})
}
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Text size="14" weight="600" color="primary">Namespace Overview</Text>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Namespace ID</Text>

						<Flex align="center" gap="10">
							<Text size="13" weight="600" color="primary">{{ getNamespaceID(namespace.namespace_id) }} </Text>

							<Icon
								@click="handleCopy(getNamespaceID(namespace.namespace_id))"
								name="copy"
								size="12"
								color="secondary"
								class="copyable"
							/>
						</Flex>
					</Flex>

					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Size</Text>

						<Text size="13" weight="600" color="primary">{{ formatBytes(namespace.size) }} </Text>
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Pay For Blobs</Text>
							<Text size="12" weight="600" color="secondary"> {{ comma(namespace.pfb_count) }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Version</Text>
							<Text size="12" weight="600" color="secondary"> {{ namespace.version }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="tertiary"> Reserved</Text>
							<Text size="12" weight="600" color="secondary" :style="{ textTransform: 'capitalize' }">
								{{ namespace.reserved }}
							</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="4" wide :class="$style.txs_wrapper">
				<Flex align="center" justify="between" :class="$style.tabs_wrapper">
					<Flex gap="4" :class="$style.tabs">
						<Flex
							@click="activeTab = tab"
							v-for="tab in tabs"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === tab && $style.active]"
						>
							<Text size="13" weight="600">{{ tab }}</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" justify="center" gap="16" :class="[$style.table, isRefetching && $style.disabled]">
					<div v-if="messages.length" :class="$style.table_scroller">
						<table>
							<thead>
								<tr>
									<th><Text size="12" weight="600" color="tertiary">Transaction</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Type</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
								</tr>
							</thead>

							<tbody>
								<tr v-for="message in messages" @click="router.push(`/tx/${message.tx.hash}`)">
									<td style="width: 1px">
										<Tooltip position="start" delay="500">
											<Flex @click.stop="handleCopy(message.tx.hash)" class="copyable" align="center" gap="8">
												<Icon
													:name="message.tx.status === 'success' ? 'tx_success' : 'tx_error'"
													size="14"
													color="secondary"
												/>

												<Text size="13" weight="600" color="primary">{{
													message.tx.hash.slice(0, 4).toUpperCase()
												}}</Text>

												<Flex align="center" gap="3">
													<div v-for="dot in 3" class="dot" />
												</Flex>

												<Text size="13" weight="600" color="primary">{{
													message.tx.hash.slice(message.tx.hash.length - 4, message.tx.hash.length).toUpperCase()
												}}</Text>
											</Flex>

											<template #content>
												{{ space(message.tx.hash).toUpperCase() }}
											</template>
										</Tooltip>
									</td>
									<td style="width: 1px">
										<MessageTypeBadge :types="[message.type]" />
									</td>
									<td>
										<Text size="13" weight="600" color="primary">
											{{ DateTime.fromISO(message.time).toRelative({ locale: "en", style: "short" }) }}
										</Text>
									</td>
									<td>
										<NuxtLink @click.stop :to="`/block/${message.height}`">
											<Outline>
												<Flex align="center" gap="6">
													<Icon name="block" size="14" color="secondary" />

													<Text size="13" weight="600" color="primary">{{ comma(message.height) }}</Text>
												</Flex>
											</Outline>
										</NuxtLink>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
						<Text size="13" weight="600" color="secondary" align="center"> No messages </Text>
						<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
							This namespace does not contain any messages
						</Text>
					</Flex>

					<!-- Pagination -->
					<Flex v-if="messages.length && pages > 1" align="center" gap="6" :class="$style.pagination">
						<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1"> First </Button>
						<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
							<Icon name="arrow-narrow-left" size="12" color="primary" />
						</Button>

						<Button type="secondary" size="mini" disabled>
							<Text size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
						</Button>

						<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
							<Icon name="arrow-narrow-right" size="12" color="primary" />
						</Button>
						<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages"> Last </Button>
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
	border-bottom: 2px solid transparent;

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
	border-bottom: 2px solid var(--op-10);

	& span {
		color: var(--txt-primary);
	}
}

.table_scroller {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.table {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

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
			padding-top: 6px;
			padding-bottom: 6px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

.empty {
	padding-top: 16px;
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
