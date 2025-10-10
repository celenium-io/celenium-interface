<script setup>
/** Components: Modules */
import NamespaceOverview from "@/components/modules/namespace/NamespaceOverview.vue"
import NamespaceCharts from "@/components/modules/namespace/NamespaceCharts.vue"

/** Services */
import { getNamespaceID, isValidId } from "@/services/utils"

/** API */
import { fetchNamespaceByID } from "@/services/api/namespace"

/** Store */
import { useCacheStore } from "@/store/cache.store"
const cacheStore = useCacheStore()

const route = useRoute()

const namespace = ref()

if (isValidId(route.params.id, "namespace")) {
	const { data: rawNamespace } = await fetchNamespaceByID(route.params.id)

	if (!rawNamespace.value) {
		throw createError({ statusCode: 404, statusMessage: `Namespace ${route.params.id} not found` })
	} else {
		namespace.value = rawNamespace.value[0]
		cacheStore.current.namespace = namespace.value
	}
} else {
	throw createError({ statusCode: 404, statusMessage: `Namespace ${route.params.id} not found` })
}

defineOgImageComponent("NamespaceImage", {
	title: "Namespace",
	namespace: namespace.value,
	cacheKey: `${namespace.value?.hash}`,
})

useHead({
	title: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} - Celenium`,
	link: [
		{
			rel: "canonical",
			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} blobs, messages, metadata and other data.`,
		},
		{
			property: "og:title",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} - Celenium`,
		},
		{
			property: "og:description",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} blobs, messages, metadata and other data.`,
		},
		{
			property: "og:url",
			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
		{
			name: "twitter:title",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} - Celenium`,
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
</script>

<template>
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
			<Breadcrumbs
				v-if="namespace"
				:items="[
					{ link: '/', name: 'Explore' },
					{ link: '/namespaces', name: 'Namespaces' },
					{ link: route.fullPath, name: `${getNamespaceID(namespace.namespace_id)}` },
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
