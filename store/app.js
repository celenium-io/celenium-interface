import { useModalsStore } from "./modals"

export const useAppStore = defineStore("app", () => {
	const modalsStore = useModalsStore()

	const head = ref()

	const latestBlocks = ref([])
	const isLatestBlocksLoaded = ref(false)

	const showCmd = ref(false)

	const theme = ref("")

	const confirmation = ref(null)
	const createConfirmation = (metadata) => {
		confirmation.value = metadata

		modalsStore.open("confirmation")
	}

	return { head, latestBlocks, isLatestBlocksLoaded, showCmd, theme, confirmation, createConfirmation }
})
