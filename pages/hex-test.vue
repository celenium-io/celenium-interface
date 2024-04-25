<script setup>
const str = ref("The quick brown fox jumps over the lazy dog repeatedly in the summer sunshine happily ever after")
const hex = ref()

watch(
	() => str.value,
	() => {
		hex.value = Buffer.from(str.value)
			.toString("hex")
			.match(/../g)
			.reduce((acc, current, idx) => {
				const chunkIdx = Math.floor(idx / 16)
				acc[chunkIdx] = acc[chunkIdx] || []
				acc[chunkIdx].push(current)
				return acc
			}, [])
	},
	{
		immediate: true,
	},
)

const selectedIdx = ref()
</script>

<template>
	<Flex direction="column" gap="24" wide :class="$style.wrapper">
		<Flex direction="column" gap="8">
			<input v-model="str" placeholder="Your text" :class="$style.input" />

			<Flex align="center" gap="8">
				<Text size="12" weight="500" color="support">
					Length: <Text color="tertiary">{{ str.length }}</Text>
				</Text>

				<Text size="12" weight="500" color="support">
					Rows: <Text color="tertiary">{{ hex.length }}</Text>
				</Text>
			</Flex>
		</Flex>

		<Flex gap="8" :class="$style.viewer">
			<Flex direction="column" gap="12">
				<Text size="13" weight="600" color="support" mono :class="$style.label">Address</Text>

				<Flex direction="column">
					<Text v-for="(row, rowIdx) in hex.length" size="13" weight="600" color="support" mono :class="$style.label">
						{{ rowIdx.toString(16).padStart(8, "0") }}:
					</Text>
				</Flex>
			</Flex>

			<Flex direction="column" gap="12">
				<Flex align="center">
					<Text
						v-for="(column, columnIdx) in 16"
						size="13"
						weight="600"
						color="support"
						mono
						:class="[$style.label, $style.column]"
					>
						{{ columnIdx.toString(16).padStart(2, "0") }}
					</Text>
				</Flex>

				<Flex direction="column">
					<Flex v-for="(row, rowIdx) in hex" align="center" :class="$style.row">
						<Text
							v-for="(item, itemIdx) in row"
							@click="selectedIdx = `${rowIdx}:${itemIdx}`"
							size="13"
							weight="600"
							color="secondary"
							mono
							:class="[$style.item, `${rowIdx}:${itemIdx}` === selectedIdx && $style.selected]"
						>
							{{ item }}
						</Text>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

input {
	color: var(--txt-primary);
	border: 1px solid var(--op-5);

	padding: 6px 8px;
}

.viewer {
	max-height: 1000px;

	overflow-y: auto;
}

.label {
	display: flex;
	align-items: center;
	justify-content: center;

	min-height: 22px;

	text-transform: uppercase;

	padding: 0 4px;

	&.column {
		min-width: 28px;

		&:nth-child(8) {
			margin-right: 8px;
		}
	}
}

.row {
	&:hover {
		background: var(--op-5);
	}
}

.item {
	display: flex;
	align-items: center;
	justify-content: center;

	min-width: 28px;
	height: 22px;

	text-transform: uppercase;

	padding: 4px;

	transition: none;

	&.selected {
		background: var(--op-20);

		color: var(--txt-primary);
	}

	&.selected:hover {
		background: var(--op-20);
	}

	&:hover {
		background: var(--op-10);
	}

	&:nth-child(8) {
		margin-right: 8px;
	}
}
</style>
