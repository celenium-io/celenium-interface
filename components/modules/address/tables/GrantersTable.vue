<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma } from "@/services/utils"

/** Store */
import { useModalsStore } from "@/store/modals.store"
import { useCacheStore } from "@/store/cache.store"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const router = useRouter()

const props = defineProps({
	granters: {
		type: Array,
		required: true,
	},
})

const handleViewRawGrants = (g) => {
	cacheStore.current._target = "grant"
	cacheStore.current.grant = g
	modalsStore.open("rawData")
}
</script>

<template>
	<div :class="$style.wrapper_granters">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Granter</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Type</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Expiration</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="g in granters">
					<td>
						<Flex align="center">
							<Outline @click.prevent="router.push(`/block/${g.height}`)">
								<Flex align="center" gap="6">
									<Icon name="block" size="14" color="secondary" />

									<Text size="13" weight="600" color="primary" tabular>{{ comma(g.height) }}</Text>
								</Flex>
							</Outline>
						</Flex>
					</td>
					<td @click="handleViewRawGrants(g)">
						<Flex justify="center" direction="column" gap="6">
							<Tooltip position="start" delay="500">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(g.time).toRelative({ locale: "en", style: "short" }) }}
								</Text>

								<template #content>
									{{ DateTime.fromISO(g.time).setLocale("en").toFormat("LLL d, t") }}
								</template>
							</Tooltip>
						</Flex>
					</td>
					<td @click="handleViewRawGrants(g)">
						<Flex align="center">
							<Text size="12" weight="600" color="primary" class="table_column_alias">
								{{ $getDisplayName("addresses", g.granter.hash) }}
							</Text>
						</Flex>
					</td>
					<td @click="handleViewRawGrants(g)">
						<Flex align="center">
							<Text v-if="g.authorization === 'fee'" size="12" weight="600" color="primary" class="table_column_alias">
								Fee
							</Text>

							<MessageTypeBadge v-else :types="g.authorization.split('.').slice(-1)" />
						</Flex>
					</td>
					<td @click="handleViewRawGrants(g)">
						<Flex justify="center" direction="column" gap="6">
							<Tooltip v-if="g.expiration" position="start" delay="500">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(g.expiration).toRelative({ locale: "en", style: "short" }) }}
								</Text>

								<template #content>
									{{ DateTime.fromISO(g.expiration).setLocale("en").toFormat("LLL d, t") }}
								</template>
							</Tooltip>

							<Tooltip v-else="g.expiration" position="start" delay="500">
								<Text size="12" weight="600" color="primary"> — — </Text>

								<template #content> This grant is permanent until the user revokes it </template>
							</Tooltip>
						</Flex>
					</td>
					<td v-if="g.revoked" @click="handleViewRawGrants(g)">
						<Flex justify="center" direction="column" gap="6">
							<Tooltip position="start" delay="500">
								<Icon name="close" size="14" color="red" />

								<template #content>
									{{ `Revoked at block ${comma(g.revoke_height)}` }}
								</template>
							</Tooltip>
						</Flex>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_granters {
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
		padding-right: 12px;

		white-space: nowrap;

		height: 40px;

		cursor: pointer;

		&:first-child {
			padding-left: 16px;
		}
	}
}
</style>
