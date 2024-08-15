<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { comma, tia } from "@/services/utils"

/** API */
import { fetchAddresses, fetchAddressesCount } from "@/services/api/address"

useHead({
	title: "Addresses - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/addresses",
		},
	],
	meta: [
		{
			name: "description",
			content: "Addresses in the Celestia Blockchain. Hash, balance, first height, last height are shown.",
		},
		{
			property: "og:title",
			content: "Addresses - Celestia Explorer",
		},
		{
			property: "og:description",
			content: "Addresses in the Celestia Blockchain. Hash, balance, first height, last height are shown.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/addresses`,
		},
		{
			property: "og:image",
			content: "/img/seo/addresses.png",
		},
		{
			name: "twitter:title",
			content: "Addresses - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content: "Addresses in the Celestia Blockchain. Hash, balance, first height, last height are shown.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/addresses.png",
		},
	],
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const addresses = ref([])
const count = ref(0)

const getAddressesCount = async () => {
	const { data: addressesCount } = await fetchAddressesCount()
	count.value = addressesCount.value
}

await getAddressesCount()

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.ceil(count.value / 20))

const sort = reactive({
	by: "spendable",
	dir: "desc",
})

const getAddresses = async () => {
	isRefetching.value = true

	const { data } = await fetchAddresses({
		limit: 20,
		offset: (page.value - 1) * 20,
		sort: sort.dir,
		sort_by: sort.by,
	})
	addresses.value = data.value

	isRefetching.value = false
}

getAddresses()

/** Refetch addresses */
watch(
	() => page.value,
	async () => {
		getAddresses()

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

	getAddresses()
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

const handleLast = async () => {
	await getAddressesCount()

	page.value = pages.value
}
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/addresses', name: `Addresses` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="address" size="16" color="secondary" />
					<Text size="14" weight="600" color="primary">Addresses</Text>
				</Flex>

				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary"> {{ comma(page) }} of {{ comma(pages) }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
					<Button @click="handleLast" type="secondary" size="mini" :disabled="page === pages">
						<Icon name="arrow-right-stop" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Hash</Text></th>
								<th @click="handleSort('spendable')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Spendable Balance</Text>
										<Icon
											v-if="sort.by === 'spendable'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th @click="handleSort('delegated')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Delegated Balance</Text>
										<Icon
											v-if="sort.by === 'delegated'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th @click="handleSort('first_height')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>First Height</Text>
										<Icon
											v-if="sort.by === 'first_height'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th @click="handleSort('last_height')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Last Height</Text>
										<Icon
											v-if="sort.by === 'last_height'"
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
							<tr v-for="address in addresses">
								<td style="width: 1px">
									<NuxtLink :to="`/address/${address.hash}`">
										<Tooltip position="start" delay="500">
											<Flex align="center" gap="8">
												<AddressBadge :hash="address.hash" />

												<CopyButton :text="address.hash" />
											</Flex>

											<template #content>
												{{ address.hash }}
											</template>
										</Tooltip>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/address/${address.hash}`">
										<AmountInCurrency
											:amount="{ value: parseInt(address.balance.spendable) }"
											:styles="{ amount: { size: '13' }, currency: { size: '13' } }"
										/>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/address/${address.hash}`">
										<AmountInCurrency
											:amount="{ value: parseInt(address.balance.delegated) }"
											:styles="{ amount: { size: '13' }, currency: { size: '13' } }"
										/>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/address/${address.hash}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">
												{{ comma(address.first_height) }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/address/${address.hash}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">
												{{ comma(address.last_height) }}
											</Text>
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
	padding: 20px 24px 60px 24px;
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
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}
</style>
