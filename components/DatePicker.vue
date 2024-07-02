<script setup>
/** Vendor */
import { DateTime, Info } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Popover from "@/components/ui/Popover.vue"

const props = defineProps({
	from: {
		type: String,
		default: '',
	},
	to: {
		type: String,
		default: '',
	},
	minDate: {
		type: String,
		default: '',
	}
})

const emit = defineEmits(["onUpdate"])

const currentDate = ref(DateTime.now())
const limitMinDate = ref(props.minDate ? DateTime.fromISO(props.minDate) : '')
const month = ref(currentDate.value.month)
const year = ref(currentDate.value.year)
const startDate = ref(props.from ? DateTime.fromSeconds(parseInt(props.from)) : {})
const endDate = ref(props.to ? DateTime.fromSeconds(parseInt(props.to)) : {})
const weekdays = ref(Info.weekdays('narrow', { locale: 'en-US' }))
const days = computed(() => {
	let rawDays = []
	const firstDay = DateTime.local(year.value, month.value).setLocale('en-US')
	const lastDay = firstDay.endOf('month')

	for (let day = firstDay; day <= lastDay; day = day.plus({ days: 1 })) {
        rawDays.push(day)
    }

	if (firstDay.weekday !== 1) {
		let prevDay = firstDay
		while (prevDay.weekday !== 1) {
			prevDay = prevDay.minus({ days: 1 }).startOf('day')
			rawDays.unshift(prevDay)
		}
	}

	if (lastDay.weekday !== 7) {
		let nextDay = lastDay
		while (nextDay.weekday !== 7) {
			nextDay = nextDay.plus({ days: 1 }).startOf('day')
			rawDays.push(nextDay)
		}
	}

	let resDays = []
	while (rawDays.length) {
		resDays.push(rawDays.splice(0, 7))
	}

	return resDays
})

const selectedRange = ref('')
const updateSelectedRange = (from, to) => {
	if (from?.ts) {
		if (to?.ts) {
			if (from.year === to.year) {
				selectedRange.value = from.toFormat('dd LLL') !== to.toFormat('dd LLL') ? `${from.toFormat('dd LLL')} - ${to.toFormat('dd LLL')}` : from.toFormat('dd LLL')
			} else {
				selectedRange.value = `${from.toFormat('dd LLL yyyy')} - ${to.toFormat('dd LLL yyyy')}`
			}
		} else {
			selectedRange.value = from.toFormat('dd LLL')
		}
	} else {
		selectedRange.value = ''
	}
}
updateSelectedRange(startDate.value, endDate.value)

const isNextMonthAvailable = computed(() => !(month.value === currentDate.value.month && year.value === currentDate.value.year))
const isPrevMonthAvailable = computed(() => limitMinDate.value ? limitMinDate.value.ts < days.value[0][0].ts : true)
const isDayAvailable = (d) => {
	if (d.startOf('day').ts > currentDate.value.startOf('day').ts) {
		return false
	} else if (limitMinDate.value) {
		return d.startOf('day').ts >= limitMinDate.value.startOf('day').ts
	} else {
		return true
	}
}

const handleSelectDate = (d) => {
	if (!startDate.value.ts) {
		startDate.value = d
	} else if (startDate.value.ts !== d.ts) {
		if (!endDate.value.ts) {
			if (startDate.value.ts > d.ts) {
				endDate.value = startDate.value
				startDate.value = d
			} else {
				endDate.value = d
			}
		} else {
			startDate.value = d
			endDate.value = {}
		}
	} else {
		if (!endDate.value.ts) {
			startDate.value = {}
		} else {
			startDate.value = endDate.value
			endDate.value = {}
		}
	}
}

const isInSelectedPeriod = (d) => {
	return startDate.value.ts < d.ts && d.ts < endDate.value.ts
}

const isOpen = ref(false)
const handleOpen = () => {
	isOpen.value = true
}
const handleClose = () => {
	isOpen.value = false

	if (!startDate.value.ts) {
		month.value = currentDate.value.month
		year.value = currentDate.value.year		
	}
}

const handleApply = () => {
	isOpen.value = false

	if (!endDate.value.ts) {
		endDate.value = startDate.value.endOf('day')
	}

	emit('onUpdate', { from: parseInt(startDate.value.ts / 1_000), to: parseInt(endDate.value.ts / 1_000) })
}

const handleClear = () => {
	isOpen.value = false

	startDate.value = {}
	endDate.value = {}

	emit('onUpdate', { clear: true })
}

const handleMonthChange = (v) => {
	switch (month.value + v) {
		case 0:
			month.value = 12
			year.value --
			break
		case 13:
			month.value = 1
			year.value ++
			break
		default:
			month.value += v
	}
}

watch(
	() => props.from,
	() => {
		updateSelectedRange(DateTime.fromSeconds(parseInt(props.from)), DateTime.fromSeconds(parseInt(props.to)))
	},
)
</script>

<template>
	<Popover :open="isOpen" @on-close="handleClose" width="250">
		<Button @click="handleOpen" type="secondary" size="mini">
			<Icon name="plus-circle" size="12" color="tertiary" />

			<Text color="secondary">Date Range</Text>

			<template v-if="selectedRange">
				<div :class="$style.vertical_divider" />

				<Text size="12" weight="600" color="primary">
					{{ selectedRange }}
				</Text>

				<Icon @click.stop="handleClear" name="close-circle" size="12" color="secondary" />
			</template>
		</Button>

		<template #content>
			<Flex direction="column" gap="12">
				<Flex align="center" justify="center" gap="6">
					<Icon
						@click="handleMonthChange(-1)"
						name="chevron"
						size="14"
						color="tertiary"
						:class="[$style.clickable, !isPrevMonthAvailable && $style.disabled]"
						:style="{ transform: 'rotate(90deg)' }"
					/>

					<Text size="12" color="secondary"> {{ `${DateTime.local(year, month).toFormat('LLLL')} ${year}` }} </Text>

					<Icon
						@click="handleMonthChange(1)"
						name="chevron"
						size="14"
						color="tertiary"
						:class="[$style.clickable, !isNextMonthAvailable && $style.disabled]"
						:style="{ transform: 'rotate(-90deg)' }"
					/>
				</Flex>

				<Flex direction="column" gap="16" wide :class="$style.table">
					<table>
						<thead>
							<tr>
								<th v-for="wd in weekdays">
									<Text size="10" color="secondary"> {{ wd }} </Text>
								</th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="w in days">
								<td v-for="d in w" :class="!isDayAvailable(d) && $style.disabled">
									<Flex align="center" justify="center"
										@click="handleSelectDate(d)"
										:class="[
											$style.day,
											(d.ts === startDate.ts || d.ts === endDate.ts) && $style.edgeDate,
											isInSelectedPeriod(d) && $style.inSelectedPeriod											
										]"
									>
										<Text size="12" color="primary"
											:class="[
												d.month !== month && $style.notInCurrentMonth,
												(d.ts === startDate.ts || d.ts === endDate.ts || isInSelectedPeriod(d)) && $style.text_primary
											]"
										> {{ d.day }} </Text>
									</Flex>
								</td>
							</tr>
						</tbody>
					</table>
				</Flex>

				<Button @click="handleApply" type="secondary" size="mini" wide>Apply</Button>
			</Flex>
		</template>
	</Popover>
</template>

<style module>
.vertical_divider {
	min-width: 2px;
	height: 12px;
	background: var(--op-10);
}

.clickable {
	cursor: pointer;
}

.table {
	transition: all 0.2s ease;

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		& tbody {
			& tr {
				transition: all 0.05s ease;
			}
		}

		& tr th {
			text-align: center;
			padding-bottom: 8px;
		}

		& tr td {
			text-align: center;

			cursor: pointer;
		}

		th:first-child, td:first-child {
            border-radius: 3px;
        }

		th:last-child, td:last-child {
            border-radius: 3px;
        }
	}
}

.day {
	min-width: 20px;
	min-height: 20px;

	border-radius: 3px;
}

.day:hover {
	background-color: rgba(51, 168, 83, 70%);
}

.notInCurrentMonth {
	color: var(--txt-tertiary);
}

.edgeDate {
	background-color: rgba(51, 168, 83, 70%);
}

.inSelectedPeriod {
	background-color: var(--btn-secondary-bg);
}

.text_primary {
	color: var(--txt-primary);
}

.disabled {
	opacity: 0.3;
	pointer-events: none;
	cursor: default;
}
</style>