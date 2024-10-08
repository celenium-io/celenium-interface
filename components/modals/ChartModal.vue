<script setup>
/** Vendor */
import { generate } from "lean-qr"

/** Services */
import amp from "@/services/amp"

/** UI */
import Modal from "@/components/ui/Modal.vue"

/** Stats Components/Constants */
import BarChart from "@/components/modules/stats/BarChart.vue"
import LineChart from "@/components/modules/stats/LineChart.vue"
import SquareSizeChart from "@/components/modules/stats/SquareSizeChart.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const series = ref()
const chartView = ref()
watch(
	() => props.show,
	async () => {
		if (props.show) {
			amp.log("showChartModal")
			series.value = {}
			nextTick(() => {
				chartView.value = cacheStore.chart.view
				series.value = cacheStore.chart.series
			})
		}
	},
)
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" fullscreen disable-trap>
        <LineChart v-if="chartView === 'line'" :series="series" />
		<BarChart v-else-if="chartView === 'bar'" :series="series" />
	</Modal>
</template>

<style module>
.badge {
	border-radius: 8px 8px 0 0;
	background: var(--op-5);

	padding: 12px;
}

.content {
	min-width: 0;

	& span:first-child {
		min-width: 0;
		text-overflow: ellipsis;
		overflow: hidden;
	}
}

.qrcode {
	filter: invert(1);
	image-rendering: pixelated;

	user-select: none;
	-webkit-user-drag: none;
	box-shadow: inset 0 0 0 4px rgba(0, 0, 0, 5%);
	border-radius: 0 0 12px 12px;
}
</style>
