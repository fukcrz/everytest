import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3"

const { bucket } = useRuntimeConfig().upload

const bodySchema = z.object({
    key: z.string(),
    uploadId: z.string(),
    parts: z
        .array(
            z.object({
                PartNumber: z.number().int().min(0),
                ETag: z.string(),
            }),
        )
        .min(2),
})

export default defineEventHandler(async (event) => {
    const { key, uploadId, parts } = await readValidatedBody(
        event,
        bodySchema.parse,
    )
    const command = new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
            Parts: parts,
        },
    })
    await s3Client.send(command)
})
