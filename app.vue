<script setup>
/** Services */
import Socket from "@/services/api/socket"
import { fetchHead } from "@/services/api/main"
import amp from "@/services/amp"

/** Components */
import CommandMenu from "@/components/cmd/CommandMenu.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const { data } = await fetchHead()
if (data.value) appStore.head = data.value

onMounted(() => {
	const runtimeConfig = useRuntimeConfig()
	amp.init(runtimeConfig.public.AMP)

	// Socket.init()

	// window.onbeforeunload = function () {
	// 	Socket.close()
	// }
})
</script>

<template>
	<CommandMenu :show="appStore.showCmd" />

	<NuxtLayout>
		<NuxtPage />

		<div id="tooltip" />
		<div id="modal" />
		<div id="dropdown" />

		<Notifications />
	</NuxtLayout>
</template>
