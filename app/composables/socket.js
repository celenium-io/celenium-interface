/** Vendor */
import { useWebSocket } from "@vueuse/core"

/** Services */
import { useSocketURL } from "~/services/config.js"

/** Store */
import { useAppStore } from "~/store/app.store.js"

const CHANNELS = ["head", "blocks"]

export const useSocket = () => {
	const appStore = useAppStore()

	const handleHeadMessage = (head) => {
		appStore.lastHead = head
	}
	const handleBlockMessage = (block) => {
		if (!block.height) return
		if (appStore.latestBlocks[0]?.height === block.height) return

		appStore.latestBlocks?.unshift(block)
		if (appStore.latestBlocks?.length > 100) appStore.latestBlocks?.pop()
	}

	const { open } = useWebSocket(useSocketURL(), {
		immediate: false,
		autoReconnect: true,
		onConnected: (ws) => {
			for (const channel of CHANNELS) {
				ws.send(
					JSON.stringify({
						method: "subscribe",
						body: {
							channel,
						},
					}),
				)
			}
		},
		onMessage: (ws, event) => {
			let data
			try {
				data = JSON.parse(event.data)
			} catch {
				return
			}
			if (!data || !data.body || typeof data !== "object") return

			switch (data.channel) {
				case "head": {
					handleHeadMessage(data.body)
					break
				}
				case "blocks": {
					handleBlockMessage(data.body)
					break
				}
			}
		},
	})

	return { open }
}
