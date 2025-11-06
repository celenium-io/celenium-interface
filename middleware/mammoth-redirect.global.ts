export default defineNuxtRouteMiddleware(() => {
    console.log('defineNuxtRouteMiddleware');
    
    if (import.meta.client) return

    console.log('import.meta.client', import.meta.client);
    

    const host = useRequestHeaders(["host"])?.host
    console.log('host', host);
    
    if (host === "mammoth.celenium.io") {
        return navigateTo("https://celenium.io/", { redirectCode: 301 })
    }
})
