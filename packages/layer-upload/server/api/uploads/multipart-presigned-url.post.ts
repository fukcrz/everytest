import { UploadPartCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const { bucket, signedUrlExpiresIn } = useRuntimeConfig().upload
const {
    multipart: { partSize },
} = useAppConfig().upload

const bodySchema = z.object({
    uploadId: z.string(),
    key: z.string().min(1).regex(S3_PATH_RE),
    partNumber: z.number().int().min(1),
    size: z.number().int().min(1).max(partSize),
})

export default defineEventHandler(async (event) => {
    const { uploadId, key, size, partNumber } = await readValidatedBody(event, bodySchema.parse)
    const putObjectCommand = new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
        ContentLength: size,
    })
    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: signedUrlExpiresIn,
    })
    return { presignedUrl, expiresIn: signedUrlExpiresIn }
})
