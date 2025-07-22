<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"

/** Constants */
import { IbcChainName } from "@/services/constants/ibc"

/** Services */
import { abbreviate } from "@/services/utils"

const props = defineProps({
	chainsStats: {
		type: Array,
		default: [],
	},
})

const largestChains = computed(() => props.chainsStats.slice(0, 5))
</script>

<template>
	<Flex wide direction="column" gap="4">
		<Flex align="center" gap="8" :class="$style.header">
			<Icon name="globe" size="14" color="tertiary" />
			<Text size="13" weight="600" color="primary">Largest chains</Text>
		</Flex>

		<Flex direction="column" gap="16" :class="$style.transfers_body">
			<div v-if="largestChains?.length" :class="$style.table_scroller">
				<table>
					<thead>
						<tr>
							<th><Text size="12" weight="600" color="tertiary">Chain</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Sent</Text></th>
							<th><Text size="12" weight="600" color="tertiary"></Text></th>
							<th><Text size="12" weight="600" color="tertiary">Received</Text></th>
							<th><Text size="12" weight="600" color="tertiary"></Text></th>
							<th><Text size="12" weight="600" color="tertiary">Flow</Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="chain in largestChains" @click="navigateTo(`/ibc/chain/${chain.chain}`)">
							<td>
								<NuxtLink>
									<Flex align="center">
										<Text size="13" weight="600" color="primary">
											{{ IbcChainName[chain.chain] ?? chain.chain }}
										</Text>
									</Flex>
								</NuxtLink>
							</td>
							<td>
								<NuxtLink>
									<Flex align="center" gap="6">
										<Icon name="arrow-narrow-up-right-circle" size="14" color="green" />
										<Text size="13" weight="600" color="primary" mono>
											{{ abbreviate(chain.sent / 1_000_000) }} <Text color="secondary">TIA</Text>
										</Text>
									</Flex>
								</NuxtLink>
							</td>
							<td>
								<Text size="13" weight="600" color="tertiary" mono>+</Text>
							</td>
							<td>
								<NuxtLink>
									<Flex align="center" gap="6">
										<Icon
											name="arrow-narrow-up-right-circle"
											size="14"
											color="purple"
											style="transform: scale(1, -1)"
										/>
										<Text size="13" weight="600" color="primary" mono>
											{{ abbreviate(chain.received / 1_000_000) }} <Text color="tertiary">TIA</Text>
										</Text>
									</Flex>
								</NuxtLink>
							</td>
							<td>
								<Text size="13" weight="600" color="tertiary" mono>=</Text>
							</td>
							<td>
								<NuxtLink>
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
			</div>

			<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
				<Text size="13" weight="600" color="secondary" align="center"> Largest chains not found </Text>
				<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
					This data is temporarily unavailable
				</Text>
			</Flex>

			<div :class="$style.bottom">
				<Button link="/ibc/chains" type="secondary" size="small" wide>
					<Icon name="table" size="12" color="secondary" />
					<Text size="12" weight="600" color="primary">View All Chains</Text>
				</Button>
			</div>
		</Flex>
	</Flex>
</template>

<style module>
.header {
	height: 40px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 12px;
}

.transfers_body {
	flex: 1;

	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	& table {
		width: 100%;

		border-spacing: 0px;

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

			&.sortable {
				cursor: pointer;
			}

			&.sortable:hover {
				& span {
					color: var(--txt-secondary);
				}
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

				padding-right: 16px;
			}
		}
	}
}

.empty {
	margin: 32px 0 16px 0;
}

.bottom {
	padding: 0 16px 16px 16px;
}

.table_scroller {
	flex: 1;

	overflow-x: auto;
}
</style>
