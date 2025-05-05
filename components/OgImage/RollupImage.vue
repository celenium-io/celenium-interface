<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma, formatBytes } from "@/services/utils"

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
			inset: "0",
			filter: "grayscale(1)",
			opacity: "0.05",
		},
	}
})
</script>

<template>
	<div class="w-full h-full" :style="{ background: '#111111', padding: '100px 120px', fontFamily: 'IBM+Plex+Mono' }">
		<img src="/img/bg.png" v-bind="bgStyles" />

		<div :style="{ height: '100%', display: 'flex', flexDirection: 'column', gap: '80px' }">
			<div :style="{ display: 'flex', alignItems: 'center' }">
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.9)' }">rollup</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">('</span>
				<span :style="{ fontSize: '50px', color: '#FF8351' }">
					{{ rollup.name }}
				</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">')</span>
			</div>

			<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Last active: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.4)' }">{{ DateTime.fromISO(rollup.last_message_time).toFormat("ff") }}</span>
				</div>

			<div :style="{ display: 'flex', flexDirection: 'column', gap: '24px' }">
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Size: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ formatBytes(rollup.size) }} </span>
				</div>
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Blobs: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ comma(rollup.blobs_count) }} </span>
				</div>
			</div>
		</div>
	</div>
</template>
