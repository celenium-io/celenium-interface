<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Spinner from "@/components/ui/Spinner.vue"

/** Services */
import { comma, space, formatBytes, getNamespaceID } from "@/services/utils"

/** API */
import { fetchNamespaces } from "@/services/api/namespace"

const router = useRouter()

const isLoading = ref(true)
const namespaces = ref([])

const sort = reactive({
	by: "time",
	dir: "desc",
})

const getNamespaces = async () => {
	isLoading.value = true

	const { data } = await fetchNamespaces({ limit: 5, sort: sort.dir, sort_by: sort.by })
	namespaces.value = data.value

	isLoading.value = false
}

getNamespaces()

const handleSort = (by) => {
	switch (sort.dir) {
		case "desc":
			if (sort.by == by) sort.dir = "asc"
			break

		case "asc":
			sort.dir = "desc"

			break
	}

	sort.by = by

	getNamespaces()
}
</script>

<template>
	<Flex wide direction="column" gap="4">
		<Flex align="center" gap="8" :class="$style.header">
			<Icon name="namespace" size="14" color="primary" />
			<Text size="13" weight="600" color="primary">Namespaces</Text>
		</Flex>

		<Flex direction="column" gap="16" :class="$style.namespaces_body">
			<div v-if="namespaces.length" :class="$style.table_scroller">
				<table>
					<thead>
						<tr>
							<th><Text size="12" weight="600" color="tertiary">Namespace</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Block Height</Text></th>
							<th @click="handleSort('time')" :class="$style.sortable">
								<Flex align="center" gap="6">
									<Text size="12" weight="600" color="tertiary">Time</Text>
									<Icon
										v-if="sort.by === 'time'"
										name="chevron"
										size="12"
										color="secondary"
										:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
									/>
								</Flex>
							</th>
							<th @click="handleSort('size')" :class="$style.sortable">
								<Flex align="center" gap="6">
									<Text size="12" weight="600" color="tertiary">Size </Text>
									<Icon
										v-if="sort.by === 'size'"
										name="chevron"
										size="12"
										color="secondary"
										:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
									/>
								</Flex>
							</th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="ns in namespaces">
							<td style="width: 1px">
								<NuxtLink :to="`/namespace/${ns.namespace_id}`">
									<Flex align="center">
										<Tooltip position="start">
											<Flex direction="column" gap="4">
												<Flex v-if="getNamespaceID(ns.namespace_id).length > 8" align="center" gap="8">
													<Text size="12" weight="600" color="primary" mono>
														{{ getNamespaceID(ns.namespace_id).slice(0, 4) }}
													</Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" class="dot" />
													</Flex>

													<Text size="12" weight="600" color="primary" mono>
														{{ getNamespaceID(ns.namespace_id).slice(-4) }}
													</Text>

													<CopyButton :text="getNamespaceID(ns.namespace_id)" />
												</Flex>

												<Flex v-else align="center" gap="8">
													<Text size="12" weight="600" color="primary" mono>
														{{ space(getNamespaceID(ns.namespace_id)) }}
													</Text>

													<CopyButton :text="getNamespaceID(ns.namespace_id)" />
												</Flex>

												<Text
													v-if="ns.name !== getNamespaceID(ns.namespace_id)"
													size="12"
													weight="500"
													color="tertiary"
												>
													{{ ns.name }}
												</Text>
											</Flex>

											<template #content>
												{{ space(getNamespaceID(ns.namespace_id)) }}
											</template>
										</Tooltip>
									</Flex>
								</NuxtLink>
							</td>
							<td>
								<NuxtLink :to="`/namespace/${ns.namespace_id}`">
									<Flex align="center">
										<Outline @click.prevent="router.push(`/block/${ns.last_height}`)">
											<Flex align="center" gap="6">
												<Icon name="block" size="14" color="secondary" />

												<Text size="13" weight="600" color="primary" tabular>{{ comma(ns.last_height) }}</Text>
											</Flex>
										</Outline>
									</Flex>
								</NuxtLink>
							</td>
							<td>
								<NuxtLink :to="`/namespace/${ns.namespace_id}`">
									<Flex align="center">
										<Text size="12" weight="600" color="primary">
											{{ DateTime.fromISO(ns.last_message_time).toRelative({ locale: "en", style: "short" }) }}
										</Text>
									</Flex>
								</NuxtLink>
							</td>
							<td>
								<NuxtLink :to="`/namespace/${ns.namespace_id}`">
									<Flex align="center">
										<Text size="13" weight="600" color="primary">{{ formatBytes(ns.size) }}</Text>
									</Flex>
								</NuxtLink>
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
					<Icon name="table" size="12" color="secondary" />
					<Text size="12" weight="600" color="primary">View all namespaces</Text>
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

				padding-right: 24px;
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
