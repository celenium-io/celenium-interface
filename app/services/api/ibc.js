/** Services */
import { useServerURL } from "@/services/config"

export const fetchIbcTransfers = async ({ limit, offset, sort = "desc", chain_id, client_id, connection_id }) => {
	try {
		const url = new URL(`${useServerURL()}/ibc/transfer`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (chain_id) url.searchParams.append("chain_id", chain_id)
		if (client_id) url.searchParams.append("client_id", client_id)
		if (connection_id) url.searchParams.append("connection_id", connection_id)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchIbcClients = async ({ limit, offset, sort, chain_id, creator }) => {
	try {
		const url = new URL(`${useServerURL()}/ibc/client`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (chain_id) url.searchParams.append("chain_id", chain_id)
		if (creator) url.searchParams.append("creator", creator)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchIbcConnections = async ({ limit, offset, sort, client_id }) => {
	try {
		const url = new URL(`${useServerURL()}/ibc/connection`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (client_id) url.searchParams.append("client_id", client_id)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchIbcChannels = async ({ limit, offset, sort, client_id, connection_id, status }) => {
	try {
		const url = new URL(`${useServerURL()}/ibc/channel`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (client_id) url.searchParams.append("client_id", client_id)
		if (connection_id) url.searchParams.append("connection_id", connection_id)
		if (status) url.searchParams.append("status", status)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
