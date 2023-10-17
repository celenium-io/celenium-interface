/** Services */
import { Server } from "@/services/config"

export const fetchHistogram = async ({ table, func, period }) => {
	try {
		const url = new URL(`${Server.API}/stats/histogram/${table}/${func}/${period}`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
