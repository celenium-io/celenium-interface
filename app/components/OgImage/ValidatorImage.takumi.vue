<script setup>
/** Services */
import { abbreviate } from "~/services/utils/index.js"

defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	title: String,
	validator: Object,
})
</script>

<template>
	<div class="wrapper w-full h-full">
		<div class="content">
			<div :style="{ display: 'flex', alignItems: 'center' }">
				<span :style="{ fontSize: '60px', color: 'rgba(255,255,255, 0.9)' }">validator</span>
				<span :style="{ fontSize: '60px', color: 'rgba(255,255,255, 0.3)' }">('</span>
				<span :style="{ fontSize: '40px', color: '#FF8351' }"> celestiavaloper•••{{ validator.address.hash.slice(-4) }} </span>
				<span :style="{ fontSize: '60px', color: 'rgba(255,255,255, 0.3)' }">')</span>
			</div>

			<span v-if="validator.moniker" :style="{ fontSize: '46px', color: 'rgba(255,255,255, 0.9)' }">
				{{ validator.moniker }}
			</span>

			<div :style="{ display: 'flex', gap: '12px' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Voting Power: </span>
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ abbreviate(validator.voting_power) }} TIA</span>
			</div>

			<div :style="{ display: 'flex', flexDirection: 'column', gap: '24px' }">
				<div v-if="validator.website" :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">{{ validator.website }} </span>
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
