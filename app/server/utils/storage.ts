import { createStorage } from "unstorage"
import netlifyBlobsDriver from "unstorage/drivers/netlify-blobs"

export const resultsStorage = createStorage<{
    topic: string
    title: string
    result: string
    questions: {
        question: string
        options: string[]
    }[]
}>({
    driver: netlifyBlobsDriver({
        name: "results",
    }),
})
