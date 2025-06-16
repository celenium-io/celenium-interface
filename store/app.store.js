import { useModalsStore } from "./modals.store"

export const useAppStore = defineStore("app", () => {
	const version = ref()

	const modalsStore = useModalsStore()

	const network = ref()

	const head = ref()
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

	const wallet = ref("")
	const address = ref("")
	const balance = ref(0)
	const isConnected = ref(false)

	const latestBlocks = ref([])
	const lastBlock = computed(() => latestBlocks.value[0])
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
		head,
		gas,
		currentPrice,
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
