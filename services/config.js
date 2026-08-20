export const useServerURL = () => {
	const { public: p } = useRuntimeConfig()
	const requestURL = useRequestURL()

	switch (requestURL.hostname) {
		case "celenium.io":
			return p.API_MAINNET

		case "mocha.celenium.io":
		case "mocha-4.celenium.io":
			return p.API_MOCHA

		case "dev.celenium.io":
			return p.API_DEV

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

		default:
			return p.API_DEV
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

		case "dev.celenium.io":
			return p.WSS_DEV

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

		case "dev.celenium.io":
			return "2023-09-06T03:15:51.510579Z"

		default:
			return "2023-09-06T03:15:51.510579Z"
	}
}

export const faucetAddress = () => useRuntimeConfig().public.FAUCET_ADDRESS
export const faucetURL = () => {
	const { public: p } = useRuntimeConfig()
	return {
		mocha: p.FAUCET_MOCHA,
	}
}

export const blockscoutURL = () => useRuntimeConfig().public.BLOCKSCOUT
export const githubServiceURL = () => useRuntimeConfig().public.GITHUB
export const nodeStatsURL = () => useRuntimeConfig().public.NODE_STATS
export const quoteServiceURL = () => useRuntimeConfig().public.QUOTE
export const rollupRankingServiceURL = () => useRuntimeConfig().public.ROLLUP_RANKING
export const tvlServiceURL = () => useRuntimeConfig().public.TVL
export const getBlobsURL = () => {
	const { public: p } = useRuntimeConfig()
	const requestURL = useRequestURL()

	switch (requestURL.hostname) {
		case "mocha.celenium.io":
		case "mocha-4.celenium.io":
			return p.BLOBS_MOCHA
		case "localhost":
			return p.BLOBS_MOCHA

		default:
			return null
	}
}

export const isSelfhosted = () => useRuntimeConfig().public.SELFHOSTED

export const Auth = {
	clientId: "jXqMTqkexWpVuE1ssMDrC2rMm9wv4ior4C9tBcuI",
	scope: "read",
	baseUrl: "https://auth.celenium.io",
	authorizeUrl: "/oauth/authorize/",
	getTokenUrl: "/oauth/token/",
	revokeTokenUrl: "/oauth/revoke_token/",
	getCurrentUserUrl: "/api/v1/user/me/",
	saveSettingsUrl: "/api/v1/user/settings/",
	redirectPath: "/auth/callback",
}
