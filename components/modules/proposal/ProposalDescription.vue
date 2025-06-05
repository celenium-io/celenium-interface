<script setup>
/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

const props = defineProps({
	proposal: {
		type: Object,
		required: true,
	},
})

const expanded = ref(false)
</script>

<template>
	<Flex direction="column" gap="4">
		<Flex align="center" :class="$style.header">
			<Flex align="center" gap="8">
				<Icon name="menu" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Description</Text>
			</Flex>
		</Flex>

		<div :class="$style.content">
			<Flex v-if="proposal.description" direction="column" gap="16">
				<Text as="pre" size="14" height="160" weight="500" color="body" :class="[$style.description, expanded && $style.expanded]">
					{{ proposal.description }}
				</Text>

				<Text @click="expanded = !expanded" size="13" weight="600" color="brand" class="clickable">
					{{ expanded ? "Hide" : "Show full description" }}
				</Text>
			</Flex>

			<TablePlaceholderView
				v-else
				title="There's no description"
				description="This proposal does not contain any description."
				icon="menu"
				subIcon="search"
				:descriptionWidth="260"
			/>
		</div>
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
	min-height: 44px;
	overflow-x: auto;

	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	padding: 16px;
}

.description {
	display: -webkit-box;
	-webkit-line-clamp: 6;
	-webkit-box-orient: vertical;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: pre-line;

	&.expanded {
		-webkit-line-clamp: initial;
	}
}

@media (max-width: 400px) {
	.content {
		overflow-x: auto;

		&::-webkit-scrollbar {
			display: none;
		}
	}
}
</style>
