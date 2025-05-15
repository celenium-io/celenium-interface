<script setup>
defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	title: String,
	series: Object,
})

const bgStyles = computed(() => {
	return {
		style: {
			filter: "grayscale(1)",
			opacity: "0.05",
		},
	}
})
</script>

<template>
	<div class="w-full h-full" :style="{ background: '#111111', padding: '80px', fontFamily: 'IBM+Plex+Mono', overflow: 'hidden' }">
		<img src="/img/stats_bg.png" width="1200" height="600" class="absolute" v-bind="bgStyles" />

			<div class="flex flex-row items-center" :style="{ height: '100%' }">
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.9)' }">stats</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">('</span>
				<span :style="{ fontSize: '50px', color: '#FF8351' }">
					{{ series.title }}
				</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">')</span>
			</div>
		</div>
</template>
