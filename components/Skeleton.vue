<script setup>
const props = defineProps({
	w: String,
	h: String,
	r: {
		type: String,
		default: "50",
	},
})
</script>

<template>
	<div :style="{ width: `${w}px`, height: `${h}px`, borderRadius: `${r}px` }" :class="$style.wrapper" />
</template>

<style module>
.wrapper {
	background: var(--op-10);

	animation: skeleton 1s ease infinite;
}

@keyframes skeleton {
	0% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}

	100% {
		opacity: 1;
	}
}
</style>
