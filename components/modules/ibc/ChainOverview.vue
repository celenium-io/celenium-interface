<script setup>
/** Services */
import { IbcChainName, IbcChainLogo } from "@/services/constants/ibc"

/** Components */
import ChainTransfersTable from "./ChainTransfersTable.vue"
import ChainClientsTable from "./ChainClientsTable.vue"

const route = useRoute()
const router = useRouter()

const props = defineProps({
	chain: {
		type: Object,
		required: true,
	},
})

const preselectedTab = route.query.tab && ["transfers", "clients"].includes(route.query.tab) ? route.query.tab : "transfers"
const activeTab = ref(preselectedTab)

watch(
	() => activeTab.value,
	() =>
		router.replace({
			query: {
				tab: activeTab.value,
			},
		}),
)

onMounted(async () => {
	router.replace({
		query: {
			tab: activeTab.value,
		},
	})
})
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<img :src="IbcChainLogo[chain.chain] ?? IbcChainLogo['_unknown']" width="14px" height="14px" />
				<Text as="h1" size="13" weight="600" color="primary">
					Chain <Text color="secondary">{{ IbcChainName[chain.chain] ?? chain.chain }}</Text>
				</Text>
			</Flex>
		</Flex>

		<Flex direction="column" gap="4" wide :class="$style.content">
			<Flex align="center" justify="between" :class="$style.tabs_wrapper">
				<Flex gap="4" :class="$style.tabs">
					<Flex
						@click="activeTab = 'transfers'"
						align="center"
						gap="6"
						:class="[$style.tab, activeTab === 'transfers' && $style.active]"
					>
						<Icon name="arrow-narrow-up-right-circle" size="12" color="secondary" />
						<Text size="13" weight="600">Transfers</Text>
					</Flex>

					<Flex
						@click="activeTab = 'clients'"
						align="center"
						gap="6"
						:class="[$style.tab, activeTab === 'clients' && $style.active]"
					>
						<Icon name="address" size="12" color="secondary" />
						<Text size="13" weight="600">Clients</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex v-if="activeTab === 'transfers'" :class="$style.inner">
				<ChainTransfersTable :chain />
			</Flex>
			<Flex v-if="activeTab === 'clients'" :class="$style.inner">
				<ChainClientsTable :chain />
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.header {
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
}

.content {
	min-width: 0;
}

.tabs_wrapper {
	min-height: 44px;
	overflow-x: auto;

	border-radius: 4px;
	background: var(--card-background);

	padding: 0 8px;
}

.tabs_wrapper::-webkit-scrollbar {
	display: none;
}

.tab {
	height: 28px;

	cursor: pointer;
	border-radius: 6px;

	padding: 0 8px;

	transition: all 0.1s ease;

	& span {
		color: var(--txt-tertiary);

		transition: all 0.1s ease;
	}

	&:hover {
		& span {
			color: var(--txt-secondary);
		}
	}
}

.tab.active {
	background: var(--op-8);

	& span {
		color: var(--txt-primary);
	}
}

.inner {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);
}

.events {
	padding: 16px;
}

.message_types {
	width: fit-content;

	border-radius: 50px;
	background: var(--op-5);
	border: 1px solid var(--op-5);

	padding: 6px 10px;
	margin-bottom: 8px;
}

.event {
	height: 36px;

	cursor: pointer;

	& .left {
		height: 100%;

		& div {
			width: 2px;
			height: 100%;
			background: var(--op-5);
		}
	}

	& .left.first {
		& div {
			&:first-child {
				background: transparent;
			}
		}
	}

	& .left.last {
		& div {
			&:last-child {
				background: transparent;
			}
		}
	}

	& .right {
		min-width: 0;
		height: 100%;

		border-bottom: 1px solid var(--op-5);

		& .text {
			display: inline-block;
			color: var(--txt-tertiary);

			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			& > * {
				margin-right: 4px;
			}

			& .tooltip {
				display: inline-block;
			}
		}
	}
}

.memo {
	text-overflow: ellipsis;
	overflow: hidden;
}

@media (max-width: 800px) {
	.content {
		grid-template-columns: 1fr;
	}

	.data {
		max-width: initial;
		min-width: 0;

		border-radius: 4px;
	}
}

@media (max-width: 550px) {
	.header {
		height: initial;
		flex-direction: column;
		gap: 12px;

		padding: 12px 0;
	}
}

@media (max-width: 500px) {
	.data {
		.main {
			min-width: initial;
		}
	}
}

@media (max-width: 400px) {
	.tabs_wrapper {
		overflow-x: auto;

		&::-webkit-scrollbar {
			display: none;
		}
	}
}
</style>
