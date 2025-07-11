<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { comma, space, formatBytes } from "@/services/utils"

/** API */
import { fetchBlocks, fetchBlocksCount } from "@/services/api/block"

useHead({
	title: "Blocks - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/blocks",
		},
	],
	meta: [
		{
			name: "description",
			content:
				"View all blocks in the Celestia Blockchain. Hash, proposer, transactions count, events, blobs size and fee are shown.",
		},
		{
			property: "og:title",
			content: "Blocks - Celestia Explorer",
		},
		{
			property: "og:description",
			content:
				"View all blocks in the Celestia Blockchain. Hash, proposer, transactions count, events, blobs size and fee are shown.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/blocks`,
		},
		{
			property: "og:image",
			content: "/img/seo/blocks.png",
		},
		{
			name: "twitter:title",
			content: "Blocks - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content:
				"View all blocks in the Celestia Blockchain. Hash, proposer, transactions count, events, blobs size and fee are shown.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/blocks.png",
		},
	],
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const blocks = ref([])
const count = ref(0)

const hintedBlock = ref(route.query.block)

const getBlocksCount = async () => {
	const { data: blocksCount } = await fetchBlocksCount()
	count.value = blocksCount.value
}

await getBlocksCount()

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.ceil(count.value / 20))

const { data } = await fetchBlocks({ limit: 20, offset: (page.value - 1) * 20 })
blocks.value = data.value

/** Refetch blocks */
watch(
	() => page.value,
	async () => {
		isRefetching.value = true

		const { data } = await fetchBlocks({ limit: 20, offset: (page.value - 1) * 20 })
		blocks.value = data.value

		isRefetching.value = false

		router.replace({ query: { page: page.value } })
	},
)

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

const handleLast = async () => {
	await getBlocksCount()

	page.value = pages.value
}
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Explore' },
				{ link: '/blocks', name: `Blocks` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="block" size="16" color="secondary" />
					<Text as="h1" size="14" weight="600" color="primary">Blocks</Text>
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

			<Flex direction="column" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Height</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Time</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Proposer</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Hash</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Txs</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Events</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Blobs</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Blobs Size</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Total Fees</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="block in blocks">
								<td style="width: 1px">
									<NuxtLink :to="`/block/${block.height}`">
										<Flex align="center">
											<Outline>
												<Flex align="center" gap="6">
													<Icon
														name="block"
														size="14"
														:color="hintedBlock == block.height ? 'blue' : 'tertiary'"
													/>

													<Text size="13" weight="600" color="primary" tabular>{{ comma(block.height) }}</Text>
												</Flex>
											</Outline>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/block/${block.height}`">
										<Flex justify="center" direction="column" gap="6">
											<Text size="12" weight="600" color="primary">
												{{ DateTime.fromISO(block.time).toRelative({ locale: "en", style: "short" }) }}
											</Text>
											<Text size="12" weight="500" color="tertiary">
												{{ DateTime.fromISO(block.time).setLocale("en").toFormat("LLL d, t") }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/block/${block.height}`">
										<Flex align="center">
											<Tooltip v-if="block.hash" delay="500">
												<template #default>
													<Flex direction="column" gap="4">
														<Text
															size="12"
															height="120"
															weight="600"
															color="primary"
															:class="$style.proposer_moniker"
														>
															{{ block.proposer.moniker }}
														</Text>

														<Flex align="center" gap="6">
															<Text size="12" weight="600" color="tertiary" mono>
																{{ block.proposer.cons_address.slice(0, 4) }}
															</Text>
															<Flex align="center" gap="3">
																<div v-for="dot in 3" class="dot" />
															</Flex>
															<Text size="12" weight="600" color="tertiary" mono>
																{{
																	block.proposer.cons_address.slice(
																		block.proposer.cons_address.length - 4,
																		block.proposer.cons_address.length,
																	)
																}}
															</Text>
															<CopyButton :text="block.proposer.cons_address" size="10" />
														</Flex>
													</Flex>
												</template>

												<template #content> {{ space(block.proposer.cons_address) }} </template>
											</Tooltip>
											<Text v-else size="13" weight="600" color="secondary">Genesis</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/block/${block.height}`">
										<Flex align="center">
											<Tooltip v-if="block.hash" delay="500">
												<template #default>
													<Flex align="center" gap="8">
														<Text size="13" weight="600" color="primary" mono>{{
															block.hash.slice(0, 4)
														}}</Text>

														<Flex align="center" gap="3">
															<div v-for="dot in 3" class="dot" />
														</Flex>

														<Text size="13" weight="600" color="primary" mono>
															{{ block.hash.slice(block.hash.length - 4, block.hash.length) }}
														</Text>

														<CopyButton :text="block.hash" />
													</Flex>
												</template>

												<template #content> {{ space(block.hash) }} </template>
											</Tooltip>
											<Text v-else size="13" weight="600" color="secondary">Genesis</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/block/${block.height}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">
												{{ block.stats.tx_count }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/block/${block.height}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">
												{{ block.stats.events_count }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/block/${block.height}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">
												{{ block.stats.blobs_count }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/block/${block.height}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">
												{{ formatBytes(block.stats.blobs_size) }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/block/${block.height}`">
										<Flex align="center" gap="4">
											<AmountInCurrency
												:amount="{ value: block.stats.fee, decimal: 6 }"
												:styles="{ amount: { size: '13' } }"
											/>
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

.proposer_moniker {
	max-width: 160px;

	text-overflow: ellipsis;
	overflow: hidden;
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
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
