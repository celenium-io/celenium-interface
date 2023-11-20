/**
 * Vendor
 */
import { ref, reactive } from "vue"
import { defineStore, acceptHMRUpdate } from "pinia"

export const useCacheStore = defineStore("cache", () => {
	const selectedBlob = ref(null)

	const current = reactive({
		_target: null,
		namespace: null,
		messages: null,
	})

	return { selectedBlob, current }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCacheStore, import.meta.hot))
}
