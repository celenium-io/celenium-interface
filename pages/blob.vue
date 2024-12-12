<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** API */
import { fetchBlobBlockscoutData, fetchBlobMetadata, fetchBlobByMetadata } from "@/services/api/namespace"

/** Components */
import HexViewer from "@/components/modules/blob/HexViewer.vue"
import DataInspector from "@/components/modules/blob/DataInspector.vue"
import Preview from "@/components/modules/blob/Preview.vue"
import Button from "@/components/ui/Button"
import Tooltip from "@/components/ui/Tooltip"

/** Services */
import { space, formatBytes, comma, strToHex } from "@/services/utils"

/** Stores */
import { useCacheStore } from "@/store/cache"
import { useModalsStore } from "@/store/modals"
import { useNotificationsStore } from "@/store/notifications"
import { blockscoutURL } from "~/services/config"
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()
const notificationsStore = useNotificationsStore()

useHead({
	title: "Hex Viewer - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/blob",
		},
	],
	meta: [
		{
			property: "og:title",
			content: "Hex Viewer - Celestia Explorer",
		},
		{
			property: "og:url",
			content: `https://celenium.io/blob`,
		},
		{
			name: "twitter:title",
			content: "Hex Viewer - Celestia Explorer",
		},
	],
})

const route = useRoute()
const router = useRouter()

const innerWidth = ref(0)

const currTab = ref("viewer")

const cards = ref({
	metadata: true,
	preview: true,
	raw: true,
})

const supportedContentTypeForPreview = ["image/png", "image/jpeg", "video/mp4", "text/plain; charset=utf-8"]

const blob = ref()
const hex = ref([])
const bytes = computed(() => {
	if (!blob.value) return []
	return hex.value.flat()
})

const l2BlockscoutUrl = ref("")

/** Selected byte (1) */
const cursor = ref(0)
const handleSelectCursor = (target) => {
	if (target < 0 || target > bytes.value.length) return
	cursor.value = target
}
/** Range of selected bytes */
const range = reactive({ start: 0, end: 0 })
const handleBytesSelect = (selection) => {
	const [start, end] = selection

	if (start !== undefined) {
		range.start = start
	}
	if (end !== undefined) {
		range.end = end
	}
}

const metadata = ref({})

const { hash, height, commitment } = route.query
cacheStore.current.blob = {
	commitment,
	hash,
	height,
}

onMounted(() => {
	if (!supportedContentTypeForPreview.includes(blob.content_type)) cards.value.preview = false

	innerWidth.value = window.innerWidth
	if (innerWidth.value <= 1020) {
		currTab.value = "metadata"
		cards.value.raw = false
	}
})

const init = async (fromCache = false) => {
	const { hash, height, commitment } = fromCache ? cacheStore.current.blob : route.query
	if (!hash || !height || !commitment) {
		router.push("/")
		return
	}

	const { data: rawMetadata } = await fetchBlobMetadata({
		hash: hash.replaceAll(" ", "+"),
		height: parseInt(height),
		commitment: commitment.replaceAll(" ", "+"),
		metadata: true,
	})
	metadata.value = rawMetadata.value

	const { data: rawBlob } = await fetchBlobByMetadata({
		hash: hash.replaceAll(" ", "+"),
		height: parseInt(height),
		commitment: commitment.replaceAll(" ", "+"),
	})

	if (!rawBlob.value || !rawMetadata.value) {
		router.push("/")
		return
	} else {
		blob.value = rawBlob.value
		hex.value = Buffer.from(blob.value.data, "base64")
			.toString("hex")
			.match(/../g)
			.reduce((acc, current, idx) => {
				const chunkIdx = Math.floor(idx / 16)
				acc[chunkIdx] = acc[chunkIdx] || []
				acc[chunkIdx].push(current)
				return acc
			}, [])
	}

	const { data } = await fetchBlobBlockscoutData({
		height: height,
		namespace: hash,
		commitment: commitment,
	})
	l2BlockscoutUrl.value = data?.value?.l2BlockscoutUrl
}
init()

watch(
	() => cacheStore.current.blob,
	() => {
		init(true)

		router.replace({
			query: {
				commitment: cacheStore.current.blob.commitment,
				hash: cacheStore.current.blob.hash,
				height: cacheStore.current.blob.height,
			},
		})
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
	a.download = `${metadata.value.namespace.namespace_id}_${blob.value.commitment.slice(
		blob.value.commitment.length - 8,
		blob.value.commitment.length,
	)}.bin`
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}

const handleCopy = (text) => {
	window.navigator.clipboard.writeText(text)

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
	<Flex wide direction="column" gap="16" :class="$style.wrapper">
		<Flex align="center" justify="between">
			<Flex align="center" gap="8">
				<Flex @click="currTab = 'viewer'" align="center" gap="6" :class="[$style.tab, currTab === 'viewer' && $style.active]">
					<Text size="12" weight="600" color="secondary" mono>01</Text>
					<Text size="13" weight="600" color="primary"> Hex Viewer </Text>
				</Flex>

				<Flex @click="currTab = 'metadata'" align="center" gap="6" :class="[$style.tab, currTab === 'metadata' && $style.active]">
					<Text size="13" weight="600" color="primary"> Blob Metadata </Text>
				</Flex>
			</Flex>

			<Flex align="center" gap="8">
				<Button v-if="l2BlockscoutUrl" :link="l2BlockscoutUrl" target="_blank" size="mini" type="secondary">
					<Icon name="blockscout" size="12" color="secondary" />
					View batch
				</Button>
				<Button @click="modalsStore.open('changeBlob')" size="mini" type="secondary">
					<Icon name="blob" size="12" color="secondary" />
					Select blob
				</Button>
				<Button @click="handleDownload" type="secondary" size="mini" wide>
					<Icon name="download" size="14" color="secondary" />
				</Button>
				<Button @click="modalsStore.open('hexSettings')" size="mini" type="secondary">
					<Icon name="settings" size="12" color="secondary" />
				</Button>
			</Flex>
		</Flex>

		<ClientOnly>
			<Flex v-if="currTab === 'viewer'" gap="16">
				<template v-if="innerWidth >= 1020">
					<Flex direction="column" gap="16" :class="$style.left">
						<ClientOnly>
							<HexViewer
								v-if="blob"
								:blob="blob"
								:bytes="bytes"
								:hex="hex"
								:cursor="cursor"
								:range="range"
								@onSelect="handleBytesSelect"
								@onCursorSelect="handleSelectCursor"
							/>
						</ClientOnly>
					</Flex>

					<Flex direction="column" gap="16" :class="$style.right">
						<DataInspector :bytes="bytes" :range="range" :cursor="cursor" />

						<Tooltip>
							<Flex align="center" gap="6" style="padding: 0 16px">
								<Icon name="info" size="12" color="support" />
								<Text size="12" weight="500" color="support">This page supports several keybinds</Text>
							</Flex>

							<template #content>
								<Flex direction="column" gap="8" align="center">
									<Flex align="center" gap="6">
										<Text color="tertiary">Clear selection - </Text> <Text mono>Esc</Text>
									</Flex>
									<Flex align="center" gap="6">
										<Text color="tertiary">Jump to start - </Text> <Text mono>PageUp</Text>
									</Flex>
									<Flex align="center" gap="6">
										<Text color="tertiary">Jump to end - </Text> <Text mono>PageDown</Text>
									</Flex>
									<Flex align="center" gap="6">
										<Text color="tertiary">Move cursor - </Text> <Text mono>Arrow Keys</Text>
									</Flex>
									<Flex align="center" gap="6">
										<Text color="tertiary">Move viewport - </Text> <Text mono>Cmd+ArrowUp/Down</Text>
									</Flex>
								</Flex>
							</template>
						</Tooltip>
					</Flex>
				</template>
				<template v-else>
					<Text size="13" weight="500" color="tertiary"
						>Hex viewer is not available on your screen, use a desktop or tablet.</Text
					>
				</template>
			</Flex>

			<Flex v-else-if="currTab === 'metadata' && blob" gap="16" :class="$style.metadata">
				<Flex direction="column" gap="16" :class="$style.left">
					<Flex direction="column" gap="16" :class="$style.card">
						<Flex @click="cards.raw = !cards.raw" align="center" justify="between" :class="$style.header">
							<Flex align="center" gap="8">
								<Text size="13" weight="600" color="primary"> Raw Content </Text>
								<Text @click.stop="handleCopy(blob.data)" size="13" weight="600" color="blue"> Copy </Text>
							</Flex>

							<Icon
								name="chevron"
								size="14"
								color="tertiary"
								:style="{ transform: `rotate(${cards.raw ? '180deg' : '0'})` }"
							/>
						</Flex>

						<Text v-if="cards.raw" size="13" color="secondary" height="140" class="selectable" :class="$style.raw_content">
							{{ blob.data }}
						</Text>
					</Flex>
				</Flex>

				<Flex direction="column" gap="16" :class="$style.right">
					<Flex v-if="metadata.commitment" direction="column" gap="16" :class="$style.card">
						<Flex @click="cards.metadata = !cards.metadata" align="center" justify="between" :class="$style.header">
							<Text size="13" weight="600" color="primary">Blob Metadata</Text>
							<Icon
								name="chevron"
								size="14"
								color="tertiary"
								:style="{ transform: `rotate(${cards.metadata ? '180deg' : '0'})` }"
							/>
						</Flex>

						<Flex v-if="cards.metadata" direction="column" gap="24" :class="$style.data">
							<Flex direction="column" gap="16">
								<NuxtLink :to="`/namespace/${metadata.namespace.namespace_id}`" target="_blank">
									<Flex justify="between" :class="$style.namespace">
										<Flex direction="column" gap="8">
											<Text size="12" weight="600" color="secondary">Namespace</Text>
											<Text size="13" weight="600" color="primary">{{ space(metadata.namespace.name) }}</Text>

											<Text size="12" weight="500" color="tertiary">
												{{ formatBytes(metadata.namespace.size) }}&nbsp;&nbsp;•&nbsp;&nbsp;{{
													comma(metadata.namespace.pfb_count)
												}}
												PFBs
											</Text>
										</Flex>

										<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
									</Flex>
								</NuxtLink>

								<Flex align="center" justify="between">
									<Text size="12" weight="600" color="tertiary"> Content Type </Text>
									<Text size="12" weight="600" color="primary">
										{{ metadata.content_type }}
									</Text>
								</Flex>

								<Flex align="center" justify="between">
									<Text size="12" weight="600" color="tertiary"> Blob Size </Text>
									<Text size="12" weight="600" color="primary">
										{{ formatBytes(metadata.size) }}
									</Text>
								</Flex>

								<Flex align="center" justify="between">
									<Text size="12" weight="600" color="tertiary"> Time </Text>
									<Text size="12" weight="600" color="primary">
										{{ DateTime.fromISO(metadata.time).setLocale("en").toRelative() }}
									</Text>
								</Flex>
							</Flex>

							<div :class="$style.divider" />

							<Flex align="center" gap="12" justify="between">
								<Flex direction="column" gap="8" wide>
									<Text size="12" weight="600" color="secondary"> Transaction </Text>

									<NuxtLink :to="`/tx/${metadata.tx.hash}`" target="_blank">
										<Flex align="center" justify="between" :class="$style.tx">
											<Flex align="center" gap="8">
												<Icon name="check-circle" size="14" color="green" />

												<Text size="13" weight="600" color="primary" mono>
													{{ metadata.tx.hash.slice(0, 4).toUpperCase() }}
												</Text>

												<Flex align="center" gap="3">
													<div v-for="dot in 3" class="dot" />
												</Flex>

												<Text size="13" weight="600" color="primary" mono>
													{{
														metadata.tx.hash
															.slice(metadata.tx.hash.length - 4, metadata.tx.hash.length)
															.toUpperCase()
													}}
												</Text>
											</Flex>

											<Icon name="arrow-narrow-up-right" size="12 " color="tertiary" />
										</Flex>
									</NuxtLink>
								</Flex>

								<Flex direction="column" gap="8" wide>
									<Text size="12" weight="600" color="secondary"> Block </Text>

									<NuxtLink :to="`/block/${metadata.height}`" target="_blank">
										<Flex align="center" justify="between" :class="$style.tx">
											<Flex align="center" gap="8">
												<Icon name="block" size="14" color="secondary" />

												<Text size="13" weight="600" color="primary" mono>
													{{ comma(metadata.height) }}
												</Text>
											</Flex>

											<Icon name="arrow-narrow-up-right" size="12 " color="tertiary" />
										</Flex>
									</NuxtLink>
								</Flex>
							</Flex>

							<Flex direction="column" gap="8">
								<Text size="12" weight="600" color="tertiary"> Commitment </Text>
								<Text
									size="12"
									weight="600"
									color="secondary"
									selectable
									style="text-overflow: ellipsis; overflow: hidden"
								>
									{{ blob.commitment }}
								</Text>
							</Flex>

							<NuxtLink :to="`/address/${metadata.signer}`" target="_blank">
								<Flex direction="column" gap="8">
									<Text size="12" weight="600" color="tertiary"> Signer </Text>
									<Text size="12" weight="600" color="secondary" style="text-overflow: ellipsis; overflow: hidden">
										{{ metadata.signer }}
									</Text>
								</Flex>
							</NuxtLink>

							<NuxtLink v-if="metadata.rollup" :to="`/rollup/${metadata.rollup.slug}`" target="_blank">
								<Flex direction="column" gap="8">
									<Text size="12" weight="600" color="tertiary"> Rollup </Text>

									<Flex align="center" gap="8">
										<Flex align="center" justify="center" :class="$style.avatar_container">
											<img :src="metadata.rollup.logo" :class="$style.avatar_image" />
										</Flex>
										<Text
											size="12"
											weight="600"
											color="secondary"
											style="text-overflow: ellipsis; overflow: hidden"
										>
											{{ metadata.rollup.name }}
										</Text>
									</Flex>
								</Flex>
							</NuxtLink>
						</Flex>
					</Flex>

					<Flex direction="column" gap="16" :class="$style.card">
						<Flex @click="cards.preview = !cards.preview" align="center" justify="between" :class="$style.header">
							<Text size="13" weight="600" color="primary">
								Preview <Text color="tertiary"> for {{ blob.content_type }}</Text>
							</Text>
							<Icon
								name="chevron"
								size="14"
								color="tertiary"
								:style="{ transform: `rotate(${cards.preview ? '180deg' : '0'})` }"
							/>
						</Flex>

						<ClientOnly>
							<Preview v-if="cards.preview && blob.data" :blob="blob" />
						</ClientOnly>

						<Flex v-if="supportedContentTypeForPreview.includes(blob.content_type)" align="center" gap="6">
							<Icon name="check" size="12" color="tertiary" />
							<Text size="12" weight="500" color="support">This content type is supported for preview</Text>
						</Flex>
						<Flex v-else align="center" gap="6">
							<Icon name="close" size="12" color="tertiary" />
							<Text size="12" weight="500" color="support">This content type is not supported for preview</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</ClientOnly>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

.left {
	max-width: calc(100% - 300px - 16px);

	flex: 1;
}

.right {
	min-width: 300px;
	max-width: 300px;
}

.card {
	border-radius: 8px;
	background: var(--card-background);
	overflow: hidden;

	padding: 16px;
}

.header {
	cursor: pointer;
	border-radius: 6px;

	padding: 8px;
	margin: -8px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-5);
	}
}

.data {
}

.namespace {
	border-radius: 6px;
	background: var(--op-5);
	cursor: pointer;

	padding: 8px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-8);
	}
}

.tx {
	background: var(--op-5);
	border-radius: 6px;
	border: 1px solid var(--op-5);
	cursor: pointer;

	padding: 6px;

	transition: all 0.2s ease;

	&:hover {
		border: 1px solid var(--op-10);
	}
}

.divider {
	width: 100%;
	height: 1px;

	background: var(--op-5);
}

.raw_content {
	max-height: 600px;

	display: -webkit-box;
	-webkit-box-orient: vertical;
	word-wrap: break-word;

	overflow: auto;
	border-radius: 6px;
	background: var(--app-background);

	padding: 16px;
}

.tab {
	border-radius: 8px;
	background: var(--op-5);
	cursor: pointer;

	padding: 8px 10px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-8);
	}

	&.active {
		background: var(--op-10);
		box-shadow: inset 0 0 0 2px var(--op-5);
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

@media (max-width: 900px) {
	.metadata {
		flex-direction: column;
	}

	.card {
		width: 100%;
	}

	.left {
		max-width: initial;
	}

	.right {
		max-width: initial;
	}
}
</style>
