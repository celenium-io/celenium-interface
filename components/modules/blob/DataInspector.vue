<script setup>
/** Vendor */
import { DateTime } from "luxon"
// import iconv from "iconv-lite"

/** Store */
import { useSettingsStore } from "@/store/settings"
const settingsStore = useSettingsStore()

const props = defineProps({
	bytes: {
		type: Array,
	},
	range: {
		type: Object,
	},
	cursor: {
		type: Number,
	},
})

const asciiMap = {
	0: "NUL - Null",
	1: "SOH - Start of heading",
	2: "STX - Start of text",
	3: "ETX - End of text",
	4: "EOT - End of transmission",
	5: "ENQ - Enquiry",
	6: "ACK - Acknowledge",
	7: "BEL - Bell",
	8: "BS - Backspace",
	9: "Tab - Horizontal tab",
	10: "LF - NL line feed, new line",
	11: "VT - Vertical tab",
	12: "FF - NP from feed, new page",
	13: "CR - Carriage return",
	14: "SO - Shift out",
	15: "SI - Shift in",
	16: "DLE - Data link escape",
	17: "DC1 - Device control 1",
	18: "DC2 - Device control 2",
	19: "DC3 - Device control 3",
	20: "DC4 - Device control 4",
	21: "NAK - Negative acknowledge",
	22: "SYN - Synchronous idle",
	23: "ETB - End of trans. block",
	24: "CAN - Cancel",
	25: "EM - End of medium",
	26: "SUB - Subtitute",
	27: "ESC - Escape",
	28: "FS - File separator",
	29: "GS - Group separator",
	30: "RS - Record separator",
	31: "US - Unit separator",
}

const hexToUint8Array = (hex) => {
	const arr = []
	for (let i = 0; i < hex.length; i += 2) {
		arr.push(parseInt(hex.substr(i, 2), 16))
	}
	return new Uint8Array(arr)
}

const decode = (bytes) => {
	return ""
	return iconv.decode(new Uint8Array(bytes.map((b) => parseInt(`0x${b}`, 16))), "IBM437")
}
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Flex align="center" justify="between">
			<Text size="13" weight="600" color="primary">Data Inspector</Text>
		</Flex>

		<Flex direction="column" gap="8" :class="$style.content">
			<Flex v-if="settingsStore.hex.inspector.binary" direction="column" gap="8" :class="$style.field">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary">Binary</Text>
					<CopyButton v-if="range.start" :text="bytes[range.start].toString(2).padStart(8, '0')" size="12" />
				</Flex>

				<Text v-if="range.start" size="13" weight="600" color="primary" mono>
					{{ bytes[range.start].toString(2).padStart(8, "0") }}
				</Text>
				<Text v-else size="13" weight="600" color="tertiary" mono>No bytes selected</Text>
			</Flex>

			<Flex v-if="settingsStore.hex.inspector.uint8" direction="column" gap="8" :class="$style.field">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary">uint8</Text>
					<CopyButton v-if="range.start" :text="hexToUint8Array(bytes[range.start]).toString()" size="12" />
				</Flex>

				<Text v-if="range.start" size="13" weight="600" color="primary" mono>
					{{ hexToUint8Array(bytes[range.start]) }}
				</Text>
				<Text v-else size="13" weight="600" color="tertiary" mono>No bytes selected</Text>
			</Flex>

			<Flex v-if="settingsStore.hex.inspector.time" direction="column" gap="8" :class="$style.field">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary">Time</Text>
				</Flex>

				<Text v-if="range.start" size="13" weight="600" color="primary" mono>
					{{ DateTime.fromISO(parseInt(bytes[range.start], 16)) }}
				</Text>
				<Text v-else size="13" weight="600" color="tertiary" mono>No bytes selected</Text>
			</Flex>

			<Flex v-if="settingsStore.hex.inspector.ascii" direction="column" gap="8" :class="$style.field">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary">ASCII</Text>
					<CopyButton
						v-if="range.start"
						:text="
							range.start < range.end
								? bytes
										.slice(range.start, range.end)
										.map((byte) => String.fromCharCode(parseInt(byte, 16)))
										.join('')
								: bytes
										.slice(range.end, range.start)
										.map((byte) => String.fromCharCode(parseInt(byte, 16)))
										.join('')
						"
						size="12"
					/>
				</Flex>

				<Text
					v-if="range.start !== null && range.end !== null"
					size="13"
					weight="600"
					height="140"
					color="primary"
					mono
					:class="$style.ascii"
				>
					<template v-if="range.start < range.end">
						{{ decode(bytes.slice(range.start, range.end)) }}
					</template>
					<template v-else-if="range.start > range.end">
						{{ decode(bytes.slice(range.end, range.start)) }}
					</template>
				</Text>
				<Text v-else size="13" weight="600" height="140" color="tertiary" mono> No bytes selected </Text>
			</Flex>

			<Flex v-if="settingsStore.hex.inspector.char" direction="column" gap="8" :class="$style.field">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary">UTF-8 Character</Text>
					<CopyButton v-if="range.start" :text="123" size="12" />
				</Flex>

				<Text
					v-if="parseInt(bytes[cursor], 16) >= 0 && parseInt(bytes[cursor], 16) <= 31"
					size="13"
					weight="600"
					height="140"
					color="secondary"
					mono
				>
					{{ asciiMap[parseInt(bytes[cursor], 16)] }}
				</Text>
				<Text v-else size="13" weight="600" height="140" color="primary" mono>
					{{ decode([bytes[cursor]]) }}
				</Text>
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

.field {
	border-radius: 6px;
	background: var(--op-5);

	padding: 8px;
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

.ascii {
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
