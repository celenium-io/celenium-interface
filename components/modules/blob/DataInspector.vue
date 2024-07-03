<script setup>
/** Vendor */
import { DateTime } from "luxon"

const props = defineProps({
	bytes: {
		type: Array,
	},
	range: {
		type: Object,
	},
})

const hexToUint8Array = (hex) => {
	const arr = []
	for (let i = 0; i < hex.length; i += 2) {
		arr.push(parseInt(hex.substr(i, 2), 16))
	}
	return new Uint8Array(arr)
}

const isASCII = (str) => {
	return /^[\x00-\x7F]*$/.test(str)
}
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Flex align="center" justify="between" :class="$style.header">
			<Text size="13" weight="600" color="primary">Data Inspector</Text>
		</Flex>

		<Flex direction="column" gap="8" :class="$style.content">
			<Flex direction="column" gap="8" :class="$style.field">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary">Binary</Text>
					<CopyButton v-if="range.start" :text="bytes[range.start - 1].toString(2).padStart(8, '0')" size="12" />
				</Flex>

				<Text v-if="range.start" size="13" weight="600" color="primary" mono>
					{{ bytes[range.start - 1].toString(2).padStart(8, "0") }}
				</Text>
				<Text v-else size="13" weight="600" color="tertiary" mono>No bytes selected</Text>
			</Flex>

			<Flex direction="column" gap="8" :class="$style.field">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary">uint8</Text>
					<CopyButton v-if="range.start" :text="hexToUint8Array(bytes[range.start - 1])" size="12" />
				</Flex>

				<Text v-if="range.start" size="13" weight="600" color="primary" mono>
					{{ hexToUint8Array(bytes[range.start - 1]) }}
				</Text>
				<Text v-else size="13" weight="600" color="tertiary" mono>No bytes selected</Text>
			</Flex>

			<Flex direction="column" gap="8" :class="$style.field">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary">Time</Text>
					<CopyButton v-if="range.start" :text="hexToUint8Array(bytes[range.start - 1])" size="12" />
				</Flex>

				<Text v-if="range.start" size="13" weight="600" color="primary" mono>
					{{ DateTime.fromISO(parseInt(bytes[range.start - 1], 16)) }}
				</Text>
				<Text v-else size="13" weight="600" color="tertiary" mono>No bytes selected</Text>
			</Flex>

			<Flex direction="column" gap="8" :class="$style.field">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary">ASCII Character</Text>
					<CopyButton
						v-if="range.start"
						:text="
							range.start < range.end
								? bytes
										.slice(range.start - 1, range.end)
										.map((byte) => String.fromCharCode(parseInt(byte, 16)))
										.join('')
								: bytes
										.slice(range.end - 1, range.start)
										.map((byte) => String.fromCharCode(parseInt(byte, 16)))
										.join('')
						"
						size="12"
					/>
				</Flex>

				<Text v-if="range.start < range.end" size="13" weight="600" height="140" color="primary" mono :class="$style.ascii">
					{{
						bytes
							.slice(range.start - 1, range.end)
							.map((byte) => String.fromCharCode(parseInt(byte, 16)))
							.join("")
					}}
				</Text>
				<Text v-if="range.start > range.end" size="13" weight="600" height="140" color="primary" mono :class="$style.ascii">
					{{
						bytes
							.slice(range.end - 1, range.start)
							.map((byte) => String.fromCharCode(parseInt(byte, 16)))
							.join("")
					}}
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
