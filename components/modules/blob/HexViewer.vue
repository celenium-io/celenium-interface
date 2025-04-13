<script setup>
/** Store */
import { useSettingsStore } from "@/store/settings"
const settingsStore = useSettingsStore()

const props = defineProps({
	blob: {
		type: Object,
	},
	bytes: {
		type: Array,
	},
	hex: {
		type: Array,
	},
	cursor: {
		type: Number,
	},
	range: {
		type: Object,
	},
})
const emit = defineEmits(["onSelect", "onCursorSelect"])

const viewerEl = ref()
const scrollOffset = ref(0)

const isSelecting = ref(false)

const onKeydown = (e) => {
	if (e.code === "Escape") {
		emit("onSelect", [null, null])
	}

	if (e.code === "PageUp") {
		e.preventDefault()
		scrollOffset.value = 0
		emit("onCursorSelect", 0)
	}

	if (e.code === "PageDown") {
		e.preventDefault()
		scrollOffset.value = props.hex.length - 40
		emit("onCursorSelect", props.bytes.length)
	}

	if (e.code === "ArrowUp" && !e.metaKey) {
		emit("onCursorSelect", props.cursor - 16)
	} else if (e.code === "ArrowUp" && e.metaKey) {
		if (scrollOffset.value === 0) return
		scrollOffset.value -= 1
	}

	if (e.code === "ArrowDown" && !e.metaKey) {
		emit("onCursorSelect", props.cursor + 16)
	} else if (e.code === "ArrowDown" && e.metaKey) {
		if (scrollOffset.value + 41 > props.hex.length) return
		scrollOffset.value += 1
	}

	if (e.code === "ArrowLeft") {
		emit("onCursorSelect", props.cursor - 1)
	}

	if (e.code === "ArrowRight") {
		emit("onCursorSelect", props.cursor + 1)
	}
}

onMounted(() => {
	document.addEventListener("keydown", onKeydown)
})

onBeforeUnmount(() => {
	document.removeEventListener("keydown", onKeydown)
})

const onScroll = (e) => {
	e.preventDefault()

	if (e.deltaY === 0) return
	if (scrollOffset.value + 40 + 1 > props.hex.length && e.deltaY > 0) return
	if (props.bytes.length < 40) return
	if (e.deltaY < 0 && scrollOffset.value <= 0) {
		if (scrollOffset.value < 0) scrollOffset.value = 0
		return
	}
	scrollOffset.value += e.deltaY > 0 ? 2 : -2
}

const onMouseEnter = (e) => {
	viewerEl.value.wrapper.addEventListener("wheel", onScroll)
}

const onMouseLeave = (e) => {
	isSelecting.value = false

	viewerEl.value.wrapper.removeEventListener("wheel", onScroll)
}

/** Multi-select */
const startOfSelection = ref()
const isMultiSelecting = ref(false)
const onPointerDown = (idx, byte) => {
	isSelecting.value = true

	const relativeIdx = idx + scrollOffset.value * 16
	startOfSelection.value = relativeIdx
}
const onPointerUp = (idx, byte) => {
	isSelecting.value = false

	const relativeIdx = idx + scrollOffset.value * 16

	if (isMultiSelecting.value) {
		isMultiSelecting.value = false
		emit("onSelect", [startOfSelection.value, relativeIdx])
	} else {
		emit("onCursorSelect", relativeIdx)
	}
}
const onByteSelect = (idx) => {
	if (!isSelecting.value) {
		hoveredByteIdx.value = idx
		return
	}

	isMultiSelecting.value = true

	const relativeIdx = idx + scrollOffset.value * 16
	emit("onSelect", [startOfSelection.value, relativeIdx])
}
const isSelected = (idx) => {
	const relativeIdx = idx + scrollOffset.value * 16
	if (props.range.start === null && props.range.end === null) return
	if (props.range.start <= props.range.end) {
		return relativeIdx >= props.range.start && relativeIdx <= props.range.end
	} else {
		return relativeIdx >= props.range.end && relativeIdx <= props.range.start
	}
}

/** Hover byte */
const hoveredByteIdx = ref(null)
const onPointerLeave = () => {
	hoveredByteIdx.value = null
}

const decode = (byte) => {
	const charCode = parseInt(`0x${byte}`, 16)
	if ((charCode >= 0 && charCode <= 31) || (charCode >= 127 && charCode <= 159)) {
		return "."
	} else {
		return String.fromCharCode.apply(null, new Uint8Array([charCode]))
	}
}
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Flex ref="viewerEl" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" @pointerleave="onPointerLeave" justify="between">
			<Flex gap="6">
				<Flex direction="column" :class="$style.row_labels">
					<Text v-for="(i, idx) in 40" size="12" weight="600" color="support" mono :class="$style.row_label">
						{{ (idx + scrollOffset).toString(16).padStart(6, "0") }}
					</Text>
				</Flex>

				<Flex direction="column">
					<Flex align="center" :class="$style.labels">
						<Text v-for="(column, columnIdx) in 16" size="12" weight="600" color="support" mono :class="[$style.label]">
							{{ columnIdx.toString(16).padStart(2, "0") }}
						</Text>
					</Flex>

					<div :class="$style.bytes">
						<Text
							v-for="(i, idx) in 640"
							@pointerdown="() => onPointerDown(idx, bytes[idx + scrollOffset * 16])"
							@pointerup="() => onPointerUp(idx, bytes[idx + scrollOffset * 16])"
							@mouseenter="() => onByteSelect(idx, bytes[idx + scrollOffset * 16])"
							size="14"
							weight="600"
							height="160"
							color="secondary"
							mono
							:class="[
								isSelected(idx) && $style.selected,
								idx + scrollOffset * 16 === cursor && $style.cursor,
								hoveredByteIdx === idx && $style.hover,
							]"
						>
							{{ bytes[idx + scrollOffset * 16] }}
						</Text>
					</div>
				</Flex>
			</Flex>

			<Flex direction="column">
				<Text size="12" weight="600" color="support" mono style="line-height: 22px">ASCII</Text>
				<div :class="$style.ascii_preview">
					<Text
						v-for="(i, idx) in 640"
						size="14"
						weight="600"
						color="tertiary"
						@pointerenter="() => onByteSelect(idx)"
						:class="[$style.char, isSelected(idx) && $style.selected, hoveredByteIdx === idx && $style.hover]"
					>
						{{ decode(bytes[idx + scrollOffset * 16]) }}
					</Text>
				</div>
			</Flex>

			<div :class="$style.scrollbar">
				<div
					:style="{ height: `${(40 * 100) / hex.length}%`, top: `${(scrollOffset * 100) / hex.length}%` }"
					:class="$style.thumb"
				/>
			</div>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	background: var(--card-background);
	overflow: hidden;

	user-select: none;

	padding: 16px;
}

.bytes {
	display: flex;
	flex-wrap: wrap;

	max-width: 392px;

	& span {
		min-width: 24px;

		font-family: "Source Code Pro";

		line-height: 20px;
		text-align: center;

		&:hover {
			cursor: pointer;

			background: var(--op-10);
		}

		&.selected {
			background: var(--op-10);
		}

		&.cursor {
			background: var(--op-15);

			animation: blink 2s infinite;
			animation-timing-function: unset;
		}

		&.hover {
			box-shadow: inset 0 0 0 1px var(--op-5);
			background: var(--op-10);
		}

		&:nth-child(2n) {
			color: var(--txt-tertiary);
		}

		&:nth-child(16n - 8) {
			margin-right: 6px;
		}
	}
}

@keyframes blink {
	0% {
		box-shadow: inset 0 -4px 0 -2px var(--hexedit-marker-cursor-blink-background, transparent);
	}

	50% {
		box-shadow: inset 0 -4px 0 -2px var(--hexedit-marker-cursor-blink-background, #fff);
	}

	100% {
		box-shadow: inset 0 -4px 0 -2px var(--hexedit-marker-cursor-blink-background, transparent);
	}
}

.labels {
}

.label {
	min-width: 24px;

	text-align: center;
	line-height: 22px;

	text-transform: uppercase;

	&:nth-child(8) {
		margin-right: 6px;
	}
}

.row_labels {
	margin-top: 22px;
}

.row_label {
	line-height: 20px;
	text-transform: uppercase;
}

.ascii_preview {
	display: flex;
	flex-wrap: wrap;

	max-width: 176px;

	& span {
		width: 11px;
		max-width: 11px;
		max-height: 20px;

		line-height: 20px;
		text-align: center;

		&.selected {
			color: var(--txt-primary);
			background: var(--op-5);
		}
	}
}

.scrollbar {
	position: relative;

	width: 4px;
	height: 100%;
	overflow: hidden;

	border-radius: 50px;
	background: var(--op-5);
}

.thumb {
	position: absolute;

	width: 4px;
	height: 10px;

	border-radius: 50px;
	background: var(--op-20);
	cursor: pointer;
}

.char {
	font-family: "Source Code Pro";

	&.hover {
		box-shadow: inset 0 0 0 1px var(--op-5);
		background: var(--op-10);
	}
}
</style>
