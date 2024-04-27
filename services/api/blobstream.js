/** Services */
import { useBlobstreamURL } from "@/services/config"

export const fetchNetworks = async () => {
	try {
		const url = new URL(`${useBlobstreamURL()}/network`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchCommitments = async ({ limit, offset, sort }) => {
	try {
		const url = new URL(`${useBlobstreamURL()}/commitments`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchCommitmentsByNetwork = async ({ network, limit, offset, sort }) => {
	try {
		const url = new URL(`${useBlobstreamURL()}/network/${network}/commitments`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchContracts = async (address) => {
	try {
		const url = new URL(`${useBlobstreamURL()}/contracts`)

		if (address) url + `/${address}`

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
