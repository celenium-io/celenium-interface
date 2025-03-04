/** Services */
import { useServerURL } from "@/services/config"

// export const fetchValidators = async ({ jailed = false, limit, offset, sort }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/validators`)

// 		url.searchParams.append("jailed", jailed)
// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)
// 		if (sort) url.searchParams.append("sort", sort)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchValidatorsCount = async () => {
// 	try {
// 		const url = new URL(`${useServerURL()}/validators/count`)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchValidatorByID = async (id) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/validators/${id}`)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchValidatorBlocks = async ({ id, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/validators/${id}/blocks`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchValidatorDelegators = async ({ id, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/validators/${id}/delegators`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchValidatorJails = async ({ id, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/validators/${id}/jails`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchValidatorUptime = async ({ id, limit }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/validators/${id}/uptime`)

// 		if (limit) url.searchParams.append("limit", limit)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

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
