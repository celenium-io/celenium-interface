export const Server = {
	API: {
		mainnet: "https://api.celenium.io/v1",
		mocha: "https://api-mocha-4.celenium.io/v1",
		dev: "https://api-dev.celenium.io/v1",
	},
	WSS: "wss://api-dev.celenium.io/v1/ws",
}

export const useServerURL = () => {
	const requestURL = useRequestURL()

	switch (requestURL.hostname) {
		case "celenium.io":
			return Server.API.mainnet

		case "mocha-4.celenium.io":
			return Server.API.mocha

		case "dev.celenium.io":
			return Server.API.dev

		default:
			return Server.API.dev
	}
}
