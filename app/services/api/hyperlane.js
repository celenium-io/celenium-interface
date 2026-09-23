/** Services */
import { useServerURL } from "@/services/config"

export const fetchHyperlaneTransfers = async ({ limit, offset, sort, address, relayer, mailbox, token, type, domain }) => {
	try {
		const url = new URL(`${useServerURL()}/hyperlane/transfer`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (address) url.searchParams.append("address", address)
		if (relayer) url.searchParams.append("relayer", relayer)
		if (mailbox) url.searchParams.append("mailbox", mailbox)
		if (token) url.searchParams.append("token", token)
		if (type) url.searchParams.append("type", type)
		if (domain) url.searchParams.append("domain", domain)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchHyperlaneMailboxes = async ({ limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/hyperlane/mailbox`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchHyperlaneTokens = async ({ limit, offset, owner, mailbox, type }) => {
	try {
		const url = new URL(`${useServerURL()}/hyperlane/token`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (owner) url.searchParams.append("owner", owner)
		if (mailbox) url.searchParams.append("mailbox", mailbox)
		if (type) url.searchParams.append("type", type)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
