/** Services */
import { useServerURL } from "@/services/config"

export const fetchValidators = ({ jailed = false, limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/validators`)

		url.searchParams.append("jailed", jailed)
		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		return useFetch(url.href, {
			key: "validators",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorsCount = () => {
	try {
		const url = new URL(`${useServerURL()}/validators/count`)

		return useFetch(url.href, {
			key: "validators_count",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorByID = (id) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}`)

		return useFetch(encodeURI(url.href), {
			key: "validator_by_id",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorBlocks = ({ id, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}/blocks`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href), {
			key: "validator_blocks",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorDelegators = ({ id, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}/delegators`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href), {
			key: "validator_delegators",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorJails = ({ id, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}/jails`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href), {
			key: "validator_jails",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorUptime = ({ id, limit }) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}/uptime`)

		if (limit) url.searchParams.append("limit", limit)

		return useFetch(encodeURI(url.href), {
			key: "validator_uptime",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorsMetrics = (count) => {
	try {
		const url = new URL(`${useServerURL()}/validators/metrics`)

		if (count) url.searchParams.append("count", count)

		return useFetch(encodeURI(url.href), {
			key: "validators_metrics",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorMetrics = (id) => {
	try {
		const url = new URL(`${useServerURL()}/validators/${id}/metrics`)

		return useFetch(encodeURI(url.href), {
			key: "validator_metric",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorsUpgrades = ({ limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/signal/upgrade`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href), {
			key: "validators_upgrades",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchValidatorsUpgradeByVersion = (version) => {
	try {
		const url = new URL(`${useServerURL()}/signal/upgrade/${version}`)

		return useFetch(encodeURI(url.href), {
			key: "validators_upgrade_by_version",
		})
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

		return useFetch(encodeURI(url.href), {
			key: "upgrades_signals",
		})
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

		return useFetch(encodeURI(url.href), {
			key: "validator_messages",
		})
	} catch (error) {
		console.error(error)
	}
}