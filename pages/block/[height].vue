<script setup>
/** Components: Modules */
import BlockOverview from "@/components/modules/block/BlockOverview.vue"
import BlobsTable from "@/components/modules/block/BlobsTable.vue"

/** Services */
import { comma } from "@/services/utils"

/** API */
import { fetchBlockByHeight } from "@/services/api/block"

/** Store */
import { useCacheStore } from "@/store/cache"
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

defineOgImage({
	title: "Block",
	block: block.value,
	component: "BlockImage",
	cacheKey: `${block.value?.height}`,
})

useHead({
	title: `Block ${comma(block.value?.height)} - Celestia Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://celenium.io${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Celestia Block Height ${block.value?.height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
		},
		{
			property: "og:title",
			content: `Block ${comma(block.value?.height)} - Celestia Explorer`,
		},
		{
			property: "og:description",
			content: `Celestia Block Height ${block.value?.height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
		},
		{
			property: "og:url",
			content: `https://celenium.io${route.path}`,
		},
		{
			property: "og:image",
			content: `https://celenium.io${route.path}__og_image__/og.png`,
		},
		{
			name: "twitter:title",
			content: `Block ${comma(block.value?.height)} - Celestia Explorer`,
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

			<BlobsTable :height="block.height" description="This block does not contain blobs" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 40px 24px 60px 24px;
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
