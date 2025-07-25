<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { formatBytes } from "@/services/utils"

/** API */
import { fetchSeries } from "@/services/api/stats"

const router = useRouter()

const days = ref([])
const weeks = ref([])

const totalSize = reactive({
	time: "",
	value: 0,
})
const minValue = ref(0)
const maxValue = ref(0)

onMounted(async () => {
	const data = await fetchSeries({
		table: "blobs_size",
		period: "day",
		from: parseInt(DateTime.now().minus({ days: 168 }).ts / 1_000),
	})

	days.value = data
	days.value.reverse()

	totalSize.value = days.value.reduce((a, b) => (a += parseInt(b.value)), 0)
	minValue.value = Math.min(...days.value.map((d) => d.value).filter((value) => value > 0))
	maxValue.value = Math.max(...days.value.map((d) => d.value))

	const firstDayDt = DateTime.fromISO(days.value[0].time)
	if (firstDayDt.weekday !== 1) {
		days.value.unshift(...Array.from({ length: firstDayDt.weekday - 1 }))
	}

	/** days -> weeks */
	while (days.value.length) {
		weeks.value.push(days.value.slice(0, 7))
		days.value.splice(0, 7)
	}

	/** fill the last available week with days */
	while (weeks.value[weeks.value.length - 1].length < 7) {
		weeks.value[weeks.value.length - 1].push(null)
	}

	/** fill empty weeks */
	while (weeks.value.length < 24) {
		weeks.value.push(Array.from({ length: 7 }))
	}

	/** remove first weeks */
	while (weeks.value.length > 24) {
		weeks.value.shift()
	}

	totalSize.time = Object.values(weeks.value[0]).find(Boolean).time
})

const calculateOpacity = (val) => {
	let opacity = 0.4
	if (val) {
		const normalizedValue = (val - minValue.value) / (maxValue.value - minValue.value)
		opacity += normalizedValue * 0.6
	}

	return opacity
}

const selectDay = (d) => {
	let from = parseInt(DateTime.fromISO(d.time).startOf("day").ts / 1_000)
	let to = parseInt(DateTime.fromISO(d.time).endOf("day").ts / 1_000)
	router.push(`/txs?message_type=MsgPayForBlobs&from=${from}&to=${to}`)
}
</script>

<template>
	<Flex direction="column" gap="12" :class="$style.wrapper">
		<Flex justify="between">
			<Flex align="center" gap="6">
				<Icon name="blob" size="12" color="secondary" />
				<Text size="13" weight="600" height="110" color="primary">Blobs Graph</Text>
			</Flex>

			<Tooltip>
				<Flex align="center" gap="6">
					<Icon name="namespace" size="12" color="primary" />

					<Text v-if="totalSize.value" size="13" color="primary" weight="600">{{ formatBytes(totalSize.value) }}</Text>
					<Skeleton v-else w="56" h="13" />
				</Flex>

				<template #content>
					<Text size="12" color="secondary">{{ `Since ${DateTime.fromISO(totalSize.time).toFormat("LLL dd")}th` }}</Text>
				</template>
			</Tooltip>
		</Flex>

		<Flex v-if="weeks.length == 24" justify="between" wide :class="$style.weeks">
			<Flex v-for="week in weeks" direction="column" justify="between">
				<Tooltip v-for="day in week" :disabled="!day">
					<Flex
						@click="selectDay(day)"
						:class="[$style.day, day?.value > 0 && $style.shadow]"
						:style="{
							background: parseInt(day?.value) > 0 ? `var(--brand)` : 'var(--op-10)',
							opacity: calculateOpacity(day?.value),
						}"
					/>

					<template #content>
						<Flex direction="column" gap="4">
							<Text color="secondary">{{ DateTime.fromISO(day.time).toFormat("LLL dd") }}th</Text>
							<Text color="primary">{{ formatBytes(day.value) }}</Text>
						</Flex>
					</template>
				</Tooltip>
			</Flex>
		</Flex>

		<Flex v-else :class="$style.weeks">
			<Flex v-for="week in 24" direction="column" justify="between" wide>
				<Skeleton v-for="i in 7" w="10" h="5" r="2" />
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 100%;
	min-height: 122px;

	border-radius: 12px;
	background: var(--card-background);

	padding: 16px;
}

.weeks {
	flex: 1;
}

.day {
	width: 10px;
	height: 5px;

	border-radius: 2px;
	cursor: pointer;
}

.day.shadow {
	box-shadow: 0 0 6px rgba(10, 222, 112, 80%);
}

.days {
	max-width: 336px;

	margin: 0 auto;
}
</style>
