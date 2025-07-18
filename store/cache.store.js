/**
 * Vendor
 */
import { ref, reactive } from "vue"
import { defineStore, acceptHMRUpdate } from "pinia"

export const useCacheStore = defineStore("cache", () => {
	const selectedBlob = ref(null)
	const selectedCommitment = ref(null)
	const selectedRollupRank = ref(null)
	const selectedRollup = ref(null)

	const qr = reactive({
		data: null,
		description: null,
		icon: null,
	})

	const chart = reactive({
		series: null,
		view: null,
	})

	const current = reactive({
		_target: null,

		/** global */
		transactions: null,

		/** namespace */
		namespace: null,
		messages: null,
		blobs: null,

		/** block */
		block: null,

		/** tx */
		transaction: null,
		events: null,
		message: null,
		event: null,

		/** address */
		address: null,

		/** bookmark */
		bookmark: null,

		/** blob viewer */
		blob: null,
		proof: null,
	})

	const tx = reactive({
		type: null,
		hash: null,
		from: null,
		to: null,
		amount: null,
		file: null,
		network: null,
		ts: null,
	})

	return { chart, current, qr, selectedBlob, selectedCommitment, selectedRollupRank, selectedRollup, tx }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCacheStore, import.meta.hot))
}
