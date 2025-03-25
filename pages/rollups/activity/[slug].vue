<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** API */
import { fetchRollupBySlug, fetchRollupGithubReposBySlug, fetchRollupGithubSummaryBySlug } from "@/services/api/rollup"

/** UI */
import Button from "@/components/ui/Button.vue"
import LineChart from "@/components/modules/stats/LineChart.vue"

/** Services */
import { comma } from "@/services/utils"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

// Pagination
const limit = 10
const page = ref(1)
const pages = computed(() => Math.ceil(activitySummary.value?.repos / limit))
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}
const handleNext = () => {
	if (page.value === pages.value) return
	page.value += 1
}

// Fetch data
const rollup = ref()
const activitySummary = ref({})
const repos = ref([])
const data = [
    {
        "date": "2025-02-21T00:00:00.000Z",
        "value": 72125
    },
    {
        "date": "2025-02-22T00:00:00.000Z",
        "value": 73490
    },
    {
        "date": "2025-02-23T00:00:00.000Z",
        "value": 68515
    },
    {
        "date": "2025-02-24T00:00:00.000Z",
        "value": 72858
    },
    {
        "date": "2025-02-25T00:00:00.000Z",
        "value": 73825
    },
    {
        "date": "2025-02-26T00:00:00.000Z",
        "value": 75003
    },
    {
        "date": "2025-02-27T00:00:00.000Z",
        "value": 66946
    },
    {
        "date": "2025-02-28T00:00:00.000Z",
        "value": 71084
    },
    {
        "date": "2025-03-01T00:00:00.000Z",
        "value": 68139
    },
    {
        "date": "2025-03-02T00:00:00.000Z",
        "value": 67415
    },
    {
        "date": "2025-03-03T00:00:00.000Z",
        "value": 66403
    },
    {
        "date": "2025-03-04T00:00:00.000Z",
        "value": 69332
    },
    {
        "date": "2025-03-05T00:00:00.000Z",
        "value": 65414
    },
    {
        "date": "2025-03-06T00:00:00.000Z",
        "value": 67747
    },
    {
        "date": "2025-03-07T00:00:00.000Z",
        "value": 65392
    },
    {
        "date": "2025-03-08T00:00:00.000Z",
        "value": 57701
    },
    {
        "date": "2025-03-09T00:00:00.000Z",
        "value": 55457
    },
    {
        "date": "2025-03-10T00:00:00.000Z",
        "value": 69260
    },
    {
        "date": "2025-03-11T00:00:00.000Z",
        "value": 88441
    },
    {
        "date": "2025-03-12T00:00:00.000Z",
        "value": 67874
    },
    {
        "date": "2025-03-13T00:00:00.000Z",
        "value": 65886
    },
    {
        "date": "2025-03-14T00:00:00.000Z",
        "value": 63179
    },
    {
        "date": "2025-03-15T00:00:00.000Z",
        "value": 67614
    },
    {
        "date": "2025-03-16T00:00:00.000Z",
        "value": 68948
    },
    {
        "date": "2025-03-17T00:00:00.000Z",
        "value": 67885
    },
    {
        "date": "2025-03-18T00:00:00.000Z",
        "value": 70194
    },
    {
        "date": "2025-03-19T00:00:00.000Z",
        "value": 64429
    },
    {
        "date": "2025-03-20T00:00:00.000Z",
        "value": 63225
    },
    {
        "date": "2025-03-21T00:00:00.000Z",
        "value": 64367
    },
    {
        "date": "2025-03-22T00:00:00.000Z",
        "value": 63376
    },
    {
        "date": "2025-03-23T00:00:00.000Z",
        "value": 58402
    }
]

const getRollupRepos = async (slug) => {
	const data = await fetchRollupGithubReposBySlug({
		slug: slug,
		limit: limit,
		offset: (page.value - 1) * limit,
		// sort: sort.dir,
		// sort_by: sort.by,
	})
	
	return data
}
const fetchData = async () => {
	const slug = route.params.slug
	const [rollupData, summaryData, reposData] = await Promise.all([
		fetchRollupBySlug(slug),
		fetchRollupGithubSummaryBySlug(slug),
		getRollupRepos(slug),
	])

	if (!rollupData?.data?.value || !summaryData) {
		router.push("/rollups/activity")
	} else {
		rollup.value = rollupData.data.value
		activitySummary.value = summaryData
		repos.value = reposData
	}
}
await fetchData()

defineOgImage({
	title: "Rollup",
	rollup: rollup.value,
	component: "RollupImage",
	cacheKey: `${rollup.value?.name}`,
})

useHead({
	title: `Rollup ${rollup.value?.name} - Celestia Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://celenium.io${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
		},
		{
			property: "og:title",
			content: `Rollup ${rollup.value?.name} - Celestia Explorer`,
		},
		{
			property: "og:description",
			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
		},
		{
			property: "og:url",
			content: `https://celenium.io${route.path}`,
		},
		{
			property: "og:image",
			content: `https://celenium.io${route.path}__og_image__/og.png`,
		},
		{
			name: "twitter:title",
			content: `Rollup ${rollup.value?.name} - Celestia Explorer`,
		},
		{
			name: "twitter:description",
			content: `Rollup ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
		},
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
	],
})

watch(
	() => page.value,
	async () => {
		repos.value = await getRollupRepos(rollup.value.slug)
	},
)
</script>

<template>
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex v-if="rollup"  direction="column" gap="16">
			<Flex justify="between" :class="$style.breadcrumbs">
				<Breadcrumbs
					:items="[
						{ link: '/', name: 'Explore' },
						{ link: '/rollups', name: 'Rollups' },
						{ link: '/rollups/activity', name: 'Activity' },
						{ link: route.fullPath, name: rollup.name },
					]"
				/>

				<Button link="https://forms.gle/nimJyQJG4Lb4BTcG7" target="_blank" type="secondary" size="mini">
					<Icon name="rollup-plus" size="12" color="secondary" /> Register rollup
				</Button>
			</Flex>

			<Flex align="start" justify="between" gap="32">
				<Flex direction="column" gap="32" :class="$style.left">
					<Flex direction="column" gap="16">
						<Flex align="center" justify="between" gap="16" wide :class="$style.card">
							<Flex align="center" gap="16">
								<Flex v-if="rollup.logo" align="center" justify="center" :class="$style.avatar_container">
									<img :src="rollup.logo" :class="$style.avatar_image" />
								</Flex>
								<Flex direction="column" gap="8">
									<Text size="13" color="primary"> {{ rollup.name }} </Text>
									<Text size="12" color="tertiary"> {{ rollup.category }} </Text>
								</Flex>
							</Flex>

							<Button :link="`/rollup/${rollup.slug}`" target="_blank" type="secondary" size="mini">
								Explore more about {{ rollup.name }}
								<Icon name="arrow-narrow-up-right" size="12" color="secondary" />
							</Button>
						</Flex>

						<Flex align="center" justify="between" gap="16">
							<Flex direction="column" gap="16" :class="$style.card">
								<Text size="13" color="secondary"> Total Blobs </Text>
								<Flex align="center" gap="8">
									<Icon name="blob" size="18" color="secondary" />
									<Text size="18" weight="600" color="primary"> {{ comma(123321123) }} </Text>
								</Flex>
							</Flex>
							<Flex align="center" :class="$style.card" wide>
								<LineChart :series="{currentData: data}" />
								<Flex direction="column" gap="16" :class="$style.card" wide>
									<Text size="13" color="secondary"> Total Commits  </Text>
									<Flex align="center" gap="6">
										<Icon name="commit" size="18" color="secondary" />
										<Text size="18" weight="600" color="primary"> {{ comma(123321123) }} </Text>
									</Flex>
								</Flex>
							</Flex>
						</Flex>

						<Flex wide direction="column" gap="4">
							<Flex justify="between" :class="$style.header">
								<Flex align="center" gap="8">
									<Icon name="github" size="16" color="secondary" />
									<Text size="14" weight="600" color="primary"> {{ `Repositories - ${activitySummary.repos}` }} </Text>
								</Flex>

								<Flex align="center" gap="6">
									<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
										<Icon name="arrow-left-stop" size="12" color="primary" />
									</Button>
									<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
										<Icon name="arrow-left" size="12" color="primary" />
									</Button>

									<Button type="secondary" size="mini" disabled>
										<Text size="12" weight="600" color="primary">Page {{ page }} </Text>
									</Button>

									<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
										<Icon name="arrow-right" size="12" color="primary" />
									</Button>
								</Flex>
							</Flex>

							<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
								<div :class="$style.table_scroller">
									<table>
										<thead>
											<tr>
												<th><Text size="12" weight="600" color="tertiary" noWrap>Repository</Text></th>
												<th><Text size="12" weight="600" color="tertiary" noWrap>Stars</Text></th>
												<th><Text size="12" weight="600" color="tertiary" noWrap>Commits</Text></th>
												<th><Text size="12" weight="600" color="tertiary" noWrap>Latest Push</Text></th>
											</tr>
										</thead>

										<tbody>
											<tr v-for="r in repos">
												<td>
													<NuxtLink :to="r.url" target="_blank">
														<Flex align="start" justify="center" direction="column" gap="4">
															<Text size="13" weight="600" color="primary"> {{ r.name }} </Text>

															<Text size="12" weight="600" color="tertiary"> {{ r.description || 'No description' }} </Text>
														</Flex>
													</NuxtLink>
												</td>
												<td>
													<NuxtLink :to="r.url" target="_blank">
														<Flex align="center">
															<Text size="13" weight="600" color="primary"> {{ comma(r.stargazers) }} </Text>
														</Flex>
													</NuxtLink>
												</td>
												<td>
													<NuxtLink :to="r.url" target="_blank">
														<Flex align="start" justify="center" direction="column" gap="4">
															<Text size="13" weight="600" color="primary"> {{ comma(r.commits) }} </Text>

															<Text size="12" weight="600" color="tertiary"> {{ `+${comma(r.commits)}` }} </Text>
														</Flex>
													</NuxtLink>
												</td>
												<td>
													<NuxtLink :to="r.url" target="_blank">
														<Flex align="center" gap="4">
															<Icon name="clock-forward-2" size="13" color="secondary" />
															<Text size="13" weight="600" color="primary">
																{{ DateTime.fromISO(r.last_pushed_at).toRelative({ locale: "en", style: "short" }) }}
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
				</Flex>

				<Flex direction="column" gap="32" :class="$style.right" wide>
					<Flex direction="column" gap="16" :class="$style.card">
						<Text size="12" color="secondary" weight="600"> Activity Rank </Text>
						<Icon name="laurel" size="24" color="legendary" />
						<Flex direction="column" gap="8">
							<Text size="14" weight="600" :class="$style.summary_rate"> 10 Excelent </Text>
							<Text size="13" color="tertiary"> 99.16% </Text>
						</Flex>

						<Text size="13" color="primary" weight="600" :style="{ lineHeight: '1.4' }">
							{{ rollup.name }}
							<Text color="secondary">shows the</Text>
							<Text color="legendary"> excelent </Text>
							<Text color="secondary">commit rate,</Text>
							<Text color="legendary"> excelent </Text>
							<Text color="secondary">blob sending rate and</Text>
							<Text color="epic"> good </Text>
							<Text color="secondary">last commit period.</Text>
						</Text>

						<div :class="$style.divider" />

						<Flex align="center" justify="between" gap="2" wide>
							<Flex align="center" gap="4">
								<Icon name="clock-forward-2" size="12" color="secondary" />
								<Text size="12" color="tertiary">
									Updated
									<Text color="secondary" weight="600"> 3 </Text>
									days ago.
								</Text>
							</Flex>

							<Flex align="center" gap="4">
								<Icon name="info" size="12" color="blue" />
								<Text size="12" color="secondary" weight="600">How it works?</Text>
							</Flex>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 60px 24px;
}

.left {
	min-width: 650px;
	max-width: 650px;
}

.right {
	min-width: 300px;
	max-width: 300px;
}

.card {
	border-radius: 6px;
	background: var(--card-background);

	padding: 16px;
}

.avatar_container {
	position: relative;
	width: 36px;
	height: 36px;
	overflow: hidden;
	border-radius: 20%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.disabled {
	opacity: 0.5;
	pointer-events: none;
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
	border-radius: 4px 4px 4px 4px;
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
				padding: 0 24px 0 16px;
				width: 300px;
				
				span {
					&:last-child {
						width: 300px;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}
			}

			& > a {
				display: flex;

				min-height: 44px;

				/* padding-right: 24px; */
			}
		}
	}
}

.summary_rate {
	background-image: linear-gradient(var(--light-orange), var(--legendary));
    color: transparent;
    background-clip: text;
}
.divider {
	width: 100%;
	height: 2px;

	background: var(--op-5);
	border-radius: 50px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
