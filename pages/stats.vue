<script setup>
/** Stats Tabs */
import BlocksTab from "@/components/modules/stats/tabs/BlocksTab.vue"
import GeneralTab from "@/components/modules/stats/tabs/GeneralTab.vue"
import RollupsTab from "@/components/modules/stats/tabs/RollupsTab.vue"

useHead({
	title: "Statistics - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/stats",
		},
	],
	meta: [
		{
			name: "description",
			content: "Celestia Blockchain statistics. Explore data on blocks, transactions, rollups, blobs and more.",
		},
		{
			property: "og:title",
			content: "Statistics - Celestia Explorer",
		},
		{
			property: "og:description",
			content: "Celestia Blockchain statistics. Explore data on blocks, transactions, rollups, blobs and more.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/addresses`,
		},
		{
			property: "og:image",
			content: "/img/seo/stats.png",
		},
		{
			name: "twitter:title",
			content: "Statistics - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content: "Celestia Blockchain statistics. Explore data on blocks, transactions, rollups, blobs and more.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/stats.png",
		},
	],
})

const route = useRoute()
const router = useRouter()

const tabs = ref(['General', 'Blocks', 'Rollups', 'Finance'])
const activeTab = ref(route.query.tab && tabs.value.includes(route.query.tab) ? route.query.tab : tabs.value[0])

const updateRouteQuery = () => {
	router.replace({
		query: {
			tab: activeTab.value,
		},
	})
}

onMounted(() => {
	updateRouteQuery()
})

watch(
	() => activeTab.value,
	() => {
		updateRouteQuery()
	}
)

</script>

<template>
	<Flex direction="column" gap="12" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/stats', name: `Statistics` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex align="center" gap="8" :class="$style.header">
			<Icon name="bar-chart" size="16" color="secondary" />
			<Text size="16" weight="600" color="primary">Celestia Statistics</Text>
		</Flex>

		<Flex align="center" gap="16" :class="$style.tabs_wrapper">
			<Text v-for="t in tabs" @click="activeTab = t" size="14" color="tertiary" :class="[$style.tab, activeTab === t && $style.tab_active]">
				{{ t }}
			</Text>
		</Flex>

		<GeneralTab v-if="activeTab === 'General'" />
		<BlocksTab v-if="activeTab === 'Blocks'" />
		<RollupsTab v-if="activeTab === 'Rollups'" />
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

.header {
	margin-bottom: 16px;
}

.tabs_wrapper {
	border-bottom: solid 3px var(--op-5);
}

.tab {
	padding-bottom: 16px;
	
	cursor: pointer;
}

.tab_active {
	color: var(--txt-primary);

	border-bottom: solid 3px var(--txt-primary);
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}

	.header {
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}
</style>
