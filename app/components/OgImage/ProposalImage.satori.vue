<script setup>
/** Vendor */
import { DateTime } from "luxon"

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

function truncateText(text = "", maxCharsPerLine = 30, maxLines = 2) {
	if (!text) return ""

	const words = text.split(/\s+/)
	const lines = []
	let currentLine = ""

	for (const word of words) {
		if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
			currentLine = (currentLine + " " + word).trim()
		} else {
			lines.push(currentLine)
			currentLine = word
			if (lines.length >= maxLines) break
		}
	}

	if (lines.length < maxLines && currentLine) {
		lines.push(currentLine)
	}

	if (lines.length > maxLines) {
		lines.length = maxLines
	}

	// ellipsis
	if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
		lines[maxLines - 1] = lines[maxLines - 1].replace(/[.,;:!?-]*$/, "") + "…"
	}

	return lines.join("\n")
}
</script>

<template>
	<div class="wrapper w-full h-full">
		<img src="/img/bg.png" width="1200" height="600" class="img" v-bind="bgStyles" />

		<div class="content">
			<div :style="{ display: 'flex', alignItems: 'center' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)', textTransform: 'capitalize', marginRight: '24px;' }">
					{{ proposal.status }}
				</span>

				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">
					- {{ DateTime.fromISO(proposal.deposit_time).toFormat("ff") }}
				</span>
			</div>

			<span :style="{ fontSize: '50px', color: 'rgba(255,255,255, 0.9)', whiteSpace: 'pre-line' }">
				{{ truncateText(proposal.title) }}
			</span>
			<span :style="{ fontSize: '50px', color: 'rgba(255,255,255, 0.3)', whiteSpace: 'pre-line' }">
				{{ truncateText(proposal.description) }}
			</span>

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
