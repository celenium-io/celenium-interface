<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"
import Spinner from "@/components/ui/Spinner.vue"

/** Components */
import BlobModal from "@/components/modals/BlobModal.vue"

/** Services */
import { formatBytes, getNamespaceID } from "@/services/utils"

/** API */
import { fetchBlockNamespaces, fetchBlockNamespacesCount } from "@/services/api/block"

/** Store */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

const props = defineProps({
	height: {
		type: Number,
	},
	loading: {
		type: Boolean,
	},
})

const router = useRouter()

const isRefetching = ref(false)
const isBlobsLoading = ref(true)
const blobs = ref([])
const totalBlobs = ref(0)

const selectedBlob = ref({})
const showBlobModal = ref(false)

const page = ref(1)
const pages = computed(() => Math.ceil(totalBlobs.value / 5))

onMounted(async () => {
	getNamespaces()

	const { data: count } = await fetchBlockNamespacesCount(props.height)
	totalBlobs.value = count.value
})

const getNamespaces = async () => {
	isRefetching.value = true

	const { data } = await fetchBlockNamespaces({
		height: props.height,
		limit: 5,
		offset: (page.value - 1) * 5,
		sort: "desc",
	})
	blobs.value = data.value

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
	selectedBlob.value = blob
	showBlobModal.value = true
}

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

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
	<BlobModal :show="showBlobModal" :item="selectedBlob" @onClose="showBlobModal = false" />

	<Flex v-if="!isBlobsLoading" direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Text size="14" weight="600" color="primary">Blobs</Text>

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
							<th><Text size="12" weight="600" color="tertiary">Namespace</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Signer</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Share Commitments</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Size</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Version</Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="blob in blobs">
							<td style="width: 1px">
								<Tooltip position="start" delay="500">
									<Outline @click="handleCopy(getNamespaceID(blob.namespace.namespace_id))" class="copyable">
										<Flex align="center" gap="8">
											<Icon name="blob" size="12" color="tertiary" />

											<Text size="13" weight="700" color="secondary" mono>
												{{ getNamespaceID(blob.namespace.namespace_id).slice(0, 4) }}
											</Text>
										</Flex>
									</Outline>

									<template #content>
										{{ getNamespaceID(blob.namespace.namespace_id) }}
									</template>
								</Tooltip>
							</td>
							<td>
								<Tooltip position="start" delay="500">
									<Flex align="center" gap="10">
										<NuxtLink :to="`/address/${blob.data.Signer}`">
											<Flex align="center" gap="6">
												<template v-if="blob.data.Signer.startsWith('celestiavaloper')">
													<Text size="13" weight="600" color="primary"> celestiavaloper </Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" class="dot" />
													</Flex>

													<Text size="13" weight="600" color="primary">
														{{ blob.data.Signer.slice(blob.data.Signer.length - 4, blob.data.Signer.length) }}
													</Text>
												</template>
												<template v-else-if="blob.data.Signer.startsWith('celestiavalcons')">
													<Text size="13" weight="600" color="primary"> celestiavalcons </Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" class="dot" />
													</Flex>

													<Text size="13" weight="600" color="primary">
														{{ blob.data.Signer.slice(blob.data.Signer.length - 4, blob.data.Signer.length) }}
													</Text>
												</template>
												<template v-else>
													<Text size="13" weight="600" color="primary"> celestia </Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" class="dot" />
													</Flex>

													<Text size="13" weight="600" color="primary">
														{{ blob.data.Signer.slice(blob.data.Signer.length - 4, blob.data.Signer.length) }}
													</Text>
												</template>
											</Flex>
										</NuxtLink>

										<Icon
											@click="handleCopy(blob.data.Signer)"
											name="copy"
											size="12"
											color="secondary"
											class="copyable"
										/>
									</Flex>

									<template #content>
										{{ blob.data.Signer }}
									</template>
								</Tooltip>
							</td>
							<td>
								<Tooltip position="start" delay="500">
									<Flex align="center" gap="10">
										<Flex align="center" gap="6">
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
										</Flex>

										<Icon
											@click="handleCopy(blob.data.ShareCommitments[0])"
											name="copy"
											size="12"
											color="secondary"
											class="copyable"
										/>
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
								<Button @click="handleViewBlob(blob)" type="secondary" size="mini">View</Button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<Flex v-else-if="loading" align="center" justify="center" gap="8" wide>
				<Spinner size="14" />
				<Text size="13" weight="500" color="secondary"> Loading blobs </Text>
			</Flex>

			<Flex v-else align="center" justify="center" direction="column" gap="8" wide>
				<Text size="13" weight="600" color="secondary" align="center"> No blobs </Text>
				<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
					This height does not contain blobs
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

	padding: 16px;

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		& tr th {
			text-align: left;
			padding: 0;
			padding-right: 16px;
			padding-bottom: 8px;

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
		}
	}
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}
</style>
