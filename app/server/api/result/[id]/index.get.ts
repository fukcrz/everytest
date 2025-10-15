import { resultsStorage } from "~~/server/utils/storage"

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(
        event,
        z.object({
            id: z.string(),
        }).parse,
    )
    const data = await resultsStorage.getItem(id)
    if (!data) {
        throw createError({ statusCode: 404, statusMessage: "Not Found" })
    }
    return data
})
