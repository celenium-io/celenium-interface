<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Components */
import AmountInCurrency from "@/components/AmountInCurrency.vue"


/** Services */
import { comma, shareOfTotalString, shortHex } from "@/services/utils"

const props = defineProps({
	signals: {
		type: Array,
		required: true,
	},
	totalStake: {
		type: String,
		required: true,
	}
})
</script>

<template>
	<div :class="$style.wrapper_signals">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Validator</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Voting Power</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Transaction</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="s in signals">
					<td>
						<NuxtLink :to="`/validator/${s.validator.id}`">
							<Flex align="center" wide>
								<Text size="13" weight="600" color="primary" mono style="text-overflow: ellipsis; overflow: hidden;">
									{{ s.validator.moniker ? s.validator.moniker : shortHex(s.validator.cons_address) }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/tx/${s.tx_hash}`">
							<Flex justify="center" direction="column" gap="4">
								<AmountInCurrency :amount="{ value: s.voting_power, decimal: 0 }" />
								<Tooltip position="start" delay="400">
									<Text size="12" weight="600" color="tertiary">
										{{ shareOfTotalString(parseFloat(s.voting_power) / 1_000_000, parseFloat(totalStake)) }}%
									</Text>

									<template #content>
										<Flex align="center" justify="between" gap="8">
											<Text size="12" color="secondary">Validator Share</Text>
											<Text size="12" weight="600" color="primary">
												{{ shareOfTotalString(parseFloat(s.voting_power) / 1_000_000, parseFloat(totalStake)) }}%
											</Text>
										</Flex>
									</template>
								</Tooltip>
							</Flex>
							
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/block/${s.height}`">
							<Flex align="center">
								<Outline>
									<Flex align="center" gap="6">
										<Icon name="block" size="14" color="secondary" />

										<Text size="13" weight="600" color="primary" tabular>{{ comma(s.height) }}</Text>
									</Flex>
								</Outline>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/tx/${s.tx_hash}`">
							<Flex align="center" gap="8">
								<Icon
									name="check-circle"
									size="13"
									color="green"
								/>

								<Text size="12" weight="600" color="primary" mono class="table_column_alias">
									{{ $getDisplayName('txs', s.tx_hash) }}
								</Text>

								<CopyButton :text="s.tx_hash" />
							</Flex>
						</NuxtLink>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_signals {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.table {
	width: 100%;
	height: fit-content;

	border-spacing: 0px;

	padding-bottom: 2px;

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
		padding-top: 2px;
		padding-bottom: 2px;
		padding-right: 16px;

		white-space: nowrap;

		cursor: default;

		&:first-child {
			padding-left: 16px;
			max-width: 220px;
		}

		&:last-child {
			padding-right: 16px;
		}

		& > a {
			display: flex;

			min-height: 40px;
		}
	}
}
</style>
