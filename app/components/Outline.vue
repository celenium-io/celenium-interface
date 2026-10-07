<script setup>
const props = defineProps({
	height: {
		type: String,
		default: "28",
	},
	radius: {
		type: String,
		default: "8",
	},
	padding: {
		type: String,
		default: "6",
	},
	wide: {
		type: Boolean,
		default: false,
	},
	hoverEffect: {
		type: Boolean,
		default: true,
	},
})
</script>

<template>
	<Flex
		:style="{ height: `${height}px`, borderRadius: `${radius}px`, width: wide ? '100%' : '' }"
		:class="[$style.wrapper, hoverEffect && $style.hoverEffect]"
	>
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

	cursor: default;
	user-select: none;
	background: var(--outline-gradient);

	padding: 1px;

	.inner {
		height: 100%;

		background: var(--outline-background);

		padding: 0 8px;

		transition: all 0.1s ease;
	}

	&.hoverEffect {
		&:hover {
			.inner {
				background: var(--outline-background-hover);
			}
		}
	}
}
</style>
