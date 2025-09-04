/** Services */
import { useBlobstreamURL } from "@/services/config"

export const fetchNetworks = () => {
	if (!useBlobstreamURL()) return []

	try {
		const url = new URL(`${useBlobstreamURL()}/network`)

		return useFetch(url.href, {
			key: "networks",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchCommitments = ({ limit, offset, sort }) => {
	if (!useBlobstreamURL()) return []
	
	try {
		const url = new URL(`${useBlobstreamURL()}/commitments`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		return useFetch(url.href, {
			key: "commitments",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchCommitmentsByNetwork = ({ network, limit, offset, sort }) => {
	if (!useBlobstreamURL()) return []
	
	try {
		const url = new URL(`${useBlobstreamURL()}/network/${network}/commitments`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		return useFetch(url.href, {
			key: "commitments_by_network",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchContracts = (address) => {
	if (!useBlobstreamURL()) return []
	
	try {
		const url = new URL(`${useBlobstreamURL()}/contracts`)

		if (address) url + `/${address}`

		return useFetch(url.href, {
			key: "contracts",
		})
	} catch (error) {
		console.error(error)
	}
}
