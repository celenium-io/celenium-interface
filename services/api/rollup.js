/** Services */
import { tvlServiceURL, useServerURL } from "@/services/config"

export const fetchRollups = async ({ categories, type, limit, offset, sort, sort_by }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup`)

		if (categories) url.searchParams.append("category", categories)
		if (type) url.searchParams.append("type", type)
		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (sort_by) url.searchParams.append("sort_by", sort_by)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

// export const fetchRollupsCount = async () => {
// 	try {
// 		const url = new URL(`${useServerURL()}/rollup/count`)

// 		const data = await useFetch(url.href)
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchRollupByID = async (id) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/rollup/${id}`)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchRollupBySlug = async (slug) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/rollup/slug/${slug}`)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchRollupBlobs = async ({ id, limit, offset, sort, sort_by }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/rollup/${id}/blobs`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)
// 		if (sort) url.searchParams.append("sort", sort)
// 		if (sort_by) url.searchParams.append("sort_by", sort_by)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchRollupNamespaces = async ({ id, limit, offset }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/rollup/${id}/namespaces`)

// 		if (limit) url.searchParams.append("limit", limit)
// 		if (offset) url.searchParams.append("offset", offset)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// export const fetchRollupExportData = async ({ id, from, to }) => {
// 	try {
// 		const url = new URL(`${useServerURL()}/rollup/${id}/export`)

// 		url.searchParams.append("from", from)
// 		url.searchParams.append("to", to)

// 		const data = await useFetch(encodeURI(url.href))
// 		return data
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

export const fetchRollupsCount = () => {
	try {
		const url = new URL(`${useServerURL()}/rollup/count`)

		return useFetch(url.href, {
			key: "rollups_count",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupByID = (id) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/${id}`)

		return useFetch(encodeURI(url.href), {
			key: "rollup_by_id",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupBySlug = (slug) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/slug/${slug}`)

		return useFetch(encodeURI(url.href), {
			key: "rollup_by_slug",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupBlobs = ({ id, limit, offset, sort, sort_by }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/${id}/blobs`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (sort_by) url.searchParams.append("sort_by", sort_by)

		return useFetch(encodeURI(url.href), {
			key: "rollup_blobs",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupNamespaces = async ({ id, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/${id}/namespaces`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		return useFetch(encodeURI(url.href), {
			key: "rollup_namespaces",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupExportData = async ({ id, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/${id}/export`)

		url.searchParams.append("from", from)
		url.searchParams.append("to", to)

		return useFetch(encodeURI(url.href), {
			key: "rollup_export_data",
		})
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupsDailyStats = async ({ limit, offset, sort, sort_by }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/day`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (sort_by) url.searchParams.append("sort_by", sort_by)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupTVL = async ({ slug, period, from, to }) => {
	try {
		const url = new URL(`${tvlServiceURL}/tvl/${slug}/${period}`)

		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)
		
		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
