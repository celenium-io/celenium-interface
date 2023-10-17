<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Spinner from "@/components/ui/Spinner.vue"

/** Services */
import { comma, formatBytes } from "@/services/utils"

/** API */
import { fetchRecentNamespaces } from "@/services/api/namespace"

/** Store */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

const isLoading = ref(true)
const namespaces = ref([])

const { data } = await fetchRecentNamespaces()
namespaces.value = data.value
isLoading.value = false

const handleCopy = (target) => {
	window.navigator.clipboard.writeText(target)

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully copied to clipboard",
			autoDestroy: true,
		},
	})
}
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
							<th><Text size="12" weight="600" color="tertiary">When</Text></th>
							<th><Text size="12" weight="600" color="tertiary">Size & Count</Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="ns in namespaces">
							<td style="width: 1px">
								<Tooltip position="start" delay="500">
									<Outline @click="handleCopy(ns.hash)" class="copyable">
										<Flex align="center" gap="8">
											<Icon name="block" size="14" color="tertiary" />

											<Text size="13" weight="700" color="secondary" mono>
												{{ ns.hash.slice(ns.hash.length - 6, ns.hash.length) }}
											</Text>
										</Flex>
									</Outline>

									<template #content> {{ ns.hash }} </template>
								</Tooltip>
							</td>
							<td>
								<NuxtLink :to="`/block/${ns.height}`">
									<Outline>
										<Flex align="center" gap="6">
											<Icon name="block" size="14" color="tertiary" />

											<Text size="13" weight="600" color="primary">{{ comma(ns.height) }}</Text>
										</Flex>
									</Outline>
								</NuxtLink>
							</td>
							<td>
								<Text size="13" weight="600" color="primary">{{
									DateTime.fromISO(ns.time).toRelative({ locale: "en", style: "short" })
								}}</Text>
							</td>
							<td>
								<Flex align="center" gap="6">
									<Text size="13" weight="600" color="primary">{{ formatBytes(ns.size) }}</Text>
									<Text size="13" weight="600" color="tertiary">({{ ns.pfb_count }})</Text>
								</Flex>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<Flex v-else-if="isLoading" align="center" justify="center" gap="8" wide>
				<Spinner size="14" />
				<Text size="13" weight="500" color="secondary"> Loading recent namespaces </Text>
			</Flex>

			<Flex v-else align="center" justify="center" direction="column" gap="8" wide style="margin: 16px 0">
				<Text size="13" weight="600" color="secondary" align="center"> Recent namespaces not found </Text>
				<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
					This data is temporarily unavailable
				</Text>
			</Flex>

			<Button link="/namespaces" type="secondary" size="small" wide>
				<Text size="12" weight="600" color="primary">View all namespaces</Text>
				<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
			</Button>
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
	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	padding: 16px;

	& table {
		width: 100%;

		border-spacing: 0px;

		& tr th {
			text-align: left;
			padding: 0;
			padding-bottom: 8px;

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
		}
	}
}

.table_scroller {
	overflow-x: auto;
}
</style>
