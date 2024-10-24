<script setup>
/** Components */
import RollupsActivityGraph from "~/components/modules/stats/RollupsActivityGraph.vue"
import RollupsActivityTable from "~/components/modules/stats/RollupsActivityTable.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

const props = defineProps({
    rollups: {
        type: Array,
        required: true,
    },
})

const selectedView = ref('table')
const handleSelectView = () => {
    selectedView.value === 'graph' ? selectedView.value = 'table' : selectedView.value = 'graph'
}
</script>

<template>
    <Flex wide direction="column" gap="4">
        <Flex align="center" justify="between" :class="$style.header">
            <Flex align="center" gap="8">
                <Icon name="rollup" size="16" color="secondary" />
                <Text size="14" weight="600" color="primary">Rollups Activity</Text>
                <Text size="13" color="tertiary">(last 24h)</Text>
            </Flex>

            <Tooltip side="top">
                <Flex
                    @click="handleSelectView"
                    align="center"
                    gap="12"
                    :class="$style.view_selector"
                    :style="{
                        background: `linear-gradient(to ${selectedView === 'table' ? 'right' : 'left'}, var(--op-5) 50%, transparent 50%)`,
                    }"
                >
                    <Icon
                        name="table"
                        size="16"
                        :style="{ fill: `${selectedView === 'table' ? 'var(--mint)' : 'var(--txt-tertiary)'}` }"
                    />

                    <Icon
                        name="gantt-chart"
                        size="16"
                        :style="{ fill: `${selectedView === 'graph' ? 'var(--mint)' : 'var(--txt-tertiary)'}` }"
                    />
                </Flex>

                <template #content>
                    <Text size="12" color="tertiary">
                        Changing data display view
                    </Text>
                </template>
            </Tooltip>
        </Flex>
        <Transition name="fastfade" mode="out-in">
            <RollupsActivityTable v-if="selectedView === 'table'" :rollups="rollups" />
            <RollupsActivityGraph v-else-if="selectedView === 'graph'" :rollups="rollups" />
        </Transition>
    </Flex>
</template>

<style module>
.header {
	height: 46px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 16px;
}

.view_selector {
    max-height: 24px;
	padding: 4px 6px 4px 6px;
	box-shadow: inset 0 0 0 1px var(--op-10);
	border-radius: 5px;
	cursor: pointer;
	transition: all 1s ease-in-out;
}
</style>