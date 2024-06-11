<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** API */
import { fetchBlobMetadata, fetchBlobByMetadata } from "@/services/api/namespace"

/** Components */
import HexViewer from "@/components/modules/blob/HexViewer.vue"
import Preview from "@/components/modules/blob/Preview.vue"
import Button from "@/components/ui/Button"

/** Services */
import { space, formatBytes, comma, strToHex } from "@/services/utils"

/** Stores */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

const route = useRoute()
const router = useRouter()

const cards = ref({
	metadata: true,
	preview: true,
	raw: false,
})

const supportedContentTypeForPreview = ["image/png", "image/jpeg", "video/mp4", "text/plain; charset=utf-8"]

const blob = ref({})
const metadata = ref({})

const init = async () => {
	const { hash, height, commitment } = route.query
	if (!hash || !height || !commitment) {
		router.push("/")
		return
	}

	const { data: rawMetadata } = await fetchBlobMetadata({
		hash: hash.replaceAll(" ", "+"),
		height: parseInt(height),
		commitment: commitment.replaceAll(" ", "+"),
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
	}
}
init()

const handleDownload = () => {
	const byteArray = new Uint8Array(
		strToHex(atob(blob.value.data))
			.match(/.{2}/g)
			.map((e) => parseInt(e, 16)),
	)

	const a = window.document.createElement("a")
	a.href = window.URL.createObjectURL(new Blob([byteArray], { type: "application/octet-stream" }))
	a.download = `${blob.value.metadata.namespace.namespace_id}_${blob.value.commitment.slice(
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
	<Flex gap="16" :class="$style.wrapper">
		<Flex direction="column" gap="16" :class="$style.left">
			<ClientOnly>
				<HexViewer v-if="blob" :blob="blob" />
			</ClientOnly>

			<Flex direction="column" gap="16" :class="$style.card">
				<Flex @click="cards.raw = !cards.raw" align="center" justify="between" :class="$style.header">
					<Flex align="center" gap="8">
						<Text size="13" weight="600" color="primary"> Raw Content </Text>
						<Text @click.stop="handleCopy(blob.data)" size="13" weight="600" color="blue"> Copy </Text>
					</Flex>

					<Icon name="chevron" size="14" color="tertiary" :style="{ transform: `rotate(${cards.raw ? '180deg' : '0'})` }" />
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
					<Icon name="chevron" size="14" color="tertiary" :style="{ transform: `rotate(${cards.metadata ? '180deg' : '0'})` }" />
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

					<Flex align="center" gap="24" justify="between">
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
											{{ metadata.tx.hash.slice(metadata.tx.hash.length - 4, metadata.tx.hash.length).toUpperCase() }}
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

					<Flex direction="column" gap="16">
						<Flex direction="column" gap="8">
							<Text size="12" weight="600" color="tertiary"> Commitment </Text>
							<Text size="12" weight="600" color="secondary" selectable style="text-overflow: ellipsis; overflow: hidden">
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
					</Flex>

					<Button @click="handleDownload" type="secondary" size="small" wide>
						<Icon name="download" size="14" color="secondary" />
						<Text>Download</Text>
					</Button>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" :class="$style.card">
				<Flex @click="cards.preview = !cards.preview" align="center" justify="between" :class="$style.header">
					<Text size="13" weight="600" color="primary">
						Preview <Text color="tertiary"> for {{ blob.content_type }}</Text>
					</Text>
					<Icon name="chevron" size="14" color="tertiary" :style="{ transform: `rotate(${cards.preview ? '180deg' : '0'})` }" />
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
</template>

<style module>
.wrapper {
	width: 100%;
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

.left {
	max-width: calc(100% - 360px - 16px);

	flex: 1;
}

.right {
	min-width: 360px;
	max-width: 360px;
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
	max-height: 200px;

	display: -webkit-box;
	-webkit-box-orient: vertical;
	word-wrap: break-word;

	overflow: auto;
	border-radius: 6px;
	background: var(--app-background);

	padding: 16px;
}
</style>
