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
import { fetchLatestBlocks } from "@/services/api/block"

/** Store */
import { useNodeStore } from "@/store/node"
import { useAppStore } from "@/store/app"
import { useBookmarksStore } from "@/store/bookmarks"
import { useSettingsStore } from "@/store/settings"
import { useEnumStore } from "@/store/enums"
import { useLegalStore } from "@/store/legal"
import { useNotificationsStore } from "@/store/notifications"
const nodeStore = useNodeStore()
const appStore = useAppStore()
const bookmarksStore = useBookmarksStore()
const settingsStore = useSettingsStore()
const enumStore = useEnumStore()
const legalStore = useLegalStore()
const notificationsStore = useNotificationsStore()

bookmarksStore.$subscribe((mutation, state) => {
	localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks))
})
settingsStore.$subscribe((mutation, state) => {
	localStorage.setItem("settings", JSON.stringify(state))
})
legalStore.$subscribe((mutation, state) => {
	localStorage.setItem("legal", JSON.stringify(state.legal))
})

onMounted(async () => {
	if (localStorage.bookmarks) {
		bookmarksStore.bookmarks = JSON.parse(localStorage.bookmarks)
	}

	if (localStorage.nodeSettings) {
		nodeStore.settings = JSON.parse(localStorage.nodeSettings)
	}

	const runtimeConfig = useRuntimeConfig()
	amp.init(runtimeConfig.public.AMP)

	const data = await fetchLatestBlocks({ limit: 100 })
	appStore.latestBlocks = data
	appStore.isLatestBlocksLoaded = true

	const head = await fetchHead()
	if (head) appStore.lastHead = head

	Socket.init()

	const gasPrice = await fetchGasPrice()
	appStore.gas = gasPrice

	await enumStore.init()

	legalStore.init()
	if (!legalStore.isAccepted()) {
		notificationsStore.create({
			notification: {
				type: "warning",
				icon: "info",
				title: "Just so you know: we use analytics.",
				description: "privacy",
				autoDestroy: false,
				irremovable: true,
				actions: [
					{
						name: "OK",
						callback: () => {
							legalStore.acceptLegal()
						},
					},
				],
			},
		})
	}

	window.onbeforeunload = function () {
		Socket.close()
	}
})
</script>

<template>
	<CommandMenu :show="appStore.showCmd" />

	<NuxtLoadingIndicator :height="2" color="#18d2a5" />
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
