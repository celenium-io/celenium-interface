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
				<Icon name="edit" size="14" color="primary" />
				<Text size="13" weight="600" color="primary">Proposed Changes</Text>
			</Flex>
		</Flex>

		<div :class="$style.content">
			<Flex v-if="Array.isArray(proposal.changes)" gap="16" :class="$style.changes">
				<Flex v-for="change in proposal.changes" wide direction="column" gap="4" :class="$style.change">
					<Flex justify="between" align="center" :class="$style.key">
						<Text size="13" weight="600" color="primary" mono> {{ change.key }} </Text>
						<Text size="13" weight="600" color="tertiary" mono> {{ change.subspace }} </Text>
					</Flex>

					<div :class="$style.value">
						<Text as="pre" size="13" weight="600" height="140" color="secondary" mono :class="$style.value_text">
							{{ JSON.parse(change.value) }}
						</Text>

						<CopyButton :text="change.value" :class="$style.copy_icon" />
					</div>
				</Flex>
			</Flex>
			<TablePlaceholderView
				v-else
				title="There's no changes"
				description="This proposal does not contain any changes."
				icon="edit"
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

.change {
	flex: 1;
}

.key {
	border-radius: 8px 8px 4px 4px;
	background: var(--app-background);

	padding: 12px;
}

.value {
	height: 100%;
	position: relative;

	border-radius: 4px 4px 8px 8px;
	background: var(--app-background);

	padding: 12px;
}

.value_text {
	white-space: pre-wrap;
}

.copy_icon {
	position: absolute;
	top: 12px;
	right: 12px;
}

@media (max-width: 700px) {
	.changes {
		flex-direction: column;
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
