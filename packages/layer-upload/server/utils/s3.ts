import { S3Client } from "@aws-sdk/client-s3"

const { publicUrlTemplate, s3, bucket } = useRuntimeConfig().upload

export const s3Client = new S3Client(structuredClone(s3))

export function buildPublicUrl(key: string) {
    return publicUrlTemplate
        .replace("{key}", key)
        .replace("{bucket}", bucket)
        .replace("{region}", s3.region)
        .replace("{endpoint}", s3.endpoint)
}

export function buildS3Key(filename: string, path?: string) {
    const i = filename.lastIndexOf(".")
    const extname = i < 0 ? "" : filename.slice(i + 1)
    const name = `${nanoid()}${extname && `.${extname}`}`
    return path ? `${path}/${name}` : name
}
