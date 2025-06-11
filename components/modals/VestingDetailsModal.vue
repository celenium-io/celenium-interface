<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** API */
import { fetchVestingPeriods } from "@/services/api/address"

/** UI */
import Button from "@/components/ui/Button.vue"
import Modal from "@/components/ui/Modal.vue"
import Spinner from "@/components/ui/Spinner.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { capitilize, comma } from "@/services/utils"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const isLoading = ref(false)
const vesting = ref()
const vestingPeriods = ref([])

const limit = ref(10)
const page = ref(1)
const handleNextCondition = ref(false)
const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

const getVestingPeriods = async () => {
	isLoading.value = true

	const { data } = await fetchVestingPeriods({
		id: vesting.value.id,
		limit: limit.value,
		offset: (page.value - 1) * limit.value,
	})

	if (data.value?.length) {
		vestingPeriods.value = data.value
	}
	handleNextCondition.value = data.value.length < limit.value

	isLoading.value = false
}

watch(
	() => props.show,
	async () => {
		if (props.show) {
			vesting.value = cacheStore.current.vesting
			nextTick(async () => {
				getVestingPeriods()
			})
		}
	},
)

watch(
	() => page.value,
	() => {
		getVestingPeriods()
	},
)
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="500" disable-trap>
		<Flex direction="column" gap="24">
			<Text size="16" weight="600" color="primary">Releasing Schedule</Text>

			<Flex align="center" justify="between" wide>
				<Flex align="center" direction="column" gap="12" :class="$style.value">
					<Flex align="center" gap="4">
						<Text size="12" weight="500" color="tertiary">Vesting Type:</Text>
						<Text size="13" weight="600" color="primary"> {{ capitilize(vesting?.type) }} </Text>
					</Flex>

					<Flex align="center" justify="start" gap="4" wide>
						<Text size="12" weight="500" color="tertiary">Total Amount:</Text>
						<AmountInCurrency
							:amount="{ value: vesting.amount, decimal: 6 }"
							:styles="{ amount: { size: '13' }, currency: { size: '13', color: 'primary' } }"
						/>
					</Flex>
				</Flex>

				<Flex align="center" direction="column" gap="12" :class="$style.value">
					<Flex align="center" gap="4">
						<Text size="12" weight="500" color="tertiary">Start Date:</Text>
						<Text size="12" weight="600" color="primary">
							{{ DateTime.fromISO(vesting.start_time).toFormat("yyyy LLL d, t") }}
						</Text>
					</Flex>

					<Flex align="center" justify="start" gap="4" wide>
						<Text size="12" weight="500" color="tertiary">End Date:</Text>
						<Text size="12" weight="600" color="primary">
							{{ DateTime.fromISO(vesting.end_time).toFormat("yyyy LLL d, t") }}
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<div :class="$style.horizontal_divider" />

			<div :class="$style.wrapper_vestings">
				<table :class="$style.table">
					<thead>
						<tr>
							<th><Text size="12" weight="600" color="tertiary">Release Date</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Amount</Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="vp in vestingPeriods">
							<td>
								<Flex align="center" justify="start" gap="4">
									<Text size="12" weight="600" color="primary">
										{{ DateTime.fromISO(vp.time).setLocale("en").toFormat("yyyy LLL d, t") }}
									</Text>

									<Text size="11" weight="500" color="tertiary">
										({{ DateTime.fromISO(vp.time).toRelative({ locale: "en", style: "short" }) }})
									</Text>
								</Flex>
							</td>
							<td>
								<AmountInCurrency
									:amount="{ value: vp.amount, decimal: 6 }"
									:styles="{ amount: { size: '13' }, currency: { size: '13' } }"
								/>
							</td>
							<td>
								<Flex align="center" justify="center">
									<Tooltip v-if="DateTime.fromISO(vp.time).ts <= DateTime.now().ts" position="start" delay="500">
										<Icon name="check" size="16" color="neutral-green" />

										<template #content> Released </template>
									</Tooltip>

									<Tooltip v-else position="start" delay="500">
										<Icon name="clock-forward" size="16" color="secondary" />

										<template #content> Waiting </template>
									</Tooltip>
								</Flex>
							</td>
						</tr>
					</tbody>
				</table>

				<!-- Pagination -->
				<Flex align="center" justify="end" gap="6" :class="$style.pagination">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="handleNextCondition">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
				</Flex>
			</div>
		</Flex>
	</Modal>
</template>

<style module>
.wrapper_vestings {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.table {
	width: 100%;
	height: fit-content;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);

	border-spacing: 0px;

	padding-bottom: 8px;

	& tbody {
		& tr {
			cursor: pointer;

			transition: all 0.05s ease;

			height: 28px;

			&:hover {
				background: var(--op-5);
			}

			&:active {
				background: var(--op-8);
			}
		}
	}

	& tr th {
		text-align: left;
		padding: 0;
		padding-bottom: 8px;

		&:first-child {
			padding-left: 8px;
		}

		& span {
			display: flex;
		}
	}

	& tr td {
		padding: 0;

		white-space: nowrap;

		cursor: default;

		min-height: 40px;

		&:first-child {
			padding-left: 8px;
		}

		&:last-child {
			padding-right: 8px;
		}
	}
}

.tables {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	background: var(--card-background);
}

.value {
	padding: 0px 8px 0px 8px;
}

.pagination {
	padding-top: 4px;
}

.horizontal_divider {
	width: 100%;
	height: 1px;
	background: var(--op-5);
}
</style>
