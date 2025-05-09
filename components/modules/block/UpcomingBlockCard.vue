<script setup>
/** Vendor */
import { DateTime, Duration } from "luxon"

/** UI */
import Spinner from "@/components/ui/Spinner.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma } from "@/services/utils"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const props = defineProps({
	height: Number,
	secondsToSelectedBlock: Number,
	avgBlockTime: Number,
})

const styles = useCssModule()

const rainEl = useTemplateRef("rainEl")
let rainInterval = null

const latestBlock = computed(() => appStore.latestBlocks[0])

const STATUS_MAP = {
	Queuing: 0,
	Arriving: 1,
	Arrived: 2,
}
const status = computed(() => {
	if (!latestBlock.value) return STATUS_MAP.Queuing
	if (props.height - latestBlock.value.height > 1) return STATUS_MAP.Queuing
	if (props.height - latestBlock.value.height === 1) return STATUS_MAP.Arriving
	if (latestBlock.value.height >= props.height) return STATUS_MAP.Arrived
})

const startDt = ref(new Date().getTime())
const endDt = ref(0)
const toHuman = (dur, smallestUnit = "seconds") => {
	const units = ["years", "months", "days", "hours", "minutes", "seconds", "milliseconds"]
	const smallestIdx = units.indexOf(smallestUnit)
	const entries = Object.entries(
		dur
			.shiftTo(...units)
			.normalize()
			.toObject(),
	).filter(([_unit, amount], idx) => amount > 0 && idx <= smallestIdx)
	const dur2 = Duration.fromObject(entries.length === 0 ? { [smallestUnit]: 0 } : Object.fromEntries(entries))
	return dur2.toHuman()
}

watch(
	() => status.value,
	() => {
		if (status.value === STATUS_MAP.Arrived) {
			endDt.value = new Date().getTime()
			rainEl.value.remove()
			clearInterval(rainInterval)
		}
	},
)

const startedFromHeight = ref(latestBlock.value?.height ?? 0)
const progress = computed(() => ((latestBlock.value.height - startedFromHeight.value) * 100) / (props.height - startedFromHeight.value))

watch(
	() => latestBlock.value,
	() => {
		if (startedFromHeight.value) return
		startedFromHeight.value = latestBlock.value.height
	},
)

onMounted(() => {
	rainInterval = setInterval(() => {
		const size = Math.floor(Math.random() * (20 - 4 + 1) + 4)

		const blockIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
		blockIcon.setAttributeNS(null, "viewBox", "0 0 24 24")
		blockIcon.setAttributeNS(null, "width", size)
		blockIcon.setAttributeNS(null, "height", size)
		blockIcon.classList.add(styles.drop)
		blockIcon.style = `filter: blur(${Math.abs(size - 20) / 4}px); top: ${Math.floor(Math.random() * (80 + 1))}px; left: ${Math.floor(
			Math.random() * (320 - 20 + 1) + 20,
		)}px;`
		const blockPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
		blockPath.setAttributeNS(
			null,
			"d",
			"M 12.403 1.185 C 12.137 1.13 11.863 1.13 11.597 1.185 C 11.29 1.248 11.015 1.402 10.797 1.525 L 10.737 1.558 L 4.31 5.129 C 3.902 5.356 3.698 5.469 3.63 5.619 C 3.57 5.75 3.57 5.9 3.629 6.031 C 3.696 6.181 3.9 6.296 4.307 6.525 L 11.607 10.632 C 11.751 10.712 11.822 10.752 11.897 10.768 C 11.964 10.782 12.034 10.782 12.101 10.768 C 12.177 10.752 12.249 10.712 12.391 10.632 L 19.692 6.525 C 20.099 6.296 20.303 6.182 20.371 6.031 C 20.43 5.9 20.429 5.751 20.37 5.62 C 20.301 5.47 20.097 5.356 19.689 5.13 L 13.262 1.558 L 13.202 1.524 C 12.985 1.402 12.71 1.248 12.402 1.185 Z M 21.996 8.89 C 21.996 8.442 21.996 8.218 21.901 8.087 C 21.818 7.973 21.691 7.899 21.551 7.883 C 21.391 7.865 21.195 7.975 20.804 8.195 L 13.408 12.355 C 13.259 12.439 13.185 12.48 13.131 12.539 C 13.083 12.591 13.047 12.653 13.025 12.721 C 13 12.797 13 12.882 13 13.052 L 13 21.228 C 13 21.675 13 21.898 13.094 22.029 C 13.176 22.143 13.302 22.218 13.442 22.234 C 13.602 22.253 13.797 22.144 14.187 21.928 L 20.663 18.331 L 20.726 18.297 C 20.956 18.169 21.248 18.009 21.471 17.767 C 21.664 17.557 21.81 17.31 21.899 17.039 C 22.002 16.726 22.001 16.395 22 16.131 L 22 16.059 C 22 14.096 21.997 10.756 21.996 8.89 Z M 9.814 21.928 C 10.204 22.144 10.399 22.253 10.559 22.234 C 10.698 22.217 10.824 22.143 10.906 22.029 C 11 21.899 11 21.675 11 21.228 L 11 13.052 C 11 12.882 11 12.797 10.975 12.721 C 10.953 12.654 10.917 12.592 10.869 12.54 C 10.815 12.48 10.741 12.439 10.593 12.355 L 3.197 8.195 C 2.805 7.975 2.609 7.865 2.449 7.883 C 2.309 7.899 2.182 7.973 2.099 8.087 C 2.005 8.217 2.005 8.442 2.004 8.89 C 2.003 10.756 2 14.096 2 16.06 L 2 16.132 C 2 16.396 1.998 16.727 2.101 17.04 C 2.191 17.31 2.337 17.559 2.53 17.768 C 2.753 18.01 3.043 18.17 3.275 18.298 L 3.338 18.332 C 5.118 19.322 8.148 21.004 9.814 21.929 Z",
		)
		blockIcon.appendChild(blockPath)

		if (rainEl.value) rainEl.value.appendChild(blockIcon)

		setTimeout(() => {
			rainEl.value?.removeChild(blockIcon)
		}, 5_000)
	}, 500)
})

onBeforeUnmount(() => {
	rainEl.value.remove()
	clearInterval(rainInterval)
})
</script>

<template>
	<Flex v-if="latestBlock" direction="column" gap="16" :class="$style.wrapper">
		<div :class="$style.rain_wrapper">
			<div ref="rainEl" :class="$style.rain" />
		</div>

		<Flex direction="column" gap="16" :class="$style.content">
			<Flex justify="between">
				<Flex align="center" gap="6">
					<Icon
						:name="
							(status === STATUS_MAP.Queuing && 'clock') ||
							(status === STATUS_MAP.Arriving && 'clock') ||
							(status === STATUS_MAP.Arrived && 'check-circle')
						"
						size="12"
						:color="
							(status === STATUS_MAP.Queuing && 'yellow') ||
							(status === STATUS_MAP.Arriving && 'purple') ||
							(status === STATUS_MAP.Arrived && 'brand')
						"
					/>
					<Text size="12" weight="700" color="tertiary">
						{{
							(status === STATUS_MAP.Queuing && "In queue") ||
							(status === STATUS_MAP.Arriving && "Arriving") ||
							(status === STATUS_MAP.Arrived && "Arrived")
						}}
					</Text>
				</Flex>

				<Tooltip side="left">
					<Icon name="info" size="14" color="tertiary" hoverColor="secondary" />

					<template #content> The block you opened is not ready yet. </template>
				</Tooltip>
			</Flex>

			<Flex direction="column" gap="8">
				<Flex align="end" gap="8">
					<Text
						size="20"
						weight="500"
						color="primary"
						mono
						:class="[$style.height, status === STATUS_MAP.Arriving && $style.blink]"
					>
						{{
							(status === STATUS_MAP.Queuing && comma(height - latestBlock?.height - 1)) ||
							(status === STATUS_MAP.Arriving && comma(height)) ||
							(status === STATUS_MAP.Arrived && endDt - startDt > 1_000 ? comma(height) : `${endDt - startDt}ms`)
						}}
					</Text>
					<Text v-if="status === STATUS_MAP.Queuing" size="12" weight="600" color="secondary">Blocks In Line</Text>
				</Flex>

				<template v-if="endDt - startDt < 1_000 && status === STATUS_MAP.Arrived">
					<Text size="12" weight="600" height="140" color="tertiary">
						In that many milliseconds you opened the page before the block arrived. You can get faster!
					</Text>
					<Text size="12" weight="600" height="140" color="support">
						Share your result on X (Twitter) <Text color="tertiary">#CatchTheBlock</Text>
					</Text>
				</template>
			</Flex>

			<div v-if="latestBlock" :class="$style.progress">
				<div
					:style="{ width: `${Math.min(progress, 100)}%` }"
					:class="[$style.bar, status === STATUS_MAP.Arrived && $style.ready]"
				/>
			</div>

			<Flex align="center" gap="6" :class="$style.badge">
				<Spinner
					v-if="[STATUS_MAP.Queuing, STATUS_MAP.Arriving].includes(status)"
					size="14"
					:color="(status === STATUS_MAP.Queuing && 'var(--yellow)') || (status === STATUS_MAP.Arriving && 'var(--purple)')"
				/>
				<Icon v-else :name="endDt - startDt > 1_000 ? 'time' : 'zap'" size="12" color="brand" />

				<Text v-if="status !== STATUS_MAP.Arrived" size="12" weight="600" color="secondary" style="white-space: nowrap">
					Awaiting <Text color="primary">{{ comma(height) }}</Text>
				</Text>
				<Text v-else-if="endDt - startDt > 1_000" size="12" weight="600" color="secondary" style="white-space: nowrap">
					Waited
					<Text color="primary">{{ toHuman(Duration.fromMillis(endDt - startDt)) }}</Text>
				</Text>
				<Text v-else size="12" weight="600" color="brand"> Catch the block! </Text>
			</Flex>
		</Flex>

		<ClientOnly>
			<Flex direction="column" gap="12" :class="$style.footer">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">
						The block {{ status === STATUS_MAP.Arrived ? "arrived" : "arrives" }}
					</Text>
					<Text size="12" weight="600" color="secondary">
						{{
							status === STATUS_MAP.Arriving ? "soon" : DateTime.now().plus({ seconds: secondsToSelectedBlock }).toRelative()
						}}
					</Text>
				</Flex>
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary"> Current height </Text>
					<Text size="12" weight="600" color="secondary"> {{ comma(latestBlock?.height) }} </Text>
				</Flex>
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary"> Blocks per min</Text>
					<Text size="12" weight="600" color="secondary"> ~{{ (60 / avgBlockTime).toFixed(0) }} </Text>
				</Flex>
			</Flex>
		</ClientOnly>
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;

	border-radius: 10px;
	background: var(--app-background);

	padding: 8px;
}

.rain_wrapper {
	position: absolute;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
}

.rain {
	position: relative;
}

@keyframes drop {
	0% {
		transform: translateY(0);
		opacity: 0;
	}

	10% {
		opacity: 1;
	}

	100% {
		transform: translateY(100px);
		opacity: 0;
	}
}

.drop {
	position: absolute;

	fill: var(--op-10);

	animation: drop 5s infinite linear;
}

.content {
	padding: 4px;
}

.badge {
	position: absolute;
	top: -10px;
	left: 50%;
	transform: translate(-50%, 0);

	width: fit-content;
	height: 24px;

	border-radius: 50px;
	background: var(--app-background);

	padding: 0 6px;
}

.progress {
	width: 100%;
	height: 4px;

	border-radius: 50px;
	background: var(--op-5);
}

.bar {
	height: 4px;

	border-radius: 50px;
	background: var(--txt-primary);

	transition: width 0.2s ease;

	&.ready {
		background: var(--brand);
	}
}

.footer {
	background: repeating-linear-gradient(-45deg, var(--app-background), var(--app-background) 5px, var(--op-5) 5px, var(--op-5) 10px);
	border-radius: 6px;

	padding: 10px;
}

@keyframes blink {
	0% {
		opacity: 1;
	}
	50% {
		opacity: 0.2;
	}
	100% {
		opacity: 1;
	}
}

.height {
	transition: all 0.2s ease;
}

.blink {
	animation: blink 2s ease infinite;
}
</style>
