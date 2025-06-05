<script setup>
/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

const props = defineProps({
	proposal: {
		type: Object,
		required: true,
	},
})
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
				<Text as="pre" size="14" height="160" weight="500" color="body" :class="[$style.description]">
					{{ proposal.description }}
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
	white-space: pre-line;
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
