/** Services */
import { useServerURL } from "@/services/config"

export const fetchHistogram = async ({ table, func, period, column, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/histogram/${table}/${func}/${period}`)

		if (column) url.searchParams.append("column", column)
		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchSummary = async ({ table, func }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/summary/${table}/${func}`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTPS = async () => {
	try {
		const url = new URL(`${useServerURL()}/stats/tps`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceUsage = async ({ top }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/namespace/usage`)

		if (top) url.searchParams.append("top", top)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceSeries = async ({ id, name, timeframe, from }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/namespace/series/${id}/${name}/${timeframe}`)

		if (from) url.searchParams.append("from", from)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupeSeries = async ({ id, name, timeframe, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/${id}/stats/${name}/${timeframe}`)

		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
