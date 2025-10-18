<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { comma } from "@/services/utils"
import { getVoteIcon, getVoteIconColor } from "@/services/utils/states"

const props = defineProps({
	signals: {
		type: Array,
		required: true,
	},
})
</script>

<template>
	<div :class="$style.wrapper_blocks">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Hash</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Voting Power</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Version</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="s in signals" @click="navigateTo(`/tx/${s.tx_hash}`)">
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
							<AmountInCurrency :amount="{ value: s.voting_power, decimal: 2 }" :styles="{ amount: { size: '13' }, currency: { size: '13' }}" />
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/tx/${s.tx_hash}`">
							<Flex align="center" gap="4">
								<Text size="13" weight="600" color="primary">
									{{ `v${s.version}` }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_blocks {
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
		padding-right: 24px;

		white-space: nowrap;

		cursor: default;

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
