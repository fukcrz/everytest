import { PutObjectCommand } from "@aws-sdk/client-s3"

const { bucket } = useRuntimeConfig().upload
const { serverUploadSize } = useAppConfig().upload

export default defineEventHandler(async (event) => {
    const formData = await readMultipartFormData(event)
    if (!formData)
        throw createError({
            status: 400,
            message: "参数错误: 缺少必要参数file",
        })

    const file = formData.find((item) => item.name == "file")
    if (!file)
        throw createError({
            status: 400,
            message: "参数错误: 缺少必要参数file",
        })
    if (file.data.length > serverUploadSize)
        throw createError({
            status: 400,
            message: "上传文件大小超出限制",
        })
    const filename = uploadFilenameSchema.parse(file.filename)
    const path = uploadPathSchema.parse(
        formData.find((item) => item.name == "path")?.data.toString("utf8"),
    )

    const key = buildS3Key(filename, path)
    const putObjectCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: file.type,
        Body: file.data,
    })
    await s3Client.send(putObjectCommand)

    return buildPublicUrl(key)
})
