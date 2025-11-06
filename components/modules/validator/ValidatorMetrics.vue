<script setup>
/** UI */
import Input from "@/components/ui/Input.vue"
import Popover from "@/components/ui/Popover.vue"

/** Components */
import RadarChart from "@/components/modules/stats/RadarChart.vue"

/** Services */
import { roundTo, sortArrayOfObjects } from "@/services/utils"

/** API */
import { fetchValidators, fetchValidatorsMetrics, fetchValidatorMetrics } from "@/services/api/validator"

const props = defineProps({
	validator: {
		type: Object,
		required: true,
	},
})

/** Data */
const isLoading = ref(false)
const metricsSeries = ref({})
const metricsOrder = ["block_missed_metric", "commission_metric", "operation_time_metric", "self_delegation_metric", "votes_metric"]
const validators = ref([])

const fetchMetrics = async (init = false) => {
    if (init) {
        isLoading.value = true

        const { data: allMetrics } = await fetchValidatorsMetrics(selectedItem.value?.value)
        const { data: validatorMetrics } = await fetchValidatorMetrics(props.validator.id)

        if (allMetrics.value) {
            metricsSeries.value.comparisonData = [prepareData(allMetrics.value, selectedItem.value.name)]
        }
        if (validatorMetrics.value) {
            metricsSeries.value.mainData = prepareData(validatorMetrics.value, props.validator.moniker)
        }

        isLoading.value = false
        
        return
    }

    if (selectedItem.value?.id) {
        const { data: validatorComparisonMetrics } = await fetchValidatorMetrics(selectedItem.value?.id)
        metricsSeries.value.comparisonData = [prepareData(validatorComparisonMetrics.value, selectedItem.value.moniker)]
    } else {
        const { data: allValidatorsMetrics } = await fetchValidatorsMetrics(selectedItem.value?.value)
        metricsSeries.value.comparisonData = [prepareData(allValidatorsMetrics.value, selectedItem.value.name)]
    }
}

function prepareData(data, name) {
    let res = {name}

    metricsOrder.forEach(m => {
        const _key = m.replace('_metric', '')
        res[_key] = roundTo(data[m] * 100, 2)
    })

    return res
}

const getValidators = async () => {
    const { data } = await fetchValidators({ limit: 100 })
    if (data.value) {
        validators.value = sortArrayOfObjects(data.value.filter(v => v.id !== props.validator.id), "moniker")
    }
}

const isPopoverOpen = ref(false)
const searchTerm = ref("")
const topList = ref([
    {
        name: "Top 25",
        value: 25,
    },
    {
        name: "Top 50",
        value: 50,
    },
    {
        name: "Top 100",
        value: 100,
    },
])
const selectedItem = ref(topList.value?.at(0))

const handlePopoverClose = () => {
	isPopoverOpen.value = false
	searchTerm.value = ""
}
const handleSelectItem = (item) => {
	selectedItem.value = item
    handlePopoverClose()
}
const filteredValidators = computed(() => {
	if (!searchTerm.value) return validators.value

	return validators.value.filter(v =>
        v.moniker?.toLowerCase().includes(searchTerm.value.trim().toLowerCase()) ||
        v.address?.hash === searchTerm.value.trim().toLowerCase()
    )
})

watch(
    () => selectedItem.value,
    async () => {
        await fetchMetrics()
    }
)

onBeforeMount(async() => {
	await fetchMetrics(true)
    await getValidators()
})
</script>

<template>
    <Flex direction="column" justify="between" align="center" gap="12" wide :class="$style.wrapper">
        <Flex align="center" justify="between" wide>
            <Text size="13" weight="600" color="primary">Validator Metrics Comparison</Text>

            <Popover :open="isPopoverOpen" @on-close="handlePopoverClose" side="right" width="160">
                <Flex
                    @click="isPopoverOpen = true"
                    align="center"
                    justify="between"
                    gap="12"
                    :class="[$style.popover_header, isPopoverOpen && $style.popover_header_active]"
                >
                    <Flex align="center" gap="4">
                        <Text size="13" color="secondary"> vs </Text>
                        <Text size="13" color="primary" :class="$style.title"> {{ selectedItem?.name || selectedItem?.moniker || selectedItem?.address?.hash }} </Text>
                    </Flex>

                    <Icon
                        name="chevron"
                        size="14"
                        color="secondary"
                        :style="{ transform: `rotate(${isPopoverOpen ? '180' : '0'}deg)`, transition: 'all 0.25s ease' }"
                    />
                </Flex>

                <template #content>
                    <Flex direction="column" justify="center" gap="12" wide>
                        <Text size="12" weight="600" color="secondary">Compare with</Text>

                        <Flex align="center" justify="between" gap="12" wide>
                            <Text size="12" color="secondary">Top</Text>

                            <Flex align="center" justify="between" wide>
                                <Flex
                                    v-for="item in topList"
                                    @click="handleSelectItem(item)"
                                    align="center"
                                    :class="[$style.top_item, selectedItem.value === item.value && $style.top_item_active]"
                                >
                                    <Text size="12" color="secondary"> {{ item.value }} </Text>
                                </Flex>
                            </Flex>
                        </Flex>

                        <Input v-model="searchTerm" size="small" placeholder="Search.." autofocus />

                        <Flex direction="column" gap="4" :class="$style.popover_list">
                            <template v-if="filteredValidators.length">
                                <Flex
                                    v-for="v in filteredValidators"
                                    @click="handleSelectItem(v)"
                                    align="center"
                                    justify="end"
                                    gap="8"
                                    :class="$style.popover_list_item"
                                >
                                    <Icon v-if="selectedItem.address?.hash === v.address?.hash" name="check" size="14" color="brand" />

                                    <Text size="12" color="primary" :weight="selectedItem.moniker === v.moniker ? '600' : '500'" :class="$style.title"> {{ v.moniker || v.address?.hash }} </Text>
                                </Flex>
                            </template>
                            <Flex v-else-if="searchTerm" justify="center" :style="{ paddingTop: '10px' }">
                                <Text size="12" weight="500" color="tertiary">Nothing was found</Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </template>
            </Popover>
        </Flex>

        <RadarChart
            :series="metricsSeries"
            :isLoading="isLoading"
            :class="$style.chart"
        />
    </Flex>
</template>

<style module lang="scss">
.wrapper {
    max-width: 384px;
}

.popover_header {
	cursor: pointer;

    max-width: 150px;

	padding: 8px;
	box-shadow: 0 0 0 1px var(--op-10);
	border-radius: 6px;

	&:hover {
		box-shadow: 0 0 0 1px var(--op-20);
	}
}

.title {
    max-width: 90px;
    min-height: 14px;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.popover_header_active {
	box-shadow: 0 0 0 1px var(--op-20);
}

.popover_list {
	max-height: 180px;

	overflow-y: auto;
	overflow-x: hidden;
	overscroll-behavior: contain;
}

.top_item {
    cursor: pointer;

    padding: 4px 6px;
    border-radius: 4px;
    border: 1px solid var(--op-10);

    &:hover {
        border: 1px solid var(--op-20);
    }
}

.top_item_active {
    border: 1px solid var(--dark-mint);

    * {
        color: var(--brand);
        font-weight: 600;
    }    
}

.popover_list_item {
	cursor: pointer;

	padding: 8px 6px;
	border-radius: 2px;

    max-width: 160px;

	&:hover {
		background-color: var(--op-5);
	}

    .title {
        max-width: 160px;
        min-height: 13px;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.chart {
    height: 380px;
}

@media (max-width: 800px) {
    .wrapper {
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
    }

    .chart {
        width: 90%;
    }
}
</style>
