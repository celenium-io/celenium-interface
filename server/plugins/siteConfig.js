const origins = [
	"https://mocha.celenium.io/",
	"https://arabica.celenium.io/",
	"https://mocha-4.celenium.io/",
	"https://mammoth.celenium.io/",
]

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("site-config:init", ({ event, siteConfig }) => {
		const origin = useNitroOrigin(event)

		if (origins.includes(origin)) {
			siteConfig.push({
				url: origin,
				indexable: false,
			})
		}
	})
})
