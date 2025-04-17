/** Services */
import { faucetURL } from "@/services/config"

export const faucetAddress = "celestia16etnwjxg6dsjuavjpr9tk822czfeylfm9f7x5g"

export const fetchBalance = async (network) => {
	try {
		const data = await useFetch(`${faucetURL[network]}/balance`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const executeFaucet = async (network, address) => {
	try {
		
		const data = await useFetch(`${faucetURL[network]}/faucet`, {
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
