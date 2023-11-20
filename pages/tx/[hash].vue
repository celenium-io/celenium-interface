<script setup>
/** Components: Modules */
import TxOverview from "@/components/modules/tx/TxOverview.vue"
import BlobsTable from "@/components/modules/block/BlobsTable.vue"

/** API */
import { fetchTxByHash } from "@/services/api/tx"

const route = useRoute()
const router = useRouter()

const tx = ref()
const { data: rawTx } = await fetchTxByHash(route.params.hash)

if (!rawTx.value) {
	router.push("/")
} else {
	tx.value = rawTx.value
}

defineOgImage({
	title: "Tx",
	tx: tx.value,
	component: "TxImage",
	cacheKey: `${tx.value?.hash}`,
})

useHead({
	title: `Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash.toUpperCase().slice(-4)} - Celestia Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://celenium.io${route.path}`,
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
			content: `Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash
				.toUpperCase()
				.slice(-4)} - Celestia Explorer`,
		},
		{
			property: "og:description",
			content: `Celestia Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash
				.toUpperCase()
				.slice(-4)}. The timestamp, hash, events, messages, metadata, gas used.`,
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
			content: `Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash
				.toUpperCase()
				.slice(-4)} - Celestia Explorer`,
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
					name: `Transaction ${tx.hash.toUpperCase().slice(0, 4)} ••• ${tx.hash.toUpperCase().slice(-4)}`,
				},
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex v-if="tx" direction="column" gap="40">
			<TxOverview :tx="tx" />

			<BlobsTable :height="tx.height" description="This transaction does not contain any blobs" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

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
