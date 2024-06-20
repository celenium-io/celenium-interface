<script setup>
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
	range: {
		type: Object,
	},
})
const emit = defineEmits(["onSelect"])

const cards = ref({
	hex: true,
	inspector: true,
})

const viewerEl = ref()
const scrollOffset = ref(0)

const isSelecting = ref(false)
const selectedBytes = ref([])

const onKeydown = (e) => {
	if (e.code === "Escape") {
		emit("onSelect", [null, null])
	}

	if (e.code === "PageUp") {
		scrollOffset.value = 0
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

	if (scrollOffset.value + 40 + 1 > props.hex.length && e.deltaY > 0) return
	if (props.bytes.length < 40) return
	if (e.deltaY < 0 && scrollOffset.value === 0) return
	scrollOffset.value += e.deltaY > 0 ? 1 : -1
}

const onMouseEnter = (e) => {
	viewerEl.value.wrapper.addEventListener("wheel", onScroll)
}

const onMouseLeave = (e) => {
	isSelecting.value = false

	viewerEl.value.wrapper.removeEventListener("wheel", onScroll)
}

/** Multi-select */
const onPointerDown = (idx, byte) => {
	isSelecting.value = true

	const relativeIdx = idx + scrollOffset.value * 16
	emit("onSelect", [relativeIdx, undefined])

	const alreadySelectedByte = selectedBytes.value.find((b) => b.idx === relativeIdx && b.value === byte)
	if (alreadySelectedByte) {
		const alreadySelectedByteIdx = selectedBytes.value.indexOf(alreadySelectedByte)
		selectedBytes.value.splice(alreadySelectedByteIdx, 1)
	} else {
		selectedBytes.value.push({ idx: relativeIdx, value: byte })
	}
}
const onPointerUp = (idx, byte) => {
	isSelecting.value = false

	const relativeIdx = idx + scrollOffset.value * 16
	emit("onSelect", [undefined, relativeIdx])
}
const onByteSelect = (idx, byte) => {
	if (!isSelecting.value) return

	const relativeIdx = idx + scrollOffset.value * 16
	emit("onSelect", [undefined, relativeIdx])

	const alreadySelectedByte = selectedBytes.value.find((b) => b.idx === relativeIdx && b.value === byte)
	if (alreadySelectedByte) {
		const alreadySelectedByteIdx = selectedBytes.value.indexOf(alreadySelectedByte)
		selectedBytes.value.splice(alreadySelectedByteIdx, 1)
	} else {
		selectedBytes.value.push({ idx: relativeIdx, value: byte })
	}
}
const isSelected = (idx) => {
	const relativeIdx = idx + scrollOffset.value * 16
	if (props.range.start <= props.range.end) {
		return relativeIdx >= props.range.start && relativeIdx <= props.range.end
	} else {
		return relativeIdx >= props.range.end && relativeIdx <= props.range.start
	}
}
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Flex @click="cards.hex = !cards.hex" align="center" justify="between" :class="$style.header">
			<Text size="13" weight="600" color="primary">Hex Viewer</Text>
			<Icon name="chevron" size="14" color="tertiary" :style="{ transform: `rotate(${cards.hex ? '180deg' : '0'})` }" />
		</Flex>

		<Flex v-if="cards.hex" ref="viewerEl" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" justify="between">
			<Flex gap="6">
				<Flex direction="column" :class="$style.row_labels">
					<Text v-for="i in 40" size="12" weight="600" color="support" mono :class="$style.row_label">
						{{ (i * (scrollOffset + 1)).toString(16).padStart(6, "0") }}
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
							v-for="i in 640"
							@pointerdown="() => onPointerDown(i, bytes[i - 1 + scrollOffset * 16])"
							@pointerup="() => onPointerUp(i, bytes[i - 1 + scrollOffset * 16])"
							@mouseenter="() => onByteSelect(i, bytes[i - 1 + scrollOffset * 16])"
							size="12"
							weight="600"
							height="160"
							color="secondary"
							mono
							:class="isSelected(i) && $style.selected"
						>
							{{ bytes[i - 1 + scrollOffset * 16] }}
						</Text>
					</div>
				</Flex>
			</Flex>

			<Flex direction="column">
				<Text size="12" weight="600" color="support" mono style="line-height: 22px">ASCII</Text>
				<div :class="$style.ascii_preview">
					<Text v-for="i in 640" size="11" weight="600" color="tertiary" :class="[$style.char, isSelected(i) && $style.selected]">
						<template v-if="bytes[i - 1 + scrollOffset * 16] !== '00'">
							{{ String.fromCharCode(parseInt(bytes[i - 1 + scrollOffset * 16], 16)) }}
						</template>
						<template v-else> . </template>
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

	padding: 16px;
}

.header {
	cursor: pointer;
	border-radius: 6px;

	padding: 8px;
	margin: -8px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-5);
	}
}

.bytes {
	display: flex;
	flex-wrap: wrap;

	max-width: 392px;

	& span {
		min-width: 24px;

		line-height: 20px;
		text-align: center;

		&:hover {
			cursor: pointer;

			background: var(--op-10);
		}

		&.selected {
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
</style>
