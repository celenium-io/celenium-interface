/** Services */
import { useSocketURL } from "../config"

/** Store */
import { useAppStore } from "@/store/app"

export let socket = null

export const init = () => {
	const appStore = useAppStore()

	const startWs = () => {
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

			/** Blocks Subscription */
			socket.send(
				JSON.stringify({
					method: "subscribe",
					body: {
						channel: "blocks",
					},
				}),
			)
		})

		socket.addEventListener("message", (e) => {
			const data = JSON.parse(e.data)
			if (data.channel === "head") {
				appStore.lastHead = data.body
			} else if (data.channel === "blocks") {
				appStore.latestBlocks.unshift(data.body)
				setTimeout(() => {
					appStore.latestBlocks.pop()
				}, 1000)
			}
		})

		socket.addEventListener("close", () => {
			socket.value = null
			setTimeout(startWs, 1_000)
		})
	}

	startWs()
}

export const close = () => {
	socket.close()
}

export default { init, close }
