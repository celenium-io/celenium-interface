<script setup>
/** API */
import Socket from "@/services/api/socket"
import { fetchHead } from "@/services/api/main"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const { data } = await fetchHead()
if (data.value) appStore.head = data.value

onMounted(() => {
	Socket.init()

	window.onbeforeunload = function () {
		Socket.close()
	}
})
</script>

<template>
	<NuxtLayout>
		<NuxtPage />

		<div id="tooltip" />
		<div id="modal" />

		<Notifications />
	</NuxtLayout>
</template>
