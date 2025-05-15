<script setup>
/** Components: Modules */
import NamespaceOverview from "@/components/modules/namespace/NamespaceOverview.vue"
import NamespaceCharts from "@/components/modules/namespace/NamespaceCharts.vue"

/** Services */
import { getNamespaceID } from "@/services/utils"

/** API */
import { fetchNamespaceByID } from "@/services/api/namespace"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const namespace = ref()
const { data: rawNamespace } = await fetchNamespaceByID(route.params.id)

if (!rawNamespace.value) {
	router.push("/")
} else {
	namespace.value = rawNamespace.value[0]
	cacheStore.current.namespace = namespace.value
}

defineOgImageComponent("NamespaceImage", {
	title: "Namespace",
	namespace: namespace.value,
	cacheKey: `${namespace.value?.hash}`,
})

useHead({
	title: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} - Celestia Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://celenium.io${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} blobs, messages, metadata and other data.`,
		},
		{
			property: "og:title",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} - Celestia Explorer`,
		},
		{
			property: "og:description",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} blobs, messages, metadata and other data.`,
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
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} - Celestia Explorer`,
		},
		{
			name: "twitter:description",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} blobs, messages, metadata and other data.`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})

onBeforeRouteLeave(() => {
	cacheStore.current.namespace = null
})

const displayName = computed(() => {
	const { $getDisplayName } = useNuxtApp()

	return $getDisplayName("namespace", namespace.value.namespace_id)
})
</script>

<template>
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
			<Breadcrumbs
				v-if="namespace"
				:items="[
					{ link: '/', name: 'Explore' },
					{ link: '/namespaces', name: 'Namespaces' },
					{ link: route.fullPath, name: `${displayName}` },
				]"
			/>

			<NamespaceOverview v-if="namespace" :namespace="namespace" />
		</Flex>

		<NamespaceCharts v-if="namespace" :id="namespace.namespace_id" />
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
