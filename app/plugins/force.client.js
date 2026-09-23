import * as d3Force from "d3-force"

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.provide("d3Force", d3Force)
})
