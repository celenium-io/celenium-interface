<script setup>
/** Services */
import Socket from "@/services/api/socket"
import amp from "@/services/amp"

/** Components */
import ModalsManager from "@/components/modals/ModalsManager.vue"
import CommandMenu from "@/components/cmd/CommandMenu.vue"

/** API */
import { fetchGasPrice } from "@/services/api/gas"
import { fetchHead } from "@/services/api/main"

/** Store */
import { useAppStore } from "@/store/app"
import { useBookmarksStore } from "@/store/bookmarks"
const appStore = useAppStore()
const bookmarksStore = useBookmarksStore()
bookmarksStore.$subscribe((mutation, state) => {
	localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks))
})

onMounted(async () => {
	const runtimeConfig = useRuntimeConfig()
	amp.init(runtimeConfig.public.AMP)

	const data = await fetchHead()
	if (data) appStore.lastHead = data

	Socket.init()

	if (localStorage.bookmarks) {
		bookmarksStore.bookmarks = JSON.parse(localStorage.bookmarks)
	}

	const data = await fetchGasPrice()
	appStore.gas = data

	window.onbeforeunload = function () {
		Socket.close()
	}
})
</script>

<template>
	<CommandMenu :show="appStore.showCmd" />

	<NuxtLoadingIndicator height="2" color="#0ade71" />
	<NuxtLayout>
		<NuxtPage />

		<div id="tooltip" />
		<div id="modal" />
		<div id="dropdown" />
		<div id="popover" />

		<ModalsManager />
		<Notifications />
	</NuxtLayout>
</template>
