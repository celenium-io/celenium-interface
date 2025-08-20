/** API */
import { fetchConstants } from "@/services/api/main"
import { fetchActiveProposals, fetchProposals } from "@/services/api/proposal"

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
		// const { data } = await fetchActiveProposals()
		// const { data } = await fetchProposals({ limit: 20, offset: 0 })
		// globalUpdates.value = data.value.map(p => ({...p, kind: "proposal"}))
		globalUpdates.value = [
{
"kind": "proposal",
"id": 5,
"height": 3648325,
"created_at": "2025-01-21T17:21:47.152406Z",
"deposit_time": "2025-01-28T17:21:47.152406Z",
"activation_time": "2025-01-21T17:21:47.152406Z",
"end_time": "2025-01-28T17:21:47.152406Z",
"status": "applied",
"type": "param_changed",
"title": "Increase the Max Block Size to 8MB Increase the Max Block Size to 8MB",
"description": "This proposal increases the max block bytes to 8MiB. The value for GovMaxSquareSize is set to the upper bound of 128. \nVoting yes on this proposal will increase the total block size to 8MiB.",
"deposit": "10000000000",
"votes_count": 14051,
"yes": 13814,
"no": 129,
"no_with_veto": 21,
"abstain": 87,
"yes_vals": 71,
"no_vals": 0,
"no_with_veto_vals": 0,
"abstain_vals": 0,
"yes_addrs": 13743,
"no_addrs": 129,
"no_with_veto_addrs": 21,
"abstain_addrs": 87,
"total_voting_power": "709474561",
"voting_power": "318990471273216",
"yes_voting_power": "318973526844665",
"no_voting_power": "3771228140",
"no_with_veto_voting_power": "1992147763",
"abstain_voting_power": "11181052648",
"quorum": "0.334000000000000000",
"veto_quorum": "0.334000000000000000",
"threshold": "0.500000000000000000",
"min_deposit": "10000000000utia",
"changes": [
{
"subspace": "baseapp",
"key": "BlockParams",
"value": "{\n                \"max_bytes\": \"8388608\",\n                \"max_gas\": \"-1\"\n            }"
},
{
"subspace": "blob",
"key": "GovMaxSquareSize",
"value": "\"128\""
}
],
"proposer": {
"hash": "celestia1jkuw8rxxrsgn9pq009987kzelkp46cgcczuxp5"
}
},
{
"kind": "proposal",
"id": 6,
"height": 4396389,
"created_at": "2025-03-11T03:11:42.191766Z",
"deposit_time": "2025-03-18T03:11:42.191766Z",
"status": "removed",
"type": "community_pool_spend",
"title": "💎ATOM Airdrop ✅",
"description": "Get 💎ATOM Airdrop ✅ visiting url: www.eCosmo.at\n\n⭐ - Conditions: Try the new version visiting: https://eCosmo.at",
"deposit": "1000000",
"votes_count": 0,
"yes": 0,
"no": 0,
"no_with_veto": 0,
"abstain": 0,
"yes_vals": 0,
"no_vals": 0,
"no_with_veto_vals": 0,
"abstain_vals": 0,
"yes_addrs": 0,
"no_addrs": 0,
"no_with_veto_addrs": 0,
"abstain_addrs": 0,
"total_voting_power": "0",
"voting_power": "0",
"yes_voting_power": "0",
"no_voting_power": "0",
"no_with_veto_voting_power": "0",
"abstain_voting_power": "0",
"changes": {
"Amount": [
{
"denom": "utia",
"amount": "1000000"
}
],
"Recipient": "celestia1zxsagcv5dgjhkhfdckcdprh7gd43s7kkhpx5p6"
},
"proposer": {
"hash": "celestia1zxsagcv5dgjhkhfdckcdprh7gd43s7kkhpx5p6"
}
},

]
		const updates = getActiveUpdates()
		globalUpdates.value = [...updates, ...globalUpdates.value]
		console.log('globalUpdates.value', globalUpdates.value);
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
