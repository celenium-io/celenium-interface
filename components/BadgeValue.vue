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
	<Flex @click="handleCopy" align="center" gap="12" :class="$style.wrapper">
		<Text size="12" weight="600" color="secondary" mono>{{ space(text.toUpperCase()) }}</Text>
		<Icon :name="copied ? 'check' : 'copy'" size="12" :color="copied ? 'green' : 'secondary'" />
	</Flex>
</template>

<style module>
.wrapper {
	border: 1px solid var(--op-10);
	border-radius: 5px;
	cursor: copy;

	padding: 6px 8px;

	transition: all 0.2s ease;

	& span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	&:hover {
		border: 1px solid var(--op-15);
		background: var(--op-5);
	}

	&:active {
		border: 1px solid var(--op-20);
		background: var(--op-10);
	}
}
</style>
