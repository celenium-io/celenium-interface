<script setup>
/** Components: Modules */
import TxOverview from "@/components/modules/tx/TxOverview.vue"
import BlobsTable from "@/components/modules/block/BlobsTable.vue"

/** Services */
import { comma } from "@/services/utils"

/** API */
import { fetchTxByHash, fetchTxMessages, fetchTxEvents } from "@/services/api/tx"

const route = useRoute()
const router = useRouter()

const tx = ref()
const { data: rawTx } = await fetchTxByHash(route.params.hash)

if (!rawTx.value) {
	router.push("/")
} else {
	tx.value = rawTx.value
}

useHead({
	title: `Transaction ${tx.value?.hash.slice(tx.value?.hash.length - 4, tx.value?.hash.length)} - Celestia Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://celenium.io${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Celestia Transaction ${tx.value?.hash.slice(
				tx.value?.hash.length - 4,
				tx.value?.hash.length,
			)}. The timestamp, hash, events, messages, metadata, gas used.`,
		},
		{
			property: "og:title",
			content: `Transaction ${tx.value?.hash.slice(tx.value?.hash.length - 4, tx.value?.hash.length)} - Celestia Explorer`,
		},
		{
			property: "og:description",
			content: `Celestia Transaction ${tx.value?.hash.slice(
				tx.value?.hash.length - 4,
				tx.value?.hash.length,
			)}. The timestamp, hash, events, messages, metadata, gas used.`,
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
			content: `Transaction ${tx.value?.hash.slice(tx.value?.hash.length - 4, tx.value?.hash.length)} - Celestia Explorer`,
		},
		{
			name: "twitter:description",
			content: `Celestia Transaction ${tx.value?.hash.slice(
				tx.value?.hash.length - 4,
				tx.value?.hash.length,
			)}. The timestamp, hash, events, messages, metadata, gas used.`,
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
				{ link: route.fullPath, name: `Transaction ${tx.hash.slice(tx.hash.length - 4, tx.hash.length)}` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex v-if="tx" direction="column" gap="40">
			<TxOverview :tx="tx" />

			<BlobsTable :height="tx.height" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 60px 24px;
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
