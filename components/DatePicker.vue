<script setup>
/** Vendor */
import { useDebounceFn } from "@vueuse/core"
import { DateTime, Info } from "luxon"

/** Stats Constants */
import { STATS_PERIODS } from "@/services/constants/stats.js"

/** UI */
import Button from "@/components/ui/Button.vue"
import Popover from "@/components/ui/Popover.vue"

/** Utils */
import { isMobile } from "@/services/utils"

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

const popoverStyles = computed(() => {
	if (!isMobile()) {
		return {
			width: 380,
			side: 'left',
			direction: 'row',
			calendar: {
				width: '65%',
				paddingLeft: '12px',
				borderLeftWidth: '1px',
				borderLeftStyle: 'solid',
				borderImage: 'linear-gradient(to bottom, transparent 0%, var(--op-10) 20%, var(--op-10) 80%, transparent 100%) 1'
			}
		}
	} else {
		return {
			width: 250,
			side: 'right',
			direction: 'column',
			calendar: {
				width: '100%',
				paddingTop: '12px',
				borderTopWidth: '1px',
				borderTopStyle: 'solid',
				borderImage: 'linear-gradient(to right, transparent 0%, var(--op-10) 5%, var(--op-10) 95%, transparent 100%) 1'
			}
		}
	}
})

const currentDate = ref(DateTime.now())
const limitMinDate = ref(props.minDate ? DateTime.fromISO(props.minDate) : '')
const month = ref(currentDate.value.month)
const year = ref(currentDate.value.year)
const startDate = ref(props.from ? DateTime.fromSeconds(parseInt(props.from)).startOf('day') : {})
const endDate = ref(props.to ? DateTime.fromSeconds(parseInt(props.to)).endOf('day') : {})
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

const periods = ref(STATS_PERIODS)
const selectedPeriod = ref()
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

const handleSelectPeriod = (period) => {
	if (selectedPeriod.value === period) {
		selectedPeriod.value = {}
		startDate.value = {}
		endDate.value = {}
	} else {
		selectedPeriod.value = period

		startDate.value = DateTime.now().minus({
			days: period.timeframe === "day" ? period.value - 1 : 0,
		}).startOf('day')
		endDate.value = DateTime.now().endOf('day')
	}
}

const handleSelectDate = (d) => {
	if (!startDate.value.ts) {
		startDate.value = d
	} else if (startDate.value.ts !== d.ts) {
		if (!endDate.value.ts) {
			if (startDate.value.ts > d.ts) {
				endDate.value = startDate.value.endOf('day')
				startDate.value = d
			} else {
				endDate.value = d.endOf('day')
			}
		} else {
			startDate.value = d
			endDate.value = {}
		}
	} else {
		if (!endDate.value.ts) {
			startDate.value = {}
		} else {
			startDate.value = endDate.value.startOf('day')
			endDate.value = {}
		}
	}

	selectedPeriod.value = {}
}

const isInSelectedPeriod = (d) => {
	return startDate.value.ts < d.ts && d.endOf('day').ts < endDate.value.ts
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

	if (!startDate.value?.ts) {
		emit('onUpdate', { clear: true })
	} else {
		endDate.value = endDate.value?.ts ? endDate.value?.endOf('day') : startDate.value?.endOf('day')

		emit('onUpdate', { from: parseInt(startDate.value.ts / 1_000), to: parseInt(endDate.value.ts / 1_000) })
	}
}

const handleClear = () => {
	isOpen.value = false

	startDate.value = {}
	endDate.value = {}
	selectedPeriod.value = {}

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
	<Popover :open="isOpen" @on-close="handleClose" :width="popoverStyles.width" :side="popoverStyles.side">
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
			<Flex align="start" :direction="popoverStyles.direction" justify="between" gap="12" wide>
				<Flex v-if="!isMobile()" direction="column" gap="20" :style="{width: '32%'}">
					<Flex align="center" justify="start" gap="6" :style="{height: '14px'}">
						<Text size="12" color="secondary"> Periods </Text>
					</Flex>

					<Flex direction="column" gap="12">
						<Flex v-for="period in periods" @click="handleSelectPeriod(period)" align="center" justify="between" :class="$style.period">
							<Text size="12" :color="period.title === selectedPeriod?.title ? 'secondary' : 'tertiary'"> {{ period.title }} </Text>

							<Icon :name="period.title === selectedPeriod?.title ? 'check' : ''" size="12" color="brand" />
						</Flex>
					</Flex>
				</Flex>

				<Flex v-else justify="between" wide :style="{padding: '0 8px'}">
					<Text size="12" color="secondary"> Periods </Text>

					<Flex gap="12">
						<Flex v-for="period in periods" @click="handleSelectPeriod(period)" align="center" justify="between" :class="$style.period">
							<Text size="12" :color="period.title === selectedPeriod?.title ? 'secondary' : 'tertiary'"> {{ period.shortTitle }} </Text>
						</Flex>
					</Flex>
				</Flex>


				<Flex direction="column" gap="12" :style="popoverStyles.calendar">
					<Flex align="center" justify="center" gap="6">
						<Icon
							@click="handleMonthChange(-1)"
							name="chevron"
							size="14"
							color="tertiary"
							class="clickable"
							:class="!isPrevMonthAvailable && $style.disabled"
							:style="{ transform: 'rotate(90deg)' }"
						/>

						<Text size="12" color="secondary"> {{ `${DateTime.local(year, month).toFormat('LLLL')} ${year}` }} </Text>

						<Icon
							@click="handleMonthChange(1)"
							name="chevron"
							size="14"
							color="tertiary"
							class="clickable"
							:class="!isNextMonthAvailable && $style.disabled"
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
												(d.ts === startDate.ts || d.endOf('day').ts === endDate.ts) && $style.edgeDate,
												isInSelectedPeriod(d) && $style.inSelectedPeriod
											]"
										>
											<Text size="12" color="primary"
												:class="[
													d.month !== month && $style.notInCurrentMonth,
													(d.ts === startDate.ts || d.endOf('day').ts === endDate.ts || isInSelectedPeriod(d)) && $style.text_primary
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
			</Flex>
		</template>
	</Popover>
</template>

<style module>
.wrapper {
	height: 100%;
}

.vertical_divider {
	min-width: 2px;
	height: 50%;
	background: var(--op-10);
}

.period {
	cursor: pointer;
}

.period:hover {
	& * {
		color: var(--txt-secondary);
	}
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
	background-color: rgba(24, 210, 165, 70%);
}

.notInCurrentMonth {
	color: var(--txt-tertiary);
}

.edgeDate {
	background-color: rgba(24, 210, 165, 60%);
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