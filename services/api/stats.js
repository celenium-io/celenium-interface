/** Services */
import { nodeStatsURL, nodeVersionStatsURL, quoteServiceURL, tvlServiceURL, useServerURL } from "@/services/config"

export const fetchGeneralStats = async ({ name }) => {
	try {
		const data = await $fetch(`${useServerURL()}/stats/${name}`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchSeries = async ({ table, period, column, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/series/${table}/${period}`)

		if (column) url.searchParams.append("column", column)
		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)
		
		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchSeriesCumulative = async ({ name, period, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/series/${name}/${period}/cumulative`)

		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)
		
		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchSummary = async ({ table, func, column, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/summary/${table}/${func}`)

		if (column) url.searchParams.append("column", column)
		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)
		
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

export const fetchTVL = async ({ slug, period, from, to }) => {
	try {
		let url = ""

		if (period) {
			url = new URL(`${tvlServiceURL}/tvl/${slug}/${period}`)

			if (from) url.searchParams.append("from", from)
			if (to) url.searchParams.append("to", to)
		} else {
			url = new URL(`${tvlServiceURL}/tvl`)
		}

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTVS = async ({ period, from, to }) => {
	try {
		let url = ""

		if (period) {
			url = new URL(`${tvlServiceURL}/tvs/${period}`)

			if (from) url.searchParams.append("from", from)
			if (to) url.searchParams.append("to", to)
		} else {
			url = new URL(`${tvlServiceURL}/tvs`)
		}

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchPrice = async () => {
	try {
		const url = new URL(`${quoteServiceURL}/price/current`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchPriceSeries = async ({ from }) => {
	try {
		const url = new URL(`${quoteServiceURL}/price/series/1d`)

		if (from) url.searchParams.append("from", from)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressSeries = async ({ hash, name, timeframe, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/stats/${name}/${timeframe}`)

		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)

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

export const fetchRollupsSeries = async ({ timeframe, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/stats/series/${timeframe}`)

		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupSeries = async ({ id, name, timeframe, from, to }) => {
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

export const fetchSquareSize = async (from) => {
	try {
		const url = new URL(`${useServerURL()}/stats/square_size`)

		if (from) url.searchParams.append("from", from)
			
		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNodeStats = async ({ name, timeframe, from, to }) => {
	try {
		const url = new URL(`${nodeStatsURL}/stats/${name}${timeframe ? `/${timeframe}` : ''}`)

		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNodeVersionStats = async ({ name, timeframe, from, to }) => {
	try {
		const url = new URL(`${nodeVersionStatsURL}/stats/version/${name}${timeframe ? `/${timeframe}` : ''}`)

		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
