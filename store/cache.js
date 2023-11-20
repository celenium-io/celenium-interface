/**
 * Vendor
 */
import { ref, reactive } from "vue"
import { defineStore, acceptHMRUpdate } from "pinia"

export const useCacheStore = defineStore("cache", () => {
	const selectedBlob = ref(null)

	return { selectedBlob }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCacheStore, import.meta.hot))
}
