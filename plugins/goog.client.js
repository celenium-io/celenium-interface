export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.hook("app:created", () => {
		useHead({
			script: [
				{
					src: "https://cdn.jsdelivr.net/npm/google-protobuf@3.21.2/google-protobuf.min.js",
					onload: () => {
						import("@/services/utils/msgpayforblobs")
						import("@/services/utils/blob")
						import("@/services/utils/blobtx")
					},
				},
			],
		})
	})
})
