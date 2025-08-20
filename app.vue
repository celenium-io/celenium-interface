<script setup>
/** Vendor */
import * as Sentry from "@sentry/vue"

/** Services */
import Socket from "@/services/api/socket"
import amp from "@/services/amp"
import { watchForUpdate } from "@/services/version"

/** Components */
import ModalsManager from "@/components/modals/ModalsManager.vue"
import CommandMenu from "@/components/cmd/CommandMenu.vue"

/** API */
import { fetchGasPrice } from "@/services/api/gas"
import { fetchHead } from "@/services/api/main"
import { fetchLatestBlocks } from "@/services/api/block"

/** Store */
import { useNodeStore } from "@/store/node.store"
import { useAppStore } from "@/store/app.store"
import { useBookmarksStore } from "@/store/bookmarks.store"
import { useSettingsStore } from "@/store/settings.store"
import { useEnumStore } from "@/store/enums.store"
import { useLegalStore } from "@/store/legal.store"
import { useNotificationsStore } from "@/store/notifications.store"
import { useActivityStore } from "@/store/activity.store"
const nodeStore = useNodeStore()
const appStore = useAppStore()
const bookmarksStore = useBookmarksStore()
const settingsStore = useSettingsStore()
const enumStore = useEnumStore()
const legalStore = useLegalStore()
const notificationsStore = useNotificationsStore()
const activityStore = useActivityStore()

bookmarksStore.$subscribe((mutation, state) => {
	localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks))
})
settingsStore.$subscribe((mutation, state) => {
	localStorage.setItem("settings", JSON.stringify(state))
})
legalStore.$subscribe((mutation, state) => {
	localStorage.setItem("legal", JSON.stringify(state.legal))
})
activityStore.$subscribe((mutation, state) => {
	localStorage.setItem("rollups_ranking", JSON.stringify(state.rollups_ranking))
})

appStore.initConstants()

let watchInterval = null

onMounted(async () => {
	/**
	 * Watch for package.json->version and notify users about the new version
	 */
	appStore.version = (await $fetch("/api/version")).version
	if (!import.meta.dev)
		watchInterval = watchForUpdate(appStore.version, (newVersion) => {
			clearInterval(watchInterval)
			notificationsStore.create({
				notification: {
					type: "success",
					icon: "info",
					title: "New update is available",
					description: "Refresh the page to get the latest update with new features & bug fixes.",
					autoDestroy: false,
					irremovable: true,
					actions: [
						{
							name: "Refresh",
							icon: "refresh",
							callback: () => {
								location.reload()
							},
						},
						{
							name: "Changelog",
							icon: "menu",
							callback: () => {
								window
									.open(`https://github.com/celenium-io/celenium-interface/releases/tag/v${newVersion}`, "_blank")
									.focus()
							},
						},
					],
				},
			})
		})

	if (localStorage.bookmarks) {
		bookmarksStore.bookmarks = JSON.parse(localStorage.bookmarks)
	}

	if (localStorage.nodeSettings) {
		nodeStore.settings = JSON.parse(localStorage.nodeSettings)
	}

	settingsStore.init()
	activityStore.init()

	appStore.initGlobalUpdates()
	
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

	if (window.location.hostname !== "localhost") {
		Sentry.init({
			dsn: "https://2801a6c0442d2b0cd4df995e4bbe45dc@newsentry.baking-bad.org/12",
			integrations: [
				Sentry.replayIntegration({
					maskAllText: false,
					blockAllMedia: false,
				}),
			],

			// Session Replay
			replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
			replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
		})
	}

	window.onbeforeunload = function () {
		Socket.close()
	}
})

onBeforeUnmount(() => {
	clearInterval(watchInterval)
})
</script>

<template>
	<CommandMenu :show="appStore.showCmd" />

	<NuxtLoadingIndicator :height="2" color="#18d2a5" />
	<NuxtLayout>
		<NuxtPage />

		<div id="tooltip" />
		<div id="dropdown" />
		<div id="popover" />
		<div id="modal" />

		<ModalsManager />
		<Notifications />
	</NuxtLayout>
</template>
