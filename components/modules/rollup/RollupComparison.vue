<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownDivider, DropdownItem, DropdownTitle } from "@/components/ui/Dropdown"

/** Services */
import { abbreviate, capitilize, comma, formatBytes, sortArrayOfObjects } from "@/services/utils"

/** API */
import { fetchRollupSeries } from "@/services/api/stats"
import { fetchRollups } from "@/services/api/rollup"

const props = defineProps({
	rollup: {
		type: Object,
		required: false,
	},
    period: {
        type: Object,
        required: false,
    },
})

const isLoading = ref(false)
const rollupsList = ref([])
const rollupComparison = ref({})
const metrics = ref(['size', 'blobs_count', 'fee'])

const getRollupsList = async () => {
	isLoading.value = true

	const data = await fetchRollups({
		limit: 30,
	})

	rollupsList.value = sortArrayOfObjects(data, 'slug')

	isLoading.value = false
}

const getRollupSeries = async (id, metric) => {
    const data = await fetchRollupSeries({
        id: id,
        name: metric,
        timeframe: props.period.timeframe,
        from: parseInt(
            DateTime.now().minus({
                days: props.period.timeframe === "day" ? props.period.value : 0,
                hours: props.period.timeframe === "hour" ? props.period.value : 0,
            }).ts / 1_000,
        ),
    })

    console.log('data', data);
    
    rollupComparison.value[metric] = data.reduce((acc, el) => acc + +el.value, 0)
    console.log('rollupComparison', rollupComparison.value);
    
}

const fetchComparisonData = async () => {
    isLoading.value = true

    for (let m in metrics.value) {
        await getRollupSeries(19, metrics.value[m])
    }

    isLoading.value = false
}

await getRollupsList()
await fetchComparisonData()



const headerEl = ref(null)
const headerWidth = ref(0)
const barWidth = ref(0)

const barWidthCalculation = () => {
	// headerWidth.value = headerEl.value.wrapper.offsetWidth
	// barWidth.value = Math.round(headerWidth.value - 100)
}

onMounted(() => {
	// barWidthCalculation()

	// window.addEventListener("resize", barWidthCalculation)
})

onBeforeUnmount(() => {
	// window.removeEventListener("resize", barWidthCalculation)
})

watch(
	() => props.period,
	async () => {
		fetchComparisonData()
	},
)

// watch(
// 	() => selectedCategories.value.length,
// 	async () => {
// 		if (page.value !== 1) {
// 			page.value = 1
// 		} else {
// 			await getRollups()
// 		}
// 	}
// )
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper" gap="16">
			<!-- <Flex
				align="center"
				direction="column"
				gap="16"
				:class="[$style.rollup_info, expanded.slug === r.slug && $style.rollup_info_expanded]"
			>
				<Flex direction="column" gap="12">
					<Flex align="center" justify="between">
						<Flex align="center" gap="8">
							<Text size="13" weight="500" color="tertiary">Size</Text>
							<Text size="13" weight="600" color="primary">{{ formatBytes(r.size) }}</Text>
						</Flex>

						<Text size="11" weight="500" color="tertiary">{{ `~${r.size_graph}% of total` }}</Text>
					</Flex>

					<Flex :style="`width: ${barWidth}px`">
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${r.size_graph}%`,
								background: 'var(--mint)',
								marginRight: '4px',
							}"
						></div>
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${100 - r.size_graph}%`,
								background: 'var(--op-20)',
							}"
						></div>
					</Flex>
				</Flex>

				<Flex direction="column" gap="12">
					<Flex align="center" justify="between">
						<Flex align="center" gap="8">
							<Text size="13" weight="500" color="tertiary">Blobs</Text>
							<Text size="13" weight="600" color="primary">{{ comma(r.blobs_count) }}</Text>
						</Flex>

						<Text size="11" weight="500" color="tertiary">{{ `~${r.blobs_count_graph}% of total` }}</Text>
					</Flex>

					<Flex :style="`width: ${barWidth}px`">
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${r.blobs_count_graph}%`,
								background: 'var(--mint)',
								marginRight: '4px',
							}"
						></div>
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${100 - r.blobs_count_graph}%`,
								background: 'var(--op-20)',
							}"
						></div>
					</Flex>
				</Flex>

				<Flex direction="column" gap="12">
					<Flex align="center" justify="between">
						<Flex align="center" gap="8">
							<Text size="13" weight="500" color="tertiary">Fee Paid</Text>
							<Text size="13" weight="600" color="primary">{{ `${comma(Math.round(r.fee / 1_000_000))} TIA` }}</Text>
						</Flex>

						<Text size="11" weight="500" color="tertiary">{{ `~${r.fee_graph}% of total` }}</Text>
					</Flex>

					<Flex :style="`width: ${barWidth}px`">
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${r.fee_graph}%`,
								background: 'var(--mint)',
								marginRight: '4px',
							}"
						></div>
						<div
							:class="$style.validator_bar"
							:style="{
								width: `${100 - r.fee_graph}%`,
								background: 'var(--op-20)',
							}"
						></div>
					</Flex>
				</Flex> -->
		<!-- <Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
            <Text size="13" weight="600" color="secondary" align="center"> No rollups found </Text>
            <Text size="12" weight="500" height="160" color="tertiary" align="center">
                There are no rollups to display
            </Text>
        </Flex> -->
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

.row {
	height: 60px;
	padding: 12px 16px 0 16px;

	border-top: 1px solid var(--op-5);

	cursor: pointer;
	
	overflow: hidden;
	transition: all 0.5s ease;
}

.row_expanded {
	height: 240px;

	transition: all 0.5s ease;
}

.dot {
	width: 4px;
	height: 4px;

	border-radius: 50%;
	background: var(--op-10);
}

.avatar_wrapper {
  position: relative;
  width: 40px;
  height: 40px;
}

.avatar_container {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.status_dot {
	position: absolute;
	bottom: 0px;
	right: 0px;
	z-index: 1;
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background: var(--brand);
	border: 1px solid var(--card-background);
}

.rollup_subtitle {
	max-width: 350px;

	text-wrap: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	transition: all 0.5s ease;
}

.rollup_info {
	height: 0;
	padding-left: 52px;
	transition: all 0.5s ease;
}

.rollup_info_expanded {
	height: 100%;
	transition: all 0.5s ease;
}

.validator_bar {
	height: 4px;

	border-radius: 2px;

	margin-bottom: 4px;
}

.actions {
	padding: 0px 12px;
}

.chip {
    box-shadow: inset 0 0 0 1px var(--op-15);
    border-radius: 10px;
	cursor: pointer;

	transition: all 0.2s ease;

	&:active {
		scale: 0.95;
	}

	&.active {
		background-color: var(--card-background);
		box-shadow: inset 0 0 0 1px var(--brand);
	}
}

.content {
    padding: 6px 10px;
}

.show {
	opacity: 1;

	transition: all 0.2s ease;
}

.hide {
	width: 0;
	opacity: 0;

	transition: all 0.2s ease;
}

a {
	& :active {
		color: var(--txt-secondary);

		& svg:first-of-type {
			fill: var(--txt-secondary);
		}		
	}
}

.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.empty {
	padding: 16px 0;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}

	.header {
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}
</style>
