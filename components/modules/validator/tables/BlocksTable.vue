<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { tia, comma, space, formatBytes } from "@/services/utils"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useModalsStore } from "@/store/modals"
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

const props = defineProps({
	blocks: {
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
					<th><Text size="12" weight="600" color="tertiary" noWrap>Height</Text></th>
					<th><Text size="12" weight="600" color="tertiary" noWrap>Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary" noWrap>Txs</Text></th>
					<th><Text size="12" weight="600" color="tertiary" noWrap>Blobs</Text></th>
					<th><Text size="12" weight="600" color="tertiary" noWrap>Total Fees</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="block in blocks">
					<td style="width: 1px">
						<NuxtLink :to="`/block/${block.height}`">
							<Flex align="center">
								<Outline>
									<Flex align="center" gap="6">
										<Icon
											name="block"
											size="14"
											:color="hintedBlock == block.height ? 'blue' : 'tertiary'"
										/>

										<Text size="13" weight="600" color="primary" tabular>{{ comma(block.height) }}</Text>
									</Flex>
								</Outline>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/block/${block.height}`">
							<Flex justify="center" direction="column" gap="6">
								<Tooltip position="start" delay="500">
									<Text size="12" weight="600" color="primary">
										{{ DateTime.fromISO(block.time).toRelative({ locale: "en", style: "short" }) }}
									</Text>

									<template #content>
										{{ DateTime.fromISO(block.time).setLocale("en").toFormat("LLL d, t") }}
									</template>
								</Tooltip>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/block/${block.height}`">
							<Flex align="center">
								<Text size="13" weight="600" color="primary">
									{{ block.stats.tx_count }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/block/${block.height}`">
							<Flex align="center">
								<Text size="13" weight="600" color="primary">
									{{ block.stats.blobs_count }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/block/${block.height}`">
							<Flex align="center" gap="4">
								<Text size="13" weight="600" :color="parseFloat(block.stats.fee) ? 'primary' : 'tertiary'">
									{{ tia(block.stats.fee) }}
								</Text>
								<Text size="13" weight="600" color="tertiary"> TIA </Text>
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