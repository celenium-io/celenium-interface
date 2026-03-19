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
	block: Object,
})

const bgStyles = computed(() => {
	return {
		style: {
			filter: "grayscale(1)",
			opacity: "0.05",
		},
	}
})

const messages = computed(() => [...new Set(props.block.message_types)])
</script>

<template>
	<div class="wrapper w-full h-full">
		<img src="/img/bg.png" width="1200" height="600" class="img" v-bind="bgStyles" />

		<div class="content">
			<div :style="{ display: 'flex' }">
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.9)' }"> block </span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">('</span>
				<span :style="{ fontSize: '70px', color: '#FF8351' }">{{ comma(block.height) }}</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">')</span>
			</div>

			<div :style="{ display: 'flex' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.7)' }">
					{{ messages.slice(0, 4).join(", ") }} {{ messages.length > 4 ? `and ${messages.length - 4} more` : "" }}
				</span>
			</div>

			<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.4)' }">{{ DateTime.fromISO(block.time).toFormat("ff") }}</span>

			<div :style="{ display: 'flex', gap: '24px' }">
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Blobs Size: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ formatBytes(block.stats.blobs_size) }} </span>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.wrapper {
	position: relative;

	font-family: "JetBrains Mono";

	background: #111111;
	overflow: hidden;
}

.img {
	position: absolute;
}

.content {
	display: flex;
	flex-direction: column;
	gap: 40px;

	margin: 100px;
}
</style>
