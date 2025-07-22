<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** API */
import { fetchIbcClients } from "@/services/api/ibc"

/** Services */
import { comma } from "@/services/utils"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

/** Store */
import { useModalsStore } from "@/store/modals.store"
import { useCacheStore } from "@/store/cache.store"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const props = defineProps({
	chain: {
		type: Object,
		default: {},
	},
})

const clients = ref([])
const isLoading = ref(true)

/** Pagination */
const page = ref(1)
const handlePrevPage = () => {
	if (page.value === 1) return
	page.value -= 1
}

const isNextPageDisabled = computed(() => {
	return !clients.value.length || clients.value.length !== 10
})
const handleNextPage = () => {
	if (isNextPageDisabled.value) return
	page.value += 1
}

const getClients = async () => {
	isLoading.value = true

	const { data } = await useAsyncData(`ibc-clients-${props.chain.chain}-${page.value}`, () =>
		fetchIbcClients({
			chain_id: props.chain.chain,
			offset: (page.value - 1) * 10,
			limit: 10,
		}),
	)
	clients.value = data.value
	clients.value.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

	isLoading.value = false
}

await getClients()

/** Refetch clients */
watch(
	() => page.value,
	async () => {
		const data = await fetchIbcClients({
			chain_id: props.chain.chain,
			offset: (page.value - 1) * 10,
			limit: 10,
		})
		clients.value = data
		clients.value.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
	},
)

const handleOpenClientModal = (client) => {
	cacheStore.current.client = client
	modalsStore.open("ibcClient")
}
</script>

<template>
	<Flex wide direction="column" :class="[$style.wrapper, isLoading && $style.disabled]">
		<Flex v-if="clients.length" :class="$style.scroller">
			<table>
				<thead>
					<tr>
						<th><Text size="12" weight="600" color="tertiary">Name</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Updated at</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Created at</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Created by</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Type</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Connections</Text></th>
					</tr>
				</thead>

				<tbody>
					<tr v-for="client in clients" @click="handleOpenClientModal(client)">
						<td>
							<Flex align="center" gap="8">
								<Text size="13" weight="600" color="primary" mono>
									{{ client.id }}
								</Text>
							</Flex>
						</td>
						<td>
							<Flex justify="center" direction="column" gap="4">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(client.updated_at).toRelative({ locale: "en", style: "short" }) }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ DateTime.fromISO(client.updated_at).setLocale("en").toFormat("LLL d, t") }}
								</Text>
							</Flex>
						</td>
						<td>
							<Flex justify="center" direction="column" gap="4">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(client.created_at).toRelative({ locale: "en", style: "short" }) }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ DateTime.fromISO(client.created_at).setLocale("en").toFormat("LLL d, t") }}
								</Text>
							</Flex>
						</td>
						<td>
							<Flex align="center" gap="6">
								<Text size="13" weight="600" color="primary" mono> celestia </Text>
								<Flex align="center" gap="3">
									<div v-for="dot in 3" class="dot" />
								</Flex>
								<Text size="13" weight="600" color="primary" mono>
									{{ client.creator.hash.slice(-4) }}
								</Text>
							</Flex>
						</td>
						<td>
							<Text size="13" weight="600" color="primary">
								{{ client.type }}
							</Text>
						</td>
						<td>
							<Text size="13" weight="600" color="primary">
								{{ client.connection_count }}
							</Text>
						</td>
					</tr>
				</tbody>
			</table>
		</Flex>

		<TablePlaceholderView
			v-else
			title="There's no clients"
			description="Perhaps we haven't found them yet"
			icon="address"
			subIcon="search"
			:descriptionWidth="260"
			style="height: 100%"
		/>

		<!-- Pagination -->
		<Flex align="center" gap="6" :class="$style.pagination">
			<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
				<Icon name="arrow-left-stop" size="12" color="primary" />
			</Button>
			<Button type="secondary" @click="handlePrevPage" size="mini" :disabled="page === 1">
				<Icon name="arrow-left" size="12" color="primary" />
			</Button>

			<Button type="secondary" size="mini" disabled>
				<Text size="12" weight="600" color="primary"> Page {{ comma(page) }} </Text>
			</Button>

			<Button @click="handleNextPage" type="secondary" size="mini" :disabled="isNextPageDisabled">
				<Icon name="arrow-right" size="12" color="primary" />
			</Button>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 100%;

	border-radius: 4px 4px 8px 8px;
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
			padding-top: 12px;
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
			padding-top: 8px;
			padding-bottom: 8px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
}

.scroller {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.pagination {
	padding: 8px 16px 16px 16px;
}

@media (max-width: 800px) {
	.table {
		border-radius: 4px 4px 8px 8px;
	}
}
</style>
