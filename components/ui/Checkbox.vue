<script setup>
const props = defineProps(["modelValue"])
const emit = defineEmits(["update:modelValue"])
</script>

<template>
	<Flex @click="emit('update:modelValue', !modelValue)" align="center" gap="8" :class="$style.wrapper">
		<Flex align="center" justify="center" :class="[$style.checkbox, modelValue && $style.active]">
			<Icon v-if="modelValue" name="check" size="12" color="primary" />
		</Flex>

		<slot />
	</Flex>
</template>

<style module>
.wrapper {
	cursor: pointer;

	&:hover {
		.checkbox {
			border-color: var(--op-10);
		}
	}
}

.checkbox {
	width: 14px;
	height: 14px;

	border-radius: 4px;
	border: 1px solid var(--op-5);
	background: rgba(0, 0, 0, 5%);

	transition: all 0.1s ease;

	&.active {
		background: var(--blue);
	}
}
</style>
