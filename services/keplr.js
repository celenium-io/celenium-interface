import { TendermintTxTracer } from "@keplr-wallet/cosmos"

export const suggestChain = () => {
	return new Promise(async (resolve, reject) => {
		try {
			await window.keplr.experimentalSuggestChain({
				chainId: "mocha-4",
				chainName: "Mocha Testnet",
				rpc: "https://rpc-mocha.pops.one/",
				rest: "https://api-mocha.pops.one/",
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
							average: 0.02,
							high: 0.1,
						},
					},
				],
				stakeCurrency: {
					coinDenom: "TIA",
					coinMinimalDenom: "utia",
					coinDecimals: 6,
					coinGeckoId: "celestia",
				},
			})

			await window.keplr.enable("mocha-4")

			resolve({ success: true })
		} catch (error) {
			reject({ success: false, message: error.message })
		}
	})
}

export const getAccounts = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const offlineSigner = window.getOfflineSigner("mocha-4")
			const accounts = await offlineSigner.getAccounts()
			resolve(accounts)
		} catch (error) {
			reject(error.message)
		}
	})
}

export const sendMsgs = async (sender, proto, fee, memo = "") => {
	const account = await fetchAccountInfo(sender)
	const { pubKey } = await window.keplr.getKey("mocha-4")

	if (account) {
		const signDoc = {
			bodyBytes: TxBody.encode(
				TxBody.fromPartial({
					messages: proto,
					memo,
				}),
			).finish(),
			authInfoBytes: AuthInfo.encode({
				signerInfos: [
					{
						publicKey: {
							typeUrl: "/cosmos.crypto.secp256k1.PubKey",
							value: PubKey.encode({
								key: pubKey,
							}).finish(),
						},
						modeInfo: {
							single: {
								mode: SignMode.SIGN_MODE_DIRECT,
							},
							multi: undefined,
						},
						sequence: account.sequence,
					},
				],
				fee: Fee.fromPartial({
					amount: fee.amount.map((coin) => {
						return {
							denom: coin.denom,
							amount: coin.amount.toString(),
						}
					}),
					gasLimit: fee.gas,
				}),
			}).finish(),
			chainId: "mocha-4",
			accountNumber: Long.fromString(account.account_number),
		}

		const signed = await window.keplr.signDirect("mocha-4", sender, signDoc)

		const signedTx = {
			tx: TxRaw.encode({
				bodyBytes: signed.signed.bodyBytes,
				authInfoBytes: signed.signed.authInfoBytes,
				signatures: [Buffer.from(signed.signature.signature, "base64")],
			}).finish(),
			signDoc: signed.signed,
		}

		const txHash = await broadcastTxSync(window.keplr, "mocha-4", signedTx.tx)
		const txTracer = new TendermintTxTracer("https://rpc-mocha.pops.one/", "/websocket")
		txTracer.traceTx(txHash).then((tx) => {
			alert("Transaction commit successfully")
		})
	}
}

export const fetchAccountInfo = async (address) => {
	try {
		const uri = `https://api-mocha.pops.one/cosmos/auth/v1beta1/accounts/${address}`
		const response = await fetch(uri)

		return response.account
	} catch (e) {
		console.error("This may be a new account. Please send some tokens to this account first.")
		return undefined
	}
}

export const broadcastTxSync = async (tx) => {
	return window.keplr.sendTx("mocha-4", tx, "sync")
}
