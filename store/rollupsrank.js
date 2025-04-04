/** Vendor */
import { defineStore, acceptHMRUpdate } from "pinia"
import { DateTime } from "luxon"

/** Services */
import { capitalizeAndReplace, roundTo, sortArrayOfObjects } from "@/services/utils"

/** API */
import { fetchRollupOrgs, fetchRollupOrgsState, fetchRollupOrgReposBySlug, fetchRollups, fetchRollupsDailyStats } from "@/services/api/rollup"

export const useRollupsRankingStore = defineStore("rollups_ranking", () => {
	const rollups_ranking = ref({
		ranking: {},
		top_rollup: {},
		last_update: 1743264808,
	})
	const rollupsRanking = ref({})
	const initialized = ref(false)

	const init = async () => {
		const savedRanking = JSON.parse(localStorage.getItem("rollups_ranking"))
		if (DateTime.now().diff(DateTime.fromMillis(savedRanking?.last_update || rollups_ranking.value.last_update), "hours").hours < 1) {
			rollups_ranking.value = savedRanking
			initialized.value = true
			return
		}
		
		const limit = 100
		const params = { limit }
		const [rollupsData, orgsData, dailyStatsData, orgsState] = await Promise.all([
			fetchRollups(params),
			fetchRollupOrgs(params),
			fetchRollupsDailyStats(params),
			fetchRollupOrgsState(params)
		])
		let maxDailyBlobsCount = 0
		let maxAvgPfbSize = 0
		let maxWeeklyCommits = 0
		rollupsRanking.value = dailyStatsData.reduce((acc, ds) => {
			let avg_pfb_size = ds.avg_size * ds.blobs_per_pfb
			maxAvgPfbSize = Math.max(maxAvgPfbSize, avg_pfb_size)
			maxDailyBlobsCount = Math.max(maxDailyBlobsCount, ds.blobs_count)
			acc[ds.slug] = {
				day_blobs_count: ds.blobs_count,
				avg_pfb_size: avg_pfb_size,
				pfb_hour_count: Math.round(ds.pfb_count / 24),
			}
			return acc
		}, {})

		for (const od of orgsData) {
			let slug = od.rollup?.slug
			if (!slug) continue

			let repos = await fetchRollupOrgReposBySlug({ slug, limit })
			repos = sortArrayOfObjects(repos, "last_pushed_at", false)
			const summCommits = repos.reduce((acc, r) => acc + r.commits_weekly, 0)
			maxWeeklyCommits = Math.max(maxWeeklyCommits, summCommits)
			if (!rollupsRanking.value[slug]) {
				rollupsRanking.value[slug] = {}
			}
			rollupsRanking.value[slug].last_pushed_at = repos[0]?.last_pushed_at
			rollupsRanking.value[slug].commits_weekly = summCommits
		}

		rollupsData.forEach(r => {
			let slug = r.slug
			if (!rollupsRanking.value[slug]) {
				rollupsRanking.value[slug] = {}
			}
			rollupsRanking.value[slug].last_message_time = r.last_message_time

		})
		
		const quantitative = (value, maxValue) => {
			return Math.min(value / maxValue, 1)
		}
		const timeBased = (maxTime, lastTime, t, timeframe) => {
			const diff = maxTime.diff(lastTime, timeframe)[timeframe]
			return Math.exp(-( diff / t ))
		}
		const coefficients = {
			day_blobs_count: 0.2,
			avg_pfb_size: 0.3,
			last_message_time: 0.3,
			commits_weekly: 0.2,
			last_pushed_at: 0.2,
		}
		const calculateRanking = (r) => {
			let ranking = {
				rank: 0,
				day_blobs_count: 0,
				avg_pfb_size: 0,
				last_message_time: 0,
				commits_weekly: 0,
				last_pushed_at: 0,
			}
			if (r.commits_weekly) {
				ranking.commits_weekly = roundTo(quantitative(r.commits_weekly, maxWeeklyCommits) * coefficients.commits_weekly * 100)
			}
			if (r.day_blobs_count) {
				ranking.day_blobs_count = roundTo(quantitative(r.day_blobs_count, maxDailyBlobsCount) * coefficients.day_blobs_count * 100)
			}
			if (r.avg_pfb_size) {
				ranking.avg_pfb_size = roundTo(quantitative(r.avg_pfb_size, maxAvgPfbSize) * coefficients.avg_pfb_size * 100)
			}
			if (r.last_message_time) {
				ranking.last_message_time = roundTo(timeBased(DateTime.now(), DateTime.fromISO(r.last_message_time), 12, "hours")  * coefficients.last_message_time * 100)
			}
			if (r.last_pushed_at) {
				ranking.last_pushed_at = roundTo(timeBased(DateTime.fromISO(orgsState), DateTime.fromISO(r.last_pushed_at), 4, "weeks")  * coefficients.last_pushed_at * 100)
			}

			ranking.rank = roundTo(Object.values(ranking).reduce((acc, val) => acc + val, 0))
			return ranking
		}

		Object.keys(rollupsRanking.value).forEach(r => {
			rollupsRanking.value[r].ranking = calculateRanking(rollupsRanking.value[r])
		})

		const maxRankEntry = Object.entries(rollupsRanking.value).reduce((maxEntry, [key, value]) => {
			return value.ranking.rank > maxEntry.rank ? { slug: key, rank: value.ranking.rank } : maxEntry
		}, { slug: null, rank: 0 })

		rollups_ranking.value = {
			ranking: rollupsRanking.value,
			top_rollup: {
				name: capitalizeAndReplace(maxRankEntry.slug, "-"),
				rank: maxRankEntry.rank
			},
			last_update: DateTime.now().ts,
		}

		initialized.value = true
	}

	return { initialized, rollups_ranking, init }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useRollupsRankingStore, import.meta.hot))
}
