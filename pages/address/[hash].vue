<script setup>
/** Components: Modules */
import AddressOverview from "@/components/modules/address/AddressOverview.vue"

/** API */
import { fetchAddressByHash } from "@/services/api/address"

/** Store */
import { useCacheStore } from "@/store/cache"

const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const address = ref()
const { data: rawAddress } = await fetchAddressByHash(route.params.hash)

if (!rawAddress.value) {
	router.push("/")
} else {
	address.value = rawAddress.value
	cacheStore.current.address = address.value
}

defineOgImage({
	title: "Address",
	address: address.value,
	component: "AddressImage",
	cacheKey: `${address.value?.hash.slice(-4)}-${address.value?.balance.spendable}-${address.value?.first_height}-${
		address.value?.last_height
	}`,
})

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
			content: `Address ${address.value?.hash} - Celestia Explorer`,
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
			content: `Address ${address.value?.hash} - Celestia Explorer`,
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

onBeforeRouteLeave(() => {
	cacheStore.current.address = null
})

const displayName = computed(() => {
	const { $getDisplayName } = useNuxtApp()

	return $getDisplayName("address", address.value.hash)
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			v-if="address"
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/addresses', name: 'Addresses' },
				{ link: route.fullPath, name: `${displayName}` },
			]"
			:class="$style.breadcrumbs"
		/>

		<AddressOverview v-if="address" :address="address" />
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
