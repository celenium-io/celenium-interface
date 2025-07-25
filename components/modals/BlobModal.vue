<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"
import Spinner from "@/components/ui/Spinner.vue"

/** Services */
import { comma, formatBytes, getNamespaceID, shortHash, space, strToHex } from "@/services/utils"

/** API */
import { fetchBlobBlockscoutData, fetchBlobByMetadata } from "@/services/api/namespace"

/** Store */
import { useCacheStore } from "@/store/cache.store"
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const supportedContentTypeForPreview = ["image/png", "image/jpeg", "video/mp4", "text/plain; charset=utf-8"]

const isLoading = ref(true)
const isStopped = ref(false)
const blob = ref({})
const notFound = ref(false)

const l2BlockscoutUrl = ref("")

const isDecode = ref(false)
const isViewAll = ref(false)

const imagePreviewEl = ref(null)
const videoPreviewEl = ref(null)
const showPreviewImage = ref(false)
const showPreviewText = ref(false)

const rawData = computed(() => {
	return blob.value.data
})
const decodedData = computed(() => {
	const result = Uint8Array.from(atob(blob.value.data), (m) => m.codePointAt(0))
	return Array.from(result).join(" ")
})
const contentPreviewText = ref("")
const viewData = computed(() => {
	if (contentPreviewText.value.length) {
		return contentPreviewText.value
	} else if (!isDecode.value) {
		return rawData.value
	} else {
		return decodedData.value
	}
})

const handleLoadAnyway = () => {
	isStopped.value = false

	getBlobMetadata()
}
const getBlobMetadata = async () => {
	isLoading.value = true

	const { data } = await fetchBlobByMetadata({
		hash: cacheStore.selectedBlob.hash,
		height: cacheStore.selectedBlob.height,
		commitment: cacheStore.selectedBlob.commitment,
	})

	if (data.value) {
		blob.value = data.value
	} else {
		notFound.value = true
	}
}

watch(
	() => props.show,
	async () => {
		if (props.show) {
			if (cacheStore.selectedBlob.size > 1_000_000) {
				isStopped.value = true
				return
			}

			await getBlobMetadata()

			const { data } = await fetchBlobBlockscoutData({
				height: cacheStore.selectedBlob.height,
				namespace: cacheStore.selectedBlob.hash,
				commitment: cacheStore.selectedBlob.commitment,
			})
			l2BlockscoutUrl.value = data?.value?.l2BlockscoutUrl

			/** auto preview for small images */
			if (
				(["image/png", "image/jpeg"].includes(blob.value.content_type) || blob.value.content_type.startsWith("text/plain")) &&
				cacheStore.selectedBlob.size < 100_000
			) {
				handlePreviewContent()
			}
		} else {
			isStopped.value = false
			isDecode.value = false
			isViewAll.value = false
			blob.value = {}

			showPreviewImage.value = false
			showPreviewText.value = false
			contentPreviewText.value = ""
		}

		isLoading.value = false
	},
)

const handleDownload = () => {
	const byteArray = new Uint8Array(
		strToHex(atob(blob.value.data))
			.match(/.{2}/g)
			.map((e) => parseInt(e, 16)),
	)

	let extension = "bin"
	if (supportedContentTypeForPreview.includes(blob.value?.content_type)) {
		const ct = blob.value.content_type.split(";")[0].split("/")[1]
		extension = ct === "plain" ? "txt" : ct
	}

	const a = window.document.createElement("a")
	a.href = window.URL.createObjectURL(new Blob([byteArray], { type: "application/octet-stream" }))
	a.download = `${getNamespaceID(cacheStore.selectedBlob.namespace_id)}_${cacheStore.selectedBlob.commitment.slice(
		cacheStore.selectedBlob.commitment.length - 8,
		cacheStore.selectedBlob.commitment.length,
	)}.${extension}`
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}

const handlePreviewContent = () => {
	if (["image/png", "image/jpeg", "video/mp4"].includes(blob.value.content_type)) {
		if (!showPreviewImage.value) {
			showPreviewImage.value = true

			nextTick(() => {
				switch (blob.value.content_type) {
					case "image/png":
					case "image/jpeg":
						const image = new Image()
						image.src = `data:image/png;base64,${blob.value.data}`
						imagePreviewEl.value.appendChild(image)
						break

					case "video/mp4":
						videoPreviewEl.value.src = `data:video/mp4;base64,${blob.value.data}`
						break
				}
			})
		} else {
			showPreviewImage.value = false
		}
	} else {
		if (!showPreviewText.value) {
			showPreviewText.value = true
			contentPreviewText.value = atob(blob.value.data)
		} else {
			showPreviewText.value = false
			contentPreviewText.value = ""
		}
	}
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="640" disable-trap>
		<Flex direction="column" gap="16">
			<Text size="14" weight="600" color="primary">Blob Viewer</Text>

			<Text v-if="notFound" size="12" weight="600" color="tertiary"> Blob not found </Text>
			<Flex v-else direction="column" gap="24">
				<template v-if="showPreviewImage">
					<div v-if="['image/png', 'image/jpeg'].includes(blob.content_type)" ref="imagePreviewEl" :class="$style.preview" />
					<video v-else-if="blob.content_type === 'video/mp4'" controls>
						<source type="video/mp4" ref="videoPreviewEl" />
					</video>
				</template>

				<Flex v-else direction="column" gap="12">
					<Flex direction="column" :justify="isLoading || isStopped ? 'center' : 'start'" gap="8" :class="$style.data">
						<Text
							v-if="!isLoading && !isStopped"
							size="13"
							weight="500"
							height="160"
							color="secondary"
							mono
							:class="[$style.field, isViewAll && $style.full]"
						>
							{{ viewData }}
						</Text>
						<Flex v-else-if="isStopped" direction="column" align="center" justify="center" gap="16">
							<Icon name="info" size="16" color="secondary" />

							<Flex direction="column" align="center" gap="8">
								<Text size="13" weight="600" color="secondary">Download not started</Text>
								<Text size="12" weight="500" color="tertiary">Auto download for data over 1 Mb is paused</Text>
							</Flex>

							<Text @click="handleLoadAnyway" size="12" weight="600" color="tertiary" :class="$style.load_btn"
								>Load anyway</Text
							>
						</Flex>
						<Flex v-else direction="column" align="center" justify="center" gap="16">
							<Spinner size="16" />

							<Flex direction="column" align="center" gap="8">
								<Text size="13" weight="600" color="secondary">Blob is loading</Text>
								<Text size="12" weight="500" color="tertiary">Loading depends on the size of the blob</Text>
							</Flex>

							<Text size="12" weight="600" color="tertiary">Size: {{ formatBytes(cacheStore.selectedBlob.size) }}</Text>
						</Flex>
					</Flex>

					<Button
						@click="isViewAll = !isViewAll"
						type="secondary"
						size="small"
						wide
						:disabled="!viewData || viewData?.length < 540"
					>
						{{ isViewAll ? "Collapse" : "Expand" }}
					</Button>
				</Flex>

				<Flex align="center" gap="12" wide :class="$style.badges">
					<Flex direction="column" gap="8" :class="$style.badge">
						<Text size="12" weight="500" color="secondary"> Content Type </Text>

						<Text v-if="cacheStore.selectedBlob.content_type" size="13" weight="600" color="primary">
							{{ cacheStore.selectedBlob.content_type }}
						</Text>
						<Text v-else-if="blob.content_type" size="13" weight="600" color="primary">
							{{ blob.content_type }}
						</Text>
						<Skeleton v-else-if="isLoading && !isStopped" w="60" h="13" />
						<Text v-else size="13" weight="600" color="tertiary">Unknown</Text>
					</Flex>

					<NuxtLink :to="`/tx/${cacheStore.selectedBlob.tx.hash}`" target="_blank" :class="[$style.badge, $style.selectable]">
						<Flex direction="column" gap="8">
							<Text size="12" weight="500" color="secondary"> Transaction </Text>

							<Flex align="center" gap="8">
								<Text size="13" weight="600" color="primary">
									{{ cacheStore.selectedBlob.tx.hash.slice(0, 4) }}
								</Text>

								<Flex align="center" gap="3">
									<div v-for="dot in 3" class="dot" />
								</Flex>

								<Text size="13" weight="600" color="primary">
									{{ cacheStore.selectedBlob.tx.hash.slice(-4) }}
								</Text>

								<Icon name="arrow-narrow-up-right" size="12" color="secondary" />
							</Flex>
						</Flex>
					</NuxtLink>

					<NuxtLink :to="`/block/${cacheStore.selectedBlob.height}`" target="_blank" :class="[$style.badge, $style.selectable]">
						<Flex direction="column" gap="8">
							<Text size="12" weight="500" color="secondary"> Height </Text>

							<Flex align="center" gap="8">
								<Text size="13" weight="600" color="primary">{{ comma(cacheStore.selectedBlob.height) }}</Text>

								<Icon name="arrow-narrow-up-right" size="12" color="secondary" />
							</Flex>
						</Flex>
					</NuxtLink>

					<Flex direction="column" gap="8" :class="$style.badge">
						<Text size="12" weight="500" color="secondary"> Size </Text>

						<Text size="13" weight="600" color="primary">{{ formatBytes(cacheStore.selectedBlob.size) }}</Text>
					</Flex>
				</Flex>

				<Flex direction="column" align="center" gap="12">
					<Flex align="center" justify="between" wide :class="$style.metadata">
						<Text size="12" weight="500" color="tertiary">Namespace ID:</Text>

						<Flex align="center" gap="8" :class="$style.value_wrapper">
							<CopyButton :text="getNamespaceID(cacheStore.selectedBlob.namespace_id)" />

							<Text size="13" weight="600" color="primary" :class="$style.value">
								{{ $getDisplayName("namespaces", cacheStore.selectedBlob.namespace_id) }}

								<Text
									v-if="getNamespaceID(cacheStore.selectedBlob.namespace_id) !== cacheStore.selectedBlob.namespace_name"
									color="secondary"
								>
									({{ cacheStore.selectedBlob.namespace_name }})
								</Text>
							</Text>
						</Flex>
					</Flex>

					<Flex align="center" justify="between" wide :class="$style.metadata">
						<Text size="12" weight="500" color="tertiary">Commitment:</Text>

						<Flex align="center" gap="8" :class="$style.value_wrapper">
							<CopyButton :text="cacheStore.selectedBlob.commitment" />

							<Text size="13" weight="600" color="primary" :class="$style.value">
								{{ shortHash(cacheStore.selectedBlob.commitment) }}
							</Text>
						</Flex>
					</Flex>

					<Flex align="center" justify="between" wide :class="$style.metadata">
						<Text size="12" weight="500" color="tertiary">Signer:</Text>

						<Flex align="center" gap="8" :class="$style.value_wrapper">
							<CopyButton :text="cacheStore.selectedBlob.signer.hash" />

							<NuxtLink :to="`/address/${cacheStore.selectedBlob.signer.hash}`" target="_blank">
								<Flex align="center" gap="6">
									<Text size="13" weight="600" color="primary" :class="$style.value">
										{{ $getDisplayName("addresses", "", cacheStore.selectedBlob.signer) }}
									</Text>

									<Icon name="arrow-narrow-up-right" size="12" color="secondary" />
								</Flex>
							</NuxtLink>
						</Flex>
					</Flex>

					<Flex v-if="cacheStore.selectedBlob.rollup" align="center" justify="between" wide :class="$style.metadata">
						<Text size="12" weight="500" color="tertiary">Rollup:</Text>

						<NuxtLink :to="`/rollup/${cacheStore.selectedBlob.rollup.slug}`" target="_blank">
							<Flex align="center" gap="6">
								<Flex align="center" justify="center" :class="$style.avatar_container">
									<img :src="cacheStore.selectedBlob.rollup.logo" :class="$style.avatar_image" />
								</Flex>

								<Text size="13" weight="600" color="primary" :class="$style.value">
									{{ cacheStore.selectedBlob.rollup.name }}
								</Text>

								<Icon name="arrow-narrow-up-right" size="12" color="secondary" />
							</Flex>
						</NuxtLink>
					</Flex>
				</Flex>
			</Flex>

			<Flex align="center" gap="8" :class="$style.buttons">
				<Flex gap="8" :class="$style.col">
					<Button
						:link="`/blob?commitment=${cacheStore.selectedBlob.commitment}&hash=${cacheStore.selectedBlob.hash}&height=${cacheStore.selectedBlob.height}`"
						target="_blank"
						type="secondary"
						size="small"
					>
						Open Blob Page
						<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
					</Button>

					<Button v-if="l2BlockscoutUrl" :link="l2BlockscoutUrl" target="_blank" size="mini" type="secondary">
						<Icon name="blockscout" size="12" color="secondary" />
						View batch
						<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
					</Button>

					<Button @click="handleDownload" type="secondary" size="small" :disabled="isLoading">
						<Icon name="download" size="14" color="secondary" />

						<Text>Download</Text>
					</Button>
				</Flex>

				<Flex gap="8" :class="$style.col">
					<Button
						@click="isDecode = !isDecode"
						type="secondary"
						size="small"
						:disabled="showPreviewImage || showPreviewText || isLoading"
					>
						{{ isDecode ? "Encode" : "Decode" }} Base64
					</Button>
					<Button
						@click="handlePreviewContent"
						type="secondary"
						size="small"
						:disabled="
							!['image/png', 'image/jpeg', 'video/mp4', 'text/plain; charset=utf-8'].includes(blob.content_type) || isLoading
						"
					>
						{{ showPreviewImage || showPreviewText ? "Hide" : "Preview" }} Content
					</Button>
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

	.buttons {
		flex-direction: column;
		align-items: flex-start;
	}

	.col {
		width: 100%;
	}

	.col {
		& a,
		button {
			width: 100%;
		}
	}
}
</style>
