export const useServerURL = () => {
	const { public: p } = useRuntimeConfig()
	const requestURL = useRequestURL()

	switch (requestURL.hostname) {
		case "celenium.io":
			return p.API_MAINNET

		case "mocha.celenium.io":
		case "mocha-4.celenium.io":
			return p.API_MOCHA

		case "arabica.celenium.io":
			return p.API_ARABICA

		case "dev.celenium.io":
			return p.API_MAINNET

		default:
			return p.API_DEV
	}
}

export const getServerURL = (network) => {
	const { public: p } = useRuntimeConfig()

	switch (network) {
		case "mainnet":
			return p.API_MAINNET
		case "mocha":
			return p.API_MOCHA
		case "arabica":
			return p.API_ARABICA

		default:
			return p.API_MAINNET
	}
}

export const useSocketURL = () => {
	const { public: p } = useRuntimeConfig()
	const requestURL = useRequestURL()

	switch (requestURL.hostname) {
		case "celenium.io":
			return p.WSS_MAINNET

		case "mocha.celenium.io":
		case "mocha-4.celenium.io":
			return p.WSS_MOCHA

		case "arabica.celenium.io":
			return p.WSS_ARABICA

		case "dev.celenium.io":
			return p.WSS_MAINNET

		default:
			return p.WSS_DEV
	}
}

export const useBlobstreamURL = () => {
	const { public: p } = useRuntimeConfig()
	const requestURL = useRequestURL()

	switch (requestURL.hostname) {
		case "mocha.celenium.io":
		case "mocha-4.celenium.io":
		case "arabica.celenium.io":
			return p.BLOBSTREAM_TESTNET

		default:
			return p.BLOBSTREAM_MAINNET
	}
}

export const getStartChainDate = () => {
	const requestURL = useRequestURL()

	switch (requestURL.hostname) {
		case "celenium.io":
			return "2023-10-31T14:00:00Z"

		case "mocha-4.celenium.io":
			return "2023-09-06T03:15:51.510579Z"

		case "mocha.celenium.io":
			return "2023-09-06T03:15:51.510579Z"

		case "arabica.celenium.io":
			return "2024-01-02T12:18:46.936662Z"

		case "dev.celenium.io":
			return "2024-01-02T12:18:46.936662Z"

		default:
			return "2023-09-06T03:15:51.510579Z"
	}
}

export const faucetAddress = () => useRuntimeConfig().public.FAUCET_ADDRESS
export const faucetURL = () => {
	const { public: p } = useRuntimeConfig()
	return {
		mocha: p.FAUCET_MOCHA,
		arabica: p.FAUCET_ARABICA,
	}
}

export const blockscoutURL = () => useRuntimeConfig().public.BLOCKSCOUT
export const githubServiceURL = () => useRuntimeConfig().public.GITHUB
export const nodeStatsURL = () => useRuntimeConfig().public.NODE_STATS
export const quoteServiceURL = () => useRuntimeConfig().public.QUOTE
export const rollupRankingServiceURL = () => useRuntimeConfig().public.ROLLUP_RANKING
export const tvlServiceURL = () => useRuntimeConfig().public.TVL

export const isSelfhosted = () => useRuntimeConfig().public.SELFHOSTED
