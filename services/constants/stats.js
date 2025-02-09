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

const countryCodesMap = {
	AF: 'AFG',
	AL: 'ALB',
	DZ: 'DZA',
	AS: 'ASM',
	AD: 'AND',
	AO: 'AGO',
	AI: 'AIA',
	AQ: 'ATA',
	AG: 'ATG',
	AR: 'ARG',
	AM: 'ARM',
	AW: 'ABW',
	AU: 'AUS',
	AT: 'AUT',
	AZ: 'AZE',
	BS: 'BHS',
	BH: 'BHR',
	BD: 'BGD',
	BB: 'BRB',
	BY: 'BLR',
	BE: 'BEL',
	BZ: 'BLZ',
	BJ: 'BEN',
	BM: 'BMU',
	BT: 'BTN',
	BO: 'BOL',
	BA: 'BIH',
	BW: 'BWA',
	BV: 'BVT',
	BR: 'BRA',
	IO: 'IOT',
	BN: 'BRN',
	BG: 'BGR',
	BF: 'BFA',
	BI: 'BDI',
	KH: 'KHM',
	CM: 'CMR',
	CA: 'CAN',
	CV: 'CPV',
	KY: 'CYM',
	CF: 'CAF',
	TD: 'TCD',
	CL: 'CHL',
	CN: 'CHN',
	CX: 'CXR',
	CC: 'CCK',
	CO: 'COL',
	KM: 'COM',
	CG: 'COG',
	CD: 'COD',
	CK: 'COK',
	CR: 'CRI',
	CI: 'CIV',
	HR: 'HRV',
	CU: 'CUB',
	CY: 'CYP',
	CZ: 'CZE',
	DK: 'DNK',
	DJ: 'DJI',
	DM: 'DMA',
	DO: 'DOM',
	EC: 'ECU',
	EG: 'EGY',
	SV: 'SLV',
	GQ: 'GNQ',
	ER: 'ERI',
	EE: 'EST',
	ET: 'ETH',
	FK: 'FLK',
	FO: 'FRO',
	FJ: 'FJI',
	FI: 'FIN',
	FR: 'FRA',
	GF: 'GUF',
	PF: 'PYF',
	TF: 'ATF',
	GA: 'GAB',
	GM: 'GMB',
	GE: 'GEO',
	DE: 'DEU',
	GH: 'GHA',
	GI: 'GIB',
	GR: 'GRC',
	GL: 'GRL',
	GD: 'GRD',
	GP: 'GLP',
	GU: 'GUM',
	GT: 'GTM',
	GN: 'GIN',
	GW: 'GNB',
	GY: 'GUY',
	HT: 'HTI',
	HM: 'HMD',
	VA: 'VAT',
	HN: 'HND',
	HK: 'HKG',
	HU: 'HUN',
	IS: 'ISL',
	IN: 'IND',
	ID: 'IDN',
	IR: 'IRN',
	IQ: 'IRQ',
	IE: 'IRL',
	IL: 'ISR',
	IT: 'ITA',
	JM: 'JAM',
	JP: 'JPN',
	JO: 'JOR',
	KZ: 'KAZ',
	KE: 'KEN',
	KI: 'KIR',
	KP: 'PRK',
	KR: 'KOR',
	KW: 'KWT',
	KG: 'KGZ',
	LA: 'LAO',
	LV: 'LVA',
	LB: 'LBN',
	LS: 'LSO',
	LR: 'LBR',
	LY: 'LBY',
	LI: 'LIE',
	LT: 'LTU',
	LU: 'LUX',
	MO: 'MAC',
	MG: 'MDG',
	MW: 'MWI',
	MY: 'MYS',
	MV: 'MDV',
	ML: 'MLI',
	MT: 'MLT',
	MH: 'MHL',
	MQ: 'MTQ',
	MR: 'MRT',
	MU: 'MUS',
	YT: 'MYT',
	MX: 'MEX',
	FM: 'FSM',
	MD: 'MDA',
	MC: 'MCO',
	MN: 'MNG',
	MS: 'MSR',
	MA: 'MAR',
	MZ: 'MOZ',
	MM: 'MMR',
	NA: 'NAM',
	NR: 'NRU',
	NP: 'NPL',
	NL: 'NLD',
	NC: 'NCL',
	NZ: 'NZL',
	NI: 'NIC',
	NE: 'NER',
	NG: 'NGA',
	NU: 'NIU',
	NF: 'NFK',
	MP: 'MNP',
	MK: 'MKD',
	NO: 'NOR',
	OM: 'OMN',
	PK: 'PAK',
	PW: 'PLW',
	PS: 'PSE',
	PA: 'PAN',
	PG: 'PNG',
	PY: 'PRY',
	PE: 'PER',
	PH: 'PHL',
	PN: 'PCN',
	PL: 'POL',
	PT: 'PRT',
	PR: 'PRI',
	QA: 'QAT',
	RE: 'REU',
	RO: 'ROU',
	RU: 'RUS',
	RW: 'RWA',
	SH: 'SHN',
	KN: 'KNA',
	LC: 'LCA',
	PM: 'SPM',
	VC: 'VCT',
	WS: 'WSM',
	SM: 'SMR',
	ST: 'STP',
	SA: 'SAU',
	SN: 'SEN',
	SC: 'SYC',
	SL: 'SLE',
	SG: 'SGP',
	SK: 'SVK',
	SI: 'SVN',
	SB: 'SLB',
	SO: 'SOM',
	ZA: 'ZAF',
	GS: 'SGS',
	ES: 'ESP',
	LK: 'LKA',
	SD: 'SDN',
	SR: 'SUR',
	SJ: 'SJM',
	SZ: 'SWZ',
	SE: 'SWE',
	CH: 'CHE',
	SY: 'SYR',
	TW: 'TWN',
	TJ: 'TJK',
	TZ: 'TZA',
	TH: 'THA',
	TL: 'TLS',
	TG: 'TGO',
	TK: 'TKL',
	TO: 'TON',
	TT: 'TTO',
	TN: 'TUN',
	TR: 'TUR',
	TM: 'TKM',
	TC: 'TCA',
	TV: 'TUV',
	UG: 'UGA',
	UA: 'UKR',
	AE: 'ARE',
	GB: 'GBR',
	US: 'USA',
	UM: 'UMI',
	UY: 'URY',
	UZ: 'UZB',
	VU: 'VUT',
	VE: 'VEN',
	VN: 'VNM',
	VG: 'VGB',
	VI: 'VIR',
	WF: 'WLF',
	EH: 'ESH',
	YE: 'YEM',
	ZM: 'ZMB',
	ZW: 'ZWE',
	AX: 'ALA',
	BQ: 'BES',
	CW: 'CUW',
	GG: 'GGY',
	IM: 'IMN',
	JE: 'JEY',
	ME: 'MNE',
	BL: 'BLM',
	MF: 'MAF',
	RS: 'SRB',
	SX: 'SXM',
	XK: 'XKK'
}
export const convertCountryCode = (alpha2) => countryCodesMap[alpha2.toUpperCase()]

const countryCentroidMap = {
	CAN: [-110, 60],
	USA: [-100, 41],
	FRA: [2.5, 47],
	GBR: [-1.8, 53],
	IDN: [114, -1],
	// NOR: [12, 63],
	NZL: [172.3, -42.5],
}
export const getCountryCentroid = (name) => countryCentroidMap[name]

const cityCountryMap = {
	sakaiminato: "JPN",
	istanbul: "TUR",
	imperia: "ITA",
	ko_samui: "THA",
	fatih: "TUR",
	nicosia: "CYP",
}
export const getCountryByCity = (city) => cityCountryMap[city.toLowerCase().replace(" ", "_")]
