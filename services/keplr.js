import { TendermintTxTracer } from "@keplr-wallet/cosmos"

import Base64 from "crypto-js/enc-base64"
import Hex from "crypto-js/enc-hex"

import { AuthInfo, Fee, TxBody, TxRaw, SignerInfo } from "./proto/gen/tx"
import { SignMode } from "./proto/gen/signing"
import { PubKey } from "./proto/gen/keys"

import Long from "long"

const arabica = {
	chainId: "arabica-11",
	chainName: "Arabica Celestia",
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

export const suggestChain = () => {
	return new Promise(async (resolve, reject) => {
		try {
			await window.keplr.experimentalSuggestChain(arabica)

			await window.keplr.enable(arabica.chainId)

			resolve({ success: true })
		} catch (error) {
			reject({ success: false, message: error.message })
		}
	})
}

export const getAccounts = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const offlineSigner = window.getOfflineSigner(arabica.chainId)
			const accounts = await offlineSigner.getAccounts()
			resolve(accounts)
		} catch (error) {
			reject(error.message)
		}
	})
}

const buildPayForBlob = (tx, blob) => {
	let blobTx = new proto.BlobTx()
	blobTx.setTx(tx)
	blobTx.setTypeId("BLOB")
	blobTx.addBlobs(blob)
	return blobTx.serializeBinary()
}

export const sendPayForBlob = async (sender, proto, fee, blob) => {
	const account = await fetchAccountInfo(sender)
	const { pubKey } = await window.keplr.getKey(arabica.chainId)

	const tx = TxBody.encode(
		TxBody.fromPartial({
			messages: proto,
			memo: "Sent via Celenium.io",
		}),
	).finish()

	if (account) {
		const signDoc = {
			bodyBytes: tx,
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
			chainId: arabica.chainId,
			accountNumber: Long.fromString(account.account_number),
		}

		const signed = await keplr.signDirect(arabica.chainId, sender, signDoc)

		const body = buildPayForBlob(
			TxRaw.encode({
				bodyBytes: signed.signed.bodyBytes,
				authInfoBytes: signed.signed.authInfoBytes,
				signatures: [decodeSignature(signed.signature.signature)],
			}).finish(),
			blob,
		)

		const signedTx = {
			tx: body,
			signDoc: signed.signed,
		}

		const txHash = await broadcastTxSync(arabica.chainId, signedTx.tx)
		return txHash
	}
}

export const simulateMsgs = async (sender, proto, fee) => {
	const account = await fetchAccountInfo(sender)

	if (account) {
		const unsignedTx = TxRaw.encode({
			bodyBytes: TxBody.encode(
				TxBody.fromPartial({
					messages: proto,
					memo: "",
				}),
			).finish(),
			authInfoBytes: AuthInfo.encode({
				signerInfos: [
					SignerInfo.fromPartial({
						modeInfo: {
							single: {
								mode: SignMode.SIGN_MODE_DIRECT,
							},
							multi: undefined,
						},
						sequence: account.sequence,
					}),
				],
				fee: Fee.fromPartial({
					amount: fee.map((coin) => {
						return {
							denom: coin.denom,
							amount: coin.amount.toString(),
						}
					}),
				}),
			}).finish(),
			signatures: [new Uint8Array(64)],
		}).finish()

		const simulatedResult = await $fetch(`${arabica.rest}/cosmos/tx/v1beta1/simulate`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				tx_bytes: Buffer.from(unsignedTx).toString("base64"),
			}),
		})

		const gasUsed = parseInt(simulatedResult.gas_info.gas_used)
		if (Number.isNaN(gasUsed)) {
			throw new Error(`Invalid integer gas: ${simulatedResult.gas_info.gas_used}`)
		}

		return gasUsed * 1.2
	}

	return undefined
}

export const sendMsgs = async (sender, proto, fee) => {
	const account = await fetchAccountInfo(sender)
	const { pubKey } = await window.keplr.getKey(arabica.chainId)

	const tx = TxBody.encode(
		TxBody.fromPartial({
			messages: proto,
			memo: "Sent via Celenium.io",
		}),
	).finish()

	if (account) {
		const signDoc = {
			bodyBytes: tx,
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
			chainId: arabica.chainId,
			accountNumber: Long.fromString(account.account_number),
		}

		const signed = await window.keplr.signDirect(arabica.chainId, sender, signDoc)

		const signedTx = {
			tx: TxRaw.encode({
				bodyBytes: signed.signed.bodyBytes,
				authInfoBytes: signed.signed.authInfoBytes,
				signatures: [decodeSignature(signed.signature.signature)],
			}).finish(),
			signDoc: signed.signed,
		}

		const txHash = await broadcastTxSync(arabica.chainId, signedTx.tx)

		const txTracer = new TendermintTxTracer(arabica.rpc, "/websocket")
		txTracer.traceTx(txHash).then((tx) => {
			console.log(tx)
		})
	}
}

export const fetchAccountInfo = async (address) => {
	try {
		const uri = `${arabica.rest}/cosmos/auth/v1beta1/accounts/${address}`
		const response = await $fetch(uri)
		return response.account
	} catch (e) {
		return undefined
	}
}

export const broadcastTxSync = async (chainId, tx) => {
	return window.keplr.sendTx(chainId, tx, "sync")
}

export const fromHexString = (hexString) => Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
function decodeSignature(s) {
	return fromHexString(Base64.parse(s).toString(Hex))
}
