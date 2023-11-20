/** Services */
import { useServerURL } from "@/services/config"

export const fetchHistogram = async ({ table, func, period, column, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/histogram/${table}/${func}/${period}`)

		if (column) url.searchParams.append("column", column)
		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)

		const data = await $fetch(url.href)
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
