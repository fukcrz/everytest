import { resultsStorage } from "~~/server/utils/storage"

const bodySchema = z.object({
    topic: z.string(),
    title: z.string(),
    result: z.string(),
    questions: z.array(
        z.object({
            question: z.string(),
            options: z.array(z.string()),
        }),
    ),
})

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, bodySchema.parse)
    const id = nanoid()
    await resultsStorage.setItem(id, body)
    return { id }
})
