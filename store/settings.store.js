/** Vendor */
import { defineStore, acceptHMRUpdate } from "pinia"

export const useSettingsStore = defineStore("settings", () => {
	const hex = ref({
		inspector: {
			binary: true,
			uint8: true,
			time: true,
			ascii: true,
			char: true,
		},
		characterSet: "ibm437",
	})

	const chart = ref({
		view: "bar",
		loadPrevData: true,
		loadLastValue: true,
	})

	const init = () => {
		const savedSettings = JSON.parse(localStorage.getItem("settings"))
		if (savedSettings?.hex) hex.value = savedSettings.hex
		if (savedSettings?.chart) chart.value = savedSettings.chart
	}

	return { chart, hex, init }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
