export const STATS_SERIES = [
	{
		group: "General",
		series: [
			{
				name: "tx_count",
				title: "Transactions",
				page: "transactions",
				tooltip: "Txs",
				aggregate: "sum",
			},
			{
				name: "fee",
				title: "Fee",
				page: "fee",
				units: "utia",
				tooltip: "Fee",
				aggregate: "sum",
			},
			{
				name: "gas_price",
				title: "Gas Price",
				page: "gas_price",
				units: "utia",
				tooltip: "Events",
				aggregate: "avg",
			},
			{
				name: "bytes_in_block",
				title: "Bytes In Blocks",
				page: "bytes_in_blocks",
				units: "bytes",
				tooltip: "Bytes",
				aggregate: "sum",
			},
			{
				name: "blobs_count",
				title: "Blobs Count",
				page: "blobs_count",
				tooltip: "Blobs",
				aggregate: "sum",
			},
			{
				name: "blobs_size",
				title: "Blobs Size",
				page: "blobs_size",
				units: "bytes",
				tooltip: "Size",
				aggregate: "sum",
			},
		],
		insights: [
			{
				name: "messages_count_24h",
				title: "Transactions",
			},
			{
				name: "rollup_stats_24h",
				title: "Rollups Blobs",
				color: "white",
			},
			{
				name: "gas",
				title: "Gas Efficiency",
			},
		],
	},
	{
		group: "Blocks",
		series: [
			{
				name: "block_time",
				title: "Block Time",
				page: "block_time",
				tooltip: "Block time",
				units: "seconds",
				aggregate: "avg",
			},
			{
				name: "bytes_in_block",
				title: "Bytes In Blocks",
				page: "bytes_in_blocks",
				units: "bytes",
				tooltip: "Bytes",
				aggregate: "cumulative",
			},
			{
				name: "square_size",
				title: "Square Size Distribution",
				page: "square_size",
			},
		],
	},
	{
		group: "Rollups",
		series: [
			{
				name: "size",
				title: "size",
				units: "bytes",
			},
			{
				name: "blobs_count",
				title: "blobs count",
			},
			{
				name: "fee",
				title: "fee paid",
				units: "utia",
			},
		],
	},
]

// TO DO: Replace forEach with for
export function getSeriesByGroupAndType(group, type) {
	let series = []
	for (const el of STATS_SERIES) {
		if (el.group === group) {
			if (type) {
				for (const s of el.series) {
					if (s.types?.includes(type) || !s.types) {
						series.push(s)
					}
				}
			} else {
				series = [...el.series]
			}
		}
	}

	return series
}

export function getSeriesByPage(page, aggregate) {
	let series = {}
	for (const el of STATS_SERIES) {
		for (const s of el.series) {
			if (s.page === page) {
				if (aggregate) {
					if (s.aggregate === aggregate) {
						series = s
					}
				} else {
					series = s
				}
			}
		}
	}

	return series
}

export function getInsightsByGroup(group) {
	let insights = []
	for (const el of STATS_SERIES) {
		if (el.group === group) {
			insights = [...el.insights]
		}
	}

	return insights
}

export const STATS_PERIODS = [
	{
		title: "Last 24 hours",
		value: 24,
		timeframe: "hour",
	},
	{
		title: "Last 7 days",
		value: 7,
		timeframe: "day",
	},
	{
		title: "Last 31 days",
		value: 31,
		timeframe: "day",
	},
]

export const STATS_HIGHLIGHTS = [
	{
		group: "General",
	},
]
