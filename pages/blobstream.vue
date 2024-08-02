<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
// import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { capitilize, comma, shortHex } from "@/services/utils"

/** API */
import { fetchNetworks, fetchCommitments, fetchCommitmentsByNetwork } from "@/services/api/blobstream"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useModalsStore } from "@/store/modals"
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

useHead({
	title: "Blobstream - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/blobstream",
		},
	],
	meta: [
		{
			name: "description",
			content: "Blobstream in the Celestia Blockchain. Commitments, transactions, L1 info.",
		},
		{
			property: "og:title",
			content: "Blobstream - Celestia Explorer",
		},
		{
			property: "og:description",
			content: "Blobstream in the Celestia Blockchain. Commitments, transactions, L1 info.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/blobstream`,
		},
		{
			property: "og:image",
			content: "/img/seo/blobstream.png",
		},
		{
			name: "twitter:title",
			content: "Blobstream - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content: "Blobstream in the Celestia Blockchain. Commitments, transactions, L1 info.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/blobstream.png",
		},
	],
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const networks = ref([])
const commitments = ref([])

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const selectedNetwork = ref(route.query.network ? route.query.network : "")
const handleNextCondition = ref(true)
const limit = ref(20)
const sort = ref("desc")

const getNetworks = async () => {
	const { data } = await fetchNetworks()
	networks.value = data.value.filter((n) => n.last_height > 0)

	if (networks.value.length === 1) {
		selectedNetwork.value = networks.value[0].network
	}
}

const getCommitments = async () => {
	isRefetching.value = true

	if (!selectedNetwork.value) {
		const { data } = await fetchCommitments({
			limit: limit.value,
			offset: (page.value - 1) * limit.value,
			sort: sort.value,
		})

		commitments.value = data.value
	} else {
		const { data } = await fetchCommitmentsByNetwork({
			network: selectedNetwork.value,
			limit: limit.value,
			offset: (page.value - 1) * limit.value,
			sort: sort.value,
		})

		commitments.value = data.value
	}

	handleNextCondition.value = commitments.value?.length < limit.value

	isRefetching.value = false
}

const updateRouteQuery = () => {
	router.replace({
		query: {
			network: selectedNetwork.value ? selectedNetwork.value : undefined,
			page: page.value,
		},
	})
}

/** Refetch commitments */
watch(
	() => page.value,
	async () => {
		getCommitments()

		updateRouteQuery()
	},
)

watch(
	() => selectedNetwork.value,
	async () => {
		if (page.value === 1) {
			getCommitments()
		} else {
			page.value = 1
		}

		updateRouteQuery()
	},
)

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	page.value += 1
}

const handleSort = () => {
	if (sort.value === "asc") {
		sort.value = "desc"
		getCommitments()
	} else {
		sort.value = "asc"
		getCommitments()
	}
}

const handleSelectNetwork = (network) => {
	if (selectedNetwork.value === network) {
		selectedNetwork.value = ""
	} else {
		selectedNetwork.value = network
	}
}

const handleViewCommitment = (commitment) => {
	cacheStore.current.commitment = commitment

	modalsStore.open("commitment")
}

getNetworks()
getCommitments()
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/blobstream', name: `Blobstream` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex align="center" gap="12" :class="$style.card_wrapper">
			<Flex
				v-for="n in networks"
				@click="handleSelectNetwork(n.network)"
				align="center"
				direction="column"
				gap="12"
				:class="[
					$style.card_network,
					selectedNetwork === n.network && $style.card_active,
					isRefetching && $style.disabled,
					networks?.length === 1 && $style.unclickable,
				]"
			>
				<Flex align="center" gap="6">
					<Text size="13" weight="600" height="110" color="primary"> {{ capitilize(n.network) }} </Text>
				</Flex>

				<Flex align="center" justify="between" wide>
					<Text size="12" weight="600" color="tertiary">Last Height</Text>

					<Text size="12" weight="600" color="secondary"> {{ comma(n.last_height) }} </Text>
				</Flex>

				<Flex align="center" justify="between" wide>
					<Text size="12" weight="600" color="tertiary">Last Hash</Text>

					<Text size="12" weight="600" color="secondary"> {{ shortHex(n.last_hash) }} </Text>
				</Flex>
			</Flex>
		</Flex>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<!-- <Icon name="address" size="16" color="secondary" /> -->
					<Text size="14" weight="600" color="primary">Blobstream Commitments</Text>
				</Flex>

				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="handleNextCondition">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div v-if="commitments?.length > 0" :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th @click="handleSort()" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Time</Text>
										<Icon
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Commitment</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Celestia Block Range</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Contract</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>L1 Info</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="c in commitments" @click.stop="handleViewCommitment(c)">
								<td style="width: 1px">
									<Flex justify="center" direction="column" gap="6">
										<Text size="12" weight="600" color="primary">
											{{ DateTime.fromISO(c.time).toRelative({ locale: "en", style: "short" }) }}
										</Text>
										<Text size="12" weight="500" color="tertiary">
											{{ DateTime.fromISO(c.time).setLocale("en").toFormat("LLL d, t") }}
										</Text>
									</Flex>
								</td>
								<td>
									<Flex justify="center" direction="column" gap="6">
										<Text size="12" weight="600" color="primary">
											{{ shortHex(c.commitment) }}
										</Text>
										<Text size="12" weight="500" color="tertiary"> nonce {{ c.proof_nonce }} </Text>
									</Flex>
								</td>
								<td>
									<Flex align="center" gap="6">
										<Flex align="center">
											<Outline @click.prevent.stop="router.push(`/block/${c.celestia_start_height}`)">
												<Flex align="center" gap="6">
													<Icon name="block" size="14" color="tertiary" />

													<Text size="13" weight="600" color="primary" tabular>{{
														comma(c.celestia_start_height)
													}}</Text>
												</Flex>
											</Outline>
										</Flex>

										<Text size="12" weight="600" color="primary">—</Text>

										<Flex align="center">
											<Outline @click.prevent.stop="router.push(`/block/${c.celestia_end_height}`)">
												<Flex align="center" gap="6">
													<Icon name="block" size="14" color="tertiary" />

													<Text size="13" weight="600" color="primary" tabular>{{
														comma(c.celestia_end_height)
													}}</Text>
												</Flex>
											</Outline>
										</Flex>
									</Flex>
								</td>
								<td>
									<Flex align="center">
										<Text size="12" weight="600" color="primary">
											{{ c.contract.alias }}
										</Text>
									</Flex>
								</td>
								<td>
									<Flex justify="center" direction="column" gap="6">
										<Text size="12" weight="600" color="primary">
											{{ shortHex(c.l1_info.tx_hash) }}
										</Text>
										<Text size="12" weight="500" color="tertiary"> Height {{ comma(c.l1_info.height) }} </Text>
									</Flex>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
					<Text size="13" weight="600" color="secondary" align="center"> No commitments found </Text>
					<Text size="12" weight="500" height="160" color="tertiary" align="center">
						Nothing pushed to the selected network
					</Text>
				</Flex>
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
	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		& tbody {
			& tr {
				cursor: pointer;

				&.active {
					opacity: 1;

					background: var(--op-3);

					& td:last-child {
						border-right: 2px solid var(--op-30);
					}
				}

				&:hover {
					background: var(--op-5);
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
		}

		& tr td {
			padding: 0;
			padding-right: 16px;
			padding-top: 8px;
			padding-bottom: 8px;

			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			border-right: 2px solid transparent;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
}

.disabled {
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

.card_wrapper {
	margin-bottom: 16px;
}

.card_network {
	min-height: 80px;
	width: 250px;

	cursor: pointer;

	background: var(--card-background);
	border-radius: 12px;
	overflow: hidden;

	padding: 12px;

	transition: all 0.2s ease;

	box-shadow: inset 0 0 0 1px var(--op-5);

	&:hover {
		opacity: 0.8;
	}

	&:active {
		scale: 0.95;
	}
}

.card_active {
	box-shadow: inset 0 0 0 1px var(--green);
}

.unclickable {
	pointer-events: none;
}

.empty {
	padding: 16px 0;
}

@media (max-width: 800px) {
	.card_wrapper {
		flex-direction: column;
	}

	.card_network {
		width: 100%;

		align-items: flex-start;
	}
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
