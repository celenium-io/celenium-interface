/** Vendor */
import { defineStore, acceptHMRUpdate } from "pinia"

export const useBookmarksStore = defineStore("bookmarks", () => {
	const bookmarks = ref({
		txs: [],
		blocks: [],
		namespaces: [],
		addresses: [],
	})

	const recentBookmarks = computed(() => {
		return [...bookmarks.value.txs, ...bookmarks.value.blocks, ...bookmarks.value.namespaces, ...bookmarks.value.addresses]
			.sort((a, b) => b.ts - a.ts)
			.slice(0, 3)
	})

	return { bookmarks, recentBookmarks }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useBookmarksStore, import.meta.hot))
}
