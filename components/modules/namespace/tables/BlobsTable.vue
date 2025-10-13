<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { formatBytes, getNamespaceID, space } from "@/services/utils"

/** Store */
import { useCacheStore } from "@/store/cache.store"
import { useModalsStore } from "@/store/modals.store"
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

const props = defineProps({
	blobs: {
		type: Array,
		required: true,
	},
	namespace: {
		type: Object,
		required: false,
	},
	source: {
		type: String,
		required: false,
	},
})

const handleViewBlob = (blob) => {
	cacheStore.selectedBlob = {
		...blob,
		hash: blob.namespace ? blob.namespace.hash : props.namespace.hash,
		namespace_id: blob.namespace ? blob.namespace.namespace_id : props.namespace.namespace_id,
		namespace_name: blob.namespace ? blob.namespace.name : props.namespace.name,
		rollup: blob.rollup,
	}

	modalsStore.open("blob")
}
</script>

<template>
	<div :class="$style.wrapper_blobs">
		<table :class="$style.table">
			<thead>
				<tr>
					<th>
						<Text size="12" weight="600" color="tertiary"> {{ source === "account" ? "Namespace" : "Signer" }} </Text>
					</th>
					<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Share Commitments</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Size</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="blob in blobs" @click.stop="handleViewBlob(blob)">
					<td v-if="source === 'account'">
						<Tooltip position="start" delay="500">
							<Flex direction="column" gap="4">
								<Flex align="center" gap="8">
									<Text size="12" weight="600" color="primary" mono class="table_column_alias">
										{{ $getDisplayName("namespaces", blob.namespace.namespace_id) }}
									</Text>

									<CopyButton :text="getNamespaceID(blob.namespace.namespace_id)" />
								</Flex>

								<Text
									v-if="blob.namespace.name !== getNamespaceID(blob.namespace.namespace_id)"
									size="12"
									weight="500"
									color="tertiary"
								>
									{{ blob.namespace.name }}
								</Text>
							</Flex>

							<template #content>
								{{ space(getNamespaceID(blob.namespace.namespace_id)) }}
							</template>
						</Tooltip>
					</td>
					<td v-else>
						<Tooltip v-if="blob.signer.hash" position="start" delay="500">
							<Flex align="center" gap="8">
								<AddressBadge :account="blob.signer" />

								<CopyButton :text="blob.signer.hash" />
							</Flex>

							<template #content>
								{{ blob.signer.hash }}
							</template>
						</Tooltip>
						<Flex v-else align="center">
							<Text size="13" weight="600" color="secondary">Unknown</Text>
						</Flex>
					</td>
					<td>
						<Flex direction="column" justify="center" gap="4">
							<Text size="12" weight="600" color="primary">
								{{ DateTime.fromISO(blob.time).toRelative({ locale: "en", style: "short" }) }}
							</Text>

							<Text size="12" weight="500" color="tertiary">
								{{ DateTime.fromISO(blob.time).setLocale("en").toFormat("LLL d, t") }}
							</Text>
						</Flex>
					</td>
					<td>
						<Tooltip position="start" delay="500">
							<Flex align="center" gap="8">
								<Text size="13" weight="600" color="primary">
									{{ blob.commitment.slice(0, 4) }}
								</Text>

								<Flex align="center" gap="3">
									<div v-for="dot in 3" class="dot" />
								</Flex>

								<Text size="13" weight="600" color="primary">
									{{ blob.commitment.slice(blob.commitment.length - 4, blob.commitment.length) }}
								</Text>

								<CopyButton :text="blob.commitment" />
							</Flex>

							<template #content>
								{{ blob.commitment }}
							</template>
						</Tooltip>
					</td>
					<td>
						<Text size="13" weight="600" color="primary">
							{{ formatBytes(blob.size) }}
						</Text>
					</td>
					<td v-if="blob.rollup?.logo" style="width: 1px">
						<NuxtLink :to="`/network/${blob.rollup.slug}`" @click.stop>
							<Tooltip position="start" delay="500">
								<Flex align="center" justify="center" :class="$style.avatar_container">
									<img :src="blob.rollup.logo" :class="$style.avatar_image" />
								</Flex>

								<template #content>
									{{ blob.rollup.name }}
								</template>
							</Tooltip>
						</NuxtLink>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_blobs {
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
		padding: 0;
		padding-top: 8px;
		padding-bottom: 8px;
		padding-right: 24px;

		white-space: nowrap;

		&:first-child {
			padding-left: 16px;
		}
	}
}

.avatar_container {
	position: relative;
	width: 20px;
	height: 20px;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
</style>
