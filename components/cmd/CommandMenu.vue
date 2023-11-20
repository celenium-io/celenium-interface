<script setup>
/** Vendor */
import * as focusTrap from "focus-trap"

/** Composables */
import { useOutside } from "@/composables/outside"

/** UI */
import Kbd from "@/components/ui/Kbd.vue"

/** Services */
import { isMac } from "@/services/utils/general"

/** API */
import { search } from "@/services/api/search"

/** Store */
import { useAppStore } from "@/store/app"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const notificationsStore = useNotificationsStore()

import Item from "./Item.vue"

const appConfig = useAppConfig()

const router = useRouter()

let trap = null
const popupEl = ref(null)
const inputEl = ref(null)

let removeOutside = null

const searchTerm = ref("")

const bounce = ref(false)

const commandMode = ref(false)
const commandMetadata = reactive({
	action: null,
})
const resetMetadata = () => {
	commandMetadata.action = null
}

const runText = ref("")

const searchAction = {
	type: "callback",
	title: "Search your query on the blockchain...",
	runText: "Run Search",
	callback: async () => {
		if (!searchTerm.value.length) return

		const { data } = await search(searchTerm.value.trim())
		if (!data.value) {
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

		switch (data.value.type) {
			case "tx":
				router.push(`/tx/${data.value.result.hash}`)
				break

			case "block":
				router.push(`/block/${data.value.result.height}`)
				break

			case "namespace":
				router.push(`/namespace/${data.value.result.namespace_id}`)
				break

			case "address":
				router.push(`/address/${data.value.result.hash}`)
				break

			default:
				break
		}
	},
}

const navigationActions = [
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
		title: "Go to Namespaces",
		runText: "Open Namespaces",
		callback: () => {
			router.push("/namespaces")
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
]
const navigationGroup = computed(() => {
	return {
		title: "Navigation",
		actions: navigationActions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const quickCommandsActions = [
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
		icon: "folder",
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
		icon: "addresses",
		title: "Open Address..",
		subtitle: "Command",
		placeholder: "Type address hash...",
		runText: "Run Command",

		callback: (hash) => {
			router.push(`/address/${hash}`)
		},
	},
]
const quickCommandsGroup = computed(() => {
	return {
		title: "Quick Actions",
		actions: quickCommandsActions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const otherActions = [
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
	{
		type: "callback",
		icon: "arrow-narrow-up-right",
		title: "View last release",
		subtitle: "Quicklink",
		runText: "Open Github",
		callback: () => {
			window.open(`https://github.com/celenium-io/celenium-interface/releases/tag/v${appConfig.version}`, "_blank")
		},
	},
]
const otherGroup = computed(() => {
	return {
		title: "Other",
		actions: otherActions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const groups = [navigationGroup, quickCommandsGroup, otherGroup]

onMounted(() => {
	document.addEventListener("keydown", (e) => {
		if (["Escape"].includes(e.code) && appStore.showCmd) {
			if (!commandMode.value) {
				appStore.showCmd = false
				return
			} else {
				exitCommandMode()

				return
			}
		}

		if (!(e.code === "KeyK" && ((isMac && e.metaKey) || (!isMac && e.ctrlKey)))) return

		appStore.showCmd = !appStore.showCmd
	})
})

const exitCommandMode = () => {
	commandMode.value = false
	searchTerm.value = ""
	runText.value = ""

	runBounce()

	resetMetadata()
}

watch(
	() => appStore.showCmd,
	() => {
		if (appStore.showCmd) {
			nextTick(() => {
				document.addEventListener("keydown", onKeydown)

				handleFocus()

				trap = focusTrap.createFocusTrap(popupEl.value.wrapper, {
					initialFocus: false,
				})
				trap.activate()

				removeOutside = useOutside(popupEl.value.wrapper, () => {
					handleOutside()
				})
			})
		} else {
			document.removeEventListener("keydown", onKeydown)

			if (trap && trap.active) trap.deactivate()

			if (removeOutside) removeOutside()

			searchTerm.value = ""
		}
	},
)

const onActionFocus = (action) => {
	runText.value = action.runText
}

const handleReturn = (action) => {
	if (!commandMode.value && action) {
		switch (action.type) {
			case "callback":
				action.callback()
				appStore.showCmd = false
				break

			case "command:input":
				commandMode.value = true

				commandMetadata.action = action

				runText.value = action.runText

				inputEl.value.focus()
				searchTerm.value = ""

				runBounce()

				break

			default:
				break
		}
	}

	if (commandMode.value) {
		if (!searchTerm.value && commandMetadata.action.type === "command:input") return

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

		itemsToNavigate = popupEl.value.wrapper.querySelectorAll('[tabindex = "1"]')
		activeItemIdx = [...itemsToNavigate].findIndex((item) => item.isEqualNode(document.activeElement))
	}

	if (e.key === "ArrowDown") {
		if (activeItemIdx === -1 || activeItemIdx === itemsToNavigate.length - 1) {
			itemsToNavigate[0].focus()
		} else {
			itemsToNavigate[activeItemIdx + 1].focus()
		}
	}

	if (e.key === "ArrowUp") {
		if (activeItemIdx === -1 || activeItemIdx === 0) {
			itemsToNavigate[itemsToNavigate.length - 1].focus()
		} else {
			itemsToNavigate[activeItemIdx - 1].focus()
		}
	}

	if (e.key === "PageUp") {
		itemsToNavigate[0].focus()
	}

	if (e.key === "PageDown") {
		itemsToNavigate[itemsToNavigate.length - 1].focus()
	}
}

const handleFocus = () => {
	inputEl.value.focus()
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

const resetRunText = () => {
	if (!commandMode.value) runText.value = ""
}
</script>

<template>
	<Transition name="fastpopup">
		<div v-if="appStore.showCmd" :class="$style.wrapper">
			<Flex @click.stop ref="popupEl" direction="column" :class="[$style.popup, bounce && $style.bounce]">
				<!-- Input Field -->
				<Flex direction="column" :class="$style.header">
					<Flex v-if="commandMode" align="center" gap="8" :class="$style.breadcrumbs">
						<Icon @click="exitCommandMode" name="arrow-narrow-left" size="12" color="secondary" :class="$style.back_btn" />

						<Flex align="center" gap="6">
							<Text size="12" weight="600" color="tertiary">Quick Actions</Text>
							<Text size="12" weight="600" color="support">/</Text>
							<Text size="12" weight="600" color="secondary">{{ commandMetadata.action.title }}</Text>
						</Flex>
					</Flex>

					<Flex @click="handleFocus" align="center" :class="$style.input">
						<input
							v-model="searchTerm"
							ref="inputEl"
							:placeholder="
								!commandMode
									? 'Find blocks, namespaces, transactions or quick actions...'
									: commandMetadata.action.placeholder
							"
							tabindex="1"
							autocomplete="off"
							autocorrect="off"
							autocapitalize="off"
							spellcheck="false"
							@focus="resetRunText"
							@keydown.enter="handleReturn"
						/>
					</Flex>
				</Flex>

				<Flex v-if="!commandMode" direction="column" :class="$style.list">
					<template v-for="group in groups">
						<Flex v-if="group.value.actions.length" direction="column" :class="$style.group">
							<Text size="12" weight="500" color="tertiary" :class="$style.label">{{ group.value.title }}</Text>

							<Flex direction="column" :class="$style.actions">
								<Item
									v-for="action in group.value.actions"
									@click="handleReturn(action)"
									@onReturn="handleReturn"
									:action="action"
									@focus="onActionFocus(action)"
								/>
							</Flex>
						</Flex>
					</template>
					<Flex v-if="searchTerm.length" direction="column" :class="$style.group">
						<Text size="12" weight="500" color="tertiary" :class="$style.label">Query "{{ searchTerm }}"</Text>

						<Flex direction="column" :class="$style.actions">
							<Item
								@click="handleReturn(searchAction)"
								@onReturn="handleReturn"
								:action="searchAction"
								@focus="onActionFocus(searchAction)"
							/>
						</Flex>
					</Flex>
				</Flex>

				<Flex align="center" justify="between" :class="$style.footer">
					<Icon name="logo" size="14" color="tertiary" />

					<Flex v-if="runText.length" align="center" gap="8">
						<Text size="13" weight="600" color="primary">{{ runText }}</Text>
						<Kbd>
							<Icon name="return" size="12" color="primary" />
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

<style module>
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

	overflow-y: auto;

	padding-bottom: 4px;
}

.group {
	.label {
		position: sticky;
		top: 0;

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

@media (max-width: 750px) {
	.popup {
		width: 95%;
		top: 7%;
	}
}
</style>
