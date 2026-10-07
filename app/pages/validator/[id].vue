<script setup>
/** Components: Modules */
import ValidatorCharts from "~/components/modules/validator/ValidatorCharts.vue"
import ValidatorOverview from "~/components/modules/validator/ValidatorOverview.vue"
import ValidatorUptime from "~/components/modules/validator/ValidatorUptime.vue"
import ValidatorVotingPowerHistory from "~/components/modules/validator/ValidatorVotingPowerHistory.vue"

/** Services */
import { isValidId } from "~/services/utils/index.js"

/** API */
import { fetchValidatorByID } from "~/services/api/validator.js"

/** Store */
import { useCacheStore } from "~/store/cache.store.js"

const cacheStore = useCacheStore()

const route = useRoute()

const validator = ref()
if (isValidId(route.params.id, "validator")) {
	const { data: rawValidator } = await fetchValidatorByID(route.params.id)

	if (!rawValidator.value) {
		throw createError({ statusCode: 404, statusMessage: `Validator ${route.params.id} not found` })
	} else {
		validator.value = rawValidator.value
		cacheStore.current.validator = validator.value
	}
} else {
	throw createError({ statusCode: 404, statusMessage: `Validator ${route.params.id} not found` })
}

defineOgImage("ValidatorImage", {
	title: "Validator",
	validator: validator.value,
	cacheKey: `${validator.value?.moniker || validator.value?.address?.hash}`,
})

useHead({
	title: `Validator ${validator.value?.moniker} - Celenium`,
	link: [
		{
			rel: "canonical",
			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Validator ${validator.value?.moniker} blocks, metadata, uptime, rates, social links, contacts and other data.`,
		},
		{
			property: "og:title",
			content: `Validator ${validator.value?.moniker} - Celenium`,
		},
		{
			property: "og:description",
			content: `Validator ${validator.value?.moniker} blocks, metadata, uptime, rates, social links, contacts and other data.`,
		},
		{
			property: "og:url",
			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
		{
			name: "twitter:title",
			content: `Validator ${validator.value?.moniker} - Celenium`,
		},
		{
			name: "twitter:description",
			content: `Validator ${validator.value?.moniker} blocks, metadata, uptime, rates, social links, contacts and other data.`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})
</script>

<template>
	<Flex direction="column" gap="16" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
			<Flex align="end" justify="between" :class="$style.breadcrumbs">
				<Breadcrumbs
					v-if="validator"
					:items="[
						{ link: '/', name: 'Explore' },
						{ link: '/validators', name: 'Validators' },
						{ link: route.fullPath, name: validator.address.hash },
					]"
				/>
			</Flex>

			<ValidatorOverview v-if="validator" :validator />
		</Flex>

		<Flex gap="16" :class="$style.uptime_history_tables">
			<ValidatorUptime v-if="validator" :validator />
			<ValidatorVotingPowerHistory v-if="validator" :validator />
		</Flex>

		<ValidatorCharts v-if="validator" :validator />
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

@media (max-width: 800px) {
	.uptime_history_tables {
		flex-direction: column;
	}
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
