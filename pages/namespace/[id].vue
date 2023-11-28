<script setup>
/** Components: Modules */
import NamespaceOverview from "@/components/modules/namespace/NamespaceOverview.vue"

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

defineOgImage({
	title: "Namespace",
	namespace: namespace.value,
	component: "NamespaceImage",
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
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			v-if="namespace"
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/namespaces', name: 'Namespaces' },
				{ link: route.fullPath, name: `${getNamespaceID(namespace.namespace_id)}` },
			]"
			:class="$style.breadcrumbs"
		/>

		<NamespaceOverview v-if="namespace" :namespace="namespace" />
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
