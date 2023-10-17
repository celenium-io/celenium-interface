<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** API */
import { fetchHistogram } from "@/services/api/histogram"

const histogram = ref([])

const { data } = await fetchHistogram({ table: "tx", func: "count", period: "hour" })
histogram.value = data.value.slice(0, 24).reverse()

let sectors = []
histogram.value.forEach((item, idx) => {
	const rSix = Math.ceil((idx + 1) / 6) * 6
	if (rSix === idx + 1) {
		sectors.push(histogram.value.slice(rSix - 6, rSix))
	}
})

const min = Math.min(...histogram.value.map((item) => parseInt(item.value)))
const max = Math.max(...histogram.value.map((item) => parseInt(item.value)))
const roundedMax = Math.ceil(max / 5) * 5

const latestSector = Math.ceil(DateTime.fromISO(histogram.value[histogram.value.length - 1].time).hour / 6)

const txCounter = computed(() => histogram.value.reduce((a, b) => (a += parseInt(b.value)), 0))

const getPercentageRatio = (v) => {
	return (parseInt(v) * 100) / roundedMax
}

const getSectorName = (idx) => {
	const a = idx * 6
	return idx !== 0 ? a - 6 : (a - 6) * -3
}
</script>

<template>
	<Flex direction="column" gap="20" :class="$style.wrapper">
		<Flex justify="between">
			<Flex align="center" gap="6">
				<Icon name="zap" size="16" color="primary" />
				<Flex gap="4" align="end">
					<Text size="16" weight="600" color="primary">{{ txCounter }}</Text>
					<Text size="12" weight="700" color="tertiary">TXs</Text>
				</Flex>
			</Flex>

			<Text size="12" weight="600" color="tertiary">24h</Text>
		</Flex>

		<!-- Chart -->
		<Flex gap="16" :class="$style.chart">
			<Flex direction="column" justify="between" :class="$style.yAxis">
				<Text size="12" weight="600" color="secondary">{{ roundedMax }}</Text>
				<Text size="12" weight="600" color="secondary">{{ Math.ceil(roundedMax / 2) }}</Text>
				<Text size="12" weight="600" color="secondary">{{ min }}</Text>
			</Flex>

			<Flex wide :class="$style.sectors">
				<Flex v-for="(sector, idx) in sectors" direction="column" gap="8" wide :class="$style.sector">
					<Flex justify="between" :class="$style.hours">
						<Flex v-for="item in sector" direction="column" justify="end" gap="6" :class="$style.hour">
							<div
								:style="{ height: `${getPercentageRatio(item.value)}%` }"
								:class="[$style.bar, getPercentageRatio(item.value) > 20 && $style.green]"
							/>
							<div :class="$style.dot" />
						</Flex>
					</Flex>

					<Text size="12" weight="600" color="tertiary">
						{{ getSectorName(idx) }}
					</Text>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 100%;

	background: var(--card-background);
	border-radius: 12px;
	overflow: hidden;

	padding: 16px;
}

.chart {
	flex: 1;
}

.yAxis {
	height: 100%;

	padding-bottom: 20px;
}

.sector {
	border-left: 2px solid var(--op-5);

	padding: 0 8px;

	&:last-child {
		border-right: 2px solid var(--op-5);
	}
}

.hours {
	height: 100%;
}

.bar {
	width: 4px;
	height: 15%;

	border-radius: 50px;
	background: var(--txt-tertiary);

	&.green {
		background: var(--green);
	}
}

.dot {
	width: 4px;
	height: 4px;

	border-radius: 50%;
	background: var(--op-5);
}
</style>
