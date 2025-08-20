<script setup>
const props = defineProps({
	update: Object,
})

console.log('update?.description?.split()', props.update?.description?.split('\n'));

</script>

<template>
	<Flex align="start" justify="start" direction="column" gap="16" wide :class="$style.wrapper">
		<Flex align="center" gap="8">
			<Icon :name="update?.kind === 'hardfork' ? 'merge' : 'node'" size="16" color="brand" />

			<Text size="14" weight="600" color="primary"> {{ update?.title }} </Text>
		</Flex>

		<Flex direction="column" align="start" justify="start" gap="8" :class="$style.description_wrapper">
			<Text v-for="d in update?.description?.split('\n')" size="12" weight="500" color="secondary" :class="$style.description"> {{ d }} </Text>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 16px 12px;

	min-width: 100%;
	min-height: 0;
	height: 302px;

	background: var(--card-background);
}

.description_wrapper {
	flex: 1;
	overflow: auto;
}

.description {
	/* display: -webkit-box; */
	line-height: 1.2;
}
</style>
