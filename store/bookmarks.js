/** Vendor */
import { defineStore, acceptHMRUpdate } from "pinia"

export const useBookmarksStore = defineStore("bookmarks", () => {
	const bookmarks = ref({
		addresses: [],
		blocks: [],
		namespaces: [],
		txs: [],
	})

	const recentBookmarks = computed(() => {
		return [...bookmarks.value.txs, ...bookmarks.value.blocks, ...bookmarks.value.namespaces, ...bookmarks.value.addresses]
			.sort((a, b) => b.ts - a.ts)
			.slice(0, 3)
	})

	const hasBookmarks = computed(() => {
		let has = false

		let keys = Object.keys(bookmarks.value)
		for (let i = 0; i < keys.length; i++) {
			if (bookmarks.value[keys[i]].length) {
				has = true
				break
			}
		}

		return has
	})

	const getBookmarkAlias = (type, id) => {
		if (!hasBookmarks) return id

		let store = getStoreByType(type)

		if (!store) return id

		for (let i = 0; i < store.length; i++) {
			let el = store[i]
			if (el.id === id) {
				return el.alias
			}
		}

		return id
	}

	const getBookmark = (type, id) => {
		if (!hasBookmarks) return null
		
		let store = getStoreByType(type)

		if (!store) return null
		
		for (let i = 0; i < store.length; i++) {
			let el = store[i]
			if (el.id === id) {
				return el
			}
		}

		return null
	}

	const addBookmark = (bookmark) => {
		let store = getStoreByType(bookmark.type)

		if (!store) return false

		store.push(bookmark)

		return true
	}

	const removeBookmark = (type, id) => {
		let store = getStoreByType(type)
		if (!store) return false

		let idx = store.findIndex((el) => el.id === id)

		if (idx === -1) return false

		store.splice(idx, 1)

		return true
	}

	const getStoreByType = (type) => {
		switch (type.toLowerCase()) {
			case 'address':
			case 'addresses':
				return bookmarks.value.addresses
			case 'block':
			case 'blocks':
				return bookmarks.value.blocks
			case 'namespace':
			case 'namespaces':
				return bookmarks.value.namespaces
			case 'tx':
			case 'txs':
				return bookmarks.value.txs
			default:
				return null
		}
	}

	const searchBookmark = (searchString) => {
		if (!hasBookmarks) return []
		
		let res = []
		
		Object.keys(bookmarks.value).forEach((b) => {
			
			bookmarks.value[b].forEach((el) => {
				if (el.alias?.toUpperCase().includes(searchString.toUpperCase())) {
					res.push({
						result: el,
						type: el.type.toLowerCase(),
					})
				}
			})
		})

		return res
	}

	const clearBookmarks = () => {
		Object.keys(bookmarks.value).forEach((b) => {
			bookmarks.value[b] = []
		})
	}

	return { bookmarks, hasBookmarks, recentBookmarks, addBookmark, clearBookmarks, getBookmark, getBookmarkAlias, removeBookmark, searchBookmark }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useBookmarksStore, import.meta.hot))
}
