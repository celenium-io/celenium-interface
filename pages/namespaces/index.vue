<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { space, formatBytes, comma, getNamespaceID } from "@/services/utils"

/** API */
import { fetchNamespaces, fetchNamespacesCount } from "@/services/api/namespace"

useHead({
	title: "Namespaces - Celestia Explorer",
	link: [
		{
			rel: "canonical",
			href: "https://celenium.io/namespaces",
		},
	],
	meta: [
		{
			name: "description",
			content: "Namespaces in the Celestia Blockchain. Namespace ID, size, version, pay for blobs are shown.",
		},
		{
			property: "og:title",
			content: "Namespaces - Celestia Explorer",
		},
		{
			property: "og:description",
			content: "Namespaces in the Celestia Blockchain. Namespace ID, size, version, pay for blobs are shown.",
		},
		{
			property: "og:url",
			content: `https://celenium.io/namespaces`,
		},
		{
			property: "og:image",
			content: "/img/seo/namespaces.png",
		},
		{
			name: "twitter:title",
			content: "Namespaces - Celestia Explorer",
		},
		{
			name: "twitter:description",
			content: "Namespaces in the Celestia Blockchain. Namespace ID, size, version, pay for blobs are shown.",
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:image",
			content: "https://celenium.io/img/seo/namespaces.png",
		},
	],
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const namespaces = ref([])
const count = ref(0)

const getNamespacesCount = async () => {
	const { data: namespacesCount } = await fetchNamespacesCount()
	count.value = namespacesCount.value
}

await getNamespacesCount()

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.ceil(count.value / 20))

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

/** Refetch namespaces */
watch(
	() => page.value,
	async () => {
		getNamespaces()

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
	await getNamespacesCount()

	page.value = pages.value
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
					<Icon name="blob" size="16" color="secondary" />
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
					<Button @click="handleLast" type="secondary" size="mini" :disabled="page === pages"> Last </Button>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Namespace</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Last Time</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Last Block</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Alias</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Size</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Version</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Pay For Blobs</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="ns in namespaces" @click="router.push(`/namespace/${ns.namespace_id}`)">
								<td style="width: 1px">
									<Tooltip position="start">
										<Flex align="center" gap="6">
											<Icon name="folder" size="14" color="secondary" />

											<template v-if="ns.hash">
												<Flex v-if="getNamespaceID(ns.namespace_id).length > 8" align="center" gap="8">
													<Text size="13" weight="600" color="primary" mono>
														{{ getNamespaceID(ns.namespace_id).slice(0, 4) }}
													</Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" class="dot" />
													</Flex>

													<Text size="13" weight="600" color="primary" mono>
														{{ getNamespaceID(ns.namespace_id).slice(-4) }}
													</Text>

													<CopyButton :text="getNamespaceID(ns.namespace_id)" />
												</Flex>

												<Flex v-else align="center" gap="8">
													<Text size="13" weight="600" color="primary" mono>
														{{ space(getNamespaceID(ns.namespace_id)) }}
													</Text>

													<CopyButton :text="getNamespaceID(ns.namespace_id)" />
												</Flex>
											</template>
											<template v-else>
												<Text size="13" weight="700" color="secondary" mono>Genesis</Text>
											</template>
										</Flex>

										<template #content>
											{{ space(getNamespaceID(ns.namespace_id)) }}
										</template>
									</Tooltip>
								</td>
								<td>
									<Flex direction="column" gap="4">
										<Text size="12" weight="600" color="primary">
											{{ DateTime.fromISO(ns.last_message_time).toRelative({ locale: "en", style: "short" }) }}
										</Text>
										<Text size="12" weight="500" color="tertiary">
											{{ DateTime.fromISO(ns.last_message_time).setLocale("en").toFormat("LLL d, t") }}
										</Text>
									</Flex>
								</td>
								<td>
									<Outline @click.stop="router.push(`/block/${ns.last_height}`)">
										<Flex align="center" gap="6">
											<Icon name="block" size="14" color="secondary" />

											<Text size="13" weight="600" color="primary" tabular>{{ comma(ns.last_height) }}</Text>
										</Flex>
									</Outline>
								</td>
								<td>
									<Text v-if="getNamespaceID(ns.namespace_id) !== ns.name" size="13" weight="600" color="primary">
										{{ ns.name }}
									</Text>
									<Text v-else size="13" weight="600" color="tertiary">Unknown</Text>
								</td>
								<td>
									<Text size="13" weight="600" color="primary">{{ formatBytes(ns.size) }}</Text>
								</td>
								<td>
									<Text size="13" weight="600" color="primary">{{ ns.version }}</Text>
								</td>
								<td>
									<Flex>
										<Text size="13" weight="600" color="primary">{{ comma(ns.pfb_count) }}</Text>
									</Flex>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Flex>

			<Flex align="center" :class="$style.footer">
				<Button link="/namespaces/treemap" type="secondary" size="mini">
					<Icon name="treemap" size="12" color="secondary" /> Open Treemap View
				</Button>
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

.footer {
	height: 46px;

	border-radius: 4px 4px 8px 8px;
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
			padding-top: 8px;
			padding-bottom: 8px;

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
