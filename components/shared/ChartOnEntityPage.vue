<script setup>
/** Vendor */
import { DateTime } from "luxon"
import { useDebounceFn } from "@vueuse/core"
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue"

/** UI */
import Text from "@/components/Text.vue"
import Skeleton from "@/components/Skeleton.vue"
import Flex from "@/components/Flex.vue"

/** Services */
import { buildLineChart, buildBarChart } from "@/services/utils/entityCharts"

/** Props */
const props = defineProps({
	seriesConfig: {
		type: Object,
		required: true,
	},

	chartView: { type: String, default: "line" },
	color: { type: String, required: false },
	loadLastValue: { type: Boolean, default: true },
	selectedPeriod: { type: Object, required: true },
	isLoading: { type: Boolean, default: true },
})

const emit = defineEmits(["update:chartView", "update:loadLastValue"])

const data = computed(() => {
	return props.seriesConfig?.series?.value || props.seriesConfig?.series || []
})

const {
	metric,
	title,
	tooltipLabel,
	yAxisFormatter,
	tooltipValueFormatter,
	unit,
} = props.seriesConfig || {}

// Tooltip variables
const showTooltip = ref(false)
const tooltipEl = ref()
const tooltipXOffset = ref(0)
const tooltipYOffset = ref(0)
const tooltipYDataOffset = ref(0)
const tooltipDynamicXPosition = ref(0)
const tooltipText = ref("")
const badgeEl = ref()
const badgeText = ref("")
const badgeOffset = ref(0)

const chartEl = ref()

const tooltipConfig = computed(() => ({
	tooltipXOffset,
	tooltipYDataOffset,
	tooltipYOffset,
	tooltipText,
	tooltipDynamicXPosition,
	badgeText,
	badgeOffset,
	tooltipEl,
	badgeEl,
	selectedPeriod: props.selectedPeriod,
	loadLastValue: props.loadLastValue,
}))

const buildChart = () => {
	const domElement = chartEl.value?.$el

	if (!domElement || !data.value.length) return

	if (props.chartView === "line") {
		buildLineChart(
			domElement,
			props.loadLastValue ? data.value : data.value.slice(0, data.value.length - 1),
			() => (showTooltip.value = true),
			() => (showTooltip.value = false),
			metric,
			tooltipConfig.value,
			props.color,
		)
	} else {
		buildBarChart(
			domElement,
			props.loadLastValue ? data.value : data.value.slice(0, data.value.length - 1),
			() => (showTooltip.value = true),
			() => (showTooltip.value = false),
			metric,
			tooltipConfig.value,
			props.color,
		)
	}
}

const getXAxisLabels = (start, tvl = false) => {
	let res = ""
	let tf = props.selectedPeriod.timeframe

	let periodValue = props.selectedPeriod.value

	if (tvl && ["hour", "week"].includes(props.selectedPeriod.timeframe)) {
		tf = "day"
		periodValue = 30
	}

	switch (tf) {
		case "month":
			start
				? (res = DateTime.now()
						.minus({ months: periodValue - 1 })
						.toFormat("LLL y"))
				: (res = props.loadLastValue ? DateTime.now().toFormat("LLL") : DateTime.now().minus({ months: 1 }).toFormat("LLL"))
			break
		case "day":
			start
				? (res = DateTime.now()
						.minus({ days: periodValue - 1 })
						.toFormat("LLL dd"))
				: (res = props.loadLastValue ? "Today" : DateTime.now().minus({ days: 1 }).toFormat("LLL dd"))
			break
		default:
			start
				? (res = DateTime.now()
						.minus({ hours: periodValue - 1 })
						.set({ minutes: 0 })
						.toFormat("hh:mm a"))
				: (res = props.loadLastValue ? "Now" : DateTime.now().minus({ hours: 1 }).set({ minutes: 0 }).toFormat("hh:mm a"))
			break
	}

	return res
}

watch(
	() => [data.value, props.chartView, props.loadLastValue],
	async () => {
		await nextTick()

		setTimeout(() => {
			if (chartEl.value) {
				debouncedRedraw()
			}
		}, 200)
	},
	{ immediate: true },
)

const debouncedRedraw = useDebounceFn(async () => {
	buildChart()
}, 500)

onMounted(() => {
	window.addEventListener("resize", debouncedRedraw)
})

onBeforeUnmount(() => {
	window.removeEventListener("resize", debouncedRedraw)
})
</script>

<template>
	<Flex direction="column" gap="20" wide>
		<Flex align="center" justify="between">
			<Flex align="center" gap="8">
				<Text size="13" weight="600" color="primary">{{ title }}</Text>
				<slot name="header-content" />
			</Flex>
			<slot name="header-actions" />
		</Flex>

		<Flex direction="column" :class="$style.chart_wrapper">
			<Flex direction="column" justify="between" :class="[$style.axis, $style.y]">
				<Text
					v-if="data.length"
					size="12"
					weight="600"
					color="tertiary"
					:style="{ opacity: Math.max(...data.map((d) => d.value)) ? 1 : 0 }"
				>
					{{ yAxisFormatter(Math.max(...data.map((d) => d.value))) }}
				</Text>
				<Skeleton v-else w="32" h="12" />

				<Text
					v-if="data.length"
					size="12"
					weight="600"
					color="tertiary"
					:style="{
						opacity: Math.round(Math.max(...data.map((d) => d.value)) / 2) !== Math.max(...data.map((d) => d.value)) ? 1 : 0,
					}"
				>
					{{ yAxisFormatter(Math.round(Math.max(...data.map((d) => d.value)) / 2)) }}
				</Text>
				<Skeleton v-else w="24" h="12" />

				<Text v-if="data.length" size="12" weight="600" color="tertiary">0</Text>
				<Skeleton v-else w="16" h="12" />
			</Flex>

			<!-- Axis X -->
			<Flex :class="[$style.axis, $style.x]">
				<Flex align="end" justify="between" wide>
					<Text size="12" weight="600" color="tertiary">
						{{ getXAxisLabels(true) }}
					</Text>
					<Text size="12" weight="600" color="tertiary">
						{{ getXAxisLabels(false) }}
					</Text>
				</Flex>
			</Flex>

			<!-- Tooltip -->
			<Transition name="fastfade">
				<div v-if="showTooltip" :class="$style.tooltip_wrapper">
					<div
						v-if="chartView === 'line'"
						:style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }"
						:class="$style.dot"
					/>
					<div v-if="chartView === 'line'" :style="{ transform: `translateX(${tooltipXOffset}px)` }" :class="$style.line" />
					<div ref="badgeEl" :style="{ transform: `translateX(${tooltipXOffset - badgeOffset}px)` }" :class="$style.badge">
						<Text size="12" weight="600" color="secondary">
							{{ badgeText }}
						</Text>
					</div>
					<Flex
						ref="tooltipEl"
						:style="{ transform: `translate(${tooltipDynamicXPosition}px, ${tooltipYOffset - 40}px)` }"
						direction="column"
						gap="8"
						:class="$style.tooltip"
					>
						<Flex align="center" gap="16">
							<Text size="12" weight="600" color="secondary">{{ tooltipLabel }}</Text>
							<Text size="12" weight="600" color="primary"> {{ tooltipValueFormatter(tooltipText) }} {{ unit }} </Text>
						</Flex>
					</Flex>
				</div>
			</Transition>

			<Flex ref="chartEl" :class="[$style.chart, isLoading && $style.loading]" />
		</Flex>
	</Flex>
</template>

<style module lang="scss">
.setting_item {
	min-height: 24px;
}

.chart_selector {
	padding: 4px 6px 4px 6px;
	box-shadow: inset 0 0 0 1px var(--op-10);
	border-radius: 5px;
	cursor: pointer;
	transition: all 1s ease-in-out;
}

.chart_wrapper {
	position: relative;
	height: 180px;
}

.chart {
	position: absolute;

	& svg {
		overflow: visible;
	}
}

.loading {
	animation: skeleton 1s ease infinite;
	pointer-events: none;
}
@keyframes skeleton {
	0% {
		opacity: 0.7;
	}

	50% {
		opacity: 0.5;
	}

	100% {
		opacity: 0.7;
	}
}

.axis {
	position: absolute;
	top: 0;
	right: 0;

	&.x {
		bottom: 6px;
		left: 52px;
	}

	&.y {
		bottom: 34px;
		left: 0;
	}
}

.tooltip_wrapper {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	& .dot {
		width: 6px;
		height: 6px;
		border-radius: 50px;
		background: var(--brand);
		box-shadow: 0 0 0 4px var(--dark-mint);
		transition: all 0.15s ease;
	}

	& .line {
		position: absolute;
		top: 0;
		bottom: 32px;
		border-left: 1px dashed var(--op-10);
		transition: all 0.15s ease;
	}

	& .badge {
		position: absolute;
		bottom: 4px;
		background: var(--card-background);
		transition: all 0.15s ease;
	}

	& .tooltip {
		pointer-events: none;
		position: absolute;
		z-index: 10;
		background: var(--card-background);
		border-radius: 6px;
		box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);
		padding: 8px;
		transition: all 0.2s ease;
	}
}
</style>
