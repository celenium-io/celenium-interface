/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { roundTo } from "@/services/utils"

export const rankCoefficients = {
	blobs: 0.2,
	commits: 0.05,
	last_msg: 0.2,
	last_push: 0.05,
	mb_price: 0.2,
	tvl: 0.3,
}

export const rankCategories = [
	{ min: 9, max: 10, name: "Legendary", color: "legendary" },
	{ min: 6, max: 8, name: "Epic", color: "epic" },
	{ min: 3, max: 5, name: "Good", color: "rare" },
	{ min: 1, max: 2, name: "Normal", color: "primary" },
	{ min: 0, max: 1, name: "Offline", color: "tertiary" },
]

export const getRankCategory = (rank) => {
	const category = rankCategories.find(({ min, max }) => rank >= min && rank <= max) || { name: "Unknown", color: "tertiary" }

	return { name: category.name, color: category.color }
}

export const getMetricCategory = (metric, score) => {
	const metricValue = rankCoefficients[metric]
	let rank = roundTo((score / metricValue) / 10, 0)

	return { ...getRankCategory(rank), rank: score / metricValue }
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
