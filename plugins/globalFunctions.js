/** Services */
import { comma, getShortNamespaceID, shortHash, splitAddress } from "@/services/utils"

/** Store */
import { useBookmarksStore } from "@/store/bookmarks"

export default defineNuxtPlugin((nuxtApp) => {

	const getDisplayName = (type, id, entity) => {
		if (entity?.hash) {
			id = entity.hash
		}
		const bookmarksStore = useBookmarksStore()
		const name = bookmarksStore.getBookmarkAlias(type, id)

		if (name !== id) {
			return name
		}
	
		switch (type) {
			case 'addresses':
				if (entity?.celestials?.name) {
					return entity.celestials.name
				}
				return splitAddress(id)
			case 'blocks':
				return comma(id)
			case 'namespaces':
				return getShortNamespaceID(id)
			case 'txs':
				return shortHash(id)
			default:
				return id
		}
	}

	nuxtApp.provide('getDisplayName', getDisplayName)
})
