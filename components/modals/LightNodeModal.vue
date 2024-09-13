<script setup>
import MyWorker from "@/assets/workers/worker.js?worker&url"

/** Vendor */
import { DateTime } from "luxon"
import init, { NodeClient, NodeConfig, Network } from "@/services/lumina-node-wasm/index.js"

/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Spinner from "@/components/ui/Spinner.vue"

/** Constants */
import { StatusMap, StatusLabelMap, NodeSpeedMap } from "@/services/constants/node.js"

/** Services */
import amp from "@/services/amp"
import { comma, isMobile } from "@/services/utils"

/** Stores */
import { useAppStore } from "@/store/app.js"
import { useNodeStore } from "@/store/node.js"
import { useModalsStore } from "@/store/modals.js"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const nodeStore = useNodeStore()
const modalsStore = useModalsStore()
const notificationsStore = useNotificationsStore()

const showMobileWarning = useCookie("showMobileWarning", { default: () => true })
const showOnboardingBanner = useCookie("showOnboardingBanner", { default: () => true })

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

let bc
onMounted(async () => {
	await init()
	initConfig()

	nodeStore.status = StatusMap.Initialized

	nodeStore.settings.network = networks[selectedNetwork.value]

	bc = new BroadcastChannel("node")
	bc.postMessage("ping")
	bc.onmessage = (e) => {
		if (e.data === "ping" && status.value === StatusMap.Started) {
			bc.postMessage("running")
		}
		if (e.data === "running") {
			disableStart.value = true
		}
		if (e.data === "start" && status.value === StatusMap.Initialized) {
			disableStart.value = true
		}
	}

	/** autostart */
	if (nodeStore.settings.autostart) {
		const delayedStart = setTimeout(() => {
			handleStart()

			amp.log("sampling:autostartTrigger", { network: networks[selectedNetwork.value], mobile: isMobile() })

			setTimeout(() => {
				notificationsStore.create({
					notification: {
						type: "success",
						icon: "lumina",
						title: `Starting the light node`,
						autoDestroy: true,
						actions: [
							{
								icon: "arrow-narrow-up-right",
								name: "View ",
								callback: () => {
									modalsStore.open("lightNode")
								},
							},
						],
					},
				})
			}, 1000)
		}, 5000)

		notificationsStore.create({
			notification: {
				type: "info",
				icon: "lumina",
				title: `Autostart of light node in 5 seconds`,
				description: "Cancel start or disable autostart as required using the buttons below",
				autoDestroy: true,
				delay: 5500,
				actions: [
					{
						icon: "",
						name: "Cancel start",
						callback: () => {
							clearTimeout(delayedStart)

							amp.log("sampling:cancelAutostart", { network: networks[selectedNetwork.value], mobile: isMobile() })
						},
					},
					{
						icon: "",
						name: "Disable autostart",
						callback: () => {
							clearTimeout(delayedStart)
							nodeStore.settings.autostart = false

							amp.log("sampling:disableAutostartFromNotification", {
								network: networks[selectedNetwork.value],
								mobile: isMobile(),
							})
						},
					},
				],
			},
		})
	}
})

const disableStart = ref(false)
const status = computed(() => nodeStore.status)

const networks = ["Mainnet", "Arabica", "Mocha"]
const selectedNetwork = ref()

const { hostname } = useRequestURL()
switch (hostname) {
	case "celenium.io":
		selectedNetwork.value = Network.Mainnet
		break

	case "mocha-4.celenium.io":
		selectedNetwork.value = Network.Mocha
		break

	case "mocha.celenium.io":
		selectedNetwork.value = Network.Mocha
		break

	case "arabica.celenium.io":
		selectedNetwork.value = Network.Arabica
		break

	case "dev.celenium.io":
		selectedNetwork.value = Network.Arabica
		break

	case "localhost":
		selectedNetwork.value = Network.Arabica
		break

	default:
		selectedNetwork.value = Network.Arabica
		break
}

const handleOpenSettings = () => {
	modalsStore.open("lightNodeSettings")
}

/**
 * Cards (show/hide)
 */
const showDetails = ref(false)
const showLogs = ref(false)
const showSquare = ref(false)

/**
 * Bootnodes
 */
const config = ref()

/**
 * Timing
 */
const startTime = ref()
const spend = ref()

/**
 * blocks/min
 */
const blocksPerMinute = ref(0)
const blocks = ref([])
const removeOldBlocks = () => {
	const cutoffTime = new Date().getTime() - 60_000
	blocks.value = blocks.value.filter((ts) => ts > cutoffTime)
}
const addBlock = () => {
	blocks.value.push(new Date().getTime())
	removeOldBlocks()

	calcBlocksPerMinute()
}
const calcBlocksPerMinute = () => {
	removeOldBlocks()
	blocksPerMinute.value = blocks.value.length
}

/**
 * Node
 */
const approxSyncingWindowSize = (30 * 24 * 60 * 60) / 12

const node = ref()
const pid = ref()
const backwardsSyncProgress = ref()
const hash = ref()
const frontHead = ref()
const squareSize = ref()
const shares = ref({})

const latestEventsTime = ref()
const rawEvents = ref([])
const isPausedReceivingEvents = ref(false)

const speed = ref(NodeSpeedMap.Fast)
const getEventsLogIconColor = () => {
	switch (speed.value) {
		case NodeSpeedMap.Fast:
			return "brand"
		case NodeSpeedMap.Medium:
			return "yellow"
		case NodeSpeedMap.Slow:
			return "red"
		case NodeSpeedMap.Silence:
			return "tertiary"
	}
}

const initConfig = () => {
	config.value = NodeConfig.default(selectedNetwork.value)
	nodeStore.rawBootnodes = config.value.bootnodes
	nodeStore.bootnodes = config.value.bootnodes
}

watch(
	() => nodeStore.bootnodes,
	() => {
		config.value.bootnodes = nodeStore.bootnodes
	},
)

let errorTimeout
const showWarning = ref(false)
watch(
	() => status.value,
	() => {
		if (status.value === StatusMap.Starting) {
			errorTimeout = setTimeout(() => {
				if (status.value !== StatusMap.Started) {
					showWarning.value = true
				}
			}, 5_000)
		}
		if (status.value === StatusMap.Started) {
			clearTimeout(errorTimeout)
			showWarning.value = false
		}
	},
)

/** update selected network from light node settings */
watch(
	() => nodeStore.settings.network,
	() => {
		const selectedNetworkIdx = networks.findIndex((n) => nodeStore.settings.network === n)
		if (selectedNetworkIdx !== -1 && selectedNetwork.value !== selectedNetworkIdx) {
			selectedNetwork.value = selectedNetworkIdx
			initConfig()
		}
	},
)

/**
 * Backwards sync utils
 */

const normalizeStoredRanges = (networkHead, storedRanges) => {
	const syncingWindowTail = networkHead - approxSyncingWindowSize

	const normalizedRanges = storedRanges.map((range) => {
		const adjustedStart = Math.max(range.start, syncingWindowTail)
		const adjustedEnd = Math.max(range.end, syncingWindowTail)
		return {
			start: adjustedStart,
			end: adjustedEnd,
		}
	})

	return normalizedRanges
}

const syncingPercentage = (ranges) => {
	return (ranges.reduce((acc, range) => acc + (range.end - range.start), 0) * 100) / approxSyncingWindowSize
}

/**
 * Start / Cancel / Free
 */

const handleStop = () => {
	location.reload()
}

const handleStart = async () => {
	if (disableStart.value) return

	bc.postMessage("start")

	nodeStore.status = StatusMap.Starting
	amp.log("sampling:start", { network: networks[selectedNetwork.value], mobile: isMobile() })

	try {
		const logVisual = (event) => {
			event.shares.forEach((s) => {
				shares.value[s] = true
			})
		}

		const onNewHead = async (height) => {
			const header = await node.value.get_header_by_height(BigInt(height))

			hash.value = header.commit.block_id.hash
			squareSize.value = header.dah.row_roots.length
		}

		const onAddedHeaders = async () => {
			const info = await node.value.syncer_info()
			const storedRanges = normalizeStoredRanges(info.subjective_head, info.stored_headers)

			backwardsSyncProgress.value = syncingPercentage(storedRanges)
			nodeStore.percentage = backwardsSyncProgress.value
		}

		const onNodeEvent = async (event) => {
			if (!event.data) {
				return
			}

			const event_data = event.data.get("event")
			if (event_data.type !== "share_sampling_result") {
				if (!isPausedReceivingEvents.value) {
					rawEvents.value.unshift(event.data.get("message"))
					if (rawEvents.value.length > 100) {
						rawEvents.value = rawEvents.value.slice(0, 20)
					}
				}

				latestEventsTime.value = DateTime.now()
			}

			switch (event_data.type) {
				case "sampling_started":
					addBlock()

					logVisual(event_data)
					break

				case "fetching_head_header_finished":
				case "added_header_from_header_sub":
					frontHead.value = event_data.height

					await onNewHead(event_data.height)
					await onAddedHeaders()
					break

				case "fetching_headers_finished":
					const to_height = event_data.to_height
					if (appStore.lastHead.last_height && to_height > appStore.lastHead.last_height) {
						await onNewHead(to_height)
					}
					await onAddedHeaders()
					break
			}
		}

		node.value = await new NodeClient(MyWorker)

		const events = await node.value.events_channel()
		events.onmessage = onNodeEvent

		await node.value.start(config.value)

		startTime.value = DateTime.now()
		setInterval(() => {
			spend.value = startTime.value.toRelative({ locale: "en", style: "short" }).replace("ago", "")

			const secondsFromLatestEvent = Math.abs(latestEventsTime.value.diffNow(["seconds"]).values.seconds)
			if (secondsFromLatestEvent < 1) {
				speed.value = NodeSpeedMap.Fast
			} else if (secondsFromLatestEvent >= 30) {
				speed.value = NodeSpeedMap.Silence
			} else if (secondsFromLatestEvent >= 15) {
				speed.value = NodeSpeedMap.Slow
			} else if (secondsFromLatestEvent >= 7) {
				speed.value = NodeSpeedMap.Medium
			}
		}, 1_000)

		nodeStore.status = StatusMap.Started
		amp.log("sampling:started", { network: networks[selectedNetwork.value], mobile: isMobile() })

		showDetails.value = true

		pid.value = await node.value.local_peer_id()
	} catch (error) {
		nodeStore.status = StatusMap.Failed
		amp.log("sampling:failed", { network: networks[selectedNetwork.value], mobile: isMobile() })

		console.error("Error initializing Node:", error)
		console.dir(error)
	}
}

watch(
	() => props.show,
	() => {
		if (props.show) {
			amp.log("sampling:open", { network: networks[selectedNetwork.value], mobile: isMobile() })
		}
	},
)
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="500" disable-trap>
		<Flex direction="column" gap="16">
			<Text size="14" weight="600" color="primary">Celestia Light Node</Text>

			<Flex v-if="showOnboardingBanner" wide gap="8" :class="$style.warning">
				<Icon name="stars" size="16" color="brand" />

				<Flex direction="column" gap="6">
					<Text size="12" weight="600" color="primary">Welcome to Light Node runner</Text>
					<Text size="12" weight="500" color="tertiary" height="140">
						You can run a light node directly in your browser from your computer or from your phone. Read more details in our
						documentation.
					</Text>

					<Flex align="center" gap="12">
						<NuxtLink to="https://docs.celenium.io/features/light-node" target="_blank">
							<Text size="12" weight="600" color="blue">Documentation</Text>
						</NuxtLink>
						<NuxtLink @click="showOnboardingBanner = false" :to="null" target="_blank" style="cursor: pointer">
							<Text size="12" weight="600" color="blue">Hide</Text>
						</NuxtLink>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="24">
				<Flex direction="column" gap="20" :class="$style.card">
					<div
						v-if="[StatusMap.Starting, StatusMap.Started, StatusMap.Failed].includes(status)"
						:class="[
							$style.bg,
							status === StatusMap.Starting && $style.starting,
							status === StatusMap.Started && $style.started,
							status === StatusMap.Failed && $style.failed,
						]"
					/>

					<Flex justify="between" align="center">
						<Flex align="center" gap="6">
							<Icon
								:name="status === StatusMap.Started ? 'zap-circle' : 'play-circle'"
								size="14"
								:color="(status === StatusMap.Started && 'brand') || (status === StatusMap.Failed && 'red') || 'secondary'"
							/>
							<Text size="12" weight="600" color="secondary">
								{{ StatusLabelMap[status] }}
							</Text>
							<Text v-if="startTime" size="12" weight="600" color="tertiary">
								{{ spend }}
							</Text>
						</Flex>

						<Icon @click="handleOpenSettings" name="settings" size="14" color="secondary" style="cursor: pointer" />
					</Flex>

					<Flex direction="column" gap="8">
						<Flex align="center" justify="between">
							<Text size="13" weight="600" color="primary">Backwards syncing headers</Text>

							<Text v-if="backwardsSyncProgress" size="12" weight="600" color="secondary">
								{{ `${backwardsSyncProgress.toFixed(backwardsSyncProgress !== 100 ? 2 : 0)}%` }}
							</Text>
							<Spinner
								v-else-if="!backwardsSyncProgress && [StatusMap.Starting, StatusMap.Started].includes(status)"
								size="12"
							/>
							<Text v-else size="12" weight="600" color="tertiary">0%</Text>
						</Flex>

						<Flex align="center" justify="between" gap="4">
							<Flex
								v-for="group in 3"
								wide
								align="center"
								gap="4"
								:class="[
									$style.group,
									status === StatusMap.Starting && $style.starting,
									status === StatusMap.Started && $style.started,
								]"
							>
								<div
									v-for="bar in 5"
									:class="[$style.bar, ((bar + (group - 1) * 5) * 100) / 15 <= backwardsSyncProgress && $style.active]"
								/>
							</Flex>
						</Flex>
					</Flex>

					<Flex direction="column" gap="12">
						<Flex align="center" gap="8" :class="$style.badges">
							<Flex align="center" gap="6" :class="[$style.height_badge, backwardsSyncProgress === 100 && $style.synced]">
								<Icon name="zap-circle" size="14" color="black" />
								<Text size="12" weight="600" color="black" mono>{{ frontHead ? comma(frontHead) : "TBD" }}</Text>
								<Text size="12" weight="600" color="semiblack" mono>BLOCK HEIGHT</Text>
							</Flex>
							<Flex align="center" gap="6" :class="$style.square_badge">
								<Icon name="square" size="14" color="secondary" />
								<Text size="12" weight="600" color="primary" mono>{{
									squareSize ? `${squareSize}x${squareSize}` : "TBD"
								}}</Text>
								<Text size="12" weight="600" color="tertiary" mono>SQUARE SIZE</Text>
							</Flex>
						</Flex>

						<Flex align="center" gap="12">
							<Text size="11" weight="600" color="tertiary">
								Network: <Text color="secondary">{{ networks[selectedNetwork] }}</Text>
							</Text>

							<Text size="11" weight="600" color="tertiary">
								Blocks/min: <Text color="secondary">{{ blocksPerMinute }}</Text>
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex v-if="isMobile() && showMobileWarning" wide gap="8" :class="$style.warning">
					<Icon name="info" size="16" color="yellow" />

					<Flex direction="column" gap="16">
						<Flex direction="column" gap="6">
							<Text size="12" weight="600" color="primary">Caution about running a node on a mobile</Text>
							<Text size="12" weight="500" color="tertiary" height="140">
								Running a light node on mobile devices may affect the performance of your device and cause your phone to
								discharge quickly.
							</Text>
						</Flex>

						<Text @click="showMobileWarning = false" size="12" weight="600" color="blue">Hide this message</Text>
					</Flex>
				</Flex>

				<Flex direction="column" gap="12">
					<Flex direction="column" gap="4" :class="$style.secondary_card">
						<Flex
							@click="showDetails = !showDetails"
							align="center"
							justify="between"
							:class="[$style.header, status !== StatusMap.Started && $style.disabled]"
						>
							<Text size="12" weight="600" color="secondary">Details</Text>
							<Icon
								name="chevron"
								size="12"
								color="secondary"
								:style="{ transform: `rotate(${showDetails ? '180deg' : '0'})` }"
							/>
						</Flex>

						<Flex v-if="showDetails" direction="column" gap="12" :class="$style.content">
							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary"> Sync Window </Text>

								<Tooltip position="end">
									<Text v-if="frontHead" size="12" weight="600" color="secondary">
										{{ comma(frontHead - approxSyncingWindowSize) }} -
										{{ comma(frontHead) }}
									</Text>
									<Text v-else size="12" weight="600" color="tertiary">Unknown</Text>

									<template #content> ~{{ comma(approxSyncingWindowSize) }} blocks or ~30 days</template>
								</Tooltip>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary"> Peer ID </Text>

								<Flex align="center" gap="8">
									<template v-if="pid">
										<Text size="12" weight="600" color="secondary">{{ pid.slice(0, 4) }}...{{ pid.slice(-4) }}</Text>
										<CopyButton :text="pid" size="12" />
									</template>
									<Text v-else size="12" weight="600" color="tertiary">Unknown</Text>
								</Flex>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary"> Hash </Text>

								<Flex align="center" gap="8">
									<template v-if="hash">
										<Text size="12" weight="600" color="secondary">
											{{ hash.slice(0, 4) }}...{{ hash.slice(-4) }}
										</Text>
										<CopyButton :text="hash" size="12" />
									</template>
									<Text v-else size="12" weight="600" color="tertiary"> Unknown </Text>
								</Flex>
							</Flex>
						</Flex>
					</Flex>

					<Flex direction="column" gap="4" :class="$style.secondary_card">
						<Flex
							@click="showLogs = !showLogs"
							align="center"
							justify="between"
							:class="[$style.header, status !== StatusMap.Started && $style.disabled]"
						>
							<Flex align="center" gap="6">
								<Text size="12" weight="600" color="secondary">Events</Text>
								<Icon
									name="zap"
									size="12"
									:color="status === StatusMap.Started ? getEventsLogIconColor() : 'tertiary'"
									:class="[status === StatusMap.Started && $style.events_icon, $style[getEventsLogIconColor()]]"
								/>
							</Flex>

							<Icon
								name="chevron"
								size="12"
								color="secondary"
								:style="{ transform: `rotate(${showLogs ? '180deg' : '0'})` }"
							/>
						</Flex>

						<Flex v-if="showLogs" direction="column" gap="12" :class="$style.raw_events">
							<Flex align="center" justify="between">
								<Text size="12" weight="500" color="secondary">
									{{ status === StatusMap.Started ? `Latest 20 events` : "No events" }}
								</Text>

								<Flex
									@click="isPausedReceivingEvents = !isPausedReceivingEvents"
									align="center"
									gap="4"
									style="cursor: pointer"
								>
									<Icon :name="isPausedReceivingEvents ? 'play-circle' : 'stop-circle'" size="12" color="primary" />
									<Text size="12" weight="600" color="secondary">
										{{ isPausedReceivingEvents ? "Receive Events" : "Pause Events" }}
									</Text>
								</Flex>
							</Flex>

							<Text v-for="event in rawEvents.slice(0, 20)" size="11" weight="500" color="tertiary" height="140">
								{{ event }}
							</Text>
						</Flex>
					</Flex>

					<Flex direction="column" gap="4" :class="$style.secondary_card">
						<Flex
							@click="showSquare = !showSquare"
							align="center"
							justify="between"
							:class="[$style.header, status !== StatusMap.Started && $style.disabled]"
						>
							<Text size="12" weight="600" color="secondary">
								Square Visualization
								<Text v-if="status === StatusMap.Started" color="tertiary">for {{ comma(frontHead) }}</Text>
							</Text>

							<Icon
								name="chevron"
								size="12"
								color="secondary"
								:style="{ transform: `rotate(${showSquare ? '180deg' : '0'})` }"
							/>
						</Flex>

						<Flex v-if="showSquare" direction="column" :class="$style.content">
							<Flex v-for="column in squareSize" wide>
								<Flex
									v-for="row in squareSize"
									align="center"
									wide
									:class="[$style.square, shares[`${row},${column}`] && $style.active]"
								>
								</Flex>
							</Flex>
						</Flex>
					</Flex>
				</Flex>

				<Flex align="center" direction="column" gap="12">
					<Button
						@click="handleStart"
						type="secondary"
						size="small"
						wide
						:disabled="[StatusMap.Starting, StatusMap.Started].includes(status) || !nodeStore.bootnodes.length || disableStart"
					>
						<Icon v-if="status === StatusMap.Started" name="zap-circle" size="12" color="brand" />
						<template v-if="disableStart"> Node is already running in other tab </template>
						<template v-else-if="status === StatusMap.Started">
							Running data availability sampling for {{ networks[selectedNetwork] }}
						</template>
						<template v-else> Start Sampling </template>
					</Button>

					<Tooltip v-if="status === StatusMap.Started" wide>
						<Button @click="handleStop" type="tertiary" size="small" wide> Stop the light node </Button>

						<template #content>
							<Flex align="center" direction="column" gap="6">
								<Text>To stop the running light node - use F5 (refresh the page).</Text>
								<Text color="tertiary">Stopping a node via the interface is temporarily unsupported.</Text>
							</Flex>
						</template>
					</Tooltip>

					<Flex align="center" direction="column" gap="4">
						<Text size="11" weight="500" color="tertiary">
							Read more about the light node on our
							<a href="https://docs.celenium.io/features/light-node" target="_blank" style="color: var(--txt-secondary)"
								>docs</a
							>.
						</Text>
						<Text size="11" weight="500" color="tertiary">
							Powered by <a href="https://lumina.rs" target="_blank" style="color: var(--txt-secondary)">Lumina.rs</a>
						</Text>
					</Flex>

					<Flex v-if="showWarning" wide gap="8" :class="$style.warning">
						<Icon name="info" size="16" color="yellow" />

						<Flex direction="column" gap="6">
							<Text size="12" weight="600" color="primary">Something went wrong and the node didn't started</Text>
							<Text size="12" weight="500" color="tertiary" height="140">
								An unexpected error may have occurred. Try refreshing the page and trying again. If the error is still
								repeated, report to our GitHub.
							</Text>

							<Flex align="center" gap="12">
								<NuxtLink to="https://github.com/celenium-io/celenium-interface/issues/new" target="_blank">
									<Text size="12" weight="600" color="blue">Open Issue Tracker</Text>
								</NuxtLink>
							</Flex>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.card {
	position: relative;

	background: linear-gradient(var(--op-5), transparent);
	border-radius: 12px;
	box-shadow: inset 0 0 0 2px var(--op-8);
	overflow: hidden;

	padding: 12px;
}

.bg {
	pointer-events: none;

	position: absolute;
	top: 0;
	bottom: 0;
	left: -200px;
	right: 0;

	&.starting {
		background: radial-gradient(
				ellipse farthest-corner at 50% 0%,
				rgba(230, 197, 37, 25%) 0%,
				rgba(230, 197, 37, 5%) 70%,
				rgba(230, 197, 37, 0%) 100%
			),
			radial-gradient(ellipse at bottom, rgba(230, 197, 37, 10%), transparent);
		animation: colorChange 6s infinite alternate;
	}

	&.started {
		background: radial-gradient(
				ellipse farthest-corner at 50% 0%,
				rgba(24, 210, 165, 25%) 0%,
				rgba(24, 210, 165, 5%) 70%,
				rgba(24, 210, 165, 0%) 100%
			),
			radial-gradient(ellipse at bottom, rgba(24, 210, 165, 10%), transparent);
		animation: colorChange 6s infinite alternate;
	}

	&.failed {
		background: radial-gradient(
				ellipse farthest-corner at 50% 0%,
				rgba(235, 87, 87, 25%) 0%,
				rgba(235, 87, 87, 5%) 70%,
				rgba(235, 87, 87, 0%) 100%
			),
			radial-gradient(ellipse at bottom, rgba(235, 87, 87, 10%), transparent);
		animation: colorChange 6s infinite alternate;
	}
}

@keyframes colorChange {
	0% {
		opacity: 1;
		left: -200px;
		right: 0;
	}
	50% {
		opacity: 0.5;
		left: 0;
		right: -200px;
	}
	100% {
		opacity: 1;
		left: -200px;
		right: 0;
	}
}

.secondary_card {
	border-radius: 8px;
	background: rgba(0, 0, 0, 25%);
}

.header {
	cursor: pointer;
	border-radius: 8px;

	padding: 12px;

	transition: all 0.3s ease;

	&.disabled {
		pointer-events: none;

		opacity: 0.4;
	}
}

.content {
	padding: 0 12px 12px 12px;
}

.raw_events {
	flex-direction: column-reverse;

	max-height: 200px;
	overflow-y: auto;

	padding: 0 12px 12px 12px;
}

.height_badge {
	background: var(--yellow);
	border-radius: 50px;

	padding: 4px 8px 4px 6px;

	&.synced {
		background: var(--brand);
	}
}

.square_badge {
	background: var(--op-15);
	border-radius: 50px;

	padding: 4px 8px 4px 6px;
}

.group {
	background: var(--op-15);
	border-radius: 50px;

	padding: 4px;

	transition: background 0.2s ease;

	&.starting {
		background: rgba(230, 197, 37, 25%);
	}

	&.started {
		background: rgba(24, 210, 165, 25%);
	}
}

.bar {
	width: 100%;
	height: 8px;

	border-radius: 50px;
	box-shadow: unset;
	background: rgba(0, 0, 0, 40%);

	transition: background 1s ease;

	&.active {
		background: #18d2a5;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 20%), 0 1px 4px rgba(24, 210, 165, 45%);
	}
}

.warning {
	background: var(--op-5);
	border-radius: 8px;

	padding: 12px;
}

.events_icon {
	transition: all 0.2s ease;

	&.brand {
		animation: eventsIconBlinkFast 2s ease infinite;
	}

	&.yellow {
		animation: eventsIconBlinkMedium 2s ease infinite;
	}

	&.red {
		animation: eventsIconBlinkSlow 2s ease infinite;
	}

	&.tertiary {
		animation: eventsIconBlinkSilence 2s ease infinite;
	}
}

.square {
	aspect-ratio: 1/1;

	background: var(--op-5);
	border: 1px solid rgb(24 25 28);

	&.active {
		background: var(--brand);
	}
}

@keyframes eventsIconBlinkFast {
	0% {
		opacity: 1;
		filter: drop-shadow(0 0 8px var(--brand));
	}

	50% {
		opacity: 0.3;
		filter: drop-shadow(0 0 2px var(--brand));
	}

	100% {
		opacity: 1;
		filter: drop-shadow(0 0 8px var(--brand));
	}
}

@keyframes eventsIconBlinkMedium {
	0% {
		opacity: 1;
		filter: drop-shadow(0 0 8px var(--yellow));
	}

	50% {
		opacity: 0.3;
		filter: drop-shadow(0 0 2px var(--yellow));
	}

	100% {
		opacity: 1;
		filter: drop-shadow(0 0 8px var(--yellow));
	}
}

@keyframes eventsIconBlinkSlow {
	0% {
		opacity: 1;
		filter: drop-shadow(0 0 8px var(--red));
	}

	50% {
		opacity: 0.3;
		filter: drop-shadow(0 0 2px var(--red));
	}

	100% {
		opacity: 1;
		filter: drop-shadow(0 0 8px var(--red));
	}
}

@keyframes eventsIconBlinkSilence {
	0% {
		opacity: 1;
		filter: drop-shadow(0 0 8px var(--op-15));
	}

	50% {
		opacity: 0.3;
		filter: drop-shadow(0 0 2px var(--op-15));
	}

	100% {
		opacity: 1;
		filter: drop-shadow(0 0 8px var(--op-15));
	}
}

@media (max-width: 470px) {
	.badges {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
