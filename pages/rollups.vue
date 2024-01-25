<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { space, formatBytes, comma } from "@/services/utils"

/** API */
import { fetchRollups, fetchRollupsCount } from "@/services/api/rollup"

useHead({
	title: "Rollups - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/rollups",
		},
	],
	meta: [
		{
			name: "description",
			content: "Rollups in the Celestia Blockchain. Rollup name, description, size, blobs, social links, contacts are shown.",
		},
		{
			property: "og:title",
			content: "Rollups - Celestia Explorer",
		},
		{
			property: "og:description",
			content: "Rollups in the Celestia Blockchain. Rollup name, description, size, blobs, social links, contacts are shown.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/rollups`,
		},
		{
			property: "og:image",
			content: "/img/seo/rollups.png",
		},
		{
			name: "twitter:title",
			content: "Rollups - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content: "Rollups in the Celestia Blockchain. Rollup name, description, size, blobs, social links, contacts are shown.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/rollups.png",
		},
	],
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const rollups = ref([])
const count = ref(0)

const sort = reactive({
	by: "time",
	dir: "desc",
})

const getRollupsCount = async () => {
	const { data: rollupsCount } = await fetchRollupsCount()
	count.value = rollupsCount.value
	console.log(count.value);
}

await getRollupsCount()

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.ceil(30 / 20))
// const pages = computed(() => Math.ceil(count.value / 20))

const getRollups = async () => {
	isRefetching.value = true

	const { data } = await fetchRollups({
		limit: 20,
		offset: (page.value - 1) * 20,
		sort: sort.dir,
		sort_by: sort.by,
	})
	rollups.value = data.value

	isRefetching.value = false
}

getRollups()

/** Refetch rollups */
watch(
	() => page.value,
	async () => {
		getRollups()

		router.replace({ query: { page: page.value } })
	},
)

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

	getRollups()
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex align="end" justify="between" :class="$style.breadcrumbs">
			<Breadcrumbs
				:items="[
					{ link: '/', name: 'Explore' },
					{ link: '/rollups', name: `Rollups` },
				]"
			/>
		</Flex>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="package" size="16" color="secondary" />
					<Text size="14" weight="600" color="primary">Rollups</Text>
				</Flex>

				<!-- Pagination -->
				<Flex align="center" gap="6" :class="$style.pagination">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button @click="handlePrev" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="rollups.length < 10">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
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
							</tr>
						</thead>

						<tbody>
							<tr v-for="r in rollups">
								<td style="width: 1px">
									<NuxtLink :to="`/rollup/${r.id}`">
										<Flex align="center">
											<Tooltip position="start">
												<Flex align="center" gap="8">
													<Text size="12" weight="600" color="primary" mono>
														{{ r.name }}
													</Text>

													<CopyButton :text="r.name" />
												</Flex>

												<template #content>
													{{ r.name }}
												</template>
											</Tooltip>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollup/${r.id}`">
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
									<NuxtLink :to="`/rollup/${r.id}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ formatBytes(r.size) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/rollup/${r.id}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ comma(r.blobs_count) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 26px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

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

	padding-bottom: 12px;

	transition: all 0.2s ease;

	& table {
		width: 100%;
		height: fit-content;

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

			& span {
				display: flex;
			}

			&:first-child {
				padding-left: 16px;
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

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.message_type {
	max-width: 100px;
	text-overflow: ellipsis;
	overflow: hidden;
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}

	.header {
		flex-direction: column;
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}
</style>
