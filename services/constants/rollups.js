/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { roundTo } from "@/services/utils"

export const rankCoefficients = {
	day_blobs_count: 0.2,
	avg_pfb_size: 0.3,
	last_message_time: 0.3,
	commits_weekly: 0.2,
	last_pushed_at: 0.2,
}

export const rankCategories = [
	{ min: 10, max: 10, name: "Legendary", color: "legendary" },
	{ min: 9, max: 9, name: "Epic", color: "epic" },
	{ min: 7, max: 8, name: "Good", color: "rare" },
	{ min: 4, max: 6, name: "Poor", color: "primary" },
	{ min: 0, max: 3, name: "Bad", color: "tertiary" },
]

export const getRankCategory = (rank) => {
	const category = rankCategories.find(({ min, max }) => rank >= min && rank <= max) || { name: "Unknown", color: "tertiary" }

	return { name: category.name, color: category.color }
}

export const getMetricCategory = (metric, score) => {
	const metricValue = rankCoefficients[metric]
	let rank = roundTo(score / metricValue * 10, 0)

	return {...getRankCategory(rank), rank: score / metricValue}
}

export const lastActivityCategories = [
	{ min: 0, max: 1, color: "brand" },
	{ min: 2, max: 11, color: "light-orange" },
	{ min: 12, max: 23, color: "red" },
	{ min: 24, max: Infinity, color: "tertiary" },
]

export const getLastActivityCategory = (date) => {
	const diff = roundTo(DateTime.now().diff(date, "hours").hours, 0, "floor")

	return lastActivityCategories.find(({ min, max }) => diff >= min && diff <= max).color
}
