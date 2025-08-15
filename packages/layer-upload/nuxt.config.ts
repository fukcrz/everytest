// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    extends: [["@layer/base", { meta: { name: "base" } }]],
    appConfig: {
        upload: {
            // 最大上传文件大小 单位:byte
            maxSize: 1024 * 1024 * 500,
            // 小于该大小的文件使用服务器端上传（而不是预签名链接），同时也是服务端上传所支持的最大上传文件大小
            serverUploadSize: 1024 * 512, // 单位:byte
            multipart: {
                // 启用分片上传的文件大小 单位:byte
                startSize: 1024 * 1024 * 30,
                // 分片大小, 建议大于5mb 单位:byte
                partSize: 1024 * 1024 * 8,
            },
        },
    },
    runtimeConfig: {
        upload: {
            // 文件公开访问URL模板, 支持: {endpoint} {region} {bucket} {key} 占位符
            publicUrlTemplate: "",
            // 创建预签名链接的有效时间 单位：秒
            signedUrlExpiresIn: 3600,
            // 存储桶名称
            bucket: "",
            // s3 客户端配置
            s3: {
                endpoint: "",
                region: "",
                forcePathStyle: true,
                credentials: {
                    accessKeyId: "",
                    secretAccessKey: "",
                },
            },
        },
    },
})
