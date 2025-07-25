<script setup>
/** Vendor */
import { useDebounceFn } from "@vueuse/core"
import * as focusTrap from "focus-trap"
import { v4 as id } from "uuid"

/** Composables */
import { useOutside } from "@/composables/outside"

/** UI */
import Kbd from "@/components/ui/Kbd.vue"

/** Components */
import Item from "./Item.vue"

/** Custom Components */
import FeeCalculator from "./custom/FeeCalculator.vue"

/** Services */
import amp from "@/services/amp"
import { isMac, isPrefersDarkScheme, getNetworkName } from "@/services/utils/general"
import { capitilize } from "@/services/utils/strings"

/** API */
import { search } from "@/services/api/search"

/** Store */
import { useAppStore } from "@/store/app.store"
import { useCacheStore } from "@/store/cache.store"
import { useModalsStore } from "@/store/modals.store"
import { useBookmarksStore } from "@/store/bookmarks.store"
import { useNotificationsStore } from "@/store/notifications.store"
const appStore = useAppStore()
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()
const bookmarksStore = useBookmarksStore()
const notificationsStore = useNotificationsStore()

const appConfig = useAppConfig()

const developerMode = useCookie("developerMode", { default: () => false })
const theme = useCookie("theme", { default: () => "dark" })
const showPromoBackground = useCookie("showPromoBackground", { default: () => true })

const route = useRoute()
const router = useRouter()

let root = null

let trap = null
const popupEl = ref(null)
const inputEl = ref(null)

const listEl = ref(null)
const actionEl = ref(null)

let removeOutside = null

const placeholder = ref()
const searchTerm = ref("")

const bounce = ref(false)

const featurePreviewMode = ref(false)

const mode = ref(null)
const isCommandMode = computed(() => mode.value === "command")
const isCustomMode = computed(() => mode.value === "custom")

const rules = ref([])

/** Command Mode Params */
const commandMetadata = reactive({
	action: null,
})
const resetMetadata = () => {
	commandMetadata.action = null
}

/** Footer Metadata: Run Text */
const runText = ref("")

/**
 * Actions & Groups
 */

const suggestedActions = ref([])
const makeSuggestions = () => {
	suggestedActions.value = []

	if (route.name === "namespaces") {
		suggestedActions.value.push({
			type: "callback",
			icon: "treemap",
			title: "Open Treemap View",
			runText: "Open",
			callback: () => {
				router.push("/namespaces/treemap")
			},
		})
	}

	if (route.name === "namespace-id") {
		suggestedActions.value.push({
			type: "callback",
			icon: "namespace",
			title: "View Raw Namespace",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "namespace"
				modalsStore.open("rawData")
			},
		})
		suggestedActions.value.push({
			type: "callback",
			icon: "tx",
			title: "View Raw Messages",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "messages"
				modalsStore.open("rawData")
			},
		})
	}

	if (route.name === "block-height") {
		suggestedActions.value.push({
			type: "callback",
			icon: "block",
			title: "View Raw Block",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "block"
				modalsStore.open("rawData")
			},
		})
		suggestedActions.value.push({
			type: "callback",
			icon: "tx",
			title: "View Raw Transactions",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "transactions"
				modalsStore.open("rawData")
			},
		})
	}

	if (route.name === "tx-hash") {
		suggestedActions.value.push({
			type: "callback",
			icon: "blob",
			title: "View Blob",
			runText: "View",
			callback: () => {
				modalsStore.open("blob")
			},
		})
		suggestedActions.value.push({
			type: "callback",
			icon: "tx",
			title: "View Raw Transactions",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "transaction"
				modalsStore.open("rawData")
			},
		})
		suggestedActions.value.push({
			type: "callback",
			icon: "tx",
			title: "View Raw Events",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "events"
				modalsStore.open("rawData")
			},
		})
	}

	if (route.name === "address-hash") {
		suggestedActions.value.push({
			type: "callback",
			icon: "address",
			title: "View Raw Address",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "address"
				modalsStore.open("rawData")
			},
		})
		suggestedActions.value.push({
			type: "callback",
			icon: "tx",
			title: "View Raw Transactions",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "transactions"
				modalsStore.open("rawData")
			},
		})
	}
}
const suggestionGroup = computed(() => {
	const actions = suggestedActions.value.map((a) => ({ id: id(), ...a }))

	return {
		title: "Suggestion",
		actions: actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const rawNavigationActions = [
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Explorer",
		runText: "Open Explorer",
		callback: () => {
			router.push("/")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Namespaces",
		runText: "Open Namespaces",
		callback: () => {
			router.push("/namespaces")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Rollups",
		runText: "Open Rollups",
		callback: () => {
			router.push("/rollups")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Transactions",
		runText: "Open Transactions",
		callback: () => {
			router.push("/txs")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Blocks",
		runText: "Open Blocks",
		callback: () => {
			router.push("/blocks")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Validators",
		runText: "Open Validators",
		callback: () => {
			router.push("/validators")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Addresses",
		runText: "Open Addresses",
		callback: () => {
			router.push("/addresses")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Blobstream",
		runText: "Open Blobstream",
		callback: () => {
			router.push("/blobstream")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Cost Savings Calculator",
		runText: "Open Cost Savings",
		callback: () => {
			router.push("/calculators/savings")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Terminal",
		runText: "Open Terminal",
		callback: () => {
			location.href = "https://terminal.celenium.io"
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Faucet",
		runText: "Open Faucet",
		callback: () => {
			router.push("/faucet")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Documentation",
		runText: "Open Documentation",
		callback: () => {
			window.open("https://docs.celenium.io", "_blank")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Read Privacy Policy",
		runText: "Open Privacy Policy",
		callback: () => {
			router.push("/privacy-policy")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Read Terms of Use",
		runText: "Open Terms of Use",
		callback: () => {
			router.push("/terms-of-use")
		},
	},
]
const navigationGroup = computed(() => {
	const actions = rawNavigationActions.map((a) => ({ id: id(), ...a }))

	return {
		title: "Navigation",
		actions: actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const rawQuickCommandsActions = [
	{
		type: "callback",
		icon: "coins",
		title: "Send TIA",
		subtitle: "Command",
		runText: "Send TIA",

		callback: () => {
			modalsStore.open("send")
		},
	},
	{
		type: "callback",
		icon: "blob",
		title: "Submit data blob",
		subtitle: "Command",
		runText: "Submit blob",

		callback: () => {
			modalsStore.open("pfb")
		},
	},
	{
		type: "command:input",
		icon: "tx",
		title: "Open Transaction..",
		subtitle: "Command",
		placeholder: "Type tx hash...",
		runText: "Run Command",

		callback: (hash) => {
			router.push(`/tx/${hash}`)
		},

		metadata: {},
	},
	{
		type: "command:input",
		icon: "block",
		title: "Open Block..",
		subtitle: "Command",
		placeholder: "Type block height...",
		runText: "Run Command",

		callback: (height) => {
			router.push(`/block/${height}`)
		},
	},
	{
		type: "command:input",
		icon: "validator",
		title: "Open Validator..",
		subtitle: "Command",
		placeholder: "Type validator moniker...",
		runText: "Run Command",

		callback: (id) => {
			router.push(`/validator/${id}`)
		},
	},
	{
		type: "command:input",
		icon: "namespace",
		title: "Open Namespace..",
		subtitle: "Command",
		placeholder: "Type namespace ID...",
		runText: "Run Command",

		callback: (id) => {
			router.push(`/namespace/${id}`)
		},
	},
	{
		type: "command:input",
		icon: "address",
		title: "Open Address..",
		subtitle: "Command",
		placeholder: "Type address hash...",
		runText: "Run Command",

		callback: (hash) => {
			router.push(`/address/${hash}`)
		},
	},
	{
		type: "callback",
		icon: "gas",
		title: "Open Gas Tracker",
		subtitle: "Command",
		runText: "Open Gas Tracker",

		callback: () => {
			router.push("/gas")
		},
	},
	{
		type: "callback",
		icon: "bookmark-plus",
		title: "Open My Bookmarks",
		subtitle: "Command",
		runText: "Run Command",

		callback: () => {
			router.push("/bookmarks")
		},
	},
	{
		type: "command:custom",
		icon: "calc",
		title: "Run Fee Calculator",
		subtitle: "Command",
		placeholder: "Type gas limit",
		runText: "Calculate Gas Fee",
		nestedRunText: "Copy Result",

		rules: [
			{
				type: "input",
				callback: (str) => {
					if (parseFloat(str.replace(/[^0-9.]/g, "")) > 5_665_140_000) return "5665140000"
					return str.replace(/[^0-9.]/g, "")
				},
			},
		],

		callback: () => {
			amp.log("copyFeeResult", { loc: "cmd" })

			window.navigator.clipboard.writeText(copyData.value)

			notificationsStore.create({
				notification: {
					type: "info",
					icon: "check",
					title: `Gas fee calculation saved into clipboard`,
					autoDestroy: true,
				},
			})
		},
	},
]
const quickCommandsGroup = computed(() => {
	const actions = rawQuickCommandsActions.map((a) => ({ id: id(), ...a }))

	return {
		title: "Quick Actions",
		actions: actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const rawSettingsActions = [
	{
		type: "command:nested",
		icon: "moon",
		title: "Switch Theme",
		subtitle: "Command",
		placeholder: "Choose Theme...",
		runText: "Switch Theme",
		nestedTitle: "Theme",

		actions: [
			{
				id: id(),
				type: "callback",
				icon: "moon",
				title: "Dark Theme",
				subtitle: "Theme",
				runText: "Switch to Dark Theme",
				callback: () => {
					root.setAttribute("theme", "dark")
					appStore.theme = "dark"
					theme.value = "dark"
				},
			},
			{
				id: id(),
				type: "callback",
				icon: "sun",
				title: "Light Theme",
				subtitle: "Theme",
				runText: "Switch to Light Theme",
				callback: () => {
					root.setAttribute("theme", "light")
					appStore.theme = "light"
					theme.value = "light"
				},
			},
			{
				id: id(),
				type: "callback",
				icon: "moon",
				title: "Dimmed Theme",
				subtitle: "Theme",
				runText: "Switch to Dimmed Theme",
				callback: () => {
					root.setAttribute("theme", "dimmed")
					appStore.theme = "dimmed"
					theme.value = "dimmed"
				},
			},
			{
				id: id(),
				type: "callback",
				icon: "settings",
				title: "System Preferences",
				subtitle: "Theme",
				runText: "Switch to System",
				callback: () => {
					root.setAttribute("theme", isPrefersDarkScheme() ? "dark" : "light")
					appStore.theme = "system"
					theme.value = "system"
				},
			},
		],
	},
	{
		type: "command:nested",
		icon: "globe",
		title: "Switch Network",
		subtitle: "Command",
		placeholder: "Choose Network...",
		runText: "Switch Network",
		nestedTitle: "Network",

		actions: [
			{
				id: id(),
				type: "callback",
				icon: "globe",
				title: "Mainnet",
				subtitle: "Network",
				runText: "Switch to Mainnet",
				callback: () => {
					window.open("https://celenium.io", "_blank")
				},
			},
			{
				id: id(),
				type: "callback",
				icon: "globe",
				title: "Mocha-4",
				subtitle: "Network",
				runText: "Switch to Mocha-4",
				callback: () => {
					window.open("https://mocha-4.celenium.io", "_blank")
				},
			},
			{
				id: id(),
				type: "callback",
				icon: "globe",
				title: "Arabica",
				subtitle: "Network",
				runText: "Switch to Arabica",
				callback: () => {
					window.open("https://arabica.celenium.io", "_blank")
				},
			},
		],
	},
]
const settingsGroup = computed(() => {
	const actions = rawSettingsActions.map((a) => ({ id: id(), ...a }))

	return {
		title: "Settings",
		actions: actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const rawDeveloperActions = [
	{
		type: "callback",
		icon: "zap",
		title: "View Constants",
		subtitle: "Command",
		runText: "View Constants",
		callback: () => {
			router.push("/constants")
		},
	},
	{
		type: "callback",
		icon: "settings",
		title: "Full Reload",
		subtitle: "Command",
		runText: "Reload",
		callback: () => {
			appStore.createConfirmation({
				title: `Do you want to fully reload the page?`,
				description: "The app will reload with a cache reset",

				buttons: {
					confirm: {
						color: "red",
						title: "Yes, clear",
					},
					cancel: {
						title: "Cancel",
					},
				},

				confirmCb: () => {
					location.reload(true)

					modalsStore.close("confirmation")
				},
				cancelCb: () => {
					modalsStore.close("confirmation")
				},
			})
		},
	},
	{
		type: "callback",
		icon: "settings",
		title: "Clear local storage",
		subtitle: "Command",
		runText: "Clear",
		callback: () => {
			appStore.createConfirmation({
				title: `Do you want to clear local storage?`,
				description: "Your local storage will be cleared (including bookmarks)",

				buttons: {
					confirm: {
						color: "red",
						title: "Yes, clear",
					},
					cancel: {
						title: "Cancel",
					},
				},

				confirmCb: () => {
					localStorage.clear()

					notificationsStore.create({
						notification: {
							type: "info",
							icon: "check",
							title: `Local storage successfully cleared`,
							autoDestroy: true,
						},
					})

					modalsStore.close("confirmation")
				},
				cancelCb: () => {
					modalsStore.close("confirmation")
				},
			})
		},
	},
	{
		type: "callback",
		icon: "bookmark-plus",
		title: "Clear bookmarks",
		subtitle: "Command",
		runText: "Clear",
		callback: () => {
			appStore.createConfirmation({
				title: `Do you want to clear your bookmarks?`,
				description: "Your local storage for bookmarks will be cleared",

				buttons: {
					confirm: {
						color: "red",
						title: "Yes, delete all bookmarks",
					},
					cancel: {
						title: "Cancel",
					},
				},

				confirmCb: () => {
					localStorage.removeItem("bookmarks")
					bookmarksStore.clearBookmarks()

					notificationsStore.create({
						notification: {
							type: "info",
							icon: "check",
							title: `Your bookmarks successfully cleared`,
							autoDestroy: true,
						},
					})

					modalsStore.close("confirmation")
				},
				cancelCb: () => {
					modalsStore.close("confirmation")
				},
			})
		},
	},
	{
		type: "callback",
		icon: "settings",
		title: "Hard Reset",
		subtitle: "Command",
		runText: "Reset",
		callback: () => {
			appStore.createConfirmation({
				title: `Do you want to hard reset?`,
				description: "Your local storage will be cleared and app will reload with a cache reset",

				buttons: {
					confirm: {
						title: "Yes, reset",
					},
					cancel: {
						title: "Cancel",
					},
				},

				confirmCb: () => {
					localStorage.clear()
					location.reload(true)

					modalsStore.close("confirmation")
				},
				cancelCb: () => {
					modalsStore.close("confirmation")
				},
			})
		},
	},
	{
		type: "callback",
		icon: "stars",
		title: "Toggle Feature Preview",
		subtitle: "Command",
		runText: "Toggle",
		callback: () => {
			localStorage.featurePreview = !localStorage.featurePreview
			featurePreviewMode.value = !featurePreviewMode.value

			notificationsStore.create({
				notification: {
					type: "info",
					icon: featurePreviewMode.value ? "check" : "close",
					title: `Feature preview ${featurePreviewMode.value ? "enabled" : "disabled"}`,
					description:
						featurePreviewMode.value &&
						"You can now get early access to the new beta features. You can report bugs to our GitHub repo.",
					autoDestroy: true,
				},
			})
		},
	},
]
const developerGroup = computed(() => {
	const actions = rawDeveloperActions.map((a) => ({ id: id(), ...a }))

	return {
		title: "Developer",
		actions: developerMode.value ? actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())) : [],
	}
})

const rawOtherActions = [
	{
		type: "callback",
		icon: "settings",
		title: "Toggle Promo Background",
		subtitle: "Command",
		runText: "Toggle",
		callback: () => {
			if (getNetworkName() !== "Mammoth") {
				notificationsStore.create({
					notification: {
						type: "info",
						icon: "info",
						title: `Available for the mammoth network only`,
						autoDestroy: true,
					},
				})
				return
			}

			showPromoBackground.value = !showPromoBackground.value
			notificationsStore.create({
				notification: {
					type: "info",
					icon: "info",
					title: `Promo background ${showPromoBackground.value ? "enabled" : "disabled"}`,
					autoDestroy: true,
				},
			})
		},
	},
	{
		type: "callback",
		icon: "terminal",
		title: "Toggle Developer Mode",
		subtitle: "Command",
		runText: "Toggle",
		callback: () => {
			developerMode.value = !developerMode.value

			notificationsStore.create({
				notification: {
					type: "info",
					icon: developerMode.value ? "check" : "close",
					title: `Developer mode ${developerMode.value ? "enabled" : "disabled"}`,
					description: developerMode.value && "Now you can access additional features in the command menu.",
					autoDestroy: true,
				},
			})
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-up-right",
		title: "View Last Release",
		subtitle: "Quicklink",
		runText: "Open Github",
		callback: () => {
			window.open(`https://github.com/celenium-io/celenium-interface/releases/tag/v${appConfig.version}`, "_blank")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-up-right",
		title: "Go to Discord",
		subtitle: "Quicklink",
		runText: "Open Discord",
		callback: () => {
			window.open("https://discord.com/channels/846362414039695391/1168936555302355005", "_blank")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-up-right",
		title: "Go to Twitter",
		subtitle: "Quicklink",
		runText: "Open Twitter",
		callback: () => {
			window.open("https://twitter.com/celenium_io", "_blank")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-up-right",
		title: "Go to Github",
		subtitle: "Quicklink",
		runText: "Open Github",
		callback: () => {
			window.open("https://github.com/celenium-io", "_blank")
		},
	},
]
const otherGroup = computed(() => {
	const actions = rawOtherActions.map((a) => ({ id: id(), ...a }))

	return {
		title: "Other",
		actions: actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const searchAction = {
	id: id(),
	type: "callback",
	icon: "search",
	title: "Search your query on the blockchain...",
	runText: "Run Search",
	callback: async () => {
		if (!searchTerm.value.length) return

		const { data } = await search(searchTerm.value.trim())
		if (!data.value.length) {
			notificationsStore.create({
				notification: {
					type: "info",
					icon: "search",
					title: "Nothing was found",
					description: "Use the hash of a block, transaction, address or namespace for correct search",
					autoDestroy: true,
				},
			})

			return
		}

		switch (data.value[0].type) {
			case "tx":
				router.push(`/tx/${data.value[0].result.hash}`)
				break

			case "block":
				router.push(`/block/${data.value[0].result.height}`)
				break

			case "namespace":
				router.push(`/namespace/${data.value[0].result.namespace_id}`)
				break

			case "address":
				router.push(`/address/${data.value[0].result.hash}`)
				break

			case "rollup":
				router.push(`/rollup/${data.value[0].result.slug}`)
				break

			case "validator":
				router.push(`/validator/${data.value[0].result.id}`)
				break

			default:
				break
		}
	},
}
const searchGroup = computed(() => {
	return {
		title: `Query "${searchTerm.value}"`,
		actions: searchTerm.value ? [searchAction] : [],
	}
})

const autocompleteActions = ref([])
const autocompleteGroup = computed(() => {
	return {
		title: "Search Result",
		actions: autocompleteActions.value,
	}
})

const debouncedSearch = useDebounceFn(async (e) => {
	const bookmarks = bookmarksStore.searchBookmarks(searchTerm.value)
	const { data } = await search(searchTerm.value.trim())

	if (!data.value?.length) return

	data.value = [...bookmarks, ...data.value]

	amp.log("showAutocomplete", { count: data.value.length, firstType: data.value[0].type })

	autocompleteActions.value = []

	for (let i = 0; i < Math.min(5, data.value.length); i++) {
		let title
		let routerLink
		switch (data.value[i].type.toLowerCase()) {
			case "tx":
			case "transaction":
				data.value[i].type = "tx"
				title = data.value[i].result.alias || data.value[i].result.hash
				routerLink = `/tx/${data.value[i].bookmark ? data.value[i].result.id : data.value[i].result.hash}`
				break

			case "block":
				title = data.value[i].result.alias || data.value[i].result.hash
				routerLink = `/block/${data.value[i].bookmark ? data.value[i].result.id : data.value[i].result.height}`
				break

			case "namespace":
				title = data.value[i].result.alias || data.value[i].result.hash
				routerLink = `/namespace/${data.value[i].bookmark ? data.value[i].result.id : data.value[i].result.namespace_id}`
				break

			case "address":
				title = data.value[i].result.alias || data.value[i].result.hash
				routerLink = `/address/${data.value[i].bookmark ? data.value[i].result.id : data.value[i].result.hash}`
				break

			case "rollup":
				title = data.value[i].result.name
				routerLink = `/rollup/${data.value[i].result.slug}`
				break

			case "validator":
				title =
					data.value[i].result.alias || data.value[i].result.moniker ? data.value[i].result.moniker : data.value[i].result.address
				routerLink = `/validator/${data.value[i].result.id}`
				break

			default:
				break
		}

		autocompleteActions.value.push({
			id: id(),
			type: "callback",
			bookmark: data.value[i].bookmark,
			icon: data.value[i].type,
			title: title,
			subtitle: capitilize(data.value[i].type),
			runText: "Open",
			callback: () => {
				router.push(routerLink)
			},
		})
	}
}, 250)

const groups = reactive([
	suggestionGroup,
	quickCommandsGroup,
	settingsGroup,
	navigationGroup,
	developerGroup,
	otherGroup,
	searchGroup,
	autocompleteGroup,
])

const fakeFocus = ref()

const copyData = ref()
const handleShareCopyData = (data) => {
	copyData.value = data
}

onMounted(() => {
	featurePreviewMode.value = localStorage.featurePreview

	root = document.querySelector("html")

	document.addEventListener("keydown", (e) => {
		if (["Escape"].includes(e.code) && appStore.showCmd) {
			if (!mode.value) {
				appStore.showCmd = false
				return
			} else {
				exitCommandMode()

				return
			}
		}

		if (e.code === "KeyK" && ((isMac && e.metaKey) || (!isMac && e.ctrlKey))) {
			e.preventDefault()

			appStore.showCmd = !appStore.showCmd

			if (appStore.showCmd) {
				amp.log("openCmd")
			}
		}
	})
})

const exitCommandMode = () => {
	mode.value = null
	searchTerm.value = ""
	runText.value = ""
	placeholder.value = null
	rules.value = []

	runBounce()

	resetMetadata()
}

watch(
	() => appStore.showCmd,
	() => {
		if (appStore.showCmd) {
			makeSuggestions()

			nextTick(() => {
				document.addEventListener("keydown", onKeydown)

				fakeFocus.value = actionEl.value[0].wrapper.wrapper.id

				handleFocus()

				trap = focusTrap.createFocusTrap(popupEl.value.wrapper, {
					initialFocus: false,
				})
				trap.activate()

				if (appStore.cmdAction) {
					const action = rawQuickCommandsActions.find((a) => a.title === appStore.cmdAction)
					handleExecute({ id: 1, ...action })
				}

				removeOutside = useOutside(popupEl.value.wrapper, () => {
					handleOutside()
				})
			})
		} else {
			appStore.cmdAction = null

			document.removeEventListener("keydown", onKeydown)

			if (trap && trap.active) trap.deactivate()

			if (removeOutside) removeOutside()

			searchTerm.value = ""
			autocompleteActions.value = []
		}
	},
)

const getActionById = () => {
	const actions = []
	let target = null

	groups.forEach((g) => {
		g.value.actions.forEach((a) => {
			actions.push(a)

			if (a.actions) {
				actions.push(...a.actions)
			}
		})
	})

	actions.forEach((a) => {
		if (a.id === fakeFocus.value) {
			target = a
		}
	})

	return target
}

const onActionFocus = () => {
	const action = getActionById()

	if (!action) return

	if (!mode.value) {
		runText.value = action.runText
	} else {
		runText.value = action.nestedRunText ? action.nestedRunText : action.runText
	}
}

const handleSearchTermInput = () => {
	if (!searchTerm.value.length) return
	if (!rules.value.length) return

	const inputRules = rules.value.filter((r) => r.type === "input")

	inputRules.forEach((r) => {
		searchTerm.value = r.callback(searchTerm.value)
	})
}

const handleExecute = (action) => {
	/** Set fake focus on click */
	if (action && action.id && action.id !== fakeFocus.value) {
		fakeFocus.value = action.id
	}

	let target = action?.id ? action : null

	if (!target) {
		target = getActionById()
	}

	if (!isCommandMode.value && target) {
		switch (target.type) {
			case "callback":
				target.callback()
				appStore.showCmd = false
				break

			case "command:input":
				mode.value = "command"

				if (target.placeholder) placeholder.value = target.placeholder

				commandMetadata.action = target

				runText.value = target.runText

				inputEl.value.focus()
				searchTerm.value = ""

				runBounce()

				break

			case "command:nested":
				mode.value = "command"

				if (target.placeholder) placeholder.value = target.placeholder

				commandMetadata.action = target

				runText.value = target.runText

				inputEl.value.focus()
				searchTerm.value = ""

				nextTick(() => {
					fakeFocus.value = actionEl.value[0].wrapper.wrapper.id
				})

				runBounce()

				break

			case "command:custom":
				mode.value = "custom"

				amp.log("openFeeCalculator")

				runText.value = target.runText

				if (target.placeholder) placeholder.value = target.placeholder
				if (target.nestedRunText) runText.value = target.nestedRunText
				if (target.rules) rules.value = target.rules

				commandMetadata.action = target

				searchTerm.value = ""

				runBounce()

				break

			default:
				break
		}

		return
	}

	if (isCommandMode.value) {
		if (commandMetadata.action.type === "command:nested") {
			target.callback()
			appStore.showCmd = false

			exitCommandMode()

			return
		}

		if (!searchTerm.value && commandMetadata.action.type === "command:input") return

		commandMetadata.action.callback(searchTerm.value)
		exitCommandMode()

		appStore.showCmd = false
	}

	if (isCustomMode.value) {
		if (!searchTerm.value || !copyData.value) return

		commandMetadata.action.callback(searchTerm.value)
		exitCommandMode()

		appStore.showCmd = false
	}
}

const onKeydown = (e) => {
	let itemsToNavigate = null
	let activeItemIdx = null

	if (["ArrowDown", "ArrowUp", "PageUp", "PageDown"].includes(e.key)) {
		e.preventDefault()

		itemsToNavigate = actionEl.value
		activeItemIdx = [...actionEl.value].findIndex((item) => item.wrapper.wrapper.id === fakeFocus.value)
	}

	if (e.key === "ArrowDown") {
		if (activeItemIdx === -1 || activeItemIdx === itemsToNavigate.length - 1) {
			fakeFocus.value = itemsToNavigate[0].wrapper.wrapper.id
		} else {
			fakeFocus.value = itemsToNavigate[activeItemIdx + 1].wrapper.wrapper.id
		}
	}

	if (e.key === "ArrowUp") {
		if (activeItemIdx === -1 || activeItemIdx === 0) {
			fakeFocus.value = itemsToNavigate[itemsToNavigate.length - 1].wrapper.wrapper.id
		} else {
			fakeFocus.value = itemsToNavigate[activeItemIdx - 1].wrapper.wrapper.id
		}
	}

	if (e.key === "PageUp") {
		fakeFocus.value = itemsToNavigate[0].wrapper.wrapper.id
	}

	if (e.key === "PageDown") {
		fakeFocus.value = itemsToNavigate[itemsToNavigate.length - 1].wrapper.wrapper.id
	}

	if (["ArrowDown", "ArrowUp", "PageUp", "PageDown"].includes(e.key)) {
		actionEl.value.forEach((a) => {
			if (a.wrapper.wrapper.id === fakeFocus.value) {
				a.wrapper.wrapper.scrollIntoView({ block: "nearest" })
			}
		})
	}
}

watch(
	() => searchTerm.value,
	() => {
		if (searchTerm.value.length < 3 && !mode.value) {
			autocompleteActions.value = []
		} else if (searchTerm.value.length > 2 && !mode.value) {
			debouncedSearch()
		}

		nextTick(() => {
			fakeFocus.value = actionEl.value[0]?.wrapper.wrapper.id
		})
	},
)

watch(
	() => fakeFocus.value,
	() => {
		onActionFocus()
	},
)

const handleFocus = () => {
	inputEl.value?.focus()
}

const handleOutside = () => {
	exitCommandMode()

	appStore.showCmd = false
}

const runBounce = () => {
	bounce.value = true
	setTimeout(() => {
		bounce.value = false
	}, 150)
}
</script>

<template>
	<Transition name="fastpopup">
		<div v-if="appStore.showCmd" :class="$style.wrapper">
			<Flex @click.stop="handleFocus" ref="popupEl" direction="column" :class="[$style.popup, bounce && $style.bounce]">
				<!-- Input Field -->
				<Flex direction="column" :class="$style.header">
					<Flex v-if="isCommandMode" align="center" gap="8" :class="$style.breadcrumbs">
						<Icon @click="exitCommandMode" name="arrow-narrow-left" size="12" color="secondary" :class="$style.back_btn" />

						<Flex align="center" gap="6">
							<Text size="12" weight="600" color="tertiary">Quick Actions</Text>
							<Text size="12" weight="600" color="support">/</Text>
							<Text size="12" weight="600" color="secondary">{{ commandMetadata.action.title }}</Text>
						</Flex>
					</Flex>

					<Flex align="center" :class="$style.input">
						<input
							v-model="searchTerm"
							ref="inputEl"
							:placeholder="placeholder || 'Find blocks, validators, namespaces, rollups, transactions or quick actions...'"
							tabindex="1"
							autocomplete="off"
							autocorrect="off"
							autocapitalize="off"
							spellcheck="false"
							@input="handleSearchTermInput"
							@keydown.enter="handleExecute"
						/>
					</Flex>
				</Flex>

				<!-- Default List -->
				<Flex v-if="!mode" ref="listEl" direction="column" :class="$style.list">
					<template v-for="group in groups">
						<Flex v-if="group.value.actions.length" direction="column" :class="$style.group">
							<Text size="12" weight="500" color="tertiary" :class="$style.label">{{ group.value.title }}</Text>

							<Flex direction="column" :class="$style.actions">
								<Item
									v-for="action in group.value.actions"
									ref="actionEl"
									:id="action.id"
									@click="handleExecute(action)"
									:action="action"
									:isFocused="action.id === fakeFocus"
								/>
							</Flex>
						</Flex>
					</template>
				</Flex>

				<!-- Command Mode -->
				<Flex v-else-if="isCommandMode" direction="column" :class="$style.list">
					<Flex direction="column" :class="$style.group">
						<Text v-if="commandMetadata.action.nestedTitle" size="12" weight="500" color="tertiary" :class="$style.label">
							{{ commandMetadata.action.nestedTitle }}
						</Text>

						<Flex direction="column" :class="$style.actions">
							<Item
								v-for="action in commandMetadata.action.actions"
								ref="actionEl"
								:id="action.id"
								@click="handleExecute(action)"
								:action="action"
								:isFocused="action.id === fakeFocus"
							/>
						</Flex>
					</Flex>
				</Flex>

				<!-- Custom Component Mode -->
				<Flex v-else-if="isCustomMode" direction="column" :class="$style.list">
					<FeeCalculator :searchTerm="searchTerm" @shareCopyData="handleShareCopyData" />
				</Flex>

				<Flex align="center" justify="between" :class="$style.footer">
					<Icon name="logo" size="14" color="tertiary" />

					<Flex v-if="runText.length" @click="handleExecute(getActionById())" align="center" gap="8" :class="$style.button">
						<Text size="13" weight="600" color="secondary">{{ runText }}</Text>
						<Kbd>
							<Icon name="return" size="12" color="secondary" />
						</Kbd>
					</Flex>
					<Flex v-else align="center" gap="8">
						<Text size="13" weight="600" color="tertiary">Navigate</Text>
						<Kbd><Text size="12" weight="600" color="primary">↓</Text></Kbd>
						<Kbd><Text size="12" weight="600" color="primary">↑</Text></Kbd>
					</Flex>
				</Flex>
			</Flex>
		</div>
	</Transition>
</template>

<style module lang="scss">
.wrapper {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	z-index: 2000;

	background: rgba(0, 0, 0, 15%);
}

.popup {
	position: fixed;
	top: clamp(15%, 20%, 50%);
	left: 50%;
	transform: translateX(-50%);
	transform-origin: center;

	z-index: 2001;

	width: 700px;
	max-height: 450px;
	overflow: hidden;

	border-radius: 10px;
	background: var(--card-background);
	border: 2px solid var(--op-5);
}

.popup.bounce {
	animation: bounce 0.1s ease-in-out;
}

@keyframes bounce {
	0% {
		transform: translateY(-5px) translateX(-50%);
	}

	100% {
		transform: translateY(0) translateX(-50%);
	}
}

.header {
	padding: 0 12px;

	.breadcrumbs {
		padding-top: 12px;

		.back_btn {
			background: var(--op-5);
			border-radius: 4px;
			box-sizing: content-box;
			cursor: pointer;

			padding: 2px 4px;

			transition: all 0.2s ease;

			&:hover {
				background: var(--op-8);
			}

			&:active {
				background: var(--op-10);
			}
		}
	}

	.input {
		min-height: 48px;

		cursor: text;
		border-bottom: 1px solid var(--op-5);

		& input {
			width: 100%;

			font-size: 14px;
			line-height: 1;
			color: var(--txt-primary);
			font-weight: 500;
		}

		& input::-webkit-input-placeholder {
			color: var(--txt-tertiary);
		}
	}
}

.list {
	flex: 1;

	scroll-padding: 4px;
	overflow-y: auto;

	overscroll-behavior: contain;

	padding-bottom: 4px;
}

.group {
	.label {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;

		background: var(--card-background);

		padding: 12px 12px 6px 12px;
	}

	.actions {
		padding: 0 4px;
	}
}

.footer {
	background: var(--op-5);
	border-top: 1px solid var(--op-5);

	padding: 6px 8px;
}

/** footer button */
.button {
	cursor: pointer;

	&:hover {
		span {
			color: var(--txt-primary);
		}
	}
}

@media (max-width: 750px) {
	.popup {
		width: 95%;
		top: 7%;
	}
}
</style>
