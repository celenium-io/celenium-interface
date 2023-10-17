/** Services */
import { Server } from "@/services/config"

export const fetchNamespaces = async ({ limit, offset, sort }) => {
	try {
		const url = new URL(`${Server.API}/namespace`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespacesCount = async () => {
	try {
		const url = new URL(`${Server.API}/namespace/count`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRecentNamespaces = async () => {
	try {
		const url = new URL(`${Server.API}/namespace/active`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceByHash = async ({ hash, height, commitment }) => {
	try {
		const url = new URL(`${Server.API}/namespace_by_hash/${hash}/${height}/${commitment}`)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}
