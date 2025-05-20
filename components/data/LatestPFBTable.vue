<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Spinner from "@/components/ui/Spinner.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { comma, space } from "@/services/utils"

/** API */
import { fetchLatestPFBs } from "@/services/api/tx"

const router = useRouter()

const isLoading = ref(true)
const pfbs = ref([])

const { data } = await fetchLatestPFBs()
pfbs.value = data.value
isLoading.value = false
</script>

<template>
	<Flex wide direction="column" gap="4">
		<Flex align="center" gap="8" :class="$style.header">
			<Icon name="blob" size="14" color="primary" />
			<Text size="13" weight="600" color="primary">Latest PFBs</Text>
		</Flex>

		<Flex direction="column" gap="16" :class="$style.pfb_body">
			<div v-if="pfbs?.length" :class="$style.table_scroller">
				<table>
					<thead>
						<tr>
							<th><Text size="12" weight="600" color="tertiary" noWrap>Hash</Text></th>
							<th><Text size="12" weight="600" color="tertiary" noWrap>Block Height</Text></th>
							<th><Text size="12" weight="600" color="tertiary" noWrap>Signer</Text></th>
							<th><Text size="12" weight="600" color="tertiary" noWrap>Fee</Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="pfb in pfbs">
							<td style="width: 1px">
								<NuxtLink :to="`/tx/${pfb.hash}`">
									<Tooltip position="start">
										<Flex align="center" gap="6">
											<Icon
												:name="pfb.status === 'success' ? 'check-circle' : 'close-circle'"
												size="13"
												:color="pfb.status === 'success' ? 'green' : 'red'"
											/>

											<Text size="13" weight="600" color="primary" mono>
												{{ pfb.hash.slice(0, 4).toUpperCase() }}
											</Text>

											<Flex align="center" gap="3">
												<div v-for="dot in 3" class="dot" />
											</Flex>

											<Text size="13" weight="600" color="primary" mono>
												{{ pfb.hash.slice(pfb.hash.length - 4, pfb.hash.length).toUpperCase() }}
											</Text>

											<CopyButton :text="pfb.hash.toUpperCase()" />
										</Flex>

										<template #content>
											<Flex direction="column" gap="6">
												<Flex align="center" gap="4">
													<Icon
														:name="pfb.status === 'success' ? 'check-circle' : 'close-circle'"
														size="13"
														:color="pfb.status === 'success' ? 'green' : 'red'"
													/>
													<Text size="13" weight="600" color="primary">
														{{ pfb.status === "success" ? "Successful" : "Failed" }} Transaction
													</Text>
												</Flex>

												{{ space(pfb.hash.toUpperCase()) }}
											</Flex>
										</template>
									</Tooltip>
								</NuxtLink>
							</td>
							<td>
								<NuxtLink :to="`/tx/${pfb.hash}`">
									<Flex align="center">
										<Outline @click.prevent="router.push(`/block/${pfb.height}`)">
											<Flex align="center" gap="6">
												<Icon name="block" size="14" color="secondary" />

												<Text size="13" weight="600" color="primary" tabular>{{ comma(pfb.height) }}</Text>
											</Flex>
										</Outline>
									</Flex>
								</NuxtLink>
							</td>
							<td>
								<NuxtLink :to="`/tx/${pfb.hash}`">
									<Flex align="center" justify="center">
										<Text size="12" weight="600" color="primary" class="table_column_alias">
											{{ $getDisplayName("addresses", pfb.signers ? pfb.signers[0].hash : "") }}
										</Text>
									</Flex>
								</NuxtLink>
							</td>
							<td>
								<NuxtLink :to="`/tx/${pfb.hash}`">
									<AmountInCurrency :amount="{ value: pfb.fee, decimal: 6 }" />
								</NuxtLink>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<Flex v-else-if="isLoading" align="center" justify="center" gap="8" wide :class="$style.empty">
				<Spinner size="14" />
				<Text size="13" weight="500" color="secondary"> Loading latest PFBs </Text>
			</Flex>

			<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
				<Text size="13" weight="600" color="secondary" align="center"> Latest PFBs not found </Text>
				<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
					This data is temporarily unavailable
				</Text>
			</Flex>

			<div :class="$style.bottom">
				<Button link="/txs?status=success&message_type=MsgPayForBlobs" type="secondary" size="small" wide>
					<Icon name="table" size="12" color="secondary" />
					<Text size="12" weight="600" color="primary">View all latest PFBs</Text>
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

.pfb_body {
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
			padding-top: 16px;
			padding-bottom: 8px;

			& span {
				display: flex;
			}

			&:first-child {
				padding-left: 16px;
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
	overflow-x: auto;
}
</style>
