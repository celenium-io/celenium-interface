/**
 * Vendor
 */
import { ref, reactive } from "vue"
import { defineStore, acceptHMRUpdate } from "pinia"

export const useModalsStore = defineStore("modals", () => {
	const history = ref([])

	const lastModal = ref()
	const modals = reactive({
		awaiting: false,
		blob: false,
		commitment: false,
		confirmation: false,
		constants: false,
		edit_alias: false,
		import: false,
		ods: false,
		rawData: false,
		pfb: false,
		changeBlob: false,
		qr: false,
		send: false,
		staking: false,
		vestingDetails: false,
		hexSettings: false,
		api: false,
		lightNode: false,
		lightNodeSettings: false,
	})

	const open = (target) => {
		if (!modals[target]) {
			lastModal.value = target
			modals[target] = true
		} else {
			modals[target] = false

			history.value = []
		}

		for (const modal of Object.keys(modals).filter((m) => m !== target)) {
			if (modals[modal]) {
				if (!history.value.includes(modal)) {
					history.value.push(modal)
				}
				modals[modal] = false
			}
		}
	}

	const close = (target) => {
		if (!modals[target]) return

		modals[target] = false

		if (history.value.length) {
			const modalToRecover = history.value.pop()
			modals[modalToRecover] = true
			lastModal.value = modalToRecover
		}
	}

	const closeAll = () => {
		history.value = []

		for (const key of Object.keys(modals)) {
			modals[key] = false
		}
	}

	return { history, lastModal, modals, open, close, closeAll }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useModalsStore, import.meta.hot))
}
