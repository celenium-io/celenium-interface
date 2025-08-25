/** Services */
import { nodeStatsURL, useServerURL } from "@/services/config"

export const fetchHead = async () => {
	try {
		const data = await $fetch(`${useServerURL()}/head`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchConstants = async () => {
	try {
		return await $fetch(`${useServerURL()}/constants`)
	} catch (error) {
		console.error(error)
	}
}

export const fetchMainnetConstants = async () => {
	try {
		return await $fetch(`https://api.celenium.io/v1/constants`)
	} catch (error) {
		console.error(error)
	}
}

export const fetchMochaConstants = async () => {
	try {
		const data = await $fetch(`https://api-mocha-4.celenium.io/v1/constants`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchArabicaConstants = async () => {
	try {
		const data = await $fetch(`https://api-arabica-11.celenium.io/v1/constants`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchMammothConstants = async () => {
	try {
		const data = await $fetch(`https://api-mammoth.celenium.io/v1/constants`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchEnums = async () => {
	try {
		const [mainEnums, nodeEnums] = await Promise.all([
			$fetch(`${useServerURL()}/enums`),
			$fetch(`${nodeStatsURL()}/enums`)
		])

		return { ...mainEnums, ...nodeEnums }
	} catch (error) {
		console.error("Failed to fetch enums: ", error)
		return {}
	}
}
