/**
 * Vendor
 */
import { ref, reactive } from "vue"
import { defineStore, acceptHMRUpdate } from "pinia"

export const useCacheStore = defineStore("cache", () => {
	const selectedBlob = ref(null)

	const current = reactive({
		_target: null,
		/** namespace */
		namespace: null,
		messages: null,
		/** block */
		block: null,
		transactions: null,
	})

	return { selectedBlob, current }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCacheStore, import.meta.hot))
}
