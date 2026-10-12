<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma, formatBytes } from "~/services/utils/index.js"

defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	title: String,
	rollup: Object,
})
</script>

<template>
	<div class="wrapper w-full h-full">
		<div class="content">
			<div :style="{ display: 'flex', alignItems: 'center' }">
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.9)' }">network</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">('</span>
				<span :style="{ fontSize: '50px', color: '#FF8351' }">
					{{ rollup.name }}
				</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">')</span>
			</div>

			<div :style="{ display: 'flex', gap: '12px' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Last active: </span>
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.4)' }">{{
					DateTime.fromISO(rollup.last_message_time).toFormat("ff")
				}}</span>
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

<style scoped>
.wrapper {
	position: relative;

	background: #111111;
	overflow: hidden;
}

.content {
	display: flex;
	flex-direction: column;
	gap: 40px;

	margin: 100px;
}
</style>
