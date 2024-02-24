<script setup>
const wrapper = ref()
defineExpose({ wrapper })

const props = defineProps({
	action: {
		type: Object,
	},
	isFocused: {
		type: Boolean,
		default: false,
	},
})
</script>

<template>
	<Flex ref="wrapper" align="center" justify="between" :class="[$style.wrapper, isFocused && $style.focused]">
		<Flex align="center" gap="8" :class="$style.left">
			<Icon :name="action.icon" size="12" color="primary" :class="$style.icon" />

			<Text size="13" weight="500" height="13" color="primary" :class="$style.title">
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

	&:hover {
		background: var(--op-5);
	}

	&:active {
		background: var(--op-8);
	}

	&.focused {
		background: var(--op-8);
		outline: none;
	}
}

.left {
	min-width: 0;
}

.icon {
	box-sizing: content-box;

	border-radius: 5px;
	background: var(--op-10);

	padding: 4px;
}

.title {
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
