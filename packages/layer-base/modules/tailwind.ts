import { addTemplate, defineNuxtModule, resolveFiles } from "nuxt/kit"
import { join, relative } from "pathe"

export default defineNuxtModule({
    setup(_, nuxt) {
        addTemplate({
            filename: "tailwind.css",
            write: true,
            async getContents() {
                const appDirs = nuxt.options._layers.map(
                    (layer) =>
                        layer.config.appDir ?? layer.config.rootDir + "/app",
                )

                const buildDir = nuxt.options.buildDir
                const source = appDirs
                    .map((dir) => relative(buildDir, dir))
                    .map((dir) => `@source "${dir}";`)
                    .join("\n")

                const importFiles: string[] = []
                for (const dir of appDirs) {
                    const cssFiles = await resolveFiles(
                        join(dir, "assets/css"),
                        "index.css",
                    )
                    if (cssFiles.length > 0) {
                        importFiles.push(
                            relative(
                                buildDir,
                                join(dir, "assets/css/index.css"),
                            ),
                        )
                    }
                }
                const imports = importFiles
                    .map((item) => `@import "${item}";`)
                    .join("\n")

                return (
                    '@import "tailwindcss";\n' +
                    '@import "@nuxt/ui";\n' +
                    imports +
                    "\n" +
                    source
                )
            },
        })
    },
})
