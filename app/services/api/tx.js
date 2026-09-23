/** Services */
import { useServerURL } from "@/services/config"

export const fetchTransactions = ({ msg_type, status, from, to, limit, offset, sort_by, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/tx`)

		if (msg_type) url.searchParams.append("msg_type", msg_type)
		if (status) url.searchParams.append("status", status)
		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)
		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort_by) url.searchParams.append("sort_by", sort_by)
		if (sort) url.searchParams.append("sort", sort)

		return useFetch(url.href, {
			key: "transactions",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxsCount = () => {
	try {
		const url = new URL(`${useServerURL()}/tx/count`)

		return useFetch(url.href, {
			key: "transactions_count",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxByHash = (hash) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}`)

		return useFetch(url.href, {
			key: "transaction",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxMessages = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/messages`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxEvents = async ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/events`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxNamespaces = async ({ hash, limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/namespace`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxNamespacesCount = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/namespace/count`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxBlobs = async ({ hash, limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/blobs`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxBlobsCount = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/blobs/count`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchLatestPFBs = () => {
	try {
		return useFetch(`${useServerURL()}/tx?msg_type=MsgPayForBlobs&sort=desc&limit=5`, {
			key: "latest_pfbs",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchTransactionsByBlock = ({ limit, offset, sort, height, from, to, status, type, excluded_types }) => {
	try {
		const url = new URL(`${useServerURL()}/tx`)

		url.searchParams.append("height", height)
		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)
		if (limit) url.searchParams.append("limit", limit)
		if (sort) url.searchParams.append("sort", sort)
		if (offset) url.searchParams.append("offset", offset)
		if (status) url.searchParams.append("status", status)
		if (type) url.searchParams.append("msg_type", type)
		if (excluded_types) url.searchParams.append("excluded_msg_type", excluded_types)

		return useFetch(url.href, {
			key: "transactions_by_block",
		})
	} catch (error) {
		console.error(error)
	}
}
