<script setup>
const emit = defineEmits(["update:modelValue"])
const props = defineProps({
	options: { type: Array, required: true },
	modelValue: { type: String, required: true },
	labelKey: { type: String, default: "text" },
	valueKey: { type: String, default: "value" },
})

const getLabel = (target) => (typeof target === "object" ? target[props.labelKey] : target)
const getValue = (target) => (typeof target === "object" ? target[props.valueKey] : target)

const handleSelect = (target) => {
	emit("update:modelValue", getValue(target))
}
</script>

<template>
	<Flex align="center" gap="2" :class="$style.wrapper">
		<button
			v-for="option in options"
			@click="handleSelect(option)"
			type="button"
			:class="[$style.option, getValue(option) === modelValue && $style.active]"
		>
			<Text size="13" weight="600" color="secondary" style="text-transform: capitalize">{{ getLabel(option) }}</Text>
		</button>
	</Flex>
</template>

<style module>
.wrapper {
	background: var(--app-background);
	border-radius: 8px;

	padding: 2px;
}

.option {
	height: 26px;

	background: transparent;
	border-radius: 6px;

	padding: 0 8px;

	&.active {
		background: var(--card-background);
		box-shadow: inset 0 1px 2px var(--op-5);

		& span {
			color: var(--txt-primary);
		}
	}
}
</style>
