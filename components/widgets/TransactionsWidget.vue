<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma, abbreviate } from "@/services/utils"

/** API */
import { fetchHistogram } from "@/services/api/stats"

const histogram = ref([])

const sectors = ref([])

const min = ref(0)
const max = ref(0)
const roundedMax = ref(0)

const latestSector = ref(0)

onMounted(async () => {
	const data = await fetchHistogram({
		table: "tx",
		func: "count",
		period: "hour",
		from: parseInt(DateTime.now().minus({ hours: 24 }).ts / 1_000),
	})
	histogram.value = data.slice(0, 24).reverse()

	histogram.value.forEach((item, idx) => {
		const rSix = Math.ceil((idx + 1) / 6) * 6
		if (rSix === idx + 1) {
			sectors.value.push(histogram.value.slice(rSix - 6, rSix))
		}
	})

	max.value = Math.max(...histogram.value.map((item) => parseInt(item.value)))
	roundedMax.value = Math.ceil(max.value / 5) * 5

	latestSector.value = Math.ceil(DateTime.fromISO(histogram.value[histogram.value.length - 1].time).hour / 6)
})

const txCounter = computed(() => {
	return histogram.value.reduce((a, b) => (a += parseInt(b.value)), 0)
})

const getPercentageRatio = (v) => {
	return (parseInt(v) * 100) / roundedMax.value
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
				<Icon name="tx" size="16" color="primary" />
				<Flex gap="4" align="end">
					<Text v-if="txCounter" size="16" weight="600" color="primary">{{ abbreviate(txCounter) }}</Text>
					<Skeleton v-else w="36" h="16" />

					<Text size="12" weight="700" color="tertiary">TXs</Text>
				</Flex>
			</Flex>

			<Text size="12" weight="600" color="tertiary">24h</Text>
		</Flex>

		<!-- Chart -->
		<Flex gap="16" :class="$style.chart">
			<Flex direction="column" justify="between" :class="$style.yAxis">
				<Skeleton w="22" h="12" v-if="!roundedMax" />
				<Text v-else size="12" weight="600" color="secondary">{{ comma(roundedMax) }}</Text>

				<Skeleton w="22" h="12" v-if="!roundedMax" />
				<Text v-else size="12" weight="600" color="secondary">{{ comma(Math.ceil(roundedMax / 2)) }}</Text>

				<Skeleton w="22" h="12" v-if="!roundedMax" />
				<Text v-else size="12" weight="600" color="secondary">{{ comma(min) }}</Text>
			</Flex>

			<Flex v-if="!sectors.length" wide :class="$style.sectors">
				<Flex v-for="i in 4" direction="column" gap="8" wide :class="$style.sector">
					<Flex justify="between" wide :class="$style.hours">
						<Flex v-for="j in 6" direction="column" justify="end" gap="6" :class="$style.hour">
							<Skeleton w="4" :style="{ height: `${Math.random(20, 80) * 100}%` }" />
							<div :class="$style.dot" />
						</Flex>
					</Flex>

					<Skeleton w="20" h="12" />
				</Flex>
			</Flex>

			<Flex v-else wide :class="$style.sectors">
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

		<!-- <Flex v-else align="center" justify="center" direction="column" gap="6" wide :class="$style.empty">
			<Text size="13" weight="600" color="secondary" align="center"> Data temporarily unavailable </Text>
			<Text size="12" weight="500" height="160" color="tertiary" align="center"> Transaction widget will be available soon </Text>
		</Flex> -->
	</Flex>
</template>

<style module>
.wrapper {
	height: 100%;
	min-height: 164px;

	background: var(--card-background);
	border-radius: 12px;
	overflow: hidden;

	padding: 16px;
}

.chart {
	flex: 1;
}

.yAxis {
	height: auto;

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

.empty {
	height: 100%;
}

@media (max-width: 1100px) {
	.bar {
		width: 8px;
	}

	.dot {
		min-width: 8px;
		min-height: 8px;
	}
}

@media (max-width: 540px) {
	.bar {
		width: 4px;
	}

	.dot {
		min-width: initial;
		min-height: initial;
	}
}
</style>
