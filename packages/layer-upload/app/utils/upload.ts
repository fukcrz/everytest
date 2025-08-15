export async function uploadFile(
    file: File,
    option?: {
        path?: string
        partRetryCount?: number
        onProgress?: (progress: number) => void
    },
) {
    const { serverUploadSize, multipart } = useAppConfig().upload
    if (file.size <= serverUploadSize) {
        return serverUpload(file, option)
    } else if (file.size > multipart.startSize) {
        return multipartUpload(file, option)
    } else {
        return clientUpload(file, option)
    }
}

export async function serverUpload(
    file: File,
    option?: {
        path?: string
        onProgress?: (progress: number) => void
    },
) {
    const { serverUploadSize } = useAppConfig().upload
    if (file.size > serverUploadSize)
        throw createError("文件大小超出限制, 最大 " + bytes(serverUploadSize))

    if (option?.onProgress) option.onProgress(0)

    const formData = new FormData()
    formData.append("file", file)
    if (option?.path) {
        formData.append("path", option.path)
    }

    const url = await $fetch("/api/uploads", {
        method: "POST",
        body: formData,
    })

    if (option?.onProgress) option.onProgress(1)

    return url
}

export async function clientUpload(
    file: File,
    option?: {
        path?: string
        onProgress?: (progress: number) => void
    },
) {
    const { maxSize } = useAppConfig().upload
    if (file.size > maxSize)
        throw createError("文件大小超出限制, 最大 " + bytes(maxSize))

    if (option?.onProgress) option.onProgress(0)

    const { presignedUrl, url } = await $fetch("/api/uploads/presigned-url", {
        method: "POST",
        body: {
            path: option?.path,
            filename: file.name,
            size: file.size,
            type: file.type,
        },
    })

    if (option?.onProgress) option.onProgress(0.1)

    await $fetch(presignedUrl, {
        method: "PUT",
        body: file,
    })

    if (option?.onProgress) option.onProgress(1)

    return url
}

export async function multipartUpload(
    file: File,
    option?: {
        path?: string
        partMaxRetries?: number
        onProgress?: (progress: number) => void
    },
) {
    const { maxSize } = useAppConfig().upload
    if (file.size > maxSize)
        throw createError("文件大小超出限制, 最大 " + bytes(maxSize))
    const partMaxRetries = option?.partMaxRetries ?? 3

    if (option?.onProgress) option.onProgress(0)

    const { uploadId, key, partSize, numParts, url } = await $fetch(
        "/api/uploads/create-multipart",
        {
            method: "POST",
            body: {
                path: option?.path,
                filename: file.name,
                size: file.size,
                type: file.type,
            },
        },
    )

    if (option?.onProgress) option.onProgress(0.01)

    const parts: { PartNumber: number; ETag: string }[] = []
    for (let i = 1; i <= numParts; i++) {
        let retryCount = 0
        while (true) {
            try {
                const part = await uploadPart(file, {
                    key,
                    uploadId,
                    partSize,
                    partNumber: i,
                })
                parts.push(part)
                if (option?.onProgress) option.onProgress((i / numParts) * 0.98)
                break
            } catch (e) {
                if (retryCount >= partMaxRetries)
                    throw createError({
                        message: "分片上传失败",
                        cause: e,
                    })
                retryCount++
            }
        }
    }

    await $fetch("/api/uploads/complete-multipart", {
        method: "POST",
        body: {
            key,
            uploadId,
            parts,
        },
    })

    if (option?.onProgress) option.onProgress(1)

    return url
}

export async function uploadPart(
    file: File,
    params: {
        key: string
        uploadId: string
        partSize: number
        // 要上传第几个片段，从1开始
        partNumber: number
    },
) {
    const { key, uploadId, partSize, partNumber } = params
    const partData = file.slice(
        (partNumber - 1) * partSize,
        partNumber * partSize,
    )
    const { presignedUrl } = await $fetch(
        "/api/uploads/multipart-presigned-url",
        {
            method: "POST",
            body: {
                uploadId,
                key,
                partNumber,
                size: partData.size,
            },
        },
    )
    const res = await $fetch.raw(presignedUrl, {
        method: "PUT",
        body: partData,
    })
    return {
        PartNumber: partNumber,
        ETag: res.headers.get("ETag")!,
    }
}
