/** Services */
import { faucetURL } from "@/services/config"

export const faucetAddress = "celestia16etnwjxg6dsjuavjpr9tk822czfeylfm9f7x5g"

export const fetchBalance = async () => {
	try {
		const data = await useFetch(`${faucetURL}/balance`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const executeFaucet = async (address) => {
	try {
		
		const data = await useFetch(`${faucetURL}/faucet`, {
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
