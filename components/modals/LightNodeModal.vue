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
import { StatusMap, StatusLabelMap, NodeSpeedMap, NodeSpeedLabelMap } from "@/services/constants/node.js"

/** Services */
import { comma } from "@/services/utils"

/** Stores */
import { useAppStore } from "@/store/app.js"
import { useNodeStore } from "@/store/node.js"
const appStore = useAppStore()
const nodeStore = useNodeStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

onMounted(async () => {
	await init()
	initConfig()

	nodeStore.status = StatusMap.Initialized
})

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

const showDetails = ref(true)
const showLogs = ref(false)
const showBootnodes = ref(false)
const showSquare = ref(false)

const approxSyncingWindowSize = (30 * 24 * 60 * 60) / 12

const bootnodes = ref([])
const config = ref()

const bootnodesTerm = ref()

const textareaEl = ref()
const resizeTextarea = () => {
	textareaEl.value.style.height = "auto"
	textareaEl.value.style.height = 12 + textareaEl.value.scrollHeight + "px"
}
const handleTextareaKeyup = () => {
	resizeTextarea()
}

const startTime = ref()
const spend = ref()

const node = ref()
const pid = ref()
const backwardsSyncProgress = ref()
const hash = ref()
const frontHead = ref()
const squareSize = ref()
const shares = ref({})

const latestEventsTime = ref()
const rawEvents = ref([])
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
	bootnodes.value = config.value.bootnodes

	bootnodesTerm.value = bootnodes.value.join("\n")
}

watch(
	() => showBootnodes.value,
	async () => {
		if (!showBootnodes.value) return

		await nextTick()
		resizeTextarea()
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

const handleStart = async () => {
	nodeStore.status = StatusMap.Starting

	try {
		const logVisual = (event) => {
			event.shares.forEach((s) => {
				shares.value[s] = true
			})
		}

		const onNewHead = async (height) => {
			const header = await node.value.get_header_by_height(BigInt(height))

			frontHead.value = height
			hash.value = header.commit.block_id.hash
			squareSize.value = header.dah.row_roots.length
		}

		const onAddedHeaders = async () => {
			const info = await node.value.syncer_info()
			const storedRanges = normalizeStoredRanges(info.subjective_head, info.stored_headers)

			backwardsSyncProgress.value = syncingPercentage(storedRanges)
		}

		const onNodeEvent = async (event) => {
			if (!event.data) {
				return
			}

			const event_data = event.data.get("event")
			if (event_data.type !== "share_sampling_result") {
				rawEvents.value.unshift(event.data.get("message"))
				latestEventsTime.value = DateTime.now()
			}

			switch (event_data.type) {
				case "sampling_started":
					logVisual(event_data)
					break

				case "fetching_head_header_finished":
				case "added_header_from_header_sub":
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
			spend.value = startTime.value.toRelative({ locale: "en" }).replace("ago", "")

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

		pid.value = await node.value.local_peer_id()
	} catch (error) {
		nodeStore.status = StatusMap.Failed

		console.error("Error initializing Node:", error)
		console.dir(error)
	}
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="500" disable-trap>
		<Flex direction="column" gap="16">
			<Text size="14" weight="600" color="primary">Celestia Light Node</Text>

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
						</Flex>

						<Icon name="info" size="14" color="tertiary" />
					</Flex>

					<Flex direction="column" gap="8">
						<Flex align="center" justify="between">
							<Text size="13" weight="600" color="primary">Backwards syncing headers</Text>

							<Text v-if="backwardsSyncProgress" size="12" weight="600" color="secondary">
								{{ `${backwardsSyncProgress.toFixed(2)}%` }}
							</Text>
							<Spinner
								v-else-if="!backwardsSyncProgress && [StatusMap.Starting, StatusMap.Started].includes(status)"
								size="12"
							/>
							<Text v-else size="12" weight="600" color="tertiary">0%</Text>
						</Flex>

						<Flex align="center" justify="between">
							<Flex
								v-for="group in 3"
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
									:class="[$style.bar, ((bar + (group - 1) * 5) * 100) / 15 < backwardsSyncProgress && $style.active]"
								/>
							</Flex>
						</Flex>
					</Flex>

					<Flex direction="column" gap="12">
						<Flex align="center" gap="8">
							<Flex align="center" gap="6" :class="$style.height_badge">
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
								Spend:
								<Text color="secondary">
									{{ startTime ? spend : "TBD" }}
								</Text>
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" gap="12">
					<Flex direction="column" gap="4" :class="$style.secondary_card">
						<Flex @click="showDetails = !showDetails" align="center" justify="between" :class="$style.header">
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
									<Text size="12" weight="600" color="secondary">
										{{ comma(appStore.lastHead.last_height - approxSyncingWindowSize) }} -
										{{ comma(appStore.lastHead.last_height) }}
									</Text>

									<template #content> ~{{ comma(approxSyncingWindowSize) }} blocks </template>
								</Tooltip>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary"> Peer ID </Text>

								<Text v-if="pid" size="12" weight="600" color="secondary">{{ pid.slice(0, 4) }}...{{ pid.slice(-4) }}</Text>
								<Text v-else size="12" weight="600" color="tertiary">Unknown</Text>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="tertiary"> Hash </Text>

								<Text v-if="hash" size="12" weight="600" color="secondary">
									{{ hash.slice(0, 4) }}...{{ hash.slice(-4) }}
								</Text>
								<Text v-else size="12" weight="600" color="tertiary"> Unknown </Text>
							</Flex>
						</Flex>
					</Flex>

					<Flex direction="column" gap="4" :class="$style.secondary_card">
						<Flex @click="showLogs = !showLogs" align="center" justify="between" :class="$style.header">
							<Flex align="center" gap="6">
								<Text size="12" weight="600" color="secondary">Events Logs</Text>
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
							<Text size="11" weight="500" color="secondary">
								{{ status === StatusMap.Started ? `Latest 20 events, speed - ${NodeSpeedLabelMap[speed]}` : "No events" }}
							</Text>

							<Text v-for="event in rawEvents.slice(0, 20)" size="11" weight="500" color="tertiary" height="140">
								{{ event }}
							</Text>
						</Flex>
					</Flex>

					<Flex direction="column" gap="4" :class="$style.secondary_card">
						<Flex @click="showBootnodes = !showBootnodes" align="center" justify="between" :class="$style.header">
							<Text size="12" weight="600" color="secondary">
								Bootnodes&nbsp; <Text color="tertiary">{{ bootnodes.length }}</Text>
							</Text>
							<Icon
								name="chevron"
								size="12"
								color="secondary"
								:style="{ transform: `rotate(${showBootnodes ? '180deg' : '0'})` }"
							/>
						</Flex>

						<Flex v-if="showBootnodes" direction="column" gap="12" :class="$style.content">
							<textarea
								ref="textareaEl"
								v-model="bootnodesTerm"
								@keyup="handleTextareaKeyup"
								:class="$style.bootnodes_container"
							>
							</textarea>

							<Flex align="center" gap="4" wide>
								<Icon name="info" size="12" color="tertiary" />
								<Text size="12" weight="600" color="tertiary"> Each address on a new line </Text>
							</Flex>
						</Flex>
					</Flex>

					<Flex direction="column" gap="4" :class="$style.secondary_card">
						<Flex @click="showSquare = !showSquare" align="center" justify="between" :class="$style.header">
							<Text size="12" weight="600" color="secondary">Square Visualization</Text>
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
						:disabled="[StatusMap.Starting, StatusMap.Started].includes(status)"
					>
						<Icon v-if="status === StatusMap.Started" name="zap" size="12" color="brand" />
						{{ status === StatusMap.Started ? `Light Node running for ${networks[selectedNetwork]}` : "Start Sampling" }}
					</Button>

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
	width: 24px;
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

.bootnode_label {
	white-space: nowrap;

	overflow: hidden;
	text-overflow: ellipsis;
}

.bootnodes_container {
	all: unset;

	font-size: 12px;
	line-height: 100%;
	font-weight: 500;
	color: var(--txt-secondary);
	white-space: nowrap;
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
</style>
