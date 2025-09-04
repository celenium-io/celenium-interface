export const Server = {
	API: {
		mainnet: "https://api.celenium.io/v1",
		mocha: "https://api-mocha-4.celenium.io/v1",
		arabica: "https://api-arabica-11.celenium.io/v1",
		mammoth: "https://api-mammoth.celenium.io/v1",
		dev: "https://api-dev.celenium.io/v1",
	},
	WSS: {
		mainnet: "wss://api.celenium.io/v1/ws",
		mocha: "wss://api-mocha-4.celenium.io/v1/ws",
		arabica: "wss://api-arabica-11.celenium.io/v1/ws",
		mammoth: "wss://api-mammoth.celenium.io/v1/ws",
		dev: "wss://api-dev.celenium.io/v1/ws",
	},
	BLOBSTREAM: {
		mainnet: "https://api-blobstream.celenium.io/v1",
		testnet: "https://api-blobstream-testnet.celenium.io/v1",
	},
}

export const useServerURL = () => {
	const requestURL = useRequestURL()

	switch (requestURL.hostname) {
		case "celenium.io":
			return Server.API.mainnet

		case "mocha-4.celenium.io":
			return Server.API.mocha

		case "mocha.celenium.io":
			return Server.API.mocha

		case "arabica.celenium.io":
			return Server.API.arabica

		case "mammoth.celenium.io":
			return Server.API.mammoth

		case "dev.celenium.io":
			return Server.API.mainnet

		default:
			return Server.API.mainnet
	}
}

export const useSocketURL = () => {
	const requestURL = useRequestURL()

	switch (requestURL.hostname) {
		case "celenium.io":
			return Server.WSS.mainnet

		case "mocha-4.celenium.io":
			return Server.WSS.mocha

		case "mocha.celenium.io":
			return Server.WSS.mocha

		case "arabica.celenium.io":
			return Server.WSS.arabica

		case "mammoth.celenium.io":
			return Server.WSS.mammoth

		case "dev.celenium.io":
			return Server.WSS.mainnet

		default:
			return Server.WSS.mainnet
	}
}

export const useBlobstreamURL = () => {
	const requestURL = useRequestURL()

	switch (requestURL.hostname) {
		case "mocha-4.celenium.io":
			return Server.BLOBSTREAM.testnet

		case "mocha.celenium.io":
			return Server.BLOBSTREAM.testnet

		case "arabica.celenium.io":
			return Server.BLOBSTREAM.testnet

		case "mammoth.celenium.io":
			return Server.BLOBSTREAM.testnet

		default:
			return Server.BLOBSTREAM.mainnet
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

		case "mammoth.celenium.io":
			return "2025-04-09T14:16:23.868211567Z"

		case "dev.celenium.io":
			return "2024-01-02T12:18:46.936662Z"

		default:
			return "2023-09-06T03:15:51.510579Z"
	}
}

export const blockscoutURL = "https://celestia-l2-router.k8s-dev.blockscout.com/api/v1/celestia/l2BatchMetadata"

export const faucetURL = {
	mocha: "https://api-faucet.celenium.io/v1",
	arabica: "https://api-arabica-faucet.celenium.io/v1",
	mammoth: "https://api-mammoth-faucet.celenium.io/v1",
}
export const githubServiceURL = "https://github.celenium.io/v1"
export const nodeStatsURL = "https://node-stats.celenium.io/v1"
export const quoteServiceURL = "https://quote.celenium.io/v1"
export const rollupRankingServiceURL = "https://ranking.celenium.io/v1"
export const tvlServiceURL = "https://tvl.celenium.io/v1"
