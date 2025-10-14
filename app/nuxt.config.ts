// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    ssr: false,
    css: ["~/assets/css/tailwind.css"],
    extends: [["@layer/base", { meta: { name: "base" } }]],
    runtimeConfig: {
        geminiApiKey: "AIzaSyDEWdszbxBvkmR1voNngRXk7Wbf3iERTYA",
    },
    app: {
        head: {
            title:"Every Test"
        }
    }
})
