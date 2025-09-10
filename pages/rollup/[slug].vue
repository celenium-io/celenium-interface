<script setup>
/** Components: Modules */
import RollupOverview from "@/components/modules/rollup/RollupOverview.vue"
import RollupCharts from "@/components/modules/rollup/RollupCharts.vue"

/** API */
import { fetchRollupBySlug } from "@/services/api/rollup"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Store */
import { useAppStore } from "@/store/app.store"
import { useCacheStore } from "@/store/cache.store"
const appStore = useAppStore()
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const rollup = ref()
const { data: rawRollup } = await fetchRollupBySlug(route.params.slug)

if (!rawRollup.value) {
	router.push("/rollups")
} else {
	rollup.value = rawRollup.value
	patchRollupColor()
	cacheStore.current.rollup = rollup.value
}

function patchRollupColor() {
	if (!rollup.value) return

	if (appStore.theme === "light" && rollup.value.color === "#FFFFFF") {
		rollup.value.originColor = rollup.value.color
		rollup.value.color = "#8b8c8d"
	} else if (rollup.value.originColor) {
		rollup.value.color = rollup.value.originColor
	}
}

defineOgImageComponent("RollupImage", {
	title: "Rollup",
	rollup: rollup.value,
	cacheKey: `${rollup.value?.name}`,
})

useHead({
	title: `Rollup ${rollup.value?.name} - Celenium`,
	link: [
		{
			rel: "canonical",
			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
		},
		{
			property: "og:title",
			content: `Rollup ${rollup.value?.name} - Celenium`,
		},
		{
			property: "og:description",
			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
		},
		{
			property: "og:url",
			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
		{
			name: "twitter:title",
			content: `Rollup ${rollup.value?.name} - Celenium`,
		},
		{
			name: "twitter:description",
			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})

watch(
	() => appStore.theme,
	() => patchRollupColor(),
)
</script>

<template>
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
			<Flex justify="between" :class="$style.breadcrumbs">
				<Breadcrumbs
					v-if="rollup"
					:items="[
						{ link: '/', name: 'Explore' },
						{ link: '/rollups', name: 'Rollups Leaderboard' },
						{ link: route.fullPath, name: rollup.name },
					]"
				/>

				<Button link="https://forms.gle/nimJyQJG4Lb4BTcG7" target="_blank" type="secondary" size="mini">
					<Icon name="rollup-plus" size="12" color="secondary" /> Register rollup
				</Button>
			</Flex>

			<RollupOverview v-if="rollup" :rollup="rollup" />
		</Flex>

		<RollupCharts v-if="rollup" :rollup="rollup" />
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
