/**
 * Vendor
 */
import { ref, reactive } from "vue"
import { defineStore, acceptHMRUpdate } from "pinia"

export const useCacheStore = defineStore("cache", () => {
	const selectedBlob = ref(null)

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

		/** address */
		address: null,
	})

	return { selectedBlob, current }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCacheStore, import.meta.hot))
}
