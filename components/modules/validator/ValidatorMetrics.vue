<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Input from "@/components/ui/Input.vue"
import Popover from "@/components/ui/Popover.vue"
import Toggle from "@/components/ui/Toggle.vue"

/** Components */
import ChartOnEntityPage from "~/components/shared/ChartOnEntityPage.vue"
import RadarChart from "@/components/modules/stats/RadarChart.vue"

/** Services */
import { abbreviate, formatBytes, roundTo, sortArrayOfObjects, tia } from "@/services/utils"
import { createDataMap, generateSeriesData, PERIODS as periods } from "@/services/utils/entityCharts"

/** API */
import { fetchStakingSeries } from "@/services/api/stats"
import { fetchValidators, fetchValidatorsMetrics, fetchValidatorMetrics } from "@/services/api/validator"

/** Store */
import { useSettingsStore } from "@/store/settings.store"
const settingsStore = useSettingsStore()

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
        itemsList.value = [...itemsList.value, ...sortArrayOfObjects(data.value.filter(v => v.id !== props.validator.id), "moniker")]
    }
}

const isPopoverOpen = ref(false)
const searchTerm = ref("")
const itemsList = ref([
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
const selectedItem = ref(itemsList.value?.at(0))

const handlePopoverClose = () => {
	isPopoverOpen.value = false
	searchTerm.value = ""
}
const handleSelectItem = (item) => {
	selectedItem.value = item
    handlePopoverClose()
}
const filteredItemsList = computed(() => {
	if (!searchTerm.value) return itemsList.value

	return itemsList.value.filter((item) => item.name?.toLowerCase().includes(searchTerm.value.trim().toLowerCase()) || item.moniker?.toLowerCase().includes(searchTerm.value.trim().toLowerCase()))
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
    <Flex direction="column" justify="between" gap="12" wide :class="$style.wrapper">
        <Flex direction="column" gap="12" wide>
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
                            <Text size="13" color="primary" :class="$style.title"> {{ selectedItem?.name || selectedItem?.moniker }} </Text>
                        </Flex>

                        <Icon
                            name="chevron"
                            size="14"
                            color="secondary"
                            :style="{ transform: `rotate(${isPopoverOpen ? '180' : '0'}deg)`, transition: 'all 0.25s ease' }"
                        />
                    </Flex>

                    <template #content>
                        <Flex direction="column" justify="center" gap="12">
                            <Text size="12" weight="600" color="secondary">Compare with</Text>

                            <Input v-model="searchTerm" size="small" placeholder="Search" autofocus />

                            <Flex direction="column" gap="4" :class="$style.popover_list">
                                <template v-if="filteredItemsList.length">
                                    <Flex
                                        v-for="item in filteredItemsList"
                                        @click="handleSelectItem(item)"
                                        align="center"
                                        justify="end"
                                        gap="8"
                                        :class="$style.popover_list_item"
                                    >
                                        <Icon v-if="item.name ? selectedItem.name === item.name : selectedItem.moniker === item.moniker" name="check" size="14" color="brand" />

                                        <Text size="12" color="primary" :class="$style.title"> {{ item.name || item.moniker }} </Text>
                                    </Flex>
                                </template>
                                <Flex v-else justify="center" :style="{ paddingTop: '10px' }">
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
                style="width: 400px; height: 400px;"
            />
        </Flex>

        <Text size="12" weight="500" color="tertiary" style="line-height: 1.2;">
            This chart summarizes validator performance based on several key metrics, including participation in consensus, reliability, commission policy, self-delegation, and operational history. Together, these indicators help evaluate how stable, committed, and aligned a validator is within the network, supporting more informed delegation decisions.
        </Text>
    </Flex>
</template>

<style module lang="scss">
.wrapper {
    max-width: 432px;
    padding: 16px;
}

.popover_header {
	cursor: pointer;

    max-width: 180px;

	padding: 8px;
	box-shadow: 0 0 0 1px var(--op-10);
	border-radius: 6px;

	&:hover {
		box-shadow: 0 0 0 1px var(--op-20);
	}
}

.title {
    max-width: 120px;

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

.popover_list_item {
	padding: 8px 2px;
	border-radius: 2px;

    max-width: 160px;

	cursor: pointer;

	&:hover {
		background-color: var(--op-5);
	}

    .title {
        max-width: 160px;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

@media (max-width: 800px) {
}
</style>
