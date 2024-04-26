export const Server = {
	API: {
		mainnet: "https://api.celenium.io/v1",
		mocha: "https://api-mocha-4.celenium.io/v1",
		arabica: "https://api-arabica-11.celenium.io/v1",
		dev: "https://api-dev.celenium.io/v1",
	},
	WSS: {
		mainnet: "wss://api.celenium.io/v1/ws",
		mocha: "wss://api-mocha-4.celenium.io/v1/ws",
		arabica: "wss://api-arabica-11.celenium.io/v1/ws",
		dev: "wss://api-dev.celenium.io/v1/ws",
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

		case "dev.celenium.io":
			return Server.API.dev

		default:
			return Server.API.dev
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

		case "dev.celenium.io":
			return Server.WSS.dev

		default:
			return Server.WSS.dev
	}
}

export const useBlobstreamURL = "https://api-blobstream.celenium.io/v1"
