import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const { bucket, signedUrlExpiresIn } = useRuntimeConfig().upload
const { maxSize } = useAppConfig().upload

const bodySchema = z.object({
    path: uploadPathSchema,
    filename: uploadFilenameSchema,
    size: z.number().int().min(0).max(maxSize),
    type: z.string().optional(),
})

export default defineEventHandler(async (event) => {
    const { path, filename, size, type } = await readValidatedBody(
        event,
        bodySchema.parse,
    )
    const key = buildS3Key(filename, path)
    const putObjectCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: path ? `${path}/${key}` : key,
        ContentLength: size,
        ContentType: type,
    })
    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: signedUrlExpiresIn,
    })
    return {
        presignedUrl,
        key,
        url: buildPublicUrl(key),
        expiresIn: signedUrlExpiresIn,
    }
})
