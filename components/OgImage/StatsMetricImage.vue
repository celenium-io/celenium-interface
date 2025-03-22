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
			position: "absolute",
			top: "0",
			left: "0",
		},
	}
})
</script>

<template>
	<div class="w-full h-full" :style="{ background: '#111111', padding: '100px 120px', fontFamily: 'IBM+Plex+Mono' }">
		<img src="/img/stats_bg.png" v-bind="bgStyles" />

		<div :style="{ height: '100%', display: 'flex', flexDirection: 'column', gap: '80px' }">
			<div :style="{ display: 'flex', alignItems: 'center' }">
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.9)' }">stats</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">('</span>
				<span :style="{ fontSize: '50px', color: '#FF8351' }">
					{{ series.title }}
				</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">')</span>
			</div>
		</div>
	</div>
</template>
