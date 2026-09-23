<script setup>
const props = defineProps({
	height: {
		type: String,
		default: "28",
	},
	radius: {
		type: String,
		default: "6",
	},
	padding: {
		type: String,
		default: "6",
	},
	wide: {
		type: Boolean,
		default: false,
	},
})
</script>

<template>
	<Flex :style="{ height: `${height}px`, borderRadius: `${radius}px`, width: wide ? '100%' : '' }" :class="$style.wrapper">
		<Flex wide :style="{ borderRadius: `${radius - 1}px`, padding: `0 ${padding}px` }" :class="$style.inner">
			<slot />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;
	width: fit-content;
	z-index: 0;

	background: var(--outline-gradient);

	padding: 1px;

	.inner {
		height: 100%;

		background: var(--outline-background);

		padding: 0 8px;

		transition: all 0.1s ease;
	}

	&:hover {
		.inner {
			background: var(--outline-background-hover);
		}
	}
}
</style>
