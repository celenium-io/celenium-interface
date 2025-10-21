<script setup>
/** Components: Modules */
import UpgradeOverview from "@/components/modules/upgrade/UpgradeOverview.vue"

/** Services */
import { isValidId } from "@/services/utils"

/** API */
import { fetchHead } from "@/services/api/main"
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
        if (!upgrade.value.tx_hash) {
            const head = await fetchHead()
            if (head) {
                upgrade.value.voting_power = head.total_voting_power
            }
        }

        upgrade.value.votedShare = parseFloat(upgrade.value.voted_power) * 100 / parseFloat(upgrade.value.voting_power)
        cacheStore.current.upgrade = upgrade.value
    } else {
        throw createError({ statusCode: 404, statusMessage: `Upgrade to version ${route.params.version} not found` })
    }
} else {
	throw createError({ statusCode: 404, statusMessage: `Upgrade to version ${route.params.version} not found` })
}

defineOgImageComponent("UpgradeImage", {
	title: "Upgrade",
	upgrade: upgrade.value,
	cacheKey: `${upgrade.value?.version}`,
})

useHead({
	title: `Celestia Node Upgrade to version ${upgrade.value?.version} - Celenium`,
	link: [
		{
			rel: "canonical",
			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Upgrade v${upgrade.value?.version} signals, metadata, stake, voting, progress and other data.`,
		},
		{
			property: "og:title",
			content: `Celestia Node Upgrade to version ${upgrade.value?.version} - Celenium`,
		},
		{
			property: "og:description",
			content: `Upgrade v${upgrade.value?.version} signals, metadata, stake, voting, progress and other data.`,
		},
		{
			property: "og:url",
			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
		{
			name: "twitter:title",
			content: `Celestia Node Upgrade to version ${upgrade.value?.version} - Celenium`,
		},
		{
			name: "twitter:description",
			content: `Upgrade v${upgrade.value?.version} signals, metadata, stake, voting, progress and other data.`,
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
