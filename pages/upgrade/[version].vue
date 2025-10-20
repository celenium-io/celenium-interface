<script setup>
/** Components: Modules */
import UpgradeOverview from "@/components/modules/upgrade/UpgradeOverview.vue"

/** Services */
import { isValidId } from "@/services/utils"

/** API */
import { fetchValidatorsUpgradeByVersion } from "@/services/api/validator"

/** Store */
import { useCacheStore } from "@/store/cache.store"
const cacheStore = useCacheStore()

const route = useRoute()

const upgrade = ref()

if (isValidId(route.params.version, "upgrade_version")) {
	const { data } = await fetchValidatorsUpgradeByVersion(route.params.version)
    
    if (data.value) {
        upgrade.value = data.value
        cacheStore.current.upgrade = upgrade.value
    } else {
        throw createError({ statusCode: 404, statusMessage: `Upgrade to version ${route.params.version} not found` })
    }
} else {
	throw createError({ statusCode: 404, statusMessage: `Upgrade to version ${route.params.version} not found` })
}

// defineOgImageComponent("ValidatorImage", {
// 	title: "Validator",
// 	validator: validator.value,
// 	cacheKey: `${validator.value?.moniker || validator.value?.address?.hash}`,
// })

// useHead({
// 	title: `Validator ${validator.value?.moniker} - Celenium`,
// 	link: [
// 		{
// 			rel: "canonical",
// 			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
// 		},
// 	],
// 	meta: [
// 		{
// 			name: "description",
// 			content: `Validator ${validator.value?.moniker} blocks, metadata, uptime, rates, social links, contacts and other data.`,
// 		},
// 		{
// 			property: "og:title",
// 			content: `Validator ${validator.value?.moniker} - Celenium`,
// 		},
// 		{
// 			property: "og:description",
// 			content: `Validator ${validator.value?.moniker} blocks, metadata, uptime, rates, social links, contacts and other data.`,
// 		},
// 		{
// 			property: "og:url",
// 			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
// 		},
// 		{
// 			name: "twitter:title",
// 			content: `Validator ${validator.value?.moniker} - Celenium`,
// 		},
// 		{
// 			name: "twitter:description",
// 			content: `Validator ${validator.value?.moniker} blocks, metadata, uptime, rates, social links, contacts and other data.`,
// 		},
// 		{
// 			name: "twitter:card",
// 			content: "summary_large_image",
// 		},
// 	],
// })
</script>

<template>
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
			<Flex align="end" justify="between" :class="$style.breadcrumbs">
				<Breadcrumbs
					v-if="upgrade"
					:items="[
						{ link: '/', name: 'Explore' },
						{ link: '/upgrades', name: 'Upgrades' },
						{ link: route.fullPath, name: `Version ${upgrade?.version}` },
					]"
				/>
			</Flex>

			<UpgradeOverview v-if="upgrade" :upgrade="upgrade" />
		</Flex>
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
