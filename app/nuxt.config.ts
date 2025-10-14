// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    ssr: false,
    css: ["~/assets/css/tailwind.css"],
    extends: [["@layer/base", { meta: { name: "base" } }]],
    nitro: {
        rollupConfig: {
            external: ["cloudflare:sockets"],
        },
    },
    runtimeConfig: {
        geminiApiKey: "",
    },
    app: {
        head: {
            title: "Every Test",
        },
    },
})
