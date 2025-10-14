export { generateText, generateObject, streamText, streamObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const google = createGoogleGenerativeAI({
    apiKey: useRuntimeConfig().geminiApiKey,
})

export const gemini = google("gemini-2.5-flash")

export function prompt(...text: string[]) {
    return text.join("\n")
}
