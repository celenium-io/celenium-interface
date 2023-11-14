<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Spinner from "@/components/ui/Spinner.vue"

/** Services */
import { comma, formatBytes, getNamespaceID } from "@/services/utils"

/** API */
import { fetchRecentNamespaces } from "@/services/api/namespace"

const router = useRouter()

const isLoading = ref(true)
const namespaces = ref([])

const { data } = await fetchRecentNamespaces()
namespaces.value = data.value
isLoading.value = false
</script>

<template>
	<Flex wide direction="column" gap="4">
		<Flex align="center" :class="$style.header">
			<Text size="14" weight="600" color="primary">Recent Namespaces</Text>
		</Flex>

		<Flex direction="column" gap="16" :class="$style.namespaces_body">
			<div v-if="namespaces.length" :class="$style.table_scroller">
				<table>
					<thead>
						<tr>
							<th><Text size="12" weight="600" color="tertiary">Namespace</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Height</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Size </Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="ns in namespaces" @click="router.push(`/namespace/${ns.namespace_id}`)">
							<td style="width: 1px">
								<Tooltip position="start" delay="500">
									<Flex align="center" gap="10">
										<Flex align="center" gap="6">
											<Icon name="folder" size="14" color="secondary" />

											<Text size="13" weight="600" color="primary" mono>
												{{ getNamespaceID(ns.namespace_id).slice(0, 4) }}
											</Text>

											<Flex align="center" gap="3">
												<div v-for="dot in 3" class="dot" />
											</Flex>

											<Text size="13" weight="600" color="primary" mono>
												{{ getNamespaceID(ns.namespace_id).slice(-4) }}
											</Text>
										</Flex>

										<CopyButton :text="getNamespaceID(ns.namespace_id)" />
									</Flex>

									<template #content> {{ getNamespaceID(ns.namespace_id) }} </template>
								</Tooltip>
							</td>
							<td>
								<NuxtLink :to="`/block/${ns.height}`" @click.stop>
									<Outline>
										<Flex align="center" gap="6">
											<Icon name="block" size="14" color="secondary" />

											<Text size="13" weight="600" color="primary" tabular>{{ comma(ns.height) }}</Text>
										</Flex>
									</Outline>
								</NuxtLink>
							</td>
							<td>
								<Text size="12" weight="600" color="primary">{{
									DateTime.fromISO(ns.time).toRelative({ locale: "en", style: "short" })
								}}</Text>
							</td>
							<td>
								<Text size="13" weight="600" color="primary">{{ formatBytes(ns.size) }}</Text>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<Flex v-else-if="isLoading" align="center" justify="center" gap="8" wide>
				<Spinner size="14" />
				<Text size="13" weight="500" color="secondary"> Loading recent namespaces </Text>
			</Flex>

			<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
				<Text size="13" weight="600" color="secondary" align="center"> Recent namespaces not found </Text>
				<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
					This data is temporarily unavailable
				</Text>
			</Flex>

			<div :class="$style.bottom">
				<Button link="/namespaces" type="secondary" size="small" wide>
					<Text size="12" weight="600" color="primary">View all namespaces</Text>
					<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
				</Button>
			</div>
		</Flex>
	</Flex>
</template>

<style module>
.header {
	height: 46px;

	border-radius: 8px 8px 4px 4px;
	background: var(--card-background);

	padding: 0 16px;
}

.namespaces_body {
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
		}

		& tr td {
			padding: 0;
			padding-right: 24px;
			padding-top: 6px;
			padding-bottom: 6px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
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
