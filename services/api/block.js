/** Services */
import { Server } from "@/services/config"

export const fetchBlocks = async ({ limit, offset }) => {
	try {
		const url = new URL(`${Server.API}/block`)

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

export const fetchBlockByHeight = async (height) => {
	try {
		const data = await useFetch(`${Server.API}/block/${height}?stats=true`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockNamespaces = async ({ height, limit, offset, sort }) => {
	try {
		const url = new URL(`${Server.API}/block/${height}/namespace`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await useLazyFetch(url.href)
		if (data.status.value === "idle") await data.execute()
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockNamespacesCount = async (height) => {
	try {
		const data = await useLazyFetch(`${Server.API}/block/${height}/namespace/count`)
		if (data.status.value === "idle") await data.execute()
		return data
	} catch (error) {
		console.error(error)
	}
}
