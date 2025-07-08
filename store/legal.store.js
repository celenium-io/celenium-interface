/** Vendor */
import { defineStore, acceptHMRUpdate } from "pinia"

/** Constants */
import { PRIVACY_POLICY_DATE, TERMS_OF_USE_DATE } from "@/services/constants/legal.js"

export const useLegalStore = defineStore("legal", () => {
	const legal = ref({
		privacy_date: "",
		terms_date: "",
		accepted: false,
	})

	const init = () => {
		const savedLegal = JSON.parse(localStorage.getItem("legal"))
		if (savedLegal) {
			legal.value.privacy_date = savedLegal.privacy_date || ""
			legal.value.terms_date = savedLegal.terms_date || ""
			legal.value.accepted = savedLegal.accepted || false
		}
	}

	const isAccepted = () => {
		return legal.value.accepted && legal.value.privacy_date === PRIVACY_POLICY_DATE && legal.value.terms_date === TERMS_OF_USE_DATE
	}

	const acceptLegal = () => {
		legal.value.privacy_date = PRIVACY_POLICY_DATE
		legal.value.terms_date = TERMS_OF_USE_DATE
		legal.value.accepted = true
	}

	return { legal, acceptLegal, init, isAccepted }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useLegalStore, import.meta.hot))
}
