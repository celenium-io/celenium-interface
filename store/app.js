export const useAppStore = defineStore("app", () => {
	const head = ref({
		last_height: 0,
		hash: "",
		last_time: new Date(),
		total_tx: 0,
		total_accounts: 0,
		total_fee: 0,
		total_blobs_size: 0,
		total_supply: 0,
	})
	const latestBlocks = ref([])

	return { head, latestBlocks }
})
