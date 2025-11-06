export default defineNuxtRouteMiddleware(() => {
    if (import.meta.client) return

    const host = useRequestHeaders(["host"])?.host
    if (host === "https://mammoth.celenium.io/") {
        return navigateTo("https://celenium.io/", { redirectCode: 301 })
    }
})
