/** Services */
import { useServerURL } from "@/services/config"

export const fetchHistogram = async ({ table, func, period }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/histogram/${table}/${func}/${period}`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchSummary = async ({ table, func }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/summary/${table}/${func}`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
