<script setup>
/** Vendor */
import { DateTime } from "luxon"

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
const startDate = ref(null)
const endDate = ref(null)
const days = ref([])

// console.log(month.value);
// console.log(year.value);
// console.log(DateTime.local(year.value, month.value).toFormat('LLLL'));

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
			year.value -= 1
			break
		case 13:
			month.value = 1
			year.value += 1
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
				<!-- <div :class="$style.calendar"> -->
				<div>
					<!-- <Flex align="center" gap="6" :class="$style.calendar_header"> -->
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
					<!-- <div class="calendar-body">
						<div class="day" v-for="day in days" :key="day.date">
							<span
								:class="{
								'is-today': isToday(day.date),
								'is-selected': isSelected(day.date),
								'is-in-range': isInRange(day.date)
								}"
								@click="selectDate(day.date)"
							>
								{{ day.date.getDate() }}
							</span>
						</div>
					</div>
					<div class="selected-dates">
						<p>Start Date: {{ formatDate(startDate) }}</p>
						<p>End Date: {{ formatDate(endDate) }}</p>
					</div> -->
				</div>

				
				<!-- <Text size="12" weight="500" color="secondary">Filter by Date</Text> -->

				<!-- <Input v-model="searchTerm" size="small" placeholder="Search" autofocus /> -->

				<!-- <Flex direction="column" gap="8" :class="$style.message_types_list">
					<template
						v-if="
							Object.keys(filters.message_type).filter((t) =>
								t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
							).length
						"
					>
						<Checkbox
							v-for="msg_type in Object.keys(filters.message_type).filter((t) =>
								t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
							)"
							v-model="filters.message_type[msg_type]"
						>
							<Text size="12" weight="500" color="primary">{{ msg_type.replace("Msg", "") }}</Text>
						</Checkbox>
					</template>
					<Flex v-else direction="column" gap="8">
						<Text size="12" weight="500" color="tertiary">Nothing was found</Text>
					</Flex>
				</Flex> -->

				<Button @click="handleApply" type="secondary" size="mini" wide>Apply</Button>
			</Flex>
		</template>
	</Popover>
	<!-- <Popover :open="isMessageTypePopoverOpen" @on-close="onMessageTypePopoverClose" width="250">
		<Button @click="handleOpenMessageTypePopover" type="secondary" size="mini">
			<Icon name="plus-circle" size="12" color="tertiary" />
			<Text color="secondary">Message Type</Text>

			<template v-if="Object.keys(filters.message_type).find((f) => filters.message_type[f])">
				<div :class="$style.vertical_divider" />

				<Text size="12" weight="600" color="primary">
					{{
						Object.keys(filters.message_type).filter((f) => filters.message_type[f]).length < 3
							? Object.keys(filters.message_type)
									.filter((f) => filters.message_type[f])
									.map((f) => f.replace("Msg", ""))
									.join(", ")
							: `${Object.keys(filters.message_type)
									.filter((f) => filters.message_type[f])[0]
									.replace("Msg", "")} and ${
									Object.keys(filters.message_type).filter((f) => filters.message_type[f]).length - 1
								} more`
					}}
				</Text>

				<Icon @click.stop="resetFilters('message_type', true)" name="close-circle" size="12" color="secondary" />
			</template>
		</Button>

		<template #content>
			<Flex direction="column" gap="12">
				<Text size="12" weight="500" color="secondary">Filter by Message Type</Text>

				<Input v-model="searchTerm" size="small" placeholder="Search" autofocus />

				<Flex direction="column" gap="8" :class="$style.message_types_list">
					<template
						v-if="
							Object.keys(filters.message_type).filter((t) =>
								t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
							).length
						"
					>
						<Checkbox
							v-for="msg_type in Object.keys(filters.message_type).filter((t) =>
								t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
							)"
							v-model="filters.message_type[msg_type]"
						>
							<Text size="12" weight="500" color="primary">{{ msg_type.replace("Msg", "") }}</Text>
						</Checkbox>
					</template>
					<Flex v-else direction="column" gap="8">
						<Text size="12" weight="500" color="tertiary">Nothing was found</Text>
					</Flex>
				</Flex>

				<Button @click="handleApplyMessageTypeFilters" type="secondary" size="mini" wide>Apply</Button>
			</Flex>
		</template>
	</Popover> -->
</template>