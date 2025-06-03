<script setup>
const props = defineProps(["modelValue", "checked", "disabled", "value"])
const emit = defineEmits(["update:modelValue"])
</script>

<template>
	<Flex
		@click="emit('update:modelValue', value)"
		@keydown.enter="emit('update:modelValue', value)"
		align="center"
		gap="8"
		:class="[$style.wrapper, disabled && $style.disabled]"
		tabindex="0"
	>
		<Flex align="center" justify="center" :class="[$style.circle, modelValue === value && $style.active]">
			<div v-if="modelValue === value" :class="$style.dot" />
		</Flex>

		<slot />
	</Flex>
</template>

<style module>
.wrapper {
	cursor: pointer;

	&:hover {
		.circle {
			border-color: var(--op-10);
		}
	}

	&.disabled {
		cursor: not-allowed;

		& .circle {
			opacity: 0.5;
			background: var(--op-30);
		}
	}
}

.wrapper:focus-visible {
	outline: none;

	.circle {
		border: 1px solid var(--op-15);
	}

	.circle.active {
		background: var(--op-15);
	}
}

.circle {
	min-width: 14px;
	min-height: 14px;

	border-radius: 50px;
	border: 1px solid var(--op-5);
	background: rgba(0, 0, 0, 5%);

	transition: all 0.1s ease;

	&.active {
		background: var(--brand);
	}
}

.dot {
	width: 6px;
	height: 6px;

	border-radius: 50px;
	background: #000;
}
</style>
