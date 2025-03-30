/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { roundTo } from "@/services/utils"

export const rankCategories = [
	{ min: 10, max: 10, name: "Legendary", color: "legendary" },
	{ min: 9, max: 9, name: "Epic", color: "epic" },
	{ min: 7, max: 8, name: "Good", color: "rare" },
	{ min: 4, max: 6, name: "Poor", color: "primary" },
	{ min: 0, max: 3, name: "Bad", color: "tertiary" },
]

export const getRankCategory = (rank) => {
	const category = rankCategories.find(({ min, max }) => rank >= min && rank <= max) || { name: "Uncategorized", color: "tertiary" }
	return { name: category.name, color: category.color }
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
