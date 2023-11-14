<script setup>
const props = defineProps({
	w: String,
	h: String,
})
</script>

<template>
	<div :style="{ width: `${w}px`, height: `${h}px` }" :class="$style.wrapper" />
</template>

<style module>
.wrapper {
	background: var(--op-10);
	border-radius: 50px;

	animation: skeleton 0.8s ease;
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
