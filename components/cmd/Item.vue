<script setup>
const props = defineProps({
	action: {
		type: Object,
	},
})
const emit = defineEmits(["onReturn"])

const onKeydown = () => {
	emit("onReturn", props.action)
}
</script>

<template>
	<Flex @keydown.enter="onKeydown" align="center" justify="between" :class="$style.wrapper" tabindex="1">
		<Flex align="center" gap="8">
			<Icon :name="action.icon" size="12" color="primary" :class="$style.icon" />

			<Text size="13" weight="500" color="primary">
				{{ action.title }}
			</Text>
		</Flex>

		<Text v-if="action.subtitle" size="12" weight="600" color="tertiary">
			{{ action.subtitle }}
		</Text>
	</Flex>
</template>

<style module>
.wrapper {
	height: 34px;

	border-radius: 6px;
	cursor: pointer;

	padding: 0 8px;

	transition: all 0.1s ease;

	&:hover {
		background: var(--op-5);
	}

	&:active {
		background: var(--op-8);
	}

	&:focus-visible {
		background: var(--op-8);
		outline: none;
	}
}

.icon {
	box-sizing: content-box;

	border-radius: 5px;
	background: var(--op-10);

	padding: 4px;
}
</style>
