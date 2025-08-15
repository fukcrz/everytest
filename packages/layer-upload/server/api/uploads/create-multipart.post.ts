import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3"

const { bucket } = useRuntimeConfig().upload
const {
    maxSize,
    multipart: { partSize },
} = useAppConfig().upload

const bodySchema = z.object({
    path: uploadPathSchema,
    filename: uploadFilenameSchema,
    size: z.number().int().min(partSize).max(maxSize),
    type: z.string().optional(),
})

export default defineEventHandler(async (event) => {
    const { path, filename, size, type } = await readValidatedBody(
        event,
        bodySchema.parse,
    )
    const key = buildS3Key(filename, path)
    const numParts = Math.ceil(size / partSize)
    const createMultipartUploadCommand = new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        ContentType: type,
    })
    const createMultipartUploadResult = await s3Client.send(
        createMultipartUploadCommand,
    )
    if (!createMultipartUploadResult.UploadId) {
        throw createError("Failed to initiate multipart upload.")
    }
    const uploadId = createMultipartUploadResult.UploadId
    return {
        uploadId,
        key,
        partSize,
        numParts,
        url: buildPublicUrl(key),
    }
})
