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

export const fetchTPS = async () => {
	try {
		const url = new URL(`${useServerURL()}/stats/tps`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
