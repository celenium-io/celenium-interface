<script setup>
/**
 * Vendor
 */
import { ref, reactive, nextTick, watch } from "vue"

const props = defineProps({
	side: {
		type: String,
		default: "bottom",
		validator: (value) => {
			return ["top", "bottom", "left", "right"].includes(value)
		},
	},
	position: {
		type: String,
		default: "center",
		validator: (value) => {
			return ["start", "end", "center"].includes(value)
		},
	},

	textAlign: { type: String, default: "center" },
	wide: { type: Boolean, default: null },
	disabled: { type: Boolean, default: false },
	delay: { type: [String, Number], default: 0 },
	width: { type: String, required: false },
	triggerWidth: { type: String, required: false, default: null },
})

const isHovered = ref(false)
const delayedHover = ref(null)

const trigger = ref(null)
const tip = ref(null)

const styles = reactive({
	transform: `translate3d(0, 0, 0)`,
	maxWidth: props.width,
})

watch(
	() => isHovered.value,
	() => {
		nextTick(() => {
			if (!tip.value) return

			const triggerRect = trigger.value.getBoundingClientRect()
			const tooltipRect = tip.value.getBoundingClientRect()

			let xPos = 0
			let yPos = 0

			switch (props.side) {
				case "top":
					yPos = triggerRect.top - tooltipRect.height - 8

					switch (props.position) {
						case "center":
							xPos = triggerRect.left - (tooltipRect.width / 2 - triggerRect.width / 2)
							break

						case "start":
							xPos = triggerRect.left
							break

						case "end":
							xPos = triggerRect.right - tooltipRect.width
							break
					}
					break

				case "bottom":
					yPos = triggerRect.bottom + 8

					switch (props.position) {
						case "center":
							xPos = triggerRect.left - (tooltipRect.width / 2 - triggerRect.width / 2)
							break

						case "start":
							xPos = triggerRect.left
							break

						case "end":
							xPos = triggerRect.right - tooltipRect.width
							break
					}
					break

				case "left":
					xPos = triggerRect.left - tooltipRect.width - 8

					switch (props.position) {
						case "center":
							yPos = triggerRect.top - (tooltipRect.height / 2 - triggerRect.height / 2)
							break

						case "start":
							yPos = triggerRect.top
							break

						case "end":
							yPos = triggerRect.bottom - tooltipRect.height
							break
					}
					break

				case "right":
					xPos = triggerRect.right + 8

					switch (props.position) {
						case "center":
							yPos = triggerRect.top - (tooltipRect.height / 2 - triggerRect.height / 2)
							break

						case "start":
							yPos = triggerRect.top
							break

						case "end":
							yPos = triggerRect.bottom - tooltipRect.height
							break
					}
					break

				default:
					break
			}

			styles.transform = `translate3d(${xPos}px, ${yPos}px,0)`
		})
	},
)

const handleMouseEnter = () => {
	if (props.disabled) return

	if (props.delay) {
		delayedHover.value = setTimeout(() => {
			isHovered.value = true
		}, parseInt(props.delay))
	} else {
		isHovered.value = true
	}
}

const handleMouseLeave = () => {
	isHovered.value = false

	if (delayedHover.value) {
		clearTimeout(delayedHover.value)
	}
}
</script>

<template>
	<div
		@mouseenter="handleMouseEnter"
		@mouseleave="handleMouseLeave"
		@touchstart="handleMouseEnter"
		@touchend="handleMouseLeave"
		:class="$style.wrapper"
		:style="{ width: triggerWidth ? triggerWidth : wide && '100%' }"
	>
		<div ref="trigger" :class="$style.trigger" :style="{ width: wide && '100%' }">
			<slot />
		</div>

		<teleport v-if="isHovered" to="#tooltip">
			<div @click.stop ref="tip" :class="[$style.content, disabled && $style.disabled]" :style="styles">
				<div :class="[$style.text]" :style="{ textAlign }">
					<slot name="content" />
				</div>
			</div>
		</teleport>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	position: relative;
}

.trigger {
	display: flex;
	min-width: 0;
}

.content {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 50000;

	width: max-content;

	box-sizing: border-box;
	background-color: var(--tooltip-background);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 10%);
	border-radius: 7px;

	padding: 6px 8px;
}

.text {
	font-size: 12px;
	font-weight: 600;
	color: var(--txt-body);
}
</style>
