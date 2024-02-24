<script setup>
/** Components: Modules */
import ValidatorOverview from "@/components/modules/validator/ValidatorOverview.vue"

/** API */
import { fetchValidatorByID } from "@/services/api/validator";

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

defineOgImage({
	title: "Validator",
	validator: validator.value,
	component: "ValidatorImage",
	cacheKey: `${validator.value?.moniker}`,
})

useHead({
	title: `Validator ${validator.value?.moniker} - Celestia Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://celenium.io${route.path}`,
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
			content: `https://celenium.io${route.path}`,
		},
		{
			property: "og:image",
			content: `https://celenium.io${route.path}__og_image__/og.png`,
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

				<!-- <Button link="https://forms.gle/nimJyQJG4Lb4BTcG7" target="_blank" type="secondary" size="mini">
					<Icon name="rollup-plus" size="12" color="secondary" /> Rollup Registration
				</Button> -->
			</Flex>
			<ValidatorOverview v-if="validator" :validator="validator" />
		</Flex>

		<!-- <RollupCharts v-if="rollup" :id="rollup.id" /> -->
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>