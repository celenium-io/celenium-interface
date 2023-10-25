<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma, tia } from "@/services/utils"

/** API */
import { fetchAddresses, fetchAddressesCount } from "@/services/api/address"

/** Store */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

useHead({
	title: "All Addresses - Celestia Explorer",
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const addresses = ref([])
const count = ref(0)

const { data: addressesCount } = await fetchAddressesCount()
count.value = addressesCount.value

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = ref(Math.ceil(count.value / 20))

const getAddresses = async () => {
	isRefetching.value = true

	const { data } = await fetchAddresses({
		limit: 20,
		offset: (page.value - 1) * 20,
		sort: "desc",
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
				{ link: '/addresses', name: `Addresses` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="addresses" size="16" color="secondary" />
					<Text size="14" weight="600" color="primary">Addresses</Text>
				</Flex>

				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1"> First </Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-narrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text size="12" weight="600" color="primary"> {{ comma(page) }} of {{ comma(pages) }} </Text>
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
								<th><Text size="12" weight="600" color="tertiary" noWrap>Balance</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>First Height</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Last Height</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="address in addresses" @click="router.push(`/address/${address.hash}`)">
								<td style="width: 1px">
									<Tooltip position="start" delay="500">
										<Flex align="center" gap="10">
											<AddressBadge :hash="address.hash" />

											<Icon
												@click.stop="handleCopy(address.hash)"
												name="copy"
												size="12"
												color="secondary"
												class="copyable"
											/>
										</Flex>

										<template #content>
											{{ address.hash }}
										</template>
									</Tooltip>
								</td>
								<td>
									<Text size="13" weight="600" color="primary"> {{ comma(tia(address.balance.value)) }} TIA </Text>
								</td>
								<td>
									<Text size="13" weight="600" color="primary"> {{ comma(address.first_height) }} </Text>
								</td>
								<td>
									<Text size="13" weight="600" color="primary"> {{ comma(address.last_height) }} </Text>
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
			padding-right: 24px;
			padding-top: 10px;
			padding-bottom: 10px;

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