/** Services */
import { useServerURL } from "@/services/config"

export const fetchBlocks = ({ limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/block`)

		url.searchParams.append("stats", true)
		url.searchParams.append("sort", "desc")

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(url.href, {
			key: "blocks",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlocksCount = () => {
	try {
		const url = new URL(`${useServerURL()}/block/count`)

		return useFetch(url.href, {
			key: "blocks_count",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchLatestBlocks = async ({ limit }) => {
	try {
		const url = new URL(`${useServerURL()}/block`)

		url.searchParams.append("stats", true)
		url.searchParams.append("sort", "desc")
		url.searchParams.append("limit", limit ? limit : 15)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchAvgBlockTime = async ({ from }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/summary/block_stats/avg?column=block_time`)

		url.searchParams.append("from", from)

		return $fetch(url.href)
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockByHeight = async (height) => {
	try {
		return useFetch(`${useServerURL()}/block/${height}?stats=true&q=${new Date().getTime()}`, {
			key: "block",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockNamespaces = async ({ height, limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/block/${height}/namespace`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockNamespacesCount = async (height) => {
	try {
		const data = await $fetch(`${useServerURL()}/block/${height}/namespace/count`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockBlobs = async ({ height, limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/block/${height}/blobs`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockBlobsCount = async (height) => {
	try {
		const data = await $fetch(`${useServerURL()}/block/${height}/blobs/count`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockEvents = async ({ height, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/block/${height}/events`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockODS = async (height) => {
	try {
		const url = new URL(`${useServerURL()}/block/${height}/ods`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
