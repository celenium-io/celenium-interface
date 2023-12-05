<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"
import Spinner from "@/components/ui/Spinner.vue"

/** Services */
import { space, formatBytes, getNamespaceID } from "@/services/utils"

/** API */
import { fetchBlockNamespaces, fetchBlockNamespacesCount } from "@/services/api/block"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useModalsStore } from "@/store/modals"
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

const props = defineProps({
	height: {
		type: Number,
	},
	loading: {
		type: Boolean,
	},
	description: {
		type: String,
	},
})

const router = useRouter()

const isRefetching = ref(false)
const isBlobsLoading = ref(true)
const blobs = ref([])
const totalBlobs = ref(0)

const page = ref(1)
const pages = computed(() => Math.ceil(totalBlobs.value / 5))

onMounted(async () => {
	getNamespaces()

	const { data: count } = await fetchBlockNamespacesCount(props.height)
	totalBlobs.value = count.value
})

const getNamespaces = async () => {
	isRefetching.value = true

	const data = await fetchBlockNamespaces({
		height: props.height,
		limit: 5,
		offset: (page.value - 1) * 5,
		sort: "desc",
	})
	blobs.value = data

	isRefetching.value = false

	if (isBlobsLoading.value) isBlobsLoading.value = false
}

/** Refetch transactions */
watch(
	() => page.value,
	async () => {
		getNamespaces()

		router.replace({ query: { page: page.value } })
	},
)

const handleViewBlob = (blob) => {
	cacheStore.selectedBlob = blob
	modalsStore.open("blob")
}

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}
</script>

<template>
	<Flex v-if="!isBlobsLoading" direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Text size="14" weight="600" color="primary">Blobs</Text>

				<Tooltip side="right">
					<Icon name="info" size="14" color="tertiary" />

					<template #content> Click on an item in the list to see the blob </template>
				</Tooltip>
			</Flex>

			<Flex v-if="pages" align="center" gap="6">
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

		<Flex wide :class="[$style.table, isRefetching && $style.disabled]">
			<div v-if="blobs.length" :class="$style.table_scroller">
				<table>
					<thead>
						<tr>
							<th><Text size="12" weight="600" color="tertiary">Namespace </Text></th>
							<th><Text size="12" weight="600" color="tertiary">Signer</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Share Commitments</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Size</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Version</Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="blob in blobs" @click.stop="handleViewBlob(blob)">
							<td>
								<Tooltip position="start" delay="500">
									<Flex @click.stop="router.push(`/namespace/${blob.namespace.namespace_id}`)" direction="column" gap="4">
										<Flex v-if="getNamespaceID(blob.namespace.namespace_id).length > 8" align="center" gap="8">
											<Text size="12" weight="600" color="primary" mono>
												{{ getNamespaceID(blob.namespace.namespace_id).slice(0, 4) }}
											</Text>

											<Flex align="center" gap="3">
												<div v-for="dot in 3" class="dot" />
											</Flex>

											<Text size="12" weight="600" color="primary" mono>
												{{ getNamespaceID(blob.namespace.namespace_id).slice(-4) }}
											</Text>

											<CopyButton :text="getNamespaceID(blob.namespace.namespace_id)" />
										</Flex>

										<Flex v-else align="center" gap="8">
											<Text size="12" weight="600" color="primary" mono>
												{{ space(getNamespaceID(blob.namespace.namespace_id)) }}
											</Text>

											<CopyButton :text="getNamespaceID(blob.namespace.namespace_id)" />
										</Flex>

										<Text
											v-if="blob.namespace.name !== getNamespaceID(blob.namespace.namespace_id)"
											size="12"
											weight="500"
											color="tertiary"
										>
											{{ blob.namespace.name }}
										</Text>
									</Flex>

									<template #content>
										{{ space(getNamespaceID(blob.namespace.namespace_id)) }}
									</template>
								</Tooltip>
							</td>
							<td>
								<Tooltip position="start" delay="500">
									<Flex align="center" gap="8">
										<AddressBadge :hash="blob.data.Signer" />

										<CopyButton :text="blob.data.Signer" />
									</Flex>

									<template #content>
										{{ blob.data.Signer }}
									</template>
								</Tooltip>
							</td>
							<td>
								<Tooltip position="start" delay="500">
									<Flex align="center" gap="8">
										<Text size="13" weight="600" color="primary">
											{{ blob.data.ShareCommitments[0].slice(0, 4) }}
										</Text>

										<Flex align="center" gap="3">
											<div v-for="dot in 3" class="dot" />
										</Flex>

										<Text size="13" weight="600" color="primary">
											{{
												blob.data.ShareCommitments[0].slice(
													blob.data.ShareCommitments[0].length - 4,
													blob.data.ShareCommitments[0].length,
												)
											}}
										</Text>

										<CopyButton :text="blob.data.ShareCommitments[0]" />
									</Flex>

									<template #content>
										{{ blob.data.ShareCommitments[0] }}
									</template>
								</Tooltip>
							</td>
							<td>
								<Text size="13" weight="600" color="primary">
									{{ formatBytes(blob.data.BlobSizes[0]) }}
								</Text>
							</td>
							<td>
								<Text size="13" weight="600" color="primary">{{ blob.namespace.version }}</Text>
							</td>
							<td style="width: 1px">
								<Icon name="arrow-narrow-up-right" size="14" color="tertiary" />
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<Flex v-else-if="loading" align="center" justify="center" gap="8" wide :class="$style.empty">
				<Spinner size="14" />
				<Text size="13" weight="500" color="secondary"> Loading blobs </Text>
			</Flex>

			<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
				<Text size="13" weight="600" color="secondary" align="center"> No blobs </Text>
				<Text size="12" weight="500" height="160" color="tertiary" align="center">
					{{ description }}
				</Text>
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

.table_scroller {
	width: 100%;

	overflow-x: auto;
}

.table {
	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		padding-bottom: 12px;

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
			padding-top: 8px;
			padding-bottom: 8px;

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

.empty {
	padding: 16px 0;
}
</style>
