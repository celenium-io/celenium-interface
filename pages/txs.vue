<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma, space } from "@/services/utils"

/** API */
import { fetchTransactions } from "@/services/api/tx"

/** Store */
import { useAppStore } from "@/store/app"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const notificationsStore = useNotificationsStore()

useHead({
	title: "All Transactions - Celestia Explorer",
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const transactions = ref([])

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = ref(Math.ceil(appStore.head.total_tx / 20))

const findPFB = ref(false)

const getTransactions = async () => {
	isRefetching.value = true

	const { data } = await fetchTransactions({
		limit: 20,
		offset: (page.value - 1) * 20,
		sort: "desc",
	})
	transactions.value = data.value

	isRefetching.value = false
}

getTransactions()

/** Refetch transactions */
watch(
	() => page.value,
	async () => {
		getTransactions()

		router.replace({ query: { page: page.value } })
	},
)

watch(
	() => findPFB.value,
	() => {
		getTransactions()
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
				{ link: '/txs', name: `Transactions` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="zap" size="16" color="secondary" />
					<Text size="14" weight="600" color="primary">Transactions</Text>
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

			<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Hash</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Messages</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>When</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Block</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Gas</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Events</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr
								v-for="tx in transactions"
								:class="findPFB && !tx.message_types.includes('MsgPayForBlobs') && $style.hide"
								@click="router.push(`/tx/${tx.hash}`)"
							>
								<td style="width: 1px">
									<Tooltip position="start">
										<Outline @click="handleCopy(tx.hash)" class="copyable">
											<Flex align="center" gap="8">
												<Icon name="zap" size="14" :color="tx.status === 'success' ? 'green' : 'red'" />

												<template v-if="tx.hash">
													<Text size="13" weight="700" color="secondary" mono>{{
														tx.hash.slice(0, 4).toUpperCase()
													}}</Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" class="dot" />
													</Flex>

													<Text size="13" weight="700" color="secondary" mono>
														{{ tx.hash.slice(tx.hash.length - 4, tx.hash.length).toUpperCase() }}
													</Text>
												</template>
												<template v-else>
													<Text size="13" weight="700" color="secondary" mono>Genesis</Text>
												</template>
											</Flex>
										</Outline>

										<template #content>
											{{ space(tx.hash).toUpperCase() }}
										</template>
									</Tooltip>
								</td>
								<td style="width: 1px">
									<Tooltip v-if="tx.message_types.length" position="start" textAlign="left">
										<Flex align="center" gap="6">
											<Text size="13" height="160" weight="600" color="primary" :class="$style.message_type">
												{{ tx.message_types[0].replace("Msg", "") }}
											</Text>
											<Text
												v-if="tx.message_types.length > 1"
												size="12"
												weight="600"
												color="primary"
												:class="$style.badge"
											>
												+{{ tx.message_types.length - 1 }}
											</Text>
										</Flex>

										<template #content>
											<Flex direction="column" gap="8">
												<Text v-for="type in tx.message_types" color="primary">
													{{ type.replace("Msg", "") }}
												</Text>
											</Flex>
										</template>
									</Tooltip>

									<Text v-else size="13" weight="600" color="tertiary">No Message Types</Text>
								</td>
								<td>
									<Text size="13" weight="600" color="primary">
										{{ DateTime.fromISO(tx.time).toRelative({ locale: "en", style: "short" }) }}
									</Text>
								</td>
								<td>
									<Outline @click.stop="router.push(`/block/${tx.height}`)">
										<Flex align="center" gap="6">
											<Icon name="block" size="14" color="tertiary" />

											<Text size="13" weight="600" color="primary">{{ comma(tx.height) }}</Text>
										</Flex>
									</Outline>
								</td>
								<td>
									<Tooltip>
										<Text v-if="tx.gas_wanted > 0" size="13" weight="600" color="primary">
											{{ ((tx.gas_used * 100) / tx.gas_wanted).toFixed(2) }}%
										</Text>

										<template #content>
											<Flex align="center" gap="4">
												<Text size="13" weight="600" color="primary">{{ comma(tx.gas_used) }}</Text>
												<Text size="13" weight="600" color="tertiary">/</Text>
												<Text size="13" weight="600" color="secondary">{{ comma(tx.gas_wanted) }}</Text>
											</Flex>
										</template>
									</Tooltip>
								</td>
								<td>
									<Text size="13" weight="600" color="primary">
										{{ tx.events_count }}
									</Text>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Flex>

			<Flex align="center" :class="$style.footer">
				<Button @click="findPFB = !findPFB" type="secondary" size="mini">
					<Icon v-if="findPFB" name="check" size="12" color="green" /> Find PFB
				</Button>
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

.footer {
	height: 46px;

	border-radius: 4px 4px 4px 8px;
	background: var(--card-background);

	padding: 0 16px;
}

.table_scroller {
	overflow-x: auto;
}

.table {
	border-radius: 4px;
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

.hide {
	opacity: 0.5;
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
