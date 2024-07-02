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
				return DateTime.now().year === startTime.year ? startTime.toFormat('dd LLL') : startTime.toFormat('dd LLL yyyy')
			default:
				return DateTime.now().year === endTime.year ? endTime.toFormat('dd LLL') : endTime.toFormat('dd LLL yyyy')
		}
	} else {
		switch (v.type) {
			case 'periodic':
			case 'continuous':
				return `${startTime.toFormat("yyyy LLL d, t")} - ${endTime.toFormat("yyyy LLL d, t")}`
			case 'permanent':
				return `Vesting from ${startTime.toFormat("yyyy LLL d, t")}`
			default:
				return `Vesting till ${endTime.toFormat("yyyy LLL d, t")}`
		}
	}
}

const handleViewVestingDetails = (v) => {
	cacheStore.current.vesting = v
	modalsStore.open("vestingDetails")
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
						<Flex align="center">
							<Text size="12" weight="600" color="primary">
								{{ capitilize(v.type) }}
							</Text>
						</Flex>
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

		white-space: nowrap;

		cursor: default;

		&:first-child {
			padding-left: 16px;
		}

		&:last-child {
			padding-right: 8px;
		}

		& > a {
			display: flex;

			min-height: 40px;

			padding-right: 24px;
		}
	}
}

.link {
	cursor: pointer;
}
</style>
