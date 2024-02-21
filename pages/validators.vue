<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Services */
import { comma, numToPercent } from "@/services/utils"

/** API */
import { fetchValidators } from "@/services/api/validator"

useHead({
	title: "Validators - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/validators",
		},
	],
	meta: [
		{
			name: "description",
			content: "Rollups in the Celestia Blockchain. Rollup name, description, size, blobs, social links, contacts are shown.",
		},
		{
			property: "og:title",
			content: "Rollups Leaderboard - Celestia Explorer",
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
			content: "Rollups Leaderboard - Celestia Explorer",
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

const isLoading = ref(false)
const validators = ref([])
const count = ref(0)

// const sort = reactive({
// 	by: "size",
// 	dir: "desc",
// })

// const getRollupsCount = async () => {
// 	const { data: rollupsCount } = await fetchRollupsCount()
// 	count.value = rollupsCount.value
// }

// await getRollupsCount()

// const page = ref(route.query.page ? parseInt(route.query.page) : 1)
// const pages = computed(() => Math.ceil(30 / 20))
const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => 21)

const getValidators = async () => {
	isLoading.value = true

	const { data } = await fetchValidators({
		limit: 20,
		offset: (page.value - 1) * 20,
	})
	validators.value = data.value

	isLoading.value = false
}

getValidators()

/** Refetch validators */
watch(
	() => page.value,
	async () => {
		getValidators()

		router.replace({ query: { page: page.value } })
	},
)

// const handleSort = (by) => {
// 	switch (sort.dir) {
// 		case "desc":
// 			if (sort.by == by) sort.dir = "asc"
// 			break

// 		case "asc":
// 			sort.dir = "desc"

// 			break
// 	}

// 	sort.by = by

// 	getRollups()
// }

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
					{ link: '/validators', name: `Validators` },
				]"
			/>

			<!-- <Button link="https://forms.gle/nimJyQJG4Lb4BTcG7" target="_blank" type="secondary" size="mini">
				<Icon name="rollup-plus" size="12" color="secondary" /> Rollup Registration
			</Button> -->
		</Flex>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="validator" size="16" color="secondary" />
					<Text size="14" weight="600" color="primary">Validators</Text>
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

					<Button @click="handleNext" type="secondary" size="mini" :disabled="validators.length < 20">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" wide :class="[$style.table, isLoading && $style.disabled]">
				<div v-if="validators.length"  :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Validator</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Rate</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Max Rate</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Max Change Rate</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Min Self Delegation</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="v in validators">
								<td style="width: 1px">
									<NuxtLink :to="`/validator/${v.id}`">
										<Flex v-if="v.moniker" align="center" gap="6">
											<Text size="13" weight="600" color="primary" mono>
												{{ v.moniker }}
											</Text>

											<CopyButton :text="v.moniker" />
										</Flex>
										<Flex v-else align="center" gap="6">
											<AddressBadge :hash="v.address" />

											<CopyButton :text="v.address" />
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/validator/${v.id}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ numToPercent(v.rate) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/validator/${v.id}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ numToPercent(v.max_rate) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/validator/${v.id}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ numToPercent(v.max_change_rate) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/validator/${v.id}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ comma(v.min_self_delegation) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
<!-- 
				<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
					<Text size="13" weight="600" color="secondary" align="center"> No rollups found </Text>
					<Text size="12" weight="500" height="160" color="tertiary" align="center">
						This network does not contain any rollups
					</Text>
				</Flex> -->
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
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
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}

.empty {
	padding: 16px 0;
}
</style>
