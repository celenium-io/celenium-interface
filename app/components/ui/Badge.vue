<script setup>
defineProps({
	size: { type: String, default: "medium" },
	border: { type: Boolean, default: true },
})
</script>

<template>
	<Flex align="center" gap="8" :class="[$style.wrapper, $style[size], border && $style.border]">
		<slot />
	</Flex>
</template>

<style module>
.wrapper {
	background: linear-gradient(var(--op-8), var(--op-3));

	border-radius: 6px;

	&.border {
		box-shadow: inset 0 0 0 1px var(--op-5);
	}

	&.medium {
		height: 26px;

		padding: 0 8px;
	}
	&.small {
		height: 20px;

		padding: 0 6px;
	}
}
</style>
