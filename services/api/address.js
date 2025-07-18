/** Services */
import { useServerURL } from "@/services/config"

// export const fetchAddresses = async ({ limit, offset, sort, sort_by }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address`)

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

// export const fetchAddressesCount = async () => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address/count`)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchAddressByHash = async (hash) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address/${hash}`)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchTxsByAddressHash = async ({ limit, offset, sort, hash, status, msg_type }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address/${hash}/txs`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)
// 		if (sort) url.searchParams.append("sort", sort)
// 		if (msg_type) url.searchParams.append("msg_type", msg_type)
// 		if (status) url.searchParams.append("status", status)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchMessagesByAddressHash = async ({ limit, offset, sort, hash, msg_type }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address/${hash}/messages`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)
// 		if (sort) url.searchParams.append("sort", sort)
// 		if (msg_type) url.searchParams.append("msg_type", msg_type)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchBlobsByAddressHash = async ({ limit, offset, sort, hash }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address/${hash}/blobs`)

// 		url.searchParams.append("sort_by", 'time')

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)
// 		if (sort) url.searchParams.append("sort", sort)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchAddressDelegations = async ({ hash, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address/${hash}/delegations`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchAddressRedelegations = async ({ hash, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address/${hash}/redelegations`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchAddressUndelegations = async ({ hash, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address/${hash}/undelegations`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchAddressGrants = async ({ hash, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address/${hash}/grants`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchAddressGranters = async ({ hash, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address/${hash}/granters`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchAddressVestings = async ({ hash, showEnded, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/address/${hash}/vestings`)

// 		url.searchParams.append("show_ended", showEnded)
// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchVestingPeriods = async ({ id, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/vesting/${id}/periods`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

export const fetchAddresses = ({ limit, offset, sort, sort_by }) => {
	try {
		const url = new URL(`${useServerURL()}/address`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (sort_by) url.searchParams.append("sort_by", sort_by)

		return useFetch(url.href, {
			key: "addresses",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressesCount = () => {
	try {
		const url = new URL(`${useServerURL()}/address/count`)

		return useFetch(url.href, {
			key: "addresses_count",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressByHash = (hash) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}`)

		return useFetch(url.href, {
			key: "address_by_hash",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxsByAddressHash = ({ limit, offset, sort, hash, status, msg_type }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/txs`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (msg_type) url.searchParams.append("msg_type", msg_type)
		if (status) url.searchParams.append("status", status)

		return useFetch(url.href, {
			key: "address_txs_by_hash",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchMessagesByAddressHash = ({ limit, offset, sort, hash, msg_type }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/messages`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (msg_type) url.searchParams.append("msg_type", msg_type)

		return useFetch(url.href, {
			key: "address_msgs_by_hash",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlobsByAddressHash = ({ limit, offset, sort, hash }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/blobs`)

		url.searchParams.append("sort_by", "time")

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		return useFetch(url.href, {
			key: "address_blobs_by_hash",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchVotesByAddressHash = async ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/votes`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await useAsyncData(`address-${hash}-votes`, () => $fetch(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressDelegations = ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/delegations`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(url.href, {
			key: "address_delegations",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressRedelegations = ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/redelegations`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(url.href, {
			key: "address_redelegations",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressUndelegations = ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/undelegations`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(url.href, {
			key: "address_undelegations",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressGrants = ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/grants`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(url.href, {
			key: "address_grants",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressGranters = ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/granters`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(url.href, {
			key: "address_granters",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressVestings = ({ hash, showEnded, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/vestings`)

		url.searchParams.append("show_ended", showEnded)
		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(url.href, {
			key: "address_vestings",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchVestingPeriods = ({ id, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/vesting/${id}/periods`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(url.href, {
			key: "vesting_periods",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchCelestials = ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/celestials`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(url.href, {
			key: "address_celestials",
		})
	} catch (error) {
		console.error(error)
	}
}
