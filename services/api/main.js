/** Services */
import { useServerURL } from "@/services/config"

export const fetchHead = async () => {
	try {
		const data = await useFetch(`${useServerURL()}/head`)
		return data
	} catch (error) {
		console.error(error)
	}
}
