/** Services */
import { useServerURL } from "@/services/config"

export const fetchValidators = ({ status = "active", limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/validators`)

		if (status) url.searchParams.append("status", status)
		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		return useFetch(url.href)
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorsCount = () => {
	try {
		const url = new URL(`${useServerURL()}/validators/count`)

		return useFetch(url.href)
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorByID = (id) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}`)

		return useFetch(encodeURI(url.href))
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorBlocks = ({ id, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}/blocks`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href))
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorDelegators = ({ id, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}/delegators`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href))
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorJails = ({ id, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}/jails`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href))
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorUptime = ({ id, limit }) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}/uptime`)

		if (limit) url.searchParams.append("limit", limit)

		return useFetch(encodeURI(url.href))
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorsMetrics = (count) => {
	try {
		const url = new URL(`${useServerURL()}/validators/metrics`)

		if (count) url.searchParams.append("count", count)

		return useFetch(encodeURI(url.href))
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorMetrics = (id) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}/metrics`)

		return useFetch(encodeURI(url.href))
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorsUpgrades = ({ limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/signal/upgrade`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href))
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorsUpgradeByVersion = (version) => {
	try {
		const url = new URL(`${useServerURL()}/signal/upgrade/${version}`)

		return useFetch(encodeURI(url.href))
	} catch (error) {
		console.error(error)
	}
}

export const fetchSignals = ({ validatorId, version, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/signal`)

		if (validatorId) url.searchParams.append("validator_id", validatorId)
		if (version) url.searchParams.append("version", version)
		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href))
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorMessages = ({ id, sort, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}/messages`)

		url.searchParams.append("sort", sort ?? "desc")
		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href))
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorVotingPowerHistory = async (options) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${options.id}/bond_updates`)

		if (options?.limit) url.searchParams.append("limit", options.limit)
		if (options?.offset) url.searchParams.append("offset", options.offset)
		if (options?.sort) url.searchParams.append("sort", options.sort)

		return await $fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		})
	} catch (err) {
		console.error(`Error during fetching validator's voting power history:`, err)

		throw createError({
			statusCode: err.statusCode || 500,
			statusMessage: err.statusMessage || "Failed to fetch validator's voting power history",
			fatal: false,
		})
	}
}
