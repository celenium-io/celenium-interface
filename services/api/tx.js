/** Services */
import { Server } from "@/services/config"

export const fetchTransactions = async ({ limit, offset, sort, msg_type }) => {
	try {
		const url = new URL(`${Server.API}/tx`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (msg_type) url.searchParams.append("msg_type", msg_type)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxByHash = async (hash) => {
	try {
		const url = new URL(`${Server.API}/tx/${hash}`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxMessages = async (hash) => {
	try {
		const url = new URL(`${Server.API}/tx/${hash}/messages`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxEvents = async (hash) => {
	try {
		const url = new URL(`${Server.API}/tx/${hash}/events`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

/** Latest PayForBlobs */
export const fetchLatestPFBs = async (height) => {
	try {
		const data = await useFetch(`${Server.API}/tx?msg_type=MsgPayForBlobs&sort=desc&limit=5`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTransactionsByBlock = async ({ limit, offset, sort, height }) => {
	try {
		const url = new URL(`${Server.API}/tx`)

		url.searchParams.append("height", height)
		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
