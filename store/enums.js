/** Vendor */
import { defineStore, acceptHMRUpdate } from "pinia"

/** API */
import { fetchEnums } from "@/services/api/main.js"

/** Constants */
import { defaultEnums } from "@/services/constants/enums.js"

export const useEnumStore = defineStore("enums", () => {
	const enums = ref({
		messageTypes: defaultEnums.message_type,
		rollupCategories: defaultEnums.categories,
		rollupTypes: defaultEnums.rollup_type,
	})

	const init = async () => {
		let data = await fetchEnums()

		if (data) {
			enums.value.messageTypes = data.message_type
			enums.value.rollupCategories = data.categories
			enums.value.rollupTypes = data.rollup_type
		}
	}

	return { enums, init }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useEnumStore, import.meta.hot))
}
