/** Services */
import { Server } from "@/services/config"

export const fetchHead = async () => {
	try {
		const data = await useFetch(`${Server.API}/head`)
		return data
	} catch (error) {
		console.error(error)
	}
}
