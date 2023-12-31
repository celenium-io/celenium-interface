import { getNamespaceID } from '~/services/utils';
<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { comma, space, formatBytes, getNamespaceID } from "@/services/utils"

/** API */
import { fetchNamespaceMessagesById } from "@/services/api/namespace"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

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
const pages = computed(() => Math.ceil(props.namespace.pfb_count / 10))
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
		offset: (page.value - 1) * 10,
		limit: 10,
	})

	if (data.value?.length) {
		messages.value = data.value
		cacheStore.current.messages = messages.value
	}

	isRefetching.value = false
}
await getMessages()

/** Refetch messages */
watch(
	() => page.value,
	() => getMessages(),
)

const handleViewRawNamespace = () => {
	cacheStore.current._target = "namespace"
	modalsStore.open("rawData")
}

const handleViewRawMessages = () => {
	cacheStore.current._target = "messages"
	modalsStore.open("rawData")
}
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="folder" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Namespace</Text>
			</Flex>

			<Dropdown>
				<Button type="tertiary" size="mini">
					<Icon name="dots" size="16" color="secondary" />
				</Button>

				<template #popup>
					<DropdownItem @click="handleViewRawNamespace"> View Raw Namespace </DropdownItem>
					<DropdownItem @click="handleViewRawMessages"> View Raw Messages </DropdownItem>
				</template>
			</Dropdown>
		</Flex>

		<Flex gap="4" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Namespace ID</Text>

						<Flex align="center" gap="10">
							<Text size="13" weight="600" color="primary">{{ space(getNamespaceID(namespace.namespace_id)) }} </Text>

							<CopyButton :text="getNamespaceID(namespace.namespace_id)" />
						</Flex>
					</Flex>

					<Flex
						v-if="getNamespaceID(namespace.namespace_id) !== namespace.name"
						direction="column"
						gap="8"
						:class="$style.key_value"
					>
						<Text size="12" weight="600" color="secondary">Alias</Text>

						<Text size="13" weight="600" color="primary">
							{{ namespace.name }}
						</Text>
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

				<Flex direction="column" justify="center" gap="8" :class="[$style.table, isRefetching && $style.disabled]">
					<div v-if="messages.length" :class="$style.table_scroller">
						<table>
							<thead>
								<tr>
									<th><Text size="12" weight="600" color="tertiary">Hash</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Type</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
								</tr>
							</thead>

							<tbody>
								<tr v-for="message in messages">
									<td style="width: 1px">
										<NuxtLink :to="`/tx/${message.tx.hash}`">
											<Tooltip position="start" delay="500">
												<Flex align="center" gap="8">
													<Icon
														:name="message.tx.status === 'success' ? 'check-circle' : 'close-circle'"
														size="14"
														:color="message.tx.status === 'success' ? 'green' : 'red'"
													/>

													<Text size="13" weight="600" color="primary" mono>{{
														message.tx.hash.slice(0, 4).toUpperCase()
													}}</Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" class="dot" />
													</Flex>

													<Text size="13" weight="600" color="primary" mono>{{
														message.tx.hash
															.slice(message.tx.hash.length - 4, message.tx.hash.length)
															.toUpperCase()
													}}</Text>

													<CopyButton :text="message.tx.hash" />
												</Flex>

												<template #content>
													<Flex direction="column" gap="6">
														<Flex align="center" gap="4">
															<Icon
																:name="message.tx.status === 'success' ? 'check-circle' : 'close-circle'"
																size="14"
																:color="message.tx.status === 'success' ? 'green' : 'red'"
															/>
															<Text size="13" weight="600" color="primary">
																{{ message.tx.status === "success" ? "Successful" : "Failed" }} Transaction
															</Text>
														</Flex>

														{{ space(message.tx.hash).toUpperCase() }}
													</Flex>
												</template>
											</Tooltip>
										</NuxtLink>
									</td>
									<td style="width: 1px">
										<NuxtLink :to="`/tx/${message.tx.hash}`">
											<Flex align="center">
												<MessageTypeBadge :types="[message.type]" />
											</Flex>
										</NuxtLink>
									</td>
									<td>
										<NuxtLink :to="`/tx/${message.tx.hash}`">
											<Flex align="center">
												<Text size="13" weight="600" color="primary">
													{{ DateTime.fromISO(message.time).toRelative({ locale: "en", style: "short" }) }}
												</Text>
											</Flex>
										</NuxtLink>
									</td>
									<td>
										<NuxtLink :to="`/tx/${message.tx.hash}`">
											<Flex align="center">
												<Outline @click.prevent="router.push(`/block/${message.height}`)">
													<Flex align="center" gap="6">
														<Icon name="block" size="14" color="secondary" />

														<Text size="13" weight="600" color="primary" tabular>{{
															comma(message.height)
														}}</Text>
													</Flex>
												</Outline>
											</Flex>
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
							<Text size="12" weight="600" color="primary"> {{ comma(page) }} of {{ comma(pages) }} </Text>
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

			& > a {
				display: flex;

				min-height: 40px;

				padding-right: 24px;
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
