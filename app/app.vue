<script setup>
/** Services */
import Socket from "~/services/api/socket.js"
import { watchForUpdate } from "~/services/version.js"
import { DEFAULT_SETTINGS } from "~/services/constants/settings.js"
import { isPrefersDarkScheme } from "~/services/utils/index.js"

/** Components */
import ModalsManager from "~/components/modals/ModalsManager.vue"
import CommandMenu from "~/components/cmd/CommandMenu.vue"

/** API */
import { fetchGasPrice } from "~/services/api/gas.js"
import { fetchHead } from "~/services/api/main.js"
import { fetchLatestBlocks } from "~/services/api/block.js"

/** Store */
import { useNodeStore } from "~/store/node.store.js"
import { useAppStore } from "~/store/app.store.js"
import { useBookmarksStore } from "~/store/bookmarks.store.js"
import { useSettingsStore } from "~/store/settings.store.js"
import { useEnumStore } from "~/store/enums.store.js"
import { useLegalStore } from "~/store/legal.store.js"
import { useNotificationsStore } from "~/store/notifications.store.js"

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

appStore.initConstants()

let watchInterval = null

const settings = useCookie("localSettings", {
	default: () => {
		return DEFAULT_SETTINGS
	},
})

switch (settings.value.appearance.general.theme) {
	case "dark":
	case "dimmed":
	case "light":
		appStore.theme = settings.value.appearance.general.theme

		break

	case "system":
		appStore.theme = "system"

		break
}

watch(
	() => settings.value.appearance.general.theme,
	() => {
		let root = document.querySelector("html")

		if (appStore.theme === "system") {
			window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
				root.setAttribute("theme", isPrefersDarkScheme() ? "dark" : "light")
			})
		} else {
			root.setAttribute("theme", settings.value.appearance.general.theme)
		}
	},
	{ deep: true },
)

onMounted(async () => {
	let root = document.querySelector("html")

	if (appStore.theme === "system") {
		root.setAttribute("theme", isPrefersDarkScheme() ? "dark" : "light")
	} else {
		root.setAttribute("theme", appStore.theme)
	}

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
