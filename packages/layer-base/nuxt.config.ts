// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    modules: ["@nuxt/ui", "motion-v/nuxt"],
    appConfig: {
        ui: {
            table: {
                slots: {
                    th: "whitespace-nowrap",
                },
            },
        } as any,
    },
    ui: {
        fonts: false,
    },
    icon: {
        serverBundle: {
            remote: "unpkg",
        },
        clientBundle: {
            scan: true,
        },
        cssLayer: "icons",
    },
})
