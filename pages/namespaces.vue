<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { space, formatBytes } from "@/services/utils"

/** API */
import { fetchNamespaces, fetchNamespacesCount } from "@/services/api/namespace"

/** Store */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

useHead({
	title: "All Namespaces - Celestia Explorer",
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const namespaces = ref([])
const count = ref(0)

const { data: namespacesCount } = await fetchNamespacesCount()
count.value = namespacesCount.value

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = ref(Math.ceil(count.value / 20))

const getNamespaces = async () => {
	isRefetching.value = true

	const { data } = await fetchNamespaces({
		limit: 20,
		offset: (page.value - 1) * 20,
		sort: "desc",
	})
	namespaces.value = data.value

	isRefetching.value = false
}

getNamespaces()

/** Refetch transactions */
watch(
	() => page.value,
	async () => {
		getNamespaces()

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
				{ link: '/namespaces', name: `Namespaces` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="4">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Icon name="zap" size="16" color="secondary" />
					<Text size="14" weight="600" color="primary">Namespaces</Text>
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
								<th><Text size="12" weight="600" color="tertiary" noWrap>Namespace</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Size</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="ns in namespaces">
								<td style="width: 1px">
									<Tooltip position="start">
										<Outline @click="handleCopy(ns.hash)" class="copyable">
											<Flex align="center" gap="8">
												<Icon name="block" size="14" color="tertiary" />

												<template v-if="ns.hash">
													<Text size="13" weight="700" color="secondary" mono>
														{{ ns.hash.slice(ns.hash.length - 6, ns.hash.length) }}
													</Text>
												</template>
												<template v-else>
													<Text size="13" weight="700" color="secondary" mono>Genesis</Text>
												</template>
											</Flex>
										</Outline>

										<template #content>
											{{ space(ns.hash) }}
										</template>
									</Tooltip>
								</td>
								<!-- <td>
									<NuxtLink :to="`/block/${ns.height}`">
										<Outline>
											<Flex align="center" gap="6">
												<Icon name="block" size="14" color="tertiary" />

												<Text size="13" weight="600" color="primary">{{ comma(ns.height) }}</Text>
											</Flex>
										</Outline>
									</NuxtLink>
								</td> -->
								<td>
									<Flex align="center" gap="6">
										<Text size="13" weight="600" color="primary">{{ formatBytes(ns.size) }}</Text>
										<Text size="13" weight="600" color="tertiary">({{ ns.pfb_count }})</Text>
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
	border-radius: 4px;
	background: var(--card-background);

	padding: 16px 16px 12px 16px;

	transition: all 0.2s ease;

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		& tbody {
			& tr {
				cursor: pointer;
			}
		}

		& tr th {
			text-align: left;
			padding: 0;
			padding-right: 16px;
			padding-bottom: 8px;

			& span {
				display: flex;
			}
		}

		& tr td {
			padding: 0;
			padding-right: 24px;
			padding-top: 6px;
			padding-bottom: 6px;

			white-space: nowrap;
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
