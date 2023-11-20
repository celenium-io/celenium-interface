<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { formatBytes } from "@/services/utils"

/** API */
import { fetchHistogram } from "@/services/api/stats"

const days = ref([])

const maxSize = ref(0)

onMounted(async () => {
	const data = await fetchHistogram({
		table: "block_stats",
		func: "sum",
		period: "day",
		column: "blobs_size",
		from: parseInt(DateTime.now().minus({ days: 21 }).ts / 1_000),
	})

	days.value = data.reverse()

	maxSize.value = Math.max(...days.value.map((d) => d.value))

	while (days.value.length <= 83) {
		const prevDay = days.value[days.value.length - 1]

		days.value.push({
			time: DateTime.fromISO(prevDay.time).minus({ day: 1 }).toISO(),
			value: 0,
			disabled: true,
		})
	}
})

const getOpacity = (val) => {
	const pct = (parseInt(val) * 100) / maxSize.value

	if (pct < 30) {
		return 0.3
	} else if (pct < 60) {
		return 0.5
	} else if (pct < 100) {
		return 1
	}
}
</script>

<template>
	<Flex direction="column" gap="16" :class="$style.wrapper">
		<Flex justify="between">
			<Flex align="center" gap="6">
				<Icon name="blob" size="12" color="secondary" />
				<Text size="13" weight="600" height="110" color="primary">Blobs Graph</Text>
			</Flex>

			<Flex align="center" gap="16">
				<Flex align="center" gap="6">
					<Icon name="folder" size="12" color="primary" />

					<Flex gap="4" align="end">
						<Text size="13" color="primary" weight="600">0</Text>
						<Text size="13" color="tertiary" weight="600">GB</Text>
					</Flex>
				</Flex>

				<Flex align="center" gap="6">
					<Icon name="blob" size="12" color="primary" />

					<Flex gap="4" align="end">
						<Text size="13" color="primary" weight="600">0</Text>
						<Text size="13" color="tertiary" weight="600">Blobs</Text>
					</Flex>
				</Flex>
			</Flex>
		</Flex>

		<Flex v-if="days.length" gap="6" wrap="wrap" wide :class="$style.days">
			<Tooltip v-for="day in days" :disabled="day.disabled">
				<Skeleton v-if="DateTime.fromISO(day.time).toISODate() === DateTime.now().toISODate()" w="10" h="10" r="2" />
				<Flex
					v-else
					:class="$style.item"
					:style="{
						background: parseInt(day.value) > 0 ? `rgb(10, 219, 111)` : 'var(--op-5)',
						opacity: (day.disabled && 0.6) || parseInt(day.value) > 0 ? getOpacity(day.value) : 1,
						boxShadow: `inset 0 0 0 1px var(--op-10)`,
					}"
				/>

				<template #content>
					<Flex direction="column" gap="4">
						<Text>
							When: <Text color="primary">{{ DateTime.fromISO(day.time).toFormat("LLL dd") }}th</Text>
						</Text>
						<Text>
							Size: <Text color="primary">{{ formatBytes(day.value) }}</Text>
						</Text>
					</Flex>
				</template>
			</Tooltip>
		</Flex>

		<Flex v-else gap="6" wrap="wrap" wide>
			<Skeleton v-for="i in 84" w="10" h="10" r="2" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 100%;

	border-radius: 12px;
	background: var(--card-background);

	padding: 16px;
}

.item {
	width: 10px;
	height: 10px;

	border-radius: 2px;
	cursor: pointer;
	box-shadow: inset 0 0 0 1px rgba(10, 219, 111, 15%);
}

.days {
	max-width: 336px;

	margin: 0 auto;
}
</style>
