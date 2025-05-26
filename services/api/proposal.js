/** Services */
import { useServerURL } from "@/services/config"

export const fetchProposals = async ({ limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/proposal`)

		url.searchParams.append("stats", true)
		url.searchParams.append("sort", "desc")

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

/** not yet implemented */
export const fetchProposalsCount = async () => {
	try {
		const url = new URL(`${useServerURL()}/proposal/count`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
