/**
 * Vendor
 */
import { reactive } from "vue"
import { defineStore } from "pinia"

export const useSettingsStore = defineStore("settings", () => {
	const hex = reactive({
		inspector: {
			binary: true,
			uint8: true,
			time: true,
			ascii: true,
			char: true,
		},
		characterSet: "ibm437",
	})

	return { hex }
})
