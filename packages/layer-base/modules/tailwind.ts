import { addTemplate, defineNuxtModule } from "nuxt/kit"
import { relative } from "pathe"

export default defineNuxtModule({
    setup(_, nuxt) {
        // addTemplate({
        //     filename: "layer.css",
        //     write: true,
        //     async getContents() {
        //         const buildDir = nuxt.options.buildDir
        //         const dirs = nuxt.options._layers.map((layer) => relative(buildDir, layer.config.rootDir))
        //         return dirs.map((dir) => `@source "${dir}";`).join("\n")
        //     },
        // })
        addTemplate({
            filename: "tailwind.css",
            write: true,
            async getContents() {
                const buildDir = nuxt.options.buildDir
                const dirs = nuxt.options._layers.map((layer) =>
                    relative(buildDir, layer.config.rootDir),
                )
                const source = dirs.map((dir) => `@source "${dir}/app";`).join("\n")
                return (
                    '@import "tailwindcss";\n' +
                    '@import "@nuxt/ui";\n' +
                    source
                )
            },
        })
    },
})
