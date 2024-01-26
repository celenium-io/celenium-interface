<script setup>
/** Services */
import Socket from "@/services/api/socket"
import { fetchHead } from "@/services/api/main"
import amp from "@/services/amp"

/** Components */
import ModalsManager from "@/components/modals/ModalsManager.vue"
import CommandMenu from "@/components/cmd/CommandMenu.vue"

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

	if (localStorage.bookmarks) {
		bookmarksStore.bookmarks = JSON.parse(localStorage.bookmarks)
	}

	Socket.init()

	const data = await fetchHead()
	if (data) appStore.head = data

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
