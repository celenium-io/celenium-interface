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
	proposal: Object,
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
	<div class="w-full h-full" :style="{ background: '#111111', padding: '100px', fontFamily: 'IBM+Plex+Mono', overflow: 'hidden' }">
		<img src="/img/bg.png" width="1200" height="600" class="absolute" v-bind="bgStyles" />

		<div :style="{ height: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }">
			<div :style="{ display: 'flex', alignItems: 'center' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)', textTransform: 'capitalize', marginRight: '24px;' }">
					{{ proposal.status }}
				</span>

				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">
					- {{ DateTime.fromISO(proposal.deposit_time).toFormat("ff") }}
				</span>
			</div>

			<span :style="{ fontSize: '50px', color: 'rgba(255,255,255, 0.9)' }"> {{ proposal.title }} </span>
			<span :style="{ fontSize: '50px', color: 'rgba(255,255,255, 0.3)' }"> {{ proposal.description }} </span>

			<div>
				<span :style="{ fontSize: '32px', color: 'rgba(255,255,255, 0.3)' }">Yes: </span>
				<span :style="{ fontSize: '32px', color: 'rgba(255,255,255, 0.6)' }">{{ proposal.yes }}</span>
				<span :style="{ fontSize: '32px', color: 'rgba(255,255,255, 0.3)' }">, No: </span>
				<span :style="{ fontSize: '32px', color: 'rgba(255,255,255, 0.6)' }">{{ proposal.no }}</span>
				<span :style="{ fontSize: '32px', color: 'rgba(255,255,255, 0.3)' }">, No with veto: </span>
				<span :style="{ fontSize: '32px', color: 'rgba(255,255,255, 0.6)' }">{{ proposal.no_with_veto }}</span>
				<span :style="{ fontSize: '32px', color: 'rgba(255,255,255, 0.3)' }">, Abstain: </span>
				<span :style="{ fontSize: '32px', color: 'rgba(255,255,255, 0.6)' }">{{ proposal.abstain }}</span>
			</div>
		</div>
	</div>
</template>
