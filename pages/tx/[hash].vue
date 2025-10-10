<script setup>
/** Components: Modules */
import TxOverview from "@/components/modules/tx/TxOverview.vue"
import BlobsTable from "@/components/modules/block/BlobsTable.vue"

/** Services */
import { isValidId } from "@/services/utils"

/** API */
import { fetchTxByHash } from "@/services/api/tx"

/** Store */
import { useCacheStore } from "@/store/cache.store"
const cacheStore = useCacheStore()

const route = useRoute()

const tx = ref()
const hash = route.params.hash.startsWith("0x") ? route.params.hash.slice(2) : route.params.hash
if (isValidId(hash, "tx")) {
	const { data: rawTx } = await fetchTxByHash(hash)
	if (!rawTx.value) {
		throw createError({ statusCode: 404, statusMessage: `Transaction ${route.params.hash} not found` })
	} else {
		tx.value = rawTx.value
		cacheStore.current.transaction = tx.value
	}
} else {
	throw createError({ statusCode: 404, statusMessage: `Transaction ${route.params.hash} not found` })
}

defineOgImageComponent("TxImage", {
	title: "Tx",
	tx: tx.value,
	cacheKey: `${tx.value?.hash}`,
})

useHead({
	title: `Transaction ${tx.value?.hash.toUpperCase()} - Celenium`,
	link: [
		{
			rel: "canonical",
			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Celestia Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash
				.toUpperCase()
				.slice(-4)}. The timestamp, hash, events, messages, metadata, gas used.`,
		},
		{
			property: "og:title",
			content: `Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash.toUpperCase().slice(-4)} - Celenium`,
		},
		{
			property: "og:description",
			content: `Celestia Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash
				.toUpperCase()
				.slice(-4)}. The timestamp, hash, events, messages, metadata, gas used.`,
		},
		{
			property: "og:url",
			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
		{
			name: "twitter:title",
			content: `Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash.toUpperCase().slice(-4)} - Celenium`,
		},
		{
			name: "twitter:description",
			content: `Celestia Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash
				.toUpperCase()
				.slice(-4)}. The timestamp, hash, events, messages, metadata, gas used.`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})

const displayName = computed(() => {
	const { $getDisplayName } = useNuxtApp()
	return $getDisplayName("tx", tx.value?.hash)
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			v-if="tx"
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/txs', name: 'Transactions' },
				{
					link: route.fullPath,
					name: `${displayName}`,
				},
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex v-if="tx" direction="column" gap="40">
			<TxOverview :tx="tx" />

			<BlobsTable :hash="tx.hash" description="This transaction does not contain any blobs" />
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
