/** Services */
import { faucetURL } from "@/services/config"

export const fetchBalance = async (network) => {
	if (!faucetURL()[network]) return {}

	try {
		const data = await useFetch(`${faucetURL()[network]}/balance`)
		
		return data
	} catch (error) {
		console.error(error)
	}
}

export const executeFaucet = async (network, address) => {
	if (!faucetURL()[network]) throw new Error(`URL for ${network} is undefined`);

	try {
		const data = await useFetch(`${faucetURL()[network]}/faucet`, {
			method: "post",
			body: {
				address,
			},
		})

		return data
	} catch (error) {
		console.error(error)
	}
}
