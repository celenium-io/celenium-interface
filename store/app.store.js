/** API */
import { fetchConstants } from "@/services/api/main"
import { fetchActiveProposals } from "@/services/api/proposal"

import { useModalsStore } from "./modals.store"

/** Constants */
import { getActiveUpdates } from "@/services/constants/updates"

export const useAppStore = defineStore("app", () => {
	const version = ref()

	const modalsStore = useModalsStore()

	const network = ref()

	const constants = ref()
	const initConstants = async () => {
		const data = await fetchConstants()
		constants.value = data?.module
	}

	const globalUpdates = ref([])
	const initGlobalUpdates = async () => {
		const { data } = await fetchActiveProposals()
		globalUpdates.value = data.value?.map(p => ({...p, kind: "proposal"}))
		const updates = getActiveUpdates()
		globalUpdates.value = [...updates, ...globalUpdates.value]
	}

	const gas = ref({
		fast: 0,
		median: 0,
		slow: 0,
	})
	const currentPrice = ref({
		time: "",
		open: "0",
		high: "0",
		low: "0",
		close: "0",
	})
	const tvs = ref(0)

	const wallet = ref("")
	const address = ref("")
	const balance = ref(0)
	const isConnected = ref(false)

	const latestBlocks = ref([])
	const lastBlock = computed(() => latestBlocks.value?.at(0))
	const lastHead = ref({})
	const isLatestBlocksLoaded = ref(false)
	const isPaused = ref(false)

	const showCmd = ref(false)
	const cmdAction = ref()

	const showSidebar = ref(false)

	const theme = ref("")

	const confirmation = ref(null)
	const createConfirmation = (metadata) => {
		confirmation.value = metadata

		modalsStore.open("confirmation")
	}

	return {
		version,
		network,
		constants,
		initConstants,
		globalUpdates,
		initGlobalUpdates,
		gas,
		currentPrice,
		tvs,
		wallet,
		address,
		balance,
		isConnected,
		latestBlocks,
		lastBlock,
		lastHead,
		isPaused,
		isLatestBlocksLoaded,
		showCmd,
		cmdAction,
		showSidebar,
		theme,
		confirmation,
		createConfirmation,
	}
})
