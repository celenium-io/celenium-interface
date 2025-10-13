<script setup>
/** Services */
import { abbreviate, formatBytes, comma, sortArrayOfObjects } from "@/services/utils"

/** Components */
import Tooltip from "@/components/ui/Tooltip.vue"

const emit = defineEmits(['clearFilters'])
const props = defineProps({
    rollups: {
        type: Array,
        required: true,
    },
    isFilterActive: {
        type: Boolean,
        default: false,
    },
})

const sort = reactive({
	by: "total_size",
	dir: "desc",
})

const sortedRollups = computed(() => {
    return sortArrayOfObjects(props.rollups, sort.by, sort.dir === 'desc' ? false : true)
})

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
}
</script>

<template>
    <Flex direction="column" gap="16" wide :class="$style.table">
        <div v-if="sortedRollups.length" :class="$style.table_scroller">
            <table>
                <thead>
                    <tr>
                        <th><Text size="12" weight="600" color="tertiary" noWrap>#</Text></th>
                        <th><Text size="12" weight="600" color="tertiary" noWrap>Network</Text></th>
                        <th @click="handleSort('total_size')" :class="$style.sortable">
                            <Flex align="center" gap="6">
                                <Text size="12" weight="600" color="tertiary" noWrap>Total Size</Text>
                                <Icon
                                    v-if="sort.by === 'total_size'"
                                    name="chevron"
                                    size="12"
                                    color="secondary"
                                    :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                />
                            </Flex>
                        </th>
                        <th @click="handleSort('avg_pfb_size')" :class="$style.sortable">
                            <Flex align="center" gap="6">
                                <Text size="12" weight="600" color="tertiary" noWrap>Avg PFB Size</Text>
                                <Icon
                                    v-if="sort.by === 'avg_pfb_size'"
                                    name="chevron"
                                    size="12"
                                    color="secondary"
                                    :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                />
                            </Flex>
                        </th>
                        <th @click="handleSort('avg_size')" :class="$style.sortable">
                            <Flex align="center" gap="6">
                                <Text size="12" weight="600" color="tertiary" noWrap>Avg Blob Size</Text>
                                <Icon
                                    v-if="sort.by === 'avg_size'"
                                    name="chevron"
                                    size="12"
                                    color="secondary"
                                    :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                />
                            </Flex>
                        </th>
                        <th @click="handleSort('blobs_count')" :class="$style.sortable">
                            <Flex align="center" gap="6">
                                <Text size="12" weight="600" color="tertiary" noWrap>Blobs</Text>
                                <Icon
                                    v-if="sort.by === 'blobs_count'"
                                    name="chevron"
                                    size="12"
                                    color="secondary"
                                    :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                />
                            </Flex>
                        </th>
                        <th @click="handleSort('pfb_hour_count')" :class="$style.sortable">
                            <Flex align="center" gap="6">
                                <Text size="12" weight="600" color="tertiary" noWrap>Frequency, pfb/hour</Text>
                                <Icon
                                    v-if="sort.by === 'pfb_hour_count'"
                                    name="chevron"
                                    size="12"
                                    color="secondary"
                                    :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                />
                            </Flex>
                        </th>
                        <th @click="handleSort('throughput')" :class="$style.sortable">
                            <Flex align="center" gap="6">
                                <Text size="12" weight="600" color="tertiary" noWrap>Throughput, b/s</Text>
                                <Icon
                                    v-if="sort.by === 'throughput'"
                                    name="chevron"
                                    size="12"
                                    color="secondary"
                                    :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                />
                            </Flex>
                        </th>
                        <th @click="handleSort('mb_price')" :class="$style.sortable">
                            <Flex align="center" gap="6">
                                <Text size="12" weight="600" color="tertiary" noWrap>MB Price</Text>
                                <Icon
                                    v-if="sort.by === 'mb_price'"
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
                    <tr v-for="(r, index) in sortedRollups">
                        <td>
                            <NuxtLink :to="`/network/${r.slug}`">
                                <Flex align="center">
                                    <Text size="13" weight="600" color="primary">{{ index + 1 }}</Text>
                                </Flex>
                            </NuxtLink>
                        </td>
                        <td style="width: 1px">
                            <NuxtLink :to="`/network/${r.slug}`">
                                <Flex align="center" gap="8">
                                    <Flex v-if="r.logo" align="center" justify="center" :class="$style.avatar_container">
                                        <img :src="r.logo" :class="$style.avatar_image" />
                                    </Flex>

                                    <Text size="12" weight="600" color="primary" mono>
                                        {{ r.name }}
                                    </Text>
                                </Flex>
                            </NuxtLink>
                        </td>
                        <td>
                            <NuxtLink :to="`/network/${r.slug}`">
                                <Flex align="center">
                                    <Text size="12" weight="600" color="primary">{{ formatBytes(r.total_size) }}</Text>
                                </Flex>
                            </NuxtLink>
                        </td>
                        <td>
                            <NuxtLink :to="`/network/${r.slug}`">
                                <Flex align="center">
                                    <Text size="12" weight="600" color="primary">
                                        {{ formatBytes(r.avg_pfb_size) }}
                                    </Text>
                                </Flex>
                            </NuxtLink>
                        </td>
                        <td>
                            <NuxtLink :to="`/network/${r.slug}`">
                                <Flex align="center">
                                    <Text size="12" weight="600" color="primary">
                                        {{ formatBytes(r.avg_size) }}
                                    </Text>
                                </Flex>
                            </NuxtLink>
                        </td>
                        <td>
                            <NuxtLink :to="`/network/${r.slug}`">
                                <Tooltip position="start" delay="400">
                                    <Flex align="center">
                                        <Text size="12" weight="600" color="primary">{{ abbreviate(r.blobs_count) }}</Text>
                                    </Flex>

                                    <template #content>
                                        <Text size="12" weight="600" color="tertiary"> {{ comma(r.blobs_count) }} </Text>
                                    </template>
                                </Tooltip>
                            </NuxtLink>
                        </td>
                        <td>
                            <NuxtLink :to="`/network/${r.slug}`">
                                <Flex align="center">
                                    <Text size="12" weight="600" color="primary">
                                        {{ comma(r.pfb_hour_count) }}
                                    </Text>
                                </Flex>
                            </NuxtLink>
                        </td>
                        <td>
                            <NuxtLink :to="`/network/${r.slug}`">
                                <Flex align="center" gap="4">
                                    <Text size="12" weight="600" color="primary">
                                        {{ comma(r.throughput) }}
                                    </Text>
                                    <!-- <Text size="12" weight="600" color="tertiary">/ sec</Text> -->
                                </Flex>
                            </NuxtLink>
                        </td>
                        <td>
                            <NuxtLink :to="`/network/${r.slug}`">
                                <Flex align="center">
                                    <AmountInCurrency :amount="{ value: r.mb_price }" />
                                </Flex>
                            </NuxtLink>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
            <Text size="13" weight="600" color="secondary" align="center"> No activity </Text>
            <Text v-if="!isFilterActive" size="12" weight="500" height="160" color="tertiary" align="center">
                There has been no network activity in the last 24 hours
            </Text>
            <Text v-else size="12" weight="500" height="160" color="tertiary" align="center">
                Try to change the filters or <Text @click="emit('clearFilters')" size="12" color="secondary" :style="{cursor: 'pointer', textDecoration: 'underline'}">clear</Text> them
            </Text>
        </Flex>
    </Flex>
</template>

<style module>
.table_scroller {
	overflow-x: auto;
}

.table {
	border-radius: 4px 4px 8px 8px;
	background: var(--card-background);

	transition: all 0.2s ease;

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		padding-bottom: 12px;

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

			& span {
				display: flex;
			}

			&:first-child {
				padding-left: 16px;
				width: 16px;
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

				min-height: 44px;

				padding-right: 24px;
			}
		}
	}
}

.avatar_container {
	position: relative;
	width: 25px;
	height: 25px;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.empty {
	padding: 16px 0;
}
</style>