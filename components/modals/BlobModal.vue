<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"

/** Services */
import { space, formatBytes, getNamespaceID, strToHex } from "@/services/utils"

/** API */
import { fetchBlobByMetadata } from "@/services/api/namespace"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const blob = ref({})
const notFound = ref(false)

const isDecode = ref(false)
const isViewAll = ref(false)

const rawData = computed(() => {
	return blob.value.data
})
const decodedData = computed(() => {
	const result = Uint8Array.from(atob(blob.value.data), (m) => m.codePointAt(0))
	return Array.from(result).join(" ")
})
const viewData = computed(() => {
	if (!isDecode.value) {
		return rawData.value
	} else {
		return decodedData.value
	}
})

watch(
	() => props.show,
	async () => {
		if (props.show) {
			const { data } = await fetchBlobByMetadata({
				hash: cacheStore.selectedBlob.namespace.hash,
				height: cacheStore.selectedBlob.height,
				commitment: cacheStore.selectedBlob.data.ShareCommitments[0],
			})

			if (data.value) {
				blob.value = data.value
			} else {
				notFound.value = true
			}
		} else {
			isDecode.value = false
			isViewAll.value = false
			blob.value = {}
		}
	},
)

const handleDownload = () => {
	const byteArray = new Uint8Array(
		strToHex(atob(blob.value.data))
			.match(/.{2}/g)
			.map((e) => parseInt(e, 16)),
	)

	const a = window.document.createElement("a")
	a.href = window.URL.createObjectURL(new Blob([byteArray], { type: "application/octet-stream" }))
	a.download = `${getNamespaceID(
		cacheStore.selectedBlob.namespace.namespace_id,
	)}_${cacheStore.selectedBlob.data.ShareCommitments[0].slice(
		cacheStore.selectedBlob.data.ShareCommitments[0].length - 8,
		cacheStore.selectedBlob.data.ShareCommitments[0].length,
	)}.bin`
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="600" disable-trap>
		<Flex direction="column" gap="24">
			<Text size="14" weight="600" color="primary">Blob Viewer</Text>

			<Text v-if="notFound" size="12" weight="600" color="tertiary"> Blob not found </Text>
			<Flex v-else-if="blob.data" direction="column" gap="24">
				<Flex direction="column" gap="12">
					<Flex direction="column" gap="8" :class="$style.data">
						<Text size="13" weight="500" height="160" color="secondary" mono :class="[$style.field, isViewAll && $style.full]">
							{{ viewData }}
						</Text>
					</Flex>

					<Button @click="isViewAll = !isViewAll" type="secondary" size="small" wide :disabled="viewData.length < 540">
						{{ isViewAll ? "Collapse" : "Expand" }}
					</Button>
				</Flex>

				<Flex direction="column" align="center" gap="16">
					<Flex align="center" justify="between" wide :class="$style.metadata">
						<Text size="12" weight="500" color="tertiary">Namespace ID:</Text>

						<Flex align="center" gap="8" :class="$style.value_wrapper">
							<CopyButton :text="getNamespaceID(cacheStore.selectedBlob.namespace.namespace_id)" />

							<Text size="13" weight="600" color="primary" :class="$style.value">
								{{ space(getNamespaceID(cacheStore.selectedBlob.namespace.namespace_id)) }}
								<Text
									v-if="
										getNamespaceID(cacheStore.selectedBlob.namespace.namespace_id) !==
										cacheStore.selectedBlob.namespace.name
									"
									color="secondary"
								>
									({{ cacheStore.selectedBlob.namespace.name }})
								</Text>
							</Text>
						</Flex>
					</Flex>

					<Flex align="center" justify="between" wide :class="$style.metadata">
						<Text size="12" weight="500" color="tertiary">Commitment:</Text>

						<Flex align="center" gap="8" :class="$style.value_wrapper">
							<CopyButton :text="cacheStore.selectedBlob.data.ShareCommitments[0]" />

							<Text size="13" weight="600" color="primary" :class="$style.value">
								{{ cacheStore.selectedBlob.data.ShareCommitments[0] }}
							</Text>
						</Flex>
					</Flex>

					<Flex align="center" justify="between" wide :class="$style.metadata">
						<Text size="12" weight="500" color="tertiary">Signer:</Text>

						<Flex align="center" gap="8" :class="$style.value_wrapper">
							<CopyButton :text="cacheStore.selectedBlob.data.Signer" />

							<NuxtLink :to="`/address/${cacheStore.selectedBlob.data.Signer}`" target="_blank">
								<Flex align="center" gap="6">
									<Text size="13" weight="600" color="primary" :class="$style.value">
										{{ cacheStore.selectedBlob.data.Signer }}
									</Text>

									<Icon name="arrow-narrow-up-right" size="12" color="secondary" />
								</Flex>
							</NuxtLink>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex v-if="blob.data" align="center" gap="8" :class="$style.buttons">
				<Button @click="handleDownload" type="secondary" size="small">
					<Icon name="download" size="14" color="secondary" />
					<Flex align="center" gap="6">
						<Text>Download</Text>
						<Text color="tertiary">{{ formatBytes(cacheStore.selectedBlob.data.BlobSizes[0]) }}</Text>
					</Flex>
				</Button>

				<Button @click="isDecode = !isDecode" type="secondary" size="small"> {{ isDecode ? "Encode" : "Decode" }} Base64 </Button>
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

@media (max-width: 550px) {
	.metadata {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
}

@media (max-width: 400px) {
	.buttons {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
