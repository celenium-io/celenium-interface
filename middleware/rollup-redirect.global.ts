export default defineNuxtRouteMiddleware((to) => {
    if (to.path.includes("rollup")) {
        return navigateTo(
            {
                path: to.path.replace("rollup", "network"),
                query: to.query,
            },
            { redirectCode: 301 }
        )
    }
})
