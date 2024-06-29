<script setup>
/** Vendor */
import { DateTime, Info } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Popover from "@/components/ui/Popover.vue"

const props = defineProps({
	color: {
		type: String,
		default: "primary"
	},
})

const month = ref(DateTime.now().month)
const year = ref(DateTime.now().year)
const startDate = ref({})
const endDate = ref({})
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

	// if (Object.keys(filters.message_type).find((f) => filters.message_type[f])) {
	// 	savedFiltersBeforeChanges.value = { ...filters.message_type }
	// }
}
const handleClose = () => {
	isOpen.value = false

	// searchTerm.value = ""

	// if (savedFiltersBeforeChanges.value) {
	// 	filters.message_type = savedFiltersBeforeChanges.value
	// 	savedFiltersBeforeChanges.value = null
	// } else {
	// 	resetFilters("message_type")
	// }
}

const handleApply = () => {

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
</script>

<template>
	<Popover :open="isOpen" @on-close="handleClose" width="250">
		<Button @click="handleOpen" type="secondary" size="mini">
			<Icon name="plus-circle" size="12" color="tertiary" />

			<Text color="secondary">Date Range</Text>
		</Button>

		<template #content>
			<Flex direction="column" gap="12">
				<Flex align="center" justify="center" gap="6">
					<Icon
						@click="handleMonthChange(-1)"
						name="chevron"
						size="14"
						color="tertiary"
						:style="{ transform: 'rotate(90deg)' }"
					/>

					<Text size="12" color="secondary"> {{ `${DateTime.local(year, month).toFormat('LLLL')} ${year}` }} </Text>

					<Icon
						@click="handleMonthChange(1)"
						name="chevron"
						size="14"
						color="tertiary"
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
								<td v-for="d in w">
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
	/* background-color: var(--neutral-green); */
}

.inSelectedPeriod {
	background-color: var(--btn-secondary-bg);
}

.text_primary {
	color: var(--txt-primary);
}

.endDate {
	background-color: rgba(51, 168, 83, 70%);
}
</style>