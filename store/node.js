/** Constants */
import { StatusMap } from "@/services/constants/node.js"

export const useNodeStore = defineStore("node", () => {
	const status = ref(StatusMap.Default)
	const percentage = ref(0)

	return { status, percentage }
})
