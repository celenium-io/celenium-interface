<script setup>
/** Services */
import { getNamespaceID, formatBytes } from "~/services/utils/index.js"

defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	title: String,
	namespace: Object,
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
	<div class="wrapper w-full h-full" class="wrapper">
		<img src="/img/bg.png" width="1200" height="600" class="img" v-bind="bgStyles" />

		<div class="content">
			<div :style="{ display: 'flex', alignItems: 'center' }">
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.9)' }">namespace</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">('</span>
				<span :style="{ fontSize: '70px', color: '#FF8351' }">
					{{ getNamespaceID(namespace.namespace_id).slice(0, 3) }}•••{{ getNamespaceID(namespace.namespace_id).slice(-3) }}
				</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">')</span>
			</div>

			<span :style="{ fontSize: '46px', color: 'rgba(255,255,255, 0.9)' }">
				{{ namespace.name }}
			</span>

			<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.7)' }">
				{{ formatBytes(namespace.size) }}
			</span>

			<div :style="{ display: 'flex', flexDirection: 'column', gap: '24px' }">
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">PFBs: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ namespace.pfb_count }} </span>
				</div>
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Version: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ namespace.version }} </span>
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
