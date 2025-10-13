<script setup>
/** Services */
import { abbreviate } from "@/services/utils"
import { IbcChainName, IbcChainLogo } from "@/services/constants/ibc"

/** Shared Components */
import TablePlaceholderView from "@/components/shared/TablePlaceholderView.vue"

const props = defineProps({
	chains: {
		type: Array,
		default: [],
	},
	isLoading: {
		type: Boolean,
		default: false,
	},
})
</script>

<template>
	<Flex direction="column" :class="[$style.wrapper, isLoading && $style.disabled]">
		<Flex v-if="chains.length" :class="$style.scroller">
			<table>
				<thead>
					<tr>
						<th><Text size="12" weight="600" color="tertiary">Chain</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Sent</Text></th>
						<th></th>
						<th><Text size="12" weight="600" color="tertiary">Received</Text></th>
						<th></th>
						<th><Text size="12" weight="600" color="tertiary">Flow</Text></th>
					</tr>
				</thead>

				<tbody>
					<tr v-for="chain in chains" @click="navigateTo(`/ibc/chain/${chain.chain}`)">
						<td>
							<NuxtLink :to="`/ibc/chain/${chain.chain}`">
								<Flex align="center" gap="12">
									<img :src="IbcChainLogo[chain.chain] ?? IbcChainLogo['_unknown']" width="20px" height="20px" />

									<Flex direction="column" gap="4">
										<Text size="12" weight="600" color="primary">
											{{ IbcChainName[chain.chain] ? IbcChainName[chain.chain] : "Unknown Chain" }}
										</Text>
										<Text size="12" weight="600" color="tertiary" mono>
											{{ chain.chain }}
										</Text>
									</Flex>
								</Flex>
							</NuxtLink>
						</td>
						<td>
							<NuxtLink :to="`/ibc/chain/${chain.chain}`">
								<Flex align="center" gap="6">
									<Icon name="arrow-narrow-up-right-circle" size="14" color="purple" />
									<Text size="13" weight="600" color="primary" mono>
										{{ abbreviate(chain.sent / 1_000_000) }} <Text color="secondary">TIA</Text>
									</Text>
								</Flex>
							</NuxtLink>
						</td>
						<td style="width: 1px">
							<Text size="13" weight="600" color="tertiary" mono>+</Text>
						</td>
						<td>
							<NuxtLink :to="`/ibc/chain/${chain.chain}`">
								<Flex align="center" gap="6">
									<Icon name="arrow-narrow-up-right-circle" size="14" color="brand" style="transform: scale(1, -1)" />
									<Text size="13" weight="600" color="primary" mono>
										{{ abbreviate(chain.received / 1_000_000) }} <Text color="tertiary">TIA</Text>
									</Text>
								</Flex>
							</NuxtLink>
						</td>
						<td style="width: 1px">
							<Text size="13" weight="600" color="tertiary" mono>=</Text>
						</td>
						<td>
							<NuxtLink :to="`/ibc/chain/${chain.chain}`">
								<Flex align="center" gap="6">
									<Icon name="coins" size="14" color="secondary" />
									<Text size="13" weight="600" color="primary" mono>
										{{ abbreviate(chain.flow / 1_000_000) }} <Text color="tertiary">TIA</Text>
									</Text>
								</Flex>
							</NuxtLink>
						</td>
					</tr>
				</tbody>
			</table>
		</Flex>

		<TablePlaceholderView
			v-else
			title="There's no transfers"
			description="Probably something went wrong... ?"
			icon="ibc"
			subIcon="warning"
			:descriptionWidth="260"
			style="height: 100%"
		/>
	</Flex>
</template>

<style module>
.wrapper {
	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	& table {
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
			padding-top: 12px;
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
			padding-right: 24px;
			padding-top: 8px;
			padding-bottom: 8px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
}

.scroller {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.pagination {
	padding: 10px 16px 10px 16px;
}

@media (max-width: 800px) {
	.table {
		border-radius: 4px 4px 8px 8px;
	}
}
</style>
