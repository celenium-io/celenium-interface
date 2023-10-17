<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { tia, comma, space } from "@/services/utils"

/** API */
import { fetchBlocks } from "@/services/api/block"

/** Store */
import { useAppStore } from "@/store/app"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const notificationsStore = useNotificationsStore()

useHead({
	title: "All Blocks - Celestia Explorer",
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const blocks = ref([])
const hintedBlock = ref(route.query.block)

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = ref(Math.ceil(appStore.head.last_height / 20))

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

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

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
					<Text size="14" weight="600" color="primary">Blocks</Text>
				</Flex>

				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1"> First </Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-narrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
						<Icon name="arrow-narrow-right" size="12" color="primary" />
					</Button>
					<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages"> Last </Button>
				</Flex>
			</Flex>

			<Flex direction="column" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Height</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>When</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Hash</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Proposer</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Txs</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Events</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Blobs Size</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Fee</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="block in blocks" @click="router.push(`/block/${block.height}`)">
								<td style="width: 1px">
									<Outline>
										<Flex align="center" gap="6">
											<Icon name="block" size="14" :color="hintedBlock == block.height ? 'blue' : 'tertiary'" />

											<Text size="13" weight="600" color="primary">{{ comma(block.height) }}</Text>
										</Flex>
									</Outline>
								</td>
								<td>
									<Text size="13" weight="600" color="primary">{{
										DateTime.fromISO(block.time).toRelative({ locale: "en", style: "short" })
									}}</Text>
								</td>
								<td>
									<Tooltip delay="500">
										<template #default>
											<Flex @click.stop="handleCopy(block.hash)" align="center" gap="6" class="copyable">
												<Text size="13" weight="600" color="secondary">{{ block.hash.slice(0, 4) }}</Text>

												<Flex align="center" gap="3">
													<div v-for="dot in 3" class="dot" />
												</Flex>

												<Text size="13" weight="600" color="secondary">
													{{ block.hash.slice(block.hash.length - 4, block.hash.length) }}
												</Text>
											</Flex>
										</template>

										<template #content> {{ space(block.hash) }} </template>
									</Tooltip>
								</td>
								<td>
									<Tooltip delay="500">
										<template #default>
											<Flex @click.stop="handleCopy(block.proposer_address)" align="center" gap="6" class="copyable">
												<Text size="13" weight="600" color="secondary">{{
													block.proposer_address.slice(0, 4)
												}}</Text>

												<Flex align="center" gap="3">
													<div v-for="dot in 3" class="dot" />
												</Flex>

												<Text size="13" weight="600" color="secondary">{{
													block.proposer_address.slice(
														block.proposer_address.length - 4,
														block.proposer_address.length,
													)
												}}</Text>
											</Flex>
										</template>

										<template #content> {{ space(block.proposer_address) }} </template>
									</Tooltip>
								</td>
								<td>
									<Text size="13" weight="600" color="primary">
										{{ block.stats.tx_count }}
									</Text>
								</td>
								<td>
									<Text size="13" weight="600" color="primary">
										{{ block.stats.events_count }}
									</Text>
								</td>
								<td>
									<Text size="13" weight="600" color="primary">
										{{ block.stats.blobs_size }}
									</Text>
								</td>
								<td>
									<Flex align="center" gap="4">
										<Text size="13" weight="600" color="primary"> {{ tia(block.stats.fee) }} </Text>
										<Text size="13" weight="600" color="tertiary"> TIA </Text>
									</Flex>
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

	padding: 60px 24px;
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
			padding-right: 24px;
			padding-top: 6px;
			padding-bottom: 6px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
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
		flex-direction: column;
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}
</style>
