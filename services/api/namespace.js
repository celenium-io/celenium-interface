/** Services */
import { blockscoutURL, useServerURL } from "@/services/config"

// export const fetchNamespaces = async ({ limit, offset, sort, sort_by }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/namespace`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)
// 		if (sort) url.searchParams.append("sort", sort)
// 		if (sort_by) url.searchParams.append("sort_by", sort_by)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchRecentNamespaces = async () => {
// 	try {
// 		const url = new URL(`${useServerURL()}/namespace/active`)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchNamespaceByID = async (id) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/namespace/${id}`)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchNamespaceByHash = async (hash) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/namespace_by_hash/${hash}`)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchNamespaceMessagesById = async ({ id, version, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/namespace/${id}/${version}/messages`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchNamespaceBlobs = async ({ id, version, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/namespace/${id}/${version}/blobs`)

// 		url.searchParams.append("sort_by", "time")

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchNamespaceRollups = async ({ id, version, limit }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/namespace/${id}/${version}/rollups`)

// 		if (limit) url.searchParams.append("limit", limit)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

export const fetchNamespaces = ({ limit, offset, sort, sort_by }) => {
	try {
		const url = new URL(`${useServerURL()}/namespace`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (sort_by) url.searchParams.append("sort_by", sort_by)

		return useFetch(url.href, {
			key: "namespaces",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchRecentNamespaces = () => {
	try {
		const url = new URL(`${useServerURL()}/namespace/active`)

		return useFetch(url.href, {
			key: "recent_namespaces",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceByID = (id) => {
	try {
		const url = new URL(`${useServerURL()}/namespace/${id}`)

		return useFetch(encodeURI(url.href), {
			key: "namespace_by_id",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceByHash = (hash) => {
	try {
		const url = new URL(`${useServerURL()}/namespace_by_hash/${hash}`)

		return useFetch(encodeURI(url.href), {
			key: "namespace_by_hash",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceMessagesById = ({ id, version, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/namespace/${id}/${version}/messages`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href), {
			key: "namespace_messages",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceBlobs = ({ id, version, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/namespace/${id}/${version}/blobs`)

		url.searchParams.append("sort_by", "time")

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href), {
			key: "namespace_blobs",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceRollups = ({ id, version, limit }) => {
	try {
		const url = new URL(`${useServerURL()}/namespace/${id}/${version}/rollups`)

		if (limit) url.searchParams.append("limit", limit)

		return useFetch(encodeURI(url.href), {
			key: "namespace_rollups",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlobByMetadata = async ({ hash, height, commitment, metadata = false }) => {
	try {
		const url = new URL(`${useServerURL()}/blob`)

		const data = await $fetch(encodeURI(url.href), {
			method: "POST",
			body: {
				hash,
				height,
				commitment,
				metadata,
			},
		})

		return data

		// return useFetch(encodeURI(url.href), {
		// 	method: "post",
		// 	body: {
		// 		hash,
		// 		height,
		// 		commitment,
		// 		metadata,
		// 	},
		// 	key: `blob_by_metadata_${hash}_${height}_${commitment}`,
		// })
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlobMetadata = async ({ hash, height, commitment }) => {
	try {
		const url = new URL(`${useServerURL()}/blob/metadata`)

		const data = $fetch(encodeURI(url.href), {
			method: "post",
			body: {
				hash,
				height,
				commitment,
			},
			// key: `blob_metadata_${hash}_${height}_${commitment}`,
		})

		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlobProof = async ({ hash, height, commitment }) => {
	try {
		const url = new URL(`${useServerURL()}/blob/proofs`)

		const data = $fetch(encodeURI(url.href), {
			method: "post",
			body: {
				hash,
				height,
				commitment,
			},
			// key: `blob_proof_${hash}_${height}_${commitment}`,
		})

		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlobBlockscoutData = ({ height, namespace, commitment }) => {
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
