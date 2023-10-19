/** Services */
import { Server } from "@/services/config"

export const fetchAddressByHash = async (hash) => {
	try {
		const url = new URL(`${Server.API}/address/${hash}`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxsByAddressHash = async ({ limit, offset, sort, hash }) => {
	try {
		const url = new URL(`${Server.API}/address/${hash}/txs`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
