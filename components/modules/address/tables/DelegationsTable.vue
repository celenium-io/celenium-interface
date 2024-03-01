<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { comma, space, tia } from "@/services/utils"

const router = useRouter()

const props = defineProps({
	delegations: {
		type: Array,
		required: true,
	},
})
</script>

<template>
	<div :class="$style.wrapper_delegations">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Validator</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Amount</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="d in delegations">
					<td>
						<NuxtLink :to="`/validator/${d.validator.id}`">
							<Flex align="center">
								<Text size="12" weight="600" color="primary">
									{{ d.validator.moniker ? d.validator.moniker : splitAddress(d.validator.cons_address) }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<Tooltip position="start" delay="500">
							<Flex align="center" gap="4">
								<Text size="12" weight="600" :color="parseFloat(d.amount) ? 'primary' : 'tertiary'">
									{{ comma(tia(d.amount)) }}
								</Text>
								<Text size="12" weight="600" color="tertiary"> TIA </Text>
							</Flex>
							<template #content>
								<Text size="13" weight="600" color="primary">
									{{ tia(d.amount) }}
								</Text>
								<Text size="13" weight="600" color="tertiary"> TIA </Text>
							</template>
						</Tooltip>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_delegations {
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

		&:first-child {
			padding-left: 16px;
		}

		& > a {
			display: flex;

			min-height: 40px;

			padding-right: 24px;
		}
	}
}
</style>
