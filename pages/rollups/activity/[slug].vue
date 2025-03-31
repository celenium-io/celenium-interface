<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** API */
import { fetchRollupOrgBySlug, fetchRollupOrgCommitsBySlug, fetchRollupOrgReposBySlug } from "@/services/api/rollup"

/** UI */
import Button from "@/components/ui/Button.vue"
import LineChart from "@/components/modules/stats/LineChart.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

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
const pages = computed(() => Math.ceil(org.value?.repos / limit))
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}
const handleNext = () => {
	if (page.value === pages.value) return
	page.value += 1
}

// Fetch data
const org = ref({})
const rollup = ref({})
const repos = ref([])
const commits = ref([])
const totalCommits = computed(() => commits.value.reduce((acc, c) => acc + c.amount, 0))
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
const chartEl = ref(null)

const getRollupRepos = async (slug) => {
	const data = await fetchRollupOrgReposBySlug({
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
	const [summaryData, reposData, commitsData] = await Promise.all([
		fetchRollupOrgBySlug(slug),
		getRollupRepos(slug),
		fetchRollupOrgCommitsBySlug({ slug }),
	])

	if (!summaryData) {
		router.push("/rollups/activity")
	} else {
		org.value = summaryData		
		rollup.value = summaryData.rollup
		repos.value = reposData
		commits.value = commitsData
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

const buildChart = (chart, data) => {
	const { width, height } = chart.getBoundingClientRect()
	const margin = { top: 4, bottom: 4 }

	const MAX_VALUE = d3.max(data?.map(d => d.amount))
	
	/** Scales */
	const x = d3.scaleUtc(
		d3.extent(data, (d => new Date(d.time))),
		[0, width],
	)
	const y = d3.scaleLinear([0, MAX_VALUE], [height - margin.bottom, margin.top])

	const line = d3
		.line()
		.x(d => x(new Date(d.time)))
		.y(d => y(d.amount))
		.curve(d3.curveCatmullRom)

	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;")
		.attr("id", "chart")
		.style("-webkit-tap-highlight-color", "transparent")

	/** Chart Lines */
	const cPath = svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--brand)")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(data))

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())

	const cTotalLength = cPath.node().getTotalLength();

	cPath.attr("stroke-dasharray", `${cTotalLength} ${cTotalLength}`)
		.attr("stroke-dashoffset", cTotalLength)
		.transition()
		.duration(1_000)
		.ease(d3.easeLinear)
		.attr("stroke-dashoffset", 0);
}

watch(
	() => page.value,
	async () => {
		repos.value = await getRollupRepos(rollup.value.slug)
	},
)

onMounted(() => {
	if (chartEl.value) {
		buildChart(chartEl.value?.wrapper, commits.value.reverse())
	}
})
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
						<Flex align="start" justify="between" gap="16" wide :class="$style.card">
							<Flex gap="16">
								<Flex v-if="rollup.logo" :class="$style.avatar_container">
									<img :src="rollup.logo" :class="$style.avatar_image" />
								</Flex>
								<Flex direction="column" gap="8">
									<Text size="13" color="primary"> {{ rollup.name }} </Text>
									<Text size="12" color="tertiary"> {{ org.description }} </Text>
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
									<Text size="18" weight="600" color="primary"> {{ comma(rollup.blobs_count) }} </Text>
								</Flex>
							</Flex>
							<Flex align="center" gap="12" :class="$style.card" wide>
								<Flex direction="column" gap="16" :class="$style.overlay">
									<Text size="13" color="secondary"> Total Commits  </Text>
									<Flex align="center" gap="6">
										<Icon name="commit" size="18" color="secondary" />
										<Text size="18" weight="600" color="primary"> {{ comma(totalCommits) }} </Text>
									</Flex>
								</Flex>
								<Flex ref="chartEl" :class="$style.chart" wide />
							</Flex>
						</Flex>

						<Flex wide direction="column" gap="4">
							<Flex justify="between" :class="$style.header">
								<Flex align="center" gap="8">
									<Icon name="github" size="16" color="secondary" />
									<Text size="14" weight="600" color="primary"> {{ `Repositories - ${org.repos}` }} </Text>
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
														<Tooltip side="top">
															<Flex align="start" justify="center" direction="column" gap="4">
																<Text size="13" weight="600" color="primary"> {{ comma(r.commits) }} </Text>

																<Text v-if="r.commits_weekly" size="12" weight="600" color="tertiary"> {{ `+${comma(r.commits_weekly)}` }} </Text>
															</Flex>

															<template #content>
																<Text size="12" weight="600" color="secondary"> {{ comma(r.commits_weekly) }} </Text>
																<Text size="12" color="secondary"> {{ `${r.commits_weekly === 1 ? ' commit' : ' commits'} in the last week` }} </Text>
															</template>
														</Tooltip>
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
					<Flex direction="column" gap="12" :class="$style.card">
						<Text size="12" color="secondary" weight="600"> Activity Rank </Text>
						<Icon name="laurel" size="32" color="legendary" />
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
	position: relative;
	border-radius: 6px;
	background: var(--card-background);
	padding: 16px;
}

.avatar_container {
	position: relative;
	width: 36px;
	min-width: 36px;
	height: 36px;
	min-height: 36px;
	overflow: hidden;
	border-radius: 20%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.overlay {
	position: absolute;
	top: -2;
	left: 0;
	width: 50%;
	min-height: 79px;
	height: 100%;
	border-radius: 6px;
	background: linear-gradient(to right, var(--card-background), transparent);
	padding: 16px;
	z-index: 2;
}

.chart {
	position: absolute;
	top: 0;
	left: 0;
	position: relative;
	flex: 1;
	min-height: 47px;
	width: 100%;
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
