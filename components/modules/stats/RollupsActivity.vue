<script setup>
/** Services */
import { abbreviate, formatBytes, comma, sortArrayOfObjects } from "@/services/utils"

/** Components */
import CircularChartCard from "@/components/modules/stats/CircularChartCard.vue"
import RollupsActivityGraph from "~/components/modules/stats/RollupsActivityGraph.vue"
import RollupsActivityTable from "~/components/modules/stats/RollupsActivityTable.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

const props = defineProps({
    rollups: {
        type: Array,
        required: true,
    },
})

const selectedView = ref('graph') // , 'table'

// const sort = reactive({
// 	by: "total_size",
// 	dir: "desc",
// })

// const handleSort = (by) => {
// 	switch (sort.dir) {
// 		case "desc":
// 			if (sort.by == by) sort.dir = "asc"
// 			break

// 		case "asc":
// 			sort.dir = "desc"

// 			break
// 	}

// 	sort.by = by

// 	props.rollups = sortArrayOfObjects(props.rollups, by, sort.dir === 'desc' ? false : true)
// }
</script>

<template>
    <Flex wide direction="column" gap="4">
        <Flex justify="between" :class="$style.header">
            <Flex align="center" gap="8">
                <Icon name="rollup" size="16" color="secondary" />
                <Text size="14" weight="600" color="primary">Rollups Activity</Text>
                <Text size="13" color="tertiary">(last 24h)</Text>
            </Flex>

            <!-- Pagination -->
            <!-- <Flex v-if="pages" align="center" gap="6">
                <Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
                    <Icon name="arrow-left-stop" size="12" color="primary" />
                </Button>
                <Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
                    <Icon name="arrow-left" size="12" color="primary" />
                </Button>

                <Button type="secondary" size="mini" disabled>
                    <Text size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
                </Button>

                <Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
                    <Icon name="arrow-right" size="12" color="primary" />
                </Button>
                <Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages">
                    <Icon name="arrow-right-stop" size="12" color="primary" />
                </Button>
            </Flex> -->
        </Flex>

        <RollupsActivityTable v-if="selectedView === 'table'" :rollups="rollups" />
        <RollupsActivityGraph v-if="selectedView === 'graph'" :rollups="rollups" />
    </Flex>
</template>

<style module>
.header {
	height: 46px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 16px;
}
</style>