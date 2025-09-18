/** Services */
import { useServerURL } from "@/services/config"

export const fetchProposals = async ({ limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/proposal`)

		url.searchParams.append("sort", "desc")

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await useAsyncData(`proposals`, () => $fetch(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchActiveProposals = async () => {
	try {
		const url = new URL(`${useServerURL()}/proposal`)

		url.searchParams.append("sort", "desc")
		url.searchParams.append("status", "active")

		const data = await useAsyncData(`proposals`, () => $fetch(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchProposalById = async ({ id }) => {
	try {
		const url = new URL(`${useServerURL()}/proposal/${id}`)

		const data = await useAsyncData(`proposal-${id}`, () => $fetch(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchProposalVotes = async ({ id, limit, offset, option, voter, validator, address }) => {
	try {
		const url = new URL(`${useServerURL()}/proposal/${id}/votes`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (option) url.searchParams.append("option", option)
		if (voter) url.searchParams.append("voter", voter)
		if (validator) url.searchParams.append("validator", validator)
		if (address) url.searchParams.append("address", address)

		const data = await useAsyncData(`proposal-${id}-votes`, () => $fetch(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

/** not yet implemented */
export const fetchProposalsCount = async () => {
	try {
		const url = new URL(`${useServerURL()}/proposal/count`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
