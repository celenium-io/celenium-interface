<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"
import Spinner from "@/components/ui/Spinner.vue"

/** Services */
import { space, formatBytes, getNamespaceID } from "@/services/utils"

/** API */
import { fetchTxBlobs, fetchTxBlobsCount } from "@/services/api/tx"
import { fetchBlockBlobs } from "@/services/api/block"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useModalsStore } from "@/store/modals"
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

const props = defineProps({
	hash: {
		type: String,
		default: "",
	},
	block: {
		type: Object,
		required: false,
	},
	height: {
		type: Number,
		default: 0,
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
const total = ref(0)

const page = ref(1)
const pages = computed(() => Math.ceil(total.value / 5))

onMounted(async () => {
	getNamespaces()
	getTotal()
})

/** fetch namespaces based on context (block or tx) */
const fetchNamespaces = async () => {
	const params = {
		limit: 5,
		offset: (page.value - 1) * 5,
		sort: "desc",
	}

	if (props.hash.length) params.hash = props.hash
	if (props.block?.height) params.height = props.block?.height

	return (props.hash.length && (await fetchTxBlobs(params))) || (props.block?.height && (await fetchBlockBlobs(params))) || []
}

const getNamespaces = async () => {
	isRefetching.value = true

	blobs.value = await fetchNamespaces()

	isRefetching.value = false

	if (isBlobsLoading.value) isBlobsLoading.value = false
}

const getTotal = async () => {
	if (props.hash.length) {
		const data = await fetchTxBlobsCount(props.hash)
		total.value = data
	}
	if (props.block?.height > 1) {
		total.value = props.block?.stats.blobs_count
	}
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
	/** normalize the blob */
	cacheStore.selectedBlob = {
		hash: blob.namespace.hash,
		namespace_id: blob.namespace.namespace_id,
		namespace_name: blob.namespace.name,
		commitment: blob.commitment,
		height: blob.height,
		signer: blob.signer,
		size: blob.size,
		tx: blob.tx,
		rollup: blob.rollup,
	}

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
				<Flex align="center" gap="8">
					<Icon name="blob" size="14" color="primary" />
					<Text size="13" weight="600" color="primary">Blobs</Text>
				</Flex>

				<Tooltip side="right">
					<Icon name="info" size="14" color="tertiary" />

					<template #content> Click on an item in the list to see the blob </template>
				</Tooltip>
			</Flex>

			<Flex v-if="pages" align="center" gap="6">
				<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
					<Icon name="arrow-left-stop" size="12" color="primary" />
				</Button>
				<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
					<Icon name="arrow-left" size="12" color="primary" />
				</Button>

				<Button type="secondary" size="mini" disabled>
					<Text size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
				</Button>

				<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
					<Icon name="arrow-right" size="12" color="primary" />
				</Button>
				<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages">
					<Icon name="arrow-right-stop" size="12" color="primary" />
				</Button>
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
							<th><Text size="12" weight="600" color="tertiary"></Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="blob in blobs" @click.stop="handleViewBlob(blob)">
							<td>
								<NuxtLink :to="`/namespace/${blob.namespace.namespace_id}`" @click.stop>
									<Tooltip position="start" delay="500">
										<Flex direction="column" gap="4">
											<Flex align="center" gap="8">
												<Text size="12" weight="600" color="primary" mono class="table_column_alias">
													{{ $getDisplayName('namespaces', blob.namespace.namespace_id) }}
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
								</NuxtLink>
							</td>
							<td>
								<Tooltip position="start" delay="500">
									<Flex align="center" gap="8">
										<AddressBadge :account="blob.signer" />

										<CopyButton :text="blob.signer.hash" />
									</Flex>

									<template #content>
										{{ blob.signer.hash }}
									</template>
								</Tooltip>
							</td>
							<td>
								<Tooltip position="start" delay="500">
									<Flex align="center" gap="8">
										<Text size="13" weight="600" color="primary">
											{{ blob.commitment.slice(0, 4) }}
										</Text>

										<Flex align="center" gap="3">
											<div v-for="dot in 3" class="dot" />
										</Flex>

										<Text size="13" weight="600" color="primary">
											{{
												blob.commitment.slice(
													blob.commitment.length - 4,
													blob.commitment.length,
												)
											}}
										</Text>

										<CopyButton :text="blob.commitment" />
									</Flex>

									<template #content>
										{{ blob.commitment }}
									</template>
								</Tooltip>
							</td>
							<td>
								<Text size="13" weight="600" color="primary">
									{{ formatBytes(blob.size) }}
								</Text>
							</td>
							<td>
								<Text size="13" weight="600" color="primary">{{ blob.namespace.version }}</Text>
							</td>
							<td style="width: 1px">
								<NuxtLink v-if="blob.rollup?.logo" :to="`/rollup/${blob.rollup.slug}`" @click.stop>
									<Tooltip position="start" delay="500">
										<Flex align="center" justify="center" :class="$style.avatar_container">
											<img :src="blob.rollup.logo" :class="$style.avatar_image" />
										</Flex>

										<template #content>
											{{ blob.rollup.name }}
										</template>
									</Tooltip>
								</NuxtLink>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<Flex v-else-if="isBlobsLoading" align="center" justify="center" gap="8" wide :class="$style.empty">
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
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
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

.avatar_container {
	position: relative;
	width: 20px;
	height: 20px;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.empty {
	padding: 16px 0;
}
</style>
