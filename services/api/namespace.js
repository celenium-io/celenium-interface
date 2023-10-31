/** Services */
import { useServerURL } from "@/services/config"

export const fetchNamespaces = async ({ limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/namespace`)

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
		const url = new URL(`${useServerURL()}/namespace/count`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRecentNamespaces = async () => {
	try {
		const url = new URL(`${useServerURL()}/namespace/active`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceByID = async (id) => {
	try {
		const url = new URL(`${useServerURL()}/namespace/${id}`)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceByHash = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/namespace_by_hash/${hash}`)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceMessagesById = async ({ id, version, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/namespace/${id}/${version}/messages`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceByMetadata = async ({ hash, height, commitment }) => {
	try {
		const url = new URL(`${useServerURL()}/namespace_by_hash/${hash}/${height}/${commitment}`)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}
