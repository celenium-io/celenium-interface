<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"

/** API */
import { fetchRollupBySlug, fetchRollupOrgBySlug, fetchRollupOrgCommitsBySlug, fetchRollupOrgReposBySlug, fetchRollupRankingBySlug } from "@/services/api/rollup"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma, isMainnet, roundTo, sortArrayOfObjects } from "@/services/utils"
import { getMetricCategory, getRankCategory } from "@/services/constants/rollups"
import { rollupRankingServiceURL } from "@/services/config"

/** Stores */
import { useCacheStore } from "@/store/cache.store"
import { useModalsStore } from "@/store/modals.store"
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

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
const isRefetching = ref(false)
const org = ref({})
const rollup = ref({})
const repos = ref([])
const commits = ref([])
const totalCommits = computed(() => commits.value?.reduce((acc, c) => acc + c.amount, 0))

if (!(isMainnet() && !!rollupRankingServiceURL())) {
	router.push("/")
} else {
	await fetchData()
}

function getMetricDescription(metric) {
	switch (metric) {
		case "blobs":
			return "blob sending rate"
		case "commits":
			return "commit rate"
		case "last_msg":
			return "last message period"
		case "last_push":
			return "last commit period"
		case "mb_price":
			return "MB price rate"
		case "tvl":
			return "TVL rate"
		default:
			return ""
	}
}
const chartEl = ref(null)

async function getRollupRepos(slug) {
	const data = await fetchRollupOrgReposBySlug({
		slug: slug,
		limit: limit,
		offset: (page.value - 1) * limit,
	})

	return data
}
async function fetchData() {
	isRefetching.value = true

	const slug = route.params.slug
	const [rollupData, summaryData, reposData, commitsData, rankData] = await Promise.all([
		fetchRollupBySlug(slug),
		fetchRollupOrgBySlug(slug),
		getRollupRepos(slug),
		fetchRollupOrgCommitsBySlug({ slug }),
		fetchRollupRankingBySlug(slug),
	])

	if (!rollupData?.data?.value) {
		throw createError({ statusCode: 404, statusMessage: `Network ${slug} not found` })
	}

	let description = []
	for (const [key, value] of Object.entries(rankData?.scores)) {
		const category = getMetricCategory(key, value)

		if (category.name.toLowerCase() === "offline") continue

		description.push({
			text: getMetricDescription(key),
			category,
		})
	}

	if (description.length) {
		description = sortArrayOfObjects(description, "category.rank", false).slice(0, Math.min(3, description.length))
		if (description[2]?.text) {
			description[0].text += ", "
			description[1].text += " and "
			description[2].text += "."
		} else if (description[1]?.text) {
			description[0].text += " and "
			description[1].text += "."
		} else {
			description[0].text += "."
		}
	}

	const minutes = DateTime.now().minute

	org.value = summaryData
	rollup.value = {
		...rollupData?.data?.value,
		ranking: {
			...rankData,
			description,
			category: getRankCategory(roundTo(rankData.rank / 10, 0)),
			updated: minutes ? minutes : 1,
		}
	}
	repos.value = reposData
	commits.value = commitsData

	isRefetching.value = false
}

defineOgImageComponent("RollupImage", {
	title: "Network",
	rollup: rollup.value,
	cacheKey: `${rollup.value?.name}`,
})

useHead({
	title: `Network ${rollup.value?.name} - Celenium`,
	link: [
		{
			rel: "canonical",
			href: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Network ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
		},
		{
			property: "og:title",
			content: `Network ${rollup.value?.name} - Celenium`,
		},
		{
			property: "og:description",
			content: `Network ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
		},
		{
			property: "og:url",
			content: `${useRequestURL().origin}${useRequestURL().pathname}`,
		},
		{
			name: "twitter:title",
			content: `Network ${rollup.value?.name} - Celenium`,
		},
		{
			name: "twitter:description",
			content: `Network ${rollup.value?.name} blobs, namespaces, metadata, social links, contacts and other data.`,
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

	const MAX_VALUE = d3.max(data?.map((d) => d.amount))

	/** Scales */
	const x = d3.scaleUtc(
		d3.extent(data, (d) => new Date(d.time)),
		[0, width],
	)
	const y = d3.scaleLinear([0, MAX_VALUE], [height - margin.bottom, margin.top])

	const line = d3
		.line()
		.x((d) => x(new Date(d.time)))
		.y((d) => y(d.amount))
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
	const cPath = svg
		.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--brand)")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(data))

	if (chart.children[0]) chart.children[0].remove()
	chart.append(svg.node())

	const cTotalLength = cPath.node().getTotalLength()

	cPath
		.attr("stroke-dasharray", `${cTotalLength} ${cTotalLength}`)
		.attr("stroke-dashoffset", cTotalLength)
		.transition()
		.duration(1_000)
		.ease(d3.easeLinear)
		.attr("stroke-dashoffset", 0)
}

const handleHowItWorksClick = () => {
	cacheStore.selectedRollup = rollup.value
	modalsStore.open("rollupRank")
}

watch(
	() => page.value,
	async () => {
		repos.value = await getRollupRepos(rollup.value?.slug)
	},
)

onMounted(() => {
	if (chartEl.value && commits.value?.length) {
		buildChart(chartEl.value?.wrapper, commits.value.reverse())
	}
})
</script>

<template>
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex v-if="rollup" direction="column" gap="16">
			<Flex justify="between" :class="$style.breadcrumbs">
				<Breadcrumbs
					:items="[
						{ link: '/', name: 'Explore' },
						{ link: '/networks', name: 'Networks Leaderboard' },
						{ link: route.fullPath, name: rollup.name },
					]"
				/>

				<Button link="https://forms.gle/nimJyQJG4Lb4BTcG7" target="_blank" type="secondary" size="mini">
					<Icon name="rollup-plus" size="12" color="secondary" /> Register network
				</Button>
			</Flex>

			<Flex align="start" justify="between" gap="32" :class="$style.area">
				<Flex direction="column" gap="32" :class="$style.left">
					<Flex direction="column" gap="16">
						<Flex align="start" justify="between" gap="16" wide :class="$style.card">
							<Flex gap="16">
								<Flex v-if="rollup.logo" :class="$style.avatar_container">
									<img :src="rollup.logo" :class="$style.avatar_image" />
								</Flex>
								<Flex direction="column" gap="8">
									<Text size="13" color="primary"> {{ rollup?.name }} </Text>
									<Text size="12" color="tertiary" :style="{ lineHeight: '1.2' }">
										{{ org?.description || rollup?.description }}
									</Text>
								</Flex>
							</Flex>

							<Button :link="`/network/${rollup.slug}`" type="secondary" size="mini">
								More about {{ rollup.name }}
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
									<Text size="13" color="secondary"> Total Commits </Text>
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
									<Text size="14" weight="600" color="primary"> {{ `Repositories - ${org?.repos || 0}` }} </Text>
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

									<Button
										@click="handleNext"
										type="secondary"
										size="mini"
										:disabled="page === pages || repos?.length === 0"
									>
										<Icon name="arrow-right" size="12" color="primary" />
									</Button>
								</Flex>
							</Flex>

							<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
								<div v-if="repos?.length" :class="$style.table_scroller">
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

															<Text size="12" weight="600" color="tertiary" :class="$style.description">
																{{ r.description || "No description" }}
															</Text>
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

																<Text v-if="r.commits_weekly" size="12" weight="600" color="tertiary">
																	{{ `+${comma(r.commits_weekly)}` }}
																</Text>
															</Flex>

															<template #content>
																<Text size="12" weight="600" color="secondary">
																	{{ comma(r.commits_weekly) }}
																</Text>
																<Text size="12" color="secondary">
																	{{
																		`${
																			r.commits_weekly === 1 ? " commit" : " commits"
																		} in the last week`
																	}}
																</Text>
															</template>
														</Tooltip>
													</NuxtLink>
												</td>
												<td>
													<NuxtLink :to="r.url" target="_blank">
														<Flex align="center" gap="4">
															<Icon name="clock-forward-2" size="13" color="secondary" />
															<Text size="13" weight="600" color="primary">
																{{
																	DateTime.fromISO(r.last_pushed_at).toRelative({
																		locale: "en",
																		style: "short",
																	})
																}}
															</Text>
														</Flex>
													</NuxtLink>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
									<Text size="13" weight="600" color="secondary" align="center"> No repositories found </Text>
									<Text size="12" weight="500" height="160" color="tertiary" align="center">
										This network probably doesn't have an associated github account
									</Text>
								</Flex>
							</Flex>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" gap="32" :class="$style.right" wide>
					<Flex v-if="rollup?.ranking?.category?.name" direction="column" gap="12" :class="$style.card">
						<Text size="12" color="secondary" weight="600"> Activity Rank </Text>
						<Flex direction="column" gap="12" :class="$style.rank_description">
							<Flex direction="column" gap="12" :style="{ flex: 1 }">
								<Icon name="laurel" size="32" :color="rollup?.ranking?.category?.color" />
								<Flex direction="column" gap="6">
									<Text
										size="16"
										weight="600"
										:class="[$style.summary_rate, $style[rollup?.ranking?.category?.name?.toLowerCase()]]"
										:style="{ textWrap: 'nowrap' }"
									>
										{{
											`${roundTo(rollup?.ranking?.rank / 10, 0)} ${
												rollup?.ranking?.category?.name
											}`
										}}
									</Text>
									<Text size="12" color="tertiary"> {{ rollup?.ranking?.rank }}% </Text>
								</Flex>
							</Flex>

							<Text
								v-if="rollup?.ranking?.description?.length"
								size="13"
								color="primary"
								weight="600"
								:style="{ lineHeight: '1.4' }"
							>
								{{ rollup.name }}
								<Text weight="500" color="secondary">shows the </Text>
								<span v-for="d in rollup?.ranking?.description">
									<Text :class="[$style.summary_rate, $style[d.category.name.toLowerCase()]]">
										{{ d.category.name.toLowerCase() + " " }}
									</Text>
									<Text weight="500" color="secondary"> {{ d.text }} </Text>
								</span>
							</Text>
							<Text v-else size="13" color="primary" weight="600" :style="{ lineHeight: '1.4' }">
								{{ rollup.name }}
								<Text weight="500" color="secondary"> is possible offline. </Text>
							</Text>
						</Flex>
						<div :class="$style.divider" />

						<Flex align="center" justify="between" gap="2" wide>
							<Flex align="center" gap="4">
								<Icon name="clock-forward-2" size="12" color="secondary" />
								<Text size="12" color="tertiary">
									Updated
									<Text color="secondary" weight="600">
										{{ `${rollup?.ranking?.updated} min. ago` }}
									</Text>
								</Text>
							</Flex>

							<Flex @click="handleHowItWorksClick" align="center" gap="4" :class="$style.how_it_works">
								<Icon name="info" size="12" color="blue" />
								<Text size="12" color="secondary" weight="600">How it works?</Text>
							</Flex>
						</Flex>
					</Flex>
					<Flex v-else direction="column" gap="12" :class="$style.card" :style="{ height: '220px' }">
						<Text size="12" color="secondary" weight="600"> Activity Rank </Text>
						<Icon name="laurel" size="32" color="tertiary" loading />
						<Flex direction="column" gap="6" :style="{ flex: 1 }">
							<Skeleton w="60" h="12" :style="{ marginTop: '4px' }" />
							<Skeleton w="80" h="10" :style="{ marginTop: '4px' }" />

							<Flex align="center" justify="center" direction="column" gap="8" :style="{ marginTop: '12px' }">
								<Flex align="center" gap="12">
									<Skeleton w="100" h="6" />
									<Skeleton w="80" h="6" />
									<Skeleton w="60" h="6" />
								</Flex>

								<Flex align="center" gap="12">
									<Skeleton w="80" h="6" />
									<Skeleton w="60" h="6" />
									<Skeleton w="100" h="6" />
								</Flex>
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
				/* width: 300px; */

				/* span {
					&:last-child {
						width: 300px;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				} */
			}

			& > a {
				display: flex;

				min-height: 44px;

				/* padding-right: 24px; */
			}
		}
	}
}

.description {
	width: 300px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.empty {
	padding: 16px 0;
}

.summary_rate {
	color: transparent;
	background-clip: text;
}
.legendary {
	background-image: linear-gradient(var(--light-orange), var(--legendary));
}
.epic {
	background-image: linear-gradient(var(--purple), var(--epic));
}
.good {
	background-image: linear-gradient(var(--blue), var(--rare));
}
.normal {
	background-image: linear-gradient(var(--txt-primary), var(--txt-tertiary));
}
.offline {
	background-image: linear-gradient(var(--txt-tertiary), var(--txt-tertiary));
}

.laurel_loading {
	animation: skeleton 1s ease infinite;
	background: var(--op-10);
}

@keyframes skeleton {
	0% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}

	100% {
		opacity: 1;
	}
}

.divider {
	width: 100%;
	height: 2px;

	background: var(--op-5);
	border-radius: 50px;
}

.how_it_works {
	cursor: pointer;

	&:hover * {
		color: var(--txt-primary);
	}
}

@media (max-width: 1000px) {
	.area {
		flex-direction: column-reverse;
	}

	.left {
		min-width: initial;
		max-width: initial;
	}

	.right {
		min-width: initial;
		max-width: initial;
	}

	.rank_description {
		flex-direction: row;
		gap: 48px;
	}
}

@media (max-width: 600px) {
	.description {
		max-width: 200px;
	}
}
@media (max-width: 540px) {
	.description {
		max-width: 180px;
	}
}
@media (max-width: 500px) {
	.description {
		max-width: 160px;
	}
}
</style>
