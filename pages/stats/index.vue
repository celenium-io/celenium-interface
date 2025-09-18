<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"

/** Stats Tabs */
import BlocksTab from "@/components/modules/stats/tabs/BlocksTab.vue"
import GeneralTab from "@/components/modules/stats/tabs/GeneralTab.vue"
import NodesTab from "~/components/modules/stats/tabs/NodesTab.vue"
import RollupsTab from "@/components/modules/stats/tabs/RollupsTab.vue"

/** Services */
import { capitilize, isMainnet } from "@/services/utils"
import { nodeStatsURL } from "@/services/config"

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
			content: "Celestia Blockchain statistics. Explore data on blocks, transactions, networks, blobs and more.",
		},
		{
			property: "og:title",
			content: "Statistics - Celestia Explorer",
		},
		{
			property: "og:description",
			content: "Celestia Blockchain statistics. Explore data on blocks, transactions, networks, blobs and more.",
		},
		{
			property: "og:url",
			content: "https://celenium.io/stats",
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
			content: "Celestia Blockchain statistics. Explore data on blocks, transactions, networks, blobs and more.",
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

const tabs = ref([
	{
		name: "general",
		visible: true,
	},
	{
		name: "blocks",
		visible: true,
	},
	{
		name: "networks",
		visible: true,
	},
	{
		name: "nodes",
		visible: isMainnet() && !!nodeStatsURL(),
	},
])
const activeTab = ref(
	route.query.tab &&
		tabs.value
			.filter((t) => t.visible)
			.map((t) => t.name)
			.includes(route.query.tab)
		? route.query.tab
		: tabs.value[0].name,
)

const updateRouteQuery = () => {
	router.replace({
		query: {
			tab: activeTab.value,
		},
	})
}

const handleSectionUpdate = (event) => {
	router.replace({
		query: {
			tab: activeTab.value,
			section: event,
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
	},
)

watch(
	() => route.query,
	() => {
		if (route.query.tab) activeTab.value = route.query.tab
	},
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
			<Text as="h1" size="16" weight="600" color="primary">Celestia Statistics</Text>
		</Flex>

		<Flex align="center" justify="between" wide :class="$style.tabs_wrapper">
			<Flex align="center" gap="16">
				<Text
					v-for="t in tabs.filter((t) => t.visible)"
					@click="activeTab = t.name"
					size="14"
					color="tertiary"
					:class="[$style.tab, activeTab === t.name && $style.tab_active]"
				>
					{{ capitilize(t.name) }}
				</Text>
			</Flex>

			<Flex v-if="activeTab === 'networks'" align="start" :class="$style.actions">
				<Button link="/networks" type="secondary" size="mini">
					<Icon name="rollup-leaderboard" size="12" color="secondary" />
					Networks Leaderboard
				</Button>
			</Flex>
		</Flex>

		<GeneralTab v-if="activeTab === 'general'" />
		<BlocksTab v-if="activeTab === 'blocks'" />
		<RollupsTab v-if="activeTab === 'networks'" @onUpdateSection="handleSectionUpdate" />
		<NodesTab v-if="activeTab === 'nodes'" />
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 20px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.header {
	margin-bottom: 16px;
}

.tabs_wrapper {
	position: relative;
}

.tabs_wrapper::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 2px;
	background-color: var(--op-5);
}

.tab {
	padding-bottom: 12px;

	cursor: pointer;
}

.tab_active {
	color: var(--txt-primary);

	border-bottom: solid 3px var(--txt-primary);
}

.actions {
	transform: translateY(-8px);
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
