<script setup>
const props = defineProps({
	blob: {
		type: Object,
	},
})

const cards = ref({
	hex: true,
	inspector: true,
})

const bytesEl = ref()
const bytes = ref([])
const scrollOffset = ref(0)

const range = reactive({ start: null, end: null })

const hex = ref([])
const selectedByte = ref()

const isSelecting = ref(false)
const selectedBytes = ref([])

const onKeydown = (e) => {
	if (e.code === "Escape") {
		range.start = null
		range.end = null
	}
}

onMounted(() => {
	document.addEventListener("keydown", onKeydown)
})

onBeforeUnmount(() => {
	document.removeEventListener("keydown", onKeydown)
})

const isASCII = (str) => {
	return /^[\x00-\x7F]*$/.test(str)
}

const onScroll = (e) => {
	e.preventDefault()

	if (bytes.value.length < 40) return
	if (e.deltaY < 0 && scrollOffset.value === 0) return
	scrollOffset.value += e.deltaY > 0 ? 1 : -1
}

const onMouseEnter = (e) => {
	bytesEl.value.addEventListener("wheel", onScroll)
}

const onMouseLeave = (e) => {
	isSelecting.value = false

	bytesEl.value.removeEventListener("wheel", onScroll)
}

/** Multi-select */
const onPointerDown = (idx, byte) => {
	isSelecting.value = true

	const relativeIdx = idx + scrollOffset.value * 16
	range.start = relativeIdx

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
	range.end = relativeIdx
}
const onByteSelect = (idx, byte) => {
	if (!isSelecting.value) return

	const relativeIdx = idx + scrollOffset.value * 16
	range.end = relativeIdx

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
	if (range.start <= range.end) {
		return relativeIdx >= range.start && relativeIdx <= range.end
	} else {
		return relativeIdx >= range.end && relativeIdx <= range.start
	}
}

watch(
	() => props.blob,
	() => {
		if (!props.blob?.data) return

		hex.value = Buffer.from(props.blob.data, "base64")
			.toString("hex")
			.match(/../g)
			.reduce((acc, current, idx) => {
				const chunkIdx = Math.floor(idx / 16)
				acc[chunkIdx] = acc[chunkIdx] || []
				acc[chunkIdx].push(current)
				return acc
			}, [])

		bytes.value = hex.value.flat()
	},
	{
		immediate: true,
	},
)

const hexToUint8Array = (hex) => {
	const arr = []
	for (let i = 0; i < hex.length; i += 2) {
		arr.push(parseInt(hex.substr(i, 2), 16))
	}
	return new Uint8Array(arr)
}
</script>

<template>
	<Flex wide direction="column" gap="16">
		<Flex direction="column" gap="16" :class="$style.wrapper">
			<Flex @click="cards.hex = !cards.hex" align="center" justify="between" :class="$style.header">
				<Text size="13" weight="600" color="primary">Hex Viewer</Text>
				<Icon name="chevron" size="14" color="tertiary" :style="{ transform: `rotate(${cards.hex ? '180deg' : '0'})` }" />
			</Flex>

			<Flex v-if="cards.hex && hex" justify="between" :class="$style.content">
				<Flex direction="column">
					<Flex align="center" :class="$style.labels">
						<Text v-for="(column, columnIdx) in 16" size="12" weight="600" color="support" mono :class="[$style.label]">
							{{ columnIdx.toString(16).padStart(2, "0") }}
						</Text>
					</Flex>

					<div ref="bytesEl" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" :class="$style.bytes">
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

				<div :class="$style.ascii_preview">
					<Text v-for="i in 640" size="11" weight="600" color="tertiary" :class="[$style.char, isSelected(i) && $style.selected]">
						<template v-if="bytes[i - 1 + scrollOffset * 16] !== '00'">
							{{ String.fromCharCode(parseInt(bytes[i - 1 + scrollOffset * 16], 16)) }}
						</template>
						<template v-else> . </template>
					</Text>
				</div>
			</Flex>
		</Flex>

		<Flex direction="column" gap="16" :class="$style.wrapper">
			<Flex @click="cards.inspector = !cards.inspector" align="center" justify="between" :class="$style.header">
				<Text size="13" weight="600" color="primary">Data Inspector</Text>
				<Icon name="chevron" size="14" color="tertiary" :style="{ transform: `rotate(${cards.inspector ? '180deg' : '0'})` }" />
			</Flex>

			<Flex v-if="cards.inspector" :class="$style.content">
				<table>
					<tbody>
						<tr>
							<td>
								<Text size="13" weight="600" color="tertiary">Name</Text>
							</td>
							<td>
								<Text size="13" weight="600" color="tertiary">Value</Text>
							</td>
						</tr>
						<tr>
							<td>
								<Text size="13" weight="600" color="secondary" mono>Binary</Text>
							</td>
							<td>
								<Text v-if="range.start" size="13" weight="600" color="primary" mono>{{
									bytes[range.start].toString(2).padStart(8, "0")
								}}</Text>
								<Text v-else size="13" weight="600" color="tertiary" mono>No bytes selected</Text>
							</td>
						</tr>
						<tr>
							<td>
								<Text size="13" weight="600" color="secondary" mono>uint8</Text>
							</td>
							<td>
								<Text v-if="range.start" size="13" weight="600" color="primary" mono>
									{{ hexToUint8Array(bytes[range.start]) }}
								</Text>
								<Text v-else size="13" weight="600" color="tertiary" mono>No bytes selected</Text>
							</td>
						</tr>
						<tr>
							<td :class="$style.no_border">
								<Text size="13" weight="600" color="secondary" mono>ASCII Character</Text>
							</td>
							<td :class="$style.no_border">
								<Text v-if="range.start < range.end" size="13" weight="600" color="primary" mono :class="$style.one_line">
									{{
										bytes
											.slice(range.start - 1, range.end)
											.map((byte) => String.fromCharCode(parseInt(byte, 16)))
											.join("")
									}}
								</Text>
								<Text v-if="range.start > range.end" size="13" weight="600" color="primary" mono :class="$style.one_line">
									{{
										bytes
											.slice(range.end - 1, range.start)
											.map((byte) => String.fromCharCode(parseInt(byte, 16)))
											.join("")
									}}
								</Text>
							</td>
						</tr>
					</tbody>
				</table>
			</Flex>
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

.content {
	& table {
		max-width: 100%;
		width: 100%;

		border-radius: 6px;
		box-shadow: inset 0 0 0 2px var(--op-5);

		& tbody {
			& tr {
				& td {
					max-width: 400px;
					overflow: hidden;
					text-overflow: ellipsis;
					color: var(--txt-tertiary);

					border-bottom: 2px solid var(--op-5);

					padding: 6px 8px;

					&:last-of-type {
						border-left: 2px solid var(--op-5);
					}

					&.no_border {
						border-bottom: none;
					}
				}
			}
		}
	}
}

.ascii_preview {
	display: flex;
	flex-wrap: wrap;

	max-width: 176px;

	margin-top: 22px;

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

.idxRow {
	min-width: 70px;
}

.value {
	cursor: pointer;

	transition: all 0.2s ease;

	&:hover {
		color: var(--txt-primary);
		background: var(--op-10);
	}

	&:nth-child(9) {
		margin-right: 10px;
	}
}

.one_line {
	white-space: nowrap;
}
</style>
