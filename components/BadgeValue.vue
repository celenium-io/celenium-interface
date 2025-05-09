<script setup>
/**
 * Services
 */
import { space } from "@/services/utils"

/** Store */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

const props = defineProps({
	text: {
		type: String,
		required: true,
	},
})

const copied = ref(false)

const handleCopy = () => {
	if (!props.text) return

	window.navigator.clipboard.writeText(props.text.toUpperCase())

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully copied to clipboard",
			autoDestroy: true,
		},
	})

	copied.value = true
	setTimeout(() => {
		copied.value = false
	}, 2_000)
}
</script>

<template>
	<Flex @click="handleCopy" align="center" justify="between" :class="[$style.wrapper, !text && $style.not_available]">
		<Flex :class="$style.left">
			<Text v-if="text" size="12" weight="600" color="secondary" mono>{{ space(text.toUpperCase()) }}</Text>
			<Text v-else size="12" weight="600" color="secondary" mono>**** **** **** ****</Text>
		</Flex>

		<div v-for="dot in 3" class="dot" />

		<Flex justify="end" :class="$style.right">
			<Text v-if="text" size="12" weight="600" color="secondary" mono>{{ space(text.toUpperCase()) }}</Text>
			<Text v-else size="12" weight="600" color="secondary" mono>**** **** **** ****</Text>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	border: 1px solid var(--op-10);
	border-radius: 5px;
	cursor: copy;

	padding: 6px 8px;

	transition: all 0.2s ease;

	&:hover {
		border: 1px solid var(--op-15);
		background: var(--op-5);
	}

	&:active {
		border: 1px solid var(--op-20);
		background: var(--op-10);
	}

	&.not_available {
		cursor: not-allowed;

		&:hover {
			background: transparent;
			border: 1px solid var(--op-10);
		}
	}
}

.left {
	min-width: 42%;
	width: 0;
	overflow: hidden;

	& span {
		white-space: nowrap;
	}
}

.right {
	min-width: 42%;
	width: 0;
	overflow: hidden;

	& span {
		white-space: nowrap;
	}
}
</style>
