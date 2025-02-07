/** Services */
import { blockscoutURL, useServerURL } from "@/services/config"

export const fetchNamespaces = async ({ limit, offset, sort, sort_by }) => {
	try {
		const url = new URL(`${useServerURL()}/namespace`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (sort_by) url.searchParams.append("sort_by", sort_by)

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

export const fetchNamespaceBlobs = async ({ id, version, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/namespace/${id}/${version}/blobs`)

		url.searchParams.append("sort_by", "time")

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceRollups = async ({ id, version, limit }) => {
	try {
		const url = new URL(`${useServerURL()}/namespace/${id}/${version}/rollups`)

		if (limit) url.searchParams.append("limit", limit)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlobByMetadata = async ({ hash, height, commitment, metadata = false }) => {
	try {
		const url = new URL(`${useServerURL()}/blob`)

		const data = await useFetch(encodeURI(url.href), {
			method: "post",
			body: {
				hash,
				height,
				commitment,
				metadata,
			},
		})
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlobMetadata = async ({ hash, height, commitment }) => {
	try {
		const url = new URL(`${useServerURL()}/blob/metadata`)

		const data = await useFetch(encodeURI(url.href), {
			method: "post",
			body: {
				hash,
				height,
				commitment,
			},
		})
		
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlobProof = async ({ hash, height, commitment }) => {
	try {
		const url = new URL(`${useServerURL()}/blob/proofs`)

		const data = await useFetch(encodeURI(url.href), {
			method: "post",
			body: {
				hash,
				height,
				commitment,
			},
		})
		
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlobBlockscoutData = async ({ height, namespace, commitment }) => {
	try {
		const url = new URL(blockscoutURL)

		url.searchParams.append("height", height)
		url.searchParams.append("namespace", namespace)
		url.searchParams.append("commitment", commitment)

		const data = useFetch(url.href)

		return data
	} catch (error) {
		console.error(error)
	}
}
