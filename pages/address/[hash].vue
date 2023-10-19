<script setup>
/** Components: Modules */
import AddressOverview from "@/components/modules/address/AddressOverview.vue"

/** Services */
import { comma } from "@/services/utils"

/** API */
import { fetchAddressByHash } from "@/services/api/address"

const route = useRoute()
const router = useRouter()

const address = ref()
const { data: rawAddress } = await fetchAddressByHash(route.params.hash)

if (!rawAddress.value) {
	router.push("/")
} else {
	address.value = rawAddress.value
}

useHead({
	title: `Address ${address.value?.hash} - Celestia Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://celenium.io${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Address ${address.value?.hash} balance, transactions and other data.`,
		},
		{
			property: "og:title",
			content: `Address ${address.value?.height} - Celestia Explorer`,
		},
		{
			property: "og:description",
			content: `Address ${address.value?.hash} balance, transactions and other data.`,
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
			content: `Address ${address.value?.height} - Celestia Explorer`,
		},
		{
			name: "twitter:description",
			content: `Address ${address.value?.hash} balance, transactions and other data.`,
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
			v-if="address"
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/addresses', name: 'Addresses' },
				{ link: route.fullPath, name: `${address.hash}` },
			]"
			:class="$style.breadcrumbs"
		/>

		<AddressOverview v-if="address" :address="address" />
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
