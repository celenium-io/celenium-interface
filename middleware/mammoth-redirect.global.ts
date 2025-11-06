export default defineNuxtRouteMiddleware(() => {
    if (import.meta.client) return

    const host = useRequestHeaders(["host"])?.host
    if (host?.includes("mammoth.celenium.io")) {
        return navigateTo("https://celenium.io/", { redirectCode: 301 })
    }
})
