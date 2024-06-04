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

	const hasBookmarks = computed(() => {
		let has = false

		Object.keys(bookmarks.value).forEach((b) => {
			if (bookmarks.value[b].length) has = true
		})

		return has
	})

	const getBookmarkAlias = (type, hash) => {
		switch (type) {
			case 'tx':
				return findBookmark('txs', hash)
			case 'block':
				return findBookmark('blocks', hash)
			case 'namespace':
				return findBookmark('namespaces', hash)
			case 'address':
				return findBookmark('addresses', hash)
			default:
				return hash
		}
	}

	const findBookmark = (key, id) => {
		for (let i = 0; i < bookmarks.value[key].length; i++) {
			const el = bookmarks.value[key][i]
			if (el.id === id) {
				return el.alias
			}
		}

		return id
	}

	const clearBookmarks = () => {
		Object.keys(bookmarks.value).forEach((b) => {
			bookmarks.value[b] = []
		})
	}

	return { bookmarks, recentBookmarks, clearBookmarks, hasBookmarks, getBookmarkAlias }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useBookmarksStore, import.meta.hot))
}
