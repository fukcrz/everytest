import { z } from "zod"

export const S3_PATH_RE =
    /^(\/?[a-zA-Z0-9!\-_.*'()]+)(\/[a-zA-Z0-9!\-_.*'()]+)*$/
export const uploadPathSchema = z
    .string()
    .trim()
    .regex(S3_PATH_RE)
    .transform((v) => (v.startsWith("/") ? v.slice(1) : v))
    .optional()

export const S3_EXTNAME_RE = /^[a-zA-Z0-9!\-_*'()]+$/
export const uploadFilenameSchema = z
    .string()
    .trim()
    .refine((v) => {
        const i = v.lastIndexOf(".")
        if (i < 0) return true
        const extname = i < 0 ? "" : v.slice(i + 1)
        if (!extname) return true
        return S3_EXTNAME_RE.test(extname)
    })
