export const useAppStore = defineStore("app", () => {
	const head = ref()

	const latestBlocks = ref([])
	const isLatestBlocksLoaded = ref(false)

	const showCmd = ref(false)

	return { head, latestBlocks, isLatestBlocksLoaded, showCmd }
})
