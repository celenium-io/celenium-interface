<script setup>
/** Store */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

const props = defineProps({
	text: {
		type: String,
	},
})

const isCopied = ref(false)

const handleCopy = (target) => {
	window.navigator.clipboard.writeText(target)

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully copied to clipboard",
			autoDestroy: true,
		},
	})

	isCopied.value = true
	setTimeout(() => {
		isCopied.value = false
	}, 1_500)
}
</script>

<template>
	<Icon
		@click.stop="handleCopy(text)"
		:name="!isCopied ? 'copy' : 'check'"
		size="12"
		:color="!isCopied ? 'tertiary' : 'green'"
		class="copyable"
	/>
</template>
