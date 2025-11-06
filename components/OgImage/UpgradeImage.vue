<script setup>
/** Services */
import { abbreviate } from "@/services/utils"

defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	title: String,
	upgrade: Object,
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
	<div class="w-full h-full" :style="{ background: '#111111', padding: '100px 50px', fontFamily: 'IBM+Plex+Mono', overflow: 'hidden' }">
		<img src="/img/bg.png" width="1200" height="600" class="absolute" v-bind="bgStyles" />

		<div :style="{ height: '100%', display: 'flex', flexDirection: 'column', gap: '50px' }">
			<div :style="{ display: 'flex', alignItems: 'center' }">
				<span :style="{ fontSize: '60px', color: 'rgba(255,255,255, 0.9)' }">upgrade</span>
				<span :style="{ fontSize: '60px', color: 'rgba(255,255,255, 0.3)' }">('</span>
				<span :style="{ fontSize: '40px', color: '#FF8351' }"> Version {{ upgrade?.version }} </span>
				<span :style="{ fontSize: '60px', color: 'rgba(255,255,255, 0.3)' }">')</span>
			</div>

			<div :style="{ display: 'flex', gap: '12px' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)', paddingRight: '16px' }">Status: </span>
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">
					{{
						upgrade.tx_hash
							? 'Applied'
							: upgrade?.votedShare > 83.33
								? 'Ready for Upgrade'
								: 'In Progress'
					}}
				</span>
			</div>

			<div :style="{ display: 'flex' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)', paddingRight: '16px' }">Total Stake: </span>
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ abbreviate(upgrade?.voting_power) }} TIA</span>
			</div>
			
			<div :style="{ display: 'flex', gap: '12px' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)', paddingRight: '16px' }">Total Voted: </span>
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ abbreviate(upgrade?.voted_power) }} TIA</span>
			</div>
		</div>
	</div>
</template>
