<script setup>
/** Components: Modules */
import ChainOverview from "@/components/modules/ibc/ChainOverview.vue"

/** Services */
import { IbcChainName } from "@/services/constants/ibc"

/** API */
import { fetchIbcChainsStats } from "@/services/api/stats"

const route = useRoute()
const router = useRouter()

const { data } = await useAsyncData(`ibc-chains`, () => fetchIbcChainsStats({ limit: 100 }))
const chain = ref(data.value.find((c) => c.chain === route.params.id))

if (!chain.value) {
	router.push("/")
}

useHead({
	title: `Chain ${IbcChainName[chain.value.chain] ?? chain.value.chain} - Celenium`,
	link: [
		{
			rel: "canonical",
			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `IBC Chain ${chain.value.chain} information`,
		},
		{
			property: "og:title",
			content: `Chain ${IbcChainName[chain.value.chain] ?? chain.value.chain} - Celenium`,
		},
		{
			property: "og:description",
			content: `IBC Chain ${chain.value.chain} information`,
		},
		{
			property: "og:url",
			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
		{
			name: "twitter:title",
			content: `Chain ${IbcChainName[chain.value.chain] ?? chain.value.chain} - Celenium`,
		},
		{
			name: "twitter:description",
			content: `IBC Chain ${chain.value.chain} information`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})
</script>

<template>
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
			<Breadcrumbs
				v-if="chain"
				:items="[
					{ link: '/', name: 'Explore' },
					{ link: '/ibc', name: 'IBC' },
					{ link: '/ibc/chains', name: 'Chains' },
					{ link: route.fullPath, name: chain.chain },
				]"
				:class="$style.breadcrumbs"
			/>

			<ChainOverview v-if="chain" :chain />
		</Flex>

		<!-- Clients & Connections & Channels -->
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
