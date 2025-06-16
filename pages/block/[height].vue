<script setup>
/** Components: Modules */
import BlockOverview from "@/components/modules/block/BlockOverview.vue"
import BlobsTable from "@/components/modules/block/BlobsTable.vue"

/** Services */
import { comma } from "@/services/utils"

/** API */
import { fetchBlockByHeight } from "@/services/api/block"

/** Store */
import { useCacheStore } from "@/store/cache.store"
const cacheStore = useCacheStore()

const route = useRoute()

const block = ref()
const { data: rawBlock } = await fetchBlockByHeight(route.params.height)

if (!rawBlock.value) {
	navigateTo({
		path: "/",
		query: {
			error: "not_found",
			target: "block",
			id: route.params.height,
		},
	})
} else {
	block.value = rawBlock.value
	cacheStore.current.block = block.value
}

defineOgImageComponent("BlockImage", {
	title: "Block",
	block: block.value,
	cacheKey: `${block.value?.height}`,
})

useHead({
	title: `Block ${comma(block.value?.height)} - Celenium`,
	link: [
		{
			rel: "canonical",
			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Celestia Block Height ${block.value?.height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
		},
		{
			property: "og:title",
			content: `Block ${comma(block.value?.height)} - Celenium`,
		},
		{
			property: "og:description",
			content: `Celestia Block Height ${block.value?.height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
		},
		{
			property: "og:url",
			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
		{
			name: "twitter:title",
			content: `Block ${comma(block.value?.height)} - Celenium`,
		},
		{
			name: "twitter:description",
			content: `Celestia Block Height ${block.value?.height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})

const displayName = computed(() => {
	const { $getDisplayName } = useNuxtApp()
	return $getDisplayName("block", block.value?.height)
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			v-if="block"
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/blocks', name: 'Blocks' },
				{ link: route.fullPath, name: `${comma(displayName)}` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex v-if="block" direction="column" gap="40">
			<BlockOverview :block="block" />

			<BlobsTable :block="block" description="This block does not contain blobs" />
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
