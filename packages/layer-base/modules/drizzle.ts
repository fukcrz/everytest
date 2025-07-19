import {
    defineNuxtModule,
    addTemplate,
    resolveFiles,
    resolveAlias,
} from "nuxt/kit"
import { basename, extname, relative, join } from "pathe"

export default defineNuxtModule({
    async setup(_, nuxt) {
        const layerSchemaMap = new Map<string, string[]>()
        const buildDir = nuxt.options.buildDir

        for (const layer of nuxt.options._layers) {
            const schemaDir = layer.config.rootDir + "/schema"
            const files = await resolveFiles(schemaDir, "*.ts")
            if (files.length < 1) continue
            const layerName = layer.meta?.name ?? basename(layer.config.rootDir)
            layerSchemaMap.set(layerName, files)
        }

        layerSchemaMap.entries().forEach(([layerName, schemaFiles]) => {
            const generatedSchemaFileNames: string[] = []
            const layerDir = `drizzle/schema/${layerName}`
            schemaFiles.forEach((path) => {
                const generatedSchemaFileName = `${basename(path, extname(path))}`
                generatedSchemaFileNames.push(generatedSchemaFileName)
                addTemplate({
                    filename: layerDir + `/${generatedSchemaFileName}.ts`,
                    write: true,
                    getContents() {
                        return `export * from "${relative(join(buildDir, layerDir), path).slice(0, -3)}"`
                    },
                })
            })
            if (!generatedSchemaFileNames.includes("index")) {
                addTemplate({
                    filename: `drizzle/schema/${layerName}/index.ts`,
                    write: true,
                    getContents() {
                        return generatedSchemaFileNames
                            .map((name) => `export * from "./${name}"`)
                            .join("\n")
                    },
                })
            }
        })

        addTemplate({
            filename: "drizzle/schema/index.ts",
            write: true,
            async getContents() {
                if (layerSchemaMap.size) {
                    return Array.from(layerSchemaMap.keys())
                        .map((layerName) => {
                            return `export * from "./${layerName}"`
                        })
                        .join("\n")
                } else {
                    return `export type __placeholder = undefined // 避免ts报错`
                }
            },
        })

        nuxt.options.alias["#schema"] =
            resolveAlias("#build") + "/drizzle/schema"
    },
})
