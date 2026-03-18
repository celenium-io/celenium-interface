<script setup></script>

<template>
	<iframe src="https://dev.celestials.id/celenium/iframe" :class="$style.iframe" />
</template>

<style module>
.iframe {
	width: calc(100% - 48px);
	height: 1000px;

	border: none;

	margin: 0 24px;
}
</style>
