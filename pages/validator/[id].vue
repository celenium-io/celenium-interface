<script setup>
/** Components: Modules */
import ValidatorOverview from "@/components/modules/validator/ValidatorOverview.vue"

/** API */
import { fetchValidatorByID } from "@/services/api/validator"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const validator = ref()
const { data: rawValidator } = await fetchValidatorByID(route.params.id)

if (!rawValidator.value) {
	router.push("/")
} else {
	validator.value = rawValidator.value
	cacheStore.current.validator = validator.value
}

defineOgImageComponent("ValidatorImage", {
	title: "Validator",
	validator: validator.value,
	cacheKey: `${validator.value?.moniker || validator.value.address.hash}`,
})

useHead({
	title: `Validator ${validator.value?.moniker} - Celestia Explorer`,
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
			content: `Validator ${validator.value?.moniker} - Celestia Explorer`,
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
			content: `Validator ${validator.value?.moniker} - Celestia Explorer`,
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
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
			<Flex align="end" justify="between" :class="$style.breadcrumbs">
				<Breadcrumbs
					v-if="validator"
					:items="[
						{ link: '/', name: 'Explore' },
						{ link: '/validators', name: 'Validators' },
						{ link: route.fullPath, name: validator.moniker ? validator.moniker : validator.address },
					]"
				/>
			</Flex>

			<ValidatorOverview v-if="validator" :validator="validator" />
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
