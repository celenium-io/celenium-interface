import { SitemapStream, streamToPromise } from "sitemap"

export default defineEventHandler(async (event) => {
	const sitemap = new SitemapStream({
		hostname: "https://celenium.io",
	})

	const links = ["/", "/txs", "/blocks", "/namespaces", "/addresses"]

	links.forEach((link) => {
		sitemap.write({
			url: link,
			changefreq: "daily",
		})
	})

	sitemap.end()

	return streamToPromise(sitemap)
})
