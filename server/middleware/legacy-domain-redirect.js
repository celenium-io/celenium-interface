/** Domains of retired networks -> where their links should land now */
const redirects = {
	"mocha-4.celenium.io": "https://mocha.celenium.io",
}

export default defineEventHandler((event) => {
	const host = getRequestHost(event, { xForwardedHost: true })
	const target = redirects[host]

	if (!target) return

	return sendRedirect(event, `${target}${event.path}`, 301)
})
