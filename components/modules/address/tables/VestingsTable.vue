<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { capitilize, comma } from "@/services/utils"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()


const router = useRouter()

const props = defineProps({
	vestings: {
		type: Array,
		required: true,
	},
})

const vestingTime = (v, tooltip) => {
	let startTime = DateTime.fromISO(v.start_time)
	let endTime = DateTime.fromISO(v.end_time)

	if (!tooltip) {
		switch (v.type) {
			case 'periodic':
			case 'continuous':
				if (startTime.year === endTime.year) {
					return `${startTime.toFormat('dd LLL')} - ${endTime.toFormat('dd LLL')}`
				} else {
					return `${startTime.toFormat('dd LLL yyyy')} - ${endTime.toFormat('dd LLL yyyy')}`
				}
			case 'permanent':
				return '— —'
			default:
				return DateTime.now().year === endTime.year ? endTime.toFormat('dd LLL') : endTime.toFormat('dd LLL yyyy')
		}
	} else {
		switch (v.type) {
			case 'periodic':
			case 'continuous':
				return `${startTime.toFormat("yyyy LLL d, t")} - ${endTime.toFormat("yyyy LLL d, t")}`
			case 'permanent':
				return 'Permanent vesting has no start or end date'
			default:
				return `Vesting till ${endTime.toFormat("yyyy LLL d, t")}`
		}
	}
}

const handleViewVestingDetails = (v) => {
	cacheStore.current.vesting = v
	modalsStore.open("vestingDetails")
}

const vestingTypeDescription = (v) => {
	switch (v.type) {
		case 'periodic':
			return 'Periodic vesting, where coins begin to vest at start time and vest periodically according to number of periods and the vesting amount per period. The number of periods, length per period, and amount per period are configurable.'
		case 'continuous':
			return 'Continuous vesting, where coins begin to vest at start time and vest linearly with respect to time until end time is reached.'
		case 'permanent':
			return 'Permanent locked vesting, where coins are locked forever. Coins in this account can still be used for delegating and for governance votes even while locked.'
		case 'delayed':
			return 'Delayed vesting, where all coins are vested once end time is reached.'
		default:
			return 'Unknown vesting type'
	}
}

</script>

<template>
	<div :class="$style.wrapper_vestings">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Type</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Vesting Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Amount</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="v in vestings">
					<td>
						<Flex align="center" :class="$style.link">
							<Outline @click.prevent="router.push(`/block/${v.height}`)">
								<Flex align="center" gap="6">
									<Icon name="block" size="14" color="secondary" />

									<Text size="13" weight="600" color="primary" tabular>{{ comma(v.height) }}</Text>
								</Flex>
							</Outline>
						</Flex>
					</td>
					<td>
						<Flex justify="center" direction="column" gap="6">
							<Tooltip position="start" delay="500">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(v.time).toRelative({ locale: "en", style: "short" }) }}
								</Text>

								<template #content>
									{{ DateTime.fromISO(v.time).setLocale("en").toFormat("LLL d, t") }}
								</template>
							</Tooltip>
						</Flex>
					</td>
					<td>
						<Tooltip position="start" delay="500">
							<Flex align="center" gap="6">
								<Text size="12" weight="600" color="primary">
									{{ capitilize(v.type) }}
								</Text>

								<Icon name="info" size="12" color="secondary" />
							</Flex>

							<template #content>
								<Flex align="center" justify="start" style="max-width: 300px; text-align: start">
									{{ vestingTypeDescription(v) }}
								</Flex>
							</template>
						</Tooltip>
					</td>
					<td>
						<Flex justify="center" direction="column" gap="6">
							<Tooltip position="start" delay="500">
								<Text size="12" weight="600" color="primary">
									{{ vestingTime(v, false) }}
								</Text>

								<template #content>
									{{ vestingTime(v, true) }}
								</template>
							</Tooltip>
						</Flex>
					</td>
					<td>
						<AmountInCurrency :amount="{ value: v.amount, decimal: 2 }" :styles="{ amount: { size: '13' }, currency: { size: '13' }}" />
					</td>

					<td v-if="v.type === 'periodic'">
						<Tooltip position="start" delay="500" @click.prevent="handleViewVestingDetails(v)" class="clickable">
							<Flex align="center">
								<Icon name="clock-forward" size="16" color="secondary" />
							</Flex>

							<template #content>
								<Text size="12" weight="500" color="secondary">
									View releasing schedule
								</Text>
							</template>
						</Tooltip>
					</td>

				</tr>
			</tbody>
		</table>
	</div>
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

	border-spacing: 0px;

	padding-bottom: 8px;

	& tbody {
		& tr {
			cursor: pointer;

			transition: all 0.05s ease;

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
		padding-right: 16px;
		padding-top: 16px;
		padding-bottom: 8px;

		&:first-child {
			padding-left: 16px;
		}

		& span {
			display: flex;
		}
	}

	& tr td {
		padding: 0;
		height: 40px;

		white-space: nowrap;

		cursor: default;

		&:first-child {
			padding-left: 16px;
		}

		&:last-child {
			padding-right: 8px;
		}

	}
}

.link {
	cursor: pointer;
}
</style>
