<script setup>
/** Components: Modules */
import BlockOverview from "@/components/modules/block/BlockOverview.vue"
import BlobsTable from "@/components/modules/block/BlobsTable.vue"

/** Services */
import { comma, isValidId } from "@/services/utils"

/** API */
import { fetchBlockByHeight } from "@/services/api/block"

/** Store */
import { useAppStore } from "@/store/app.store"
import { useCacheStore } from "@/store/cache.store"
const appStore = useAppStore()
const cacheStore = useCacheStore()

const route = useRoute()

const block = ref()

if (!isValidId(route.params.height, "block")) {
	navigateTo("/")
}

const { data: rawBlock } = await fetchBlockByHeight(route.params.height)

const height = rawBlock.value ? rawBlock.value.height : Number(route.params.height)

const latestBlock = computed(() => appStore.latestBlocks[0])

const isUpcomingBlock = ref(!rawBlock.value)
const isWaited = ref(isUpcomingBlock.value)

if (isUpcomingBlock.value && height > 1_000_000_000_000) {
	navigateTo("/")
}

watch(
	() => latestBlock.value,
	() => {
		if (height === latestBlock.value.height) {
			isUpcomingBlock.value = false
			block.value = latestBlock.value
		}
	},
)

if (rawBlock.value) {
	block.value = rawBlock.value
	cacheStore.current.block = block.value
}

defineOgImageComponent("BlockImage", {
	title: "Block",
	block: block.value,
	component: "BlockImage",
	cacheKey: `${height}`,
})

useHead({
	title: `Block ${comma(height)} - Celenium`,
	link: [
		{
			rel: "canonical",
			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Celestia Block Height ${height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
		},
		{
			property: "og:title",
			content: `Block ${comma(height)} - Celenium`,
		},
		{
			property: "og:description",
			content: `Celestia Block Height ${height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
		},
		{
			property: "og:url",
			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
		{
			name: "twitter:title",
			content: `Block ${comma(height)} - Celenium`,
		},
		{
			name: "twitter:description",
			content: `Celestia Block Height ${height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})

const displayName = computed(() => {
	const { $getDisplayName } = useNuxtApp()
	return $getDisplayName("block", height)
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/blocks', name: 'Blocks' },
				{ link: route.fullPath, name: `${comma(displayName)}` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex direction="column" gap="40">
			<BlockOverview :block="block" :isUpcomingBlock :isWaited :height />
			<BlobsTable
				:block="block"
				:isUpcomingBlock
				description="This block does not contain any blobs. It's actually kind of strange."
			/>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
