<script setup>
import Tooltip from "@/components/ui/Tooltip.vue"

const props = defineProps({
    rollups: {
        type: Array,
        required: true,
    },
})



</script>

<template>
    <Flex wide direction="column" gap="4">
        <Flex justify="between" :class="$style.header">
            <Flex align="center" gap="8">
                <Icon name="rollup" size="16" color="secondary" />
                <!-- <Text size="14" weight="600" color="primary">Rollups Leaderboard</Text> -->
            </Flex>

            <!-- Pagination -->
            <!-- <Flex v-if="pages" align="center" gap="6">
                <Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
                    <Icon name="arrow-left-stop" size="12" color="primary" />
                </Button>
                <Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
                    <Icon name="arrow-left" size="12" color="primary" />
                </Button>

                <Button type="secondary" size="mini" disabled>
                    <Text size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
                </Button>

                <Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
                    <Icon name="arrow-right" size="12" color="primary" />
                </Button>
                <Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages">
                    <Icon name="arrow-right-stop" size="12" color="primary" />
                </Button>
            </Flex> -->
        </Flex>

        <Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
            <div v-if="rollups.length" :class="$style.table_scroller">
                <table>
                    <thead>
                        <tr>
                            <th><Text size="12" weight="600" color="tertiary" noWrap>#</Text></th>
                            <th><Text size="12" weight="600" color="tertiary" noWrap>Rollup</Text></th>
                            <th @click="handleSort('time')" :class="$style.sortable">
                                <Flex align="center" gap="6">
                                    <Text size="12" weight="600" color="tertiary" noWrap>Last Active</Text>
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
                                    <Text size="12" weight="600" color="tertiary" noWrap>Size</Text>
                                    <Icon
                                        v-if="sort.by === 'size'"
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
                            <th @click="handleSort('fee')" :class="$style.sortable">
                                <Flex align="center" gap="6">
                                    <Text size="12" weight="600" color="tertiary" noWrap>Blob Fees Paid</Text>
                                    <Icon
                                        v-if="sort.by === 'fee'"
                                        name="chevron"
                                        size="12"
                                        color="secondary"
                                        :style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
                                    />
                                </Flex>
                            </th>
                            <th><Text size="12" weight="600" color="tertiary" noWrap>Paid per MB</Text></th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="(r, index) in rollups">
                            <td>
                                <NuxtLink :to="`/rollup/${r.slug}`">
                                    <Flex align="center">
                                        <Text size="13" weight="600" color="primary">{{ index + 1 }}</Text>
                                    </Flex>
                                </NuxtLink>
                            </td>
                            <td style="width: 1px">
                                <NuxtLink :to="`/rollup/${r.slug}`">
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
                                <NuxtLink :to="`/rollup/${r.slug}`">
                                    <Flex direction="column" justify="center" gap="4">
                                        <Text size="12" weight="600" color="primary">
                                            {{ DateTime.fromISO(r.last_message_time).toRelative({ locale: "en", style: "short" }) }}
                                        </Text>

                                        <Text size="12" weight="500" color="tertiary">
                                            {{ DateTime.fromISO(r.last_message_time).setLocale("en").toFormat("LLL d, t") }}
                                        </Text>
                                    </Flex>
                                </NuxtLink>
                            </td>
                            <td>
                                <NuxtLink :to="`/rollup/${r.slug}`">
                                    <Flex align="start" justify="center" direction="column" gap="4">
                                        <Tooltip position="start" delay="400">
                                            <Flex direction="column" gap="4">
                                                <Text size="13" weight="600" color="primary">{{ formatBytes(r.size) }}</Text>

                                                <Text size="12" weight="600" color="tertiary">{{ truncateDecimalPart(r.size_pct * 100, 2) }}%</Text>
                                            </Flex>

                                            <template #content>
                                                <Flex align="end" gap="8">
                                                    <Text size="12" weight="600" color="tertiary">Share of total size</Text>

                                                    <Text size="12" weight="600" color="primary">{{ truncateDecimalPart(r.size_pct * 100, 2) }}%</Text>
                                                </Flex>
                                            </template>
                                        </Tooltip>
                                    </Flex>
                                </NuxtLink>
                            </td>
                            <td>
                                <NuxtLink :to="`/rollup/${r.slug}`">
                                    <Flex align="start" justify="center" direction="column" gap="4">
                                        <Tooltip position="start" delay="400">
                                            <Flex direction="column" gap="4">
                                                <Text size="13" weight="600" color="primary">{{ comma(r.blobs_count) }}</Text>

                                                <Text size="12" weight="600" color="tertiary">{{ truncateDecimalPart(r.blobs_count_pct * 100, 2) }}%</Text>
                                            </Flex>

                                            <template #content>
                                                <Flex align="end" gap="8">
                                                    <Text size="12" weight="600" color="tertiary">Share of total blobs count</Text>

                                                    <Text size="12" weight="600" color="primary">{{ truncateDecimalPart(r.blobs_count_pct * 100, 2) }}%</Text>
                                                </Flex>
                                            </template>
                                        </Tooltip>
                                    </Flex>
                                </NuxtLink>
                            </td>
                            <td>
                                <NuxtLink :to="`/rollup/${r.slug}`">
                                    <Flex align="start" justify="center" direction="column" gap="4">
                                        <AmountInCurrency :amount="{ value: r.fee }" />

                                        <Tooltip position="start" delay="400">
                                            <Text size="12" weight="600" color="tertiary">{{ truncateDecimalPart(r.fee_pct * 100, 2) }}%</Text>

                                            <template #content>
                                                <Flex align="end" gap="8">
                                                    <Text size="12" weight="600" color="tertiary">Share of total fee paid</Text>

                                                    <Text size="12" weight="600" color="primary">{{ truncateDecimalPart(r.fee_pct * 100, 2) }}%</Text>
                                                </Flex>
                                            </template>
                                        </Tooltip>
                                    </Flex>
                                </NuxtLink>
                            </td>
                            <td>
                                <NuxtLink :to="`/rollup/${r.slug}`">
                                    <Flex align="center">
                                        <AmountInCurrency :amount="{ value: utiaPerMB(r) }" />
                                    </Flex>
                                </NuxtLink>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
                <Text size="13" weight="600" color="secondary" align="center"> No rollups found </Text>
                <Text size="12" weight="500" height="160" color="tertiary" align="center">
                    This network does not contain any rollups
                </Text>
            </Flex>
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