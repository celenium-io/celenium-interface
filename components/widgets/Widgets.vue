<script setup>
/** Components: Widgets */
import BlockWidget from "./BlockWidget.vue"
import BlobsWidget from "./BlobsWidget.vue"
import NetworkWidget from "./NetworkWidget.vue"
import TransactionsWidget from "./TransactionsWidget.vue"
import ValidatorsWidget from "./ValidatorsWidget.vue"
</script>

<template>
	<Flex gap="20" :class="$style.wrapper">
		<Flex direction="column" gap="20" wide :class="$style.column">
			<BlockWidget />
			<BlobsWidget />
		</Flex>

		<NetworkWidget />

		<Flex direction="column" gap="20" wide :class="$style.column">
			<TransactionsWidget />
			<ValidatorsWidget />
		</Flex>
	</Flex>
</template>

<style module>
.column {
	min-width: 368px;
}
</style>
