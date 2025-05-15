<script setup>
/** Components: Modules */
import AddressOverview from "@/components/modules/address/AddressOverview.vue"
import AddressCharts from "@/components/modules/address/AddressCharts.vue"

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

defineOgImageComponent("AddressImage", {
	title: "Address",
	address: address.value,
	cacheKey: `${address.value?.hash.slice(-4)}-${address.value?.balance.spendable}-${address.value?.first_height}-${
		address.value?.last_height
	}`,
})

useHead({
	title: `Address ${address.value?.hash} - Celestia Explorer`,
	link: [
		{
			rel: "canonical",
			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
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
			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
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
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
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

		<AddressCharts v-if="address" :hash="address.hash" />
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
