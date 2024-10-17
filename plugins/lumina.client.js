import { NodeClient, NodeConfig } from "@/services/lumina-node-wasm/lumina_node_wasm.js"

export default defineNuxtPlugin({
	name: 'lumina',
	setup() {
		return {
			provide: {
				lumina: {
					NodeClient,
					NodeConfig
				}
			}
		}
	}
})