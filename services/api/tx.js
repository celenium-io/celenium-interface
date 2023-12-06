/** Services */
import { useServerURL } from "@/services/config"

export const fetchTransactions = async ({ limit, offset, sort, msg_type, status }) => {
	try {
		const url = new URL(`${useServerURL()}/tx`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (msg_type) url.searchParams.append("msg_type", msg_type)
		if (status) url.searchParams.append("status", status)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxsCount = async () => {
	try {
		const url = new URL(`${useServerURL()}/tx/count`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxByHash = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxMessages = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/messages`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxEvents = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/events`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

/** Latest PayForBlobs */
export const fetchLatestPFBs = async (height) => {
	try {
		const data = await useFetch(`${useServerURL()}/tx?msg_type=MsgPayForBlobs&sort=desc&limit=5`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTransactionsByBlock = async ({ limit, offset, sort, height, type }) => {
	try {
		const url = new URL(`${useServerURL()}/tx`)

		url.searchParams.append("height", height)
		if (limit) url.searchParams.append("limit", limit)
		if (sort) url.searchParams.append("sort", sort)
		if (offset) url.searchParams.append("offset", offset)
		if (type) url.searchParams.append("msg_type", type)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
