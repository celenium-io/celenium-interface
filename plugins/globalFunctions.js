/** Services */
import { comma, getShortNamespaceID, shortHash, splitAddress } from "@/services/utils"

/** Store */
import { useBookmarksStore } from "@/store/bookmarks.store"

const SYSTEM_ADDRESSES = [
	"celestia1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3y3clr6",
	"celestia10d07y265gmmuvt4z0w9aw880jnsr700jtgz4v7",
	"celestia1vlthgax23ca9syk7xgaz347xmf4nunefkz88ka",
	"celestia1yl6hdjhmkf37639730gffanpzndzdpmhl48edw",
	"celestia1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8k44vnj",
	"celestia1m3h30wlvsf8llruxtpukdvsy0km2kum8emkgad",
	"celestia17xpfvakm2amg962yls6f84z3kell8c5lpnjs3s",
	"celestia1tygms3xhhs3yv487phx3dw4a95jn7t7ls3yw4w",
]

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
			case "addresses":
			case "address":
				if (SYSTEM_ADDRESSES.includes(id) && entity?.name) {
					return entity.name
				}

				if (entity?.celestials?.name) {
					return entity.celestials.name
				}

				return splitAddress(id)
			case "blocks":
				return comma(id)
			case "namespaces":
			case "namespace":
				return getShortNamespaceID(id)
			case "txs":
			case "tx":
				return shortHash(id)
			default:
				return id
		}
	}

	nuxtApp.provide("getDisplayName", getDisplayName)
})
