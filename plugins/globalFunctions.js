/** Services */
import { comma, getShortHash, getShortNamespaceID, space, splitAddress } from "@/services/utils"

/** Store */
import { useBookmarksStore } from "@/store/bookmarks"

export default defineNuxtPlugin((nuxtApp) => {

	const getDisplayName = (type, id) => {
		const bookmarksStore = useBookmarksStore()
		const name = bookmarksStore.getBookmarkAlias(type, id)

		if (name !== id) {
			return name
		}
	
		switch (type) {
			case 'addresses':
				return splitAddress(id)
			case 'blocks':
				return comma(id)
			case 'namespaces':
				return getShortNamespaceID(id)
			case 'txs':
				return getShortHash(id)
			default:
				return id
		}
	}

	nuxtApp.provide('getDisplayName', getDisplayName)
})
