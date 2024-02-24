<script setup>
/** Services */
import { getNamespaceID, formatBytes } from "@/services/utils"

defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	title: String,
	rollup: Object,
})

const bgStyles = computed(() => {
	return {
		style: {
			position: "absolute",
			top: "0",
			left: "0",
			filter: "grayscale(1)",
			opacity: "0.05",
		},
	}
})
</script>

<template>
	<div class="w-full h-full" :style="{ background: '#111111', padding: '100px 120px', fontFamily: 'IBM+Plex+Mono' }">
		<img src="/img/bg.png" v-bind="bgStyles" />

		<div :style="{ height: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }">
			<div :style="{ display: 'flex', alignItems: 'center' }">
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.9)' }">rollup</span>
			</div>

			<span :style="{ fontSize: '46px', color: 'rgba(255,255,255, 0.9)' }">
				{{ rollup.name }}
			</span>

			<div :style="{ display: 'flex', flexDirection: 'column', gap: '24px' }">
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Size: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ formatBytes(rollup.size) }} </span>
				</div>
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Blobs: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ rollup.blobs_count }} </span>
				</div>
			</div>
		</div>
	</div>
</template>
