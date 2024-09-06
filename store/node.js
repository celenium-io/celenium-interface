/** Constants */
import { StatusMap } from "@/services/constants/node.js"

/** Utils */
import { getNetworkName } from "@/services/utils/general"

export const useNodeStore = defineStore("node", () => {
	const status = ref(StatusMap.Default)
	const percentage = ref(0)

	const settings = reactive({
		autostart: false,
		charger: false,

		network: "",
	})

	return { status, percentage, settings }
})
