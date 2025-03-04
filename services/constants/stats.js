export const STATS_SERIES = [
	{
		group: 'General',
		series: [
			{
				name: 'tx_count',
				title: 'Transactions',
				page: 'transactions',
				tooltip: 'Txs',
				aggregate: 'sum',
			},
			{
				name: 'fee',
				title: 'Fee',
				page: 'fee',
				units: 'utia',
				tooltip: 'Fee',
				aggregate: 'sum',
			},
			{
				name: 'gas_price',
				title: 'Gas Price',
				page: 'gas_price',
				units: 'utia',
				tooltip: 'Events',
				aggregate: 'avg',
			},
			{
				name: 'bytes_in_block',
				title: 'Bytes In Blocks',
				page: 'bytes_in_blocks',
				units: 'bytes',
				tooltip: 'Bytes',
				aggregate: 'sum',
			},
			{
				name: 'blobs_count',
				title: 'Blobs Count',
				page: 'blobs_count',
				tooltip: 'Blobs',
				aggregate: 'sum',
			},
			{
				name: 'blobs_size',
				title: 'Blobs Size',
				page: 'blobs_size',
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
	{
		group: 'Blocks',
		series: [
			{
				name: 'block_time',
				title: 'Block Time',
				page: 'block_time',
				tooltip: 'Block time',
				units: 'seconds',
				aggregate: 'avg',
			},
			{
				name: 'bytes_in_block',
				title: 'Bytes In Blocks',
				page: 'bytes_in_blocks',
				units: 'bytes',
				tooltip: 'Bytes',
				aggregate: 'cumulative',
			},
			{
				name: 'square_size',
				title: 'Square Size Distribution',
				page: 'square_size',
			},
		],
	},
	{
		group: 'Rollups',
		series: [
			{
				subGroup: 'top',
				name: 'size',
				title: 'size',
				units: 'bytes',
			},
			{
				subGroup: 'top',
				name: 'blobs_count',
				title: 'blobs count',
			},
			{
				subGroup: 'top',
				name: 'fee',
				title: 'fee paid',
				units: 'utia',
			},
			{
				subGroup: 'economy',
				name: 'tvs',
				title: 'Total Value Secured',
				page: 'tvs',
				units: 'usd',
			},
		],
	},
]

// TO DO: Replace forEach with for
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

export function getSeriesByPage(page, aggregate) {
	let series = {}
	for (const p of STATS_SERIES) {
		for (const s of p.series) {
			if (s.page === page) {
				if (aggregate) {
					if (s.aggregate === aggregate) {
						series = s
						break;
					}
				} else {
					series = s
					break;
				}
			}
		}

		if (series.page) break;
	}

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
		shortTitle: '24h',
		value: 24,
		timeframe: 'hour',
	},
	{
		title: 'Last 7 days',
		shortTitle: '7d',
		value: 7,
		timeframe: 'day',
	},
	{
		title: 'Last 31 days',
		shortTitle: '31d',
		value: 31,
		timeframe: 'day',
	},
]

export const STATS_TIMEFRAMES = [
	{
		title: '1 hour',
		shortTitle: '1H',
		interval: { hours: 1 },
		timeframe: 'hour',
	},
	{
		title: '1 day',
		shortTitle: '1D',
		interval: { days: 1 },
		timeframe: 'day',
	},
	{
		title: '1 week',
		shortTitle: '1W',
		interval: { weeks: 1 },
		timeframe: 'week',
	},
	{
		title: '1 month',
		shortTitle: '1M',
		interval: { months: 1 },
		timeframe: 'month',
	},
]
