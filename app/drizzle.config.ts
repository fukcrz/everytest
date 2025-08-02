import { defineConfig } from "drizzle-kit"
import { config } from "dotenv"

config()

export default defineConfig({
    dialect: "postgresql",
    schema: "./.nuxt/drizzle/schema",
    dbCredentials: {
        url: (process.env as any).DATABASE_URL,
    },
})
