export const STATS_SERIES = [
	{
		group: 'General',
		series: [
			{
				name: 'tx_count',
				title: 'Transactions',
				tooltip: 'Txs',
				aggregate: 'sum',
			},
			{
				name: 'fee',
				title: 'Fee',
				tooltip: 'Fee',
				aggregate: 'sum',
			},
			{
				name: 'gas_price',
				title: 'Gas Price',
				untis: 'utia',
				tooltip: 'Events',
				aggregate: 'avg',
			},
			{
				name: 'bytes_in_block',
				title: 'Bytes In Block',
				units: 'bytes',
				tooltip: 'Bytes',
				aggregate: 'sum',
			},
			{
				name: 'blobs_count',
				title: 'Blobs Count',
				tooltip: 'Blobs',
				aggregate: 'sum',
			},
			{
				name: 'blobs_size',
				title: 'Blobs Size',
				units: 'bytes',
				tooltip: 'Size',
				aggregate: 'sum',
			},
		],
		insights: [
			{
				name: 'messages_count_24h',
				title: 'Transactions',
			},
			{
				name: 'rollup_stats_24h',
				title: 'Rollups Blobs',
				color: 'white',
			},
			{
				name: 'gas',
				title: 'Gas Efficiency',
			},
		],
	},
]

export function getSeriesByGroupAndType(group, type) {
	let series = []
	STATS_SERIES.forEach(el => {
		if (el.group === group) {
			if (type) {
				el.series.forEach(s => {
					if (s.types?.includes(type) || !s.types) {
						series.push(s)
					}
				})
			} else {
				series = [...el.series]
			}
		}
	})

	return series
}

export function getInsightsByGroup(group) {
	let insights = []
	STATS_SERIES.forEach(el => {
		if (el.group === group) {
			insights = [...el.insights]
		}
	})

	return insights
}

export const STATS_PERIODS = [
	{
		title: 'Last 24 hours',
		value: 24,
		timeframe: 'hour',
	},
	{
		title: 'Last 7 days',
		value: 7,
		timeframe: 'day',
	},
	{
		title: 'Last 31 days',
		value: 31,
		timeframe: 'day',
	},
]

export const STATS_HIGHLIGHTS = [
	{
		group: 'General',
	}
]