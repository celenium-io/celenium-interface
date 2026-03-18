/** Constants */
import { StatusMap } from "@/services/constants/node.js"

export const useNodeStore = defineStore("node", () => {
	const status = ref(StatusMap.Default)
	const percentage = ref(0)
	const bootnodes = ref([])
	const rawBootnodes = ref([])

	const settings = reactive({
		autostart: false,
		charger: false,

		network: "",
	})

	return { status, percentage, bootnodes, rawBootnodes, settings }
})
