/** Vendor */
import { defineStore, acceptHMRUpdate } from "pinia"

/** API */
import { fetchEnums } from "@/services/api/main.js"

/** Constants */
import { DEFAULT_ENUMS, LOCAL_ENUMS_KEYS, ENUMS_OVERRIDES } from "@/services/constants/enums.js"

const toCamel = (target) => target.toLowerCase().replace(/[-_][a-z]/g, (group) => group.slice(-1).toUpperCase())

export const useEnumStore = defineStore("enums", () => {
	const enums = ref({})

	LOCAL_ENUMS_KEYS.forEach((key) => {
		const newKey = ENUMS_OVERRIDES[key] ? ENUMS_OVERRIDES[key] : toCamel(key)
		enums.value[newKey] = DEFAULT_ENUMS[key]
	})

	const init = async () => {
		const data = await fetchEnums()
		if (!data) return

		for (const enumKey in data) {
			if (ENUMS_OVERRIDES[enumKey]) {
				enums.value[ENUMS_OVERRIDES[enumKey]] = data[enumKey]
			} else {
				enums.value[toCamel(enumKey)]
			}
		}
	}

	return { enums, init }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useEnumStore, import.meta.hot))
}
