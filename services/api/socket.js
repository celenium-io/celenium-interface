/** Services */
import { useSocketURL } from "../config"

/** Store */
import { useAppStore } from "@/store/app"

export let socket = null

export const init = () => {
	const appStore = useAppStore()

	socket = new WebSocket(useSocketURL())

	socket.addEventListener("open", (e) => {
		/** Head Subscription */
		socket.send(
			JSON.stringify({
				method: "subscribe",
				body: {
					channel: "head",
				},
			}),
		)
	})

	socket.addEventListener("message", (e) => {
		const data = JSON.parse(e.data)
		appStore.latestBlocks.unshift(data)
		setTimeout(() => {
			appStore.latestBlocks.pop()
		}, 1_000)
	})
}

export const close = () => {
	socket.close()
}

export default { init, close }
