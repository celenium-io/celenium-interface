export const mocha = {
	chainId: "mocha-4",
	chainName: "Celestia Mocha Testnet",
	rpc: "https://rpc-celestia-testnet-mocha.keplr.app",
	rest: "https://lcd-celestia-testnet-mocha.keplr.app",
	chainSymbolImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/mocha/chain.png",
	stakeCurrency: {
		coinDenom: "TIA",
		coinMinimalDenom: "utia",
		coinDecimals: 6,
	},
	bip44: {
		coinType: 118,
	},
	bech32Config: {
		bech32PrefixAccAddr: "celestia",
		bech32PrefixAccPub: "celestiapub",
		bech32PrefixValAddr: "celestiavaloper",
		bech32PrefixValPub: "celestiavaloperpub",
		bech32PrefixConsAddr: "celestiavalcons",
		bech32PrefixConsPub: "celestiavalconspub",
	},
	currencies: [
		{
			coinDenom: "TIA",
			coinMinimalDenom: "utia",
			coinDecimals: 6,
		},
	],
	feeCurrencies: [
		{
			coinDenom: "TIA",
			coinMinimalDenom: "utia",
			coinDecimals: 6,
			gasPriceStep: {
				low: 0.01,
				average: 0.02,
				high: 0.1,
			},
		},
	],
	features: [],
}

export const arabica = {
	chainId: "arabica-11",
	chainName: "Celestia Arabica Testnet",
	rpc: "https://rpc.celestia-arabica-11.com",
	rest: "https://api.celestia-arabica-11.com",
	bip44: {
		coinType: 118,
	},
	bech32Config: {
		bech32PrefixAccAddr: "celestia",
		bech32PrefixAccPub: "celestia" + "pub",
		bech32PrefixValAddr: "celestia" + "valoper",
		bech32PrefixValPub: "celestia" + "valoperpub",
		bech32PrefixConsAddr: "celestia" + "valcons",
		bech32PrefixConsPub: "celestia" + "valconspub",
	},
	currencies: [
		{
			coinDenom: "TIA",
			coinMinimalDenom: "utia",
			coinDecimals: 6,
			coinGeckoId: "celestia",
		},
	],
	feeCurrencies: [
		{
			coinDenom: "TIA",
			coinMinimalDenom: "utia",
			coinDecimals: 6,
			coinGeckoId: "celestia",
			gasPriceStep: {
				low: 0.01,
				average: 0.025,
				high: 0.3,
			},
		},
	],
	stakeCurrency: {
		coinDenom: "TIA",
		coinMinimalDenom: "utia",
		coinDecimals: 6,
		coinGeckoId: "celestia",
	},
}

export const mammoth = {
	chainId: "mamo-1",
	chainName: "Celestia Mammoth Testnet",
	rpc: "https://rpc.ams.mamochain.com",
	rest: "https://api.ams.mamochain.com",
	bip44: {
		coinType: 118,
	},
	bech32Config: {
		bech32PrefixAccAddr: "celestia",
		bech32PrefixAccPub: "celestia" + "pub",
		bech32PrefixValAddr: "celestia" + "valoper",
		bech32PrefixValPub: "celestia" + "valoperpub",
		bech32PrefixConsAddr: "celestia" + "valcons",
		bech32PrefixConsPub: "celestia" + "valconspub",
	},
	currencies: [
		{
			coinDenom: "TIA",
			coinMinimalDenom: "utia",
			coinDecimals: 6,
			coinGeckoId: "celestia",
		},
	],
	feeCurrencies: [
		{
			coinDenom: "TIA",
			coinMinimalDenom: "utia",
			coinDecimals: 6,
			coinGeckoId: "celestia",
			gasPriceStep: {
				low: 0.01,
				average: 0.025,
				high: 0.3,
			},
		},
	],
	stakeCurrency: {
		coinDenom: "TIA",
		coinMinimalDenom: "utia",
		coinDecimals: 6,
		coinGeckoId: "celestia",
	},
}

export const mainnet = {
	bech32Config: {
		bech32PrefixAccAddr: "celestia",
		bech32PrefixAccPub: "celestiapub",
		bech32PrefixConsAddr: "celestiavalcons",
		bech32PrefixConsPub: "celestiavalconspub",
		bech32PrefixValAddr: "celestiavaloper",
		bech32PrefixValPub: "celestiavaloperpub",
	},
	bip44: {
		coinType: 118,
	},
	chainId: "celestia",
	chainName: "Celestia",
	chainSymbolImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/celestia/chain.png",
	currencies: [
		{
			coinDecimals: 6,
			coinDenom: "TIA",
			coinGeckoId: "celestia",
			coinMinimalDenom: "utia",
			coinImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/celestia/chain.png",
		},
	],
	features: [],
	feeCurrencies: [
		{
			coinDecimals: 6,
			coinDenom: "TIA",
			coinGeckoId: "celestia",
			coinMinimalDenom: "utia",
			coinImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/celestia/chain.png",
			gasPriceStep: {
				low: 0.01,
				average: 0.02,
				high: 0.1,
			},
		},
	],
	rpc: "https://rpc-celestia.keplr.app",
	rest: "https://lcd-celestia.keplr.app",
	stakeCurrency: {
		coinDecimals: 6,
		coinDenom: "TIA",
		coinGeckoId: "celestia",
		coinMinimalDenom: "utia",
		coinImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/celestia/utia.png",
	},
	walletUrlForStaking: "https://wallet.keplr.app/chains/celestia",
}
