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
	{
		group: 'Ecosystem',
		series: [
			{
				name: 'nodetype',
				title: 'node type',
			},
			{
				name: 'version',
				title: 'version',
			},
		],
	},]

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

const loaderPathes = [
	{
		name: "France",
		path: "M283.4 19.83c-3.2 0-31.2 5.09-31.2 5.09c-1.3 41.61-30.4 78.48-90.3 84.88l-12.8-23.07l-25.1 2.48l11.3 60.09l-113.79-4.9l12.2 41.5C156.3 225.4 150.7 338.4 124 439.4c47 53 141.8 47.8 186 43.1c3.1-62.2 52.4-64.5 135.9-32.2c11.3-17.6 18.8-36 44.6-50.7l-46.6-139.5l-27.5 6.2c11-21.1 32.2-49.9 50.4-63.4l15.6-86.9c-88.6-6.3-146.4-46.36-199-96.17",
		weight: 0.2,
	},
	{
		name: "Africa",
		path: "m201.56 19.495l-87.79 9.131l-73.745 94.814v52.676l56.186 61.805l64.615-13.344l49.164 9.832l-10.535 37.926l33.711 61.103l-16.855 42.842l39.79 116.225l53.62-8.768l49.164-55.484l4.213-38.629l31.605-23.879l-6.322-69.531l83.594-106.994l-51.989 7.263l-79.363-138.359l-125.016-8.428z",
		weight: 0.2,
	},
	{
		name: "Mongolia",
		path: "m18.83 183.4l73.19-29.3L165.6 185c6.3-17 8.6-42.6 26.3-44.3c22.3-2.1 42.9 15.1 47.1 39.9l54-1.6l54.5 22.8l55-35.2l32.3 7.9s-20.3 32.6-9.7 42.4c9.1 8.5 35.5-10.9 35.5-10.9l32.6 22.1l-87.1 62.7c-6.7-4.7-16.4-13.5-27.1-5c-9.9 7.9-6 21.9 1 33.8c-32.9 31-71 43-109.8 51.7l-127.8-30l-92.59-70c9.92-34.7-14.36-61-30.98-87.9",
		weight: 0.2,
	},
	{
		name: "Brazil",
		path: "M292.8 41.71c16.1 58.89 125.3 78.19 197.9 116.19c1.6 35.2-14.4 72.6-56.7 102.3c2.9 70.2-41.8 110.2-114.3 132.4c-.3 33.2-12.7 64-47.3 90.3l-59-36.4l47.4-34.2c-1.8-25.6-9.6-52.3-55-67.3l-26.3-93.2c-54.5-10.4-51.9-31.3-56.3-50.9l-64.93 20.4c-49.154-31-51.902-75.4 6.26-83.4l6.99-72.78l51.18 9.12L133 37.03l49.6-7.9l20.7 37.33z",
		weight: 0.2,
	},
	{
		name: "Australia",
		path: "m380.37 28.839l-27.24 100.215l-64-48l17.405-34.46l-83.863 8.079l-13.541 42.38l-35.512-25.482l-67.16 85.62l-83.008 48.593l34.81 156.752l38.87 6.518l112-64l74.38 52.082l21.62-28.094l32 72.012L424 415.452l64.549-126.398l-6.014-64.703l-65.404-79.297l-36.762-116.215z",
		weight: 0.2,
	}
]
export function getRandomLoaderPath() {
	const randomNum = Math.random()

	let cumWeight = 0
	for (let p of loaderPathes.filter(el => el.weight <= 1)) {
		cumWeight += p.weight
		if (randomNum <= cumWeight) {
			return p.path
		}
	}
}