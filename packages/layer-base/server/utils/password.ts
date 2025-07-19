import { randomBytes, pbkdf2, timingSafeEqual } from "crypto"
import { promisify } from "util"

const promisifyPbkdf2 = promisify(pbkdf2)

const keyLength = 64 // 生成的密钥（哈希）长度 (bytes)
const digest = "sha512" // 使用的哈希算法 (e.g., 'sha256', 'sha512')
// 迭代次数会随着时间推移和计算能力的增强而需要增加
// 建议查阅最新的安全建议，例如 OWASP
const iterations = 310000 // 迭代次数 (推荐至少 310k for PBKDF2-SHA256/512 by OWASP as of 2023)
const saltByteLength = 16 // 盐的字节长度 (16 bytes = 128 bits 是一个不错的选择)
const delimiter = ":" // 用于分隔盐和哈希的字符

/**
 * 异步加密密码，将盐和哈希合并存储
 * @param password 需要加密的明文密码
 * @returns 包含盐和哈希的合并字符串 (格式: "salt:hash")
 */
export async function hashPasswordCrypto(password: string): Promise<string> {
    // 1. 生成一个随机盐 (Buffer)
    const saltBuffer = randomBytes(saltByteLength)
    const salt = saltBuffer.toString("hex") // 将盐转换为十六进制字符串

    // 2. 使用 PBKDF2 对密码进行哈希 (Buffer)
    const hashBuffer = await promisifyPbkdf2(
        password,
        saltBuffer,
        iterations,
        keyLength,
        digest,
    )
    const hash = hashBuffer.toString("hex") // 将哈希转换为十六进制字符串

    // 3. 将盐和哈希合并
    const combined = `${salt}${delimiter}${hash}`

    return combined
}

/**
 * 异步校验密码，解析合并的盐和哈希字符串
 * @param password 用户输入的明文密码
 * @param storedCombined 存储在数据库中的盐和哈希合并字符串 (格式: "salt:hash")
 * @returns 密码是否匹配
 */
export async function comparePasswordCrypto(
    password: string,
    storedCombined: string,
): Promise<boolean> {
    try {
        // 1. 解析合并的字符串，获取盐和哈希
        const parts = storedCombined.split(delimiter)

        if (parts.length !== 2) {
            // 存储的密码格式不正确，返回 false
            return false
        }

        const storedSalt = parts[0]
        const storedHash = parts[1]

        // 将存储的盐从十六进制字符串转换回 Buffer
        const saltBuffer = Buffer.from(storedSalt, "hex")
        // 将存储的哈希从十六进制字符串转换回 Buffer
        const storedHashBuffer = Buffer.from(storedHash, "hex")

        // 2. 使用相同的盐、迭代次数、密钥长度和哈希算法对输入的密码进行哈希
        const derivedKeyBuffer = await promisifyPbkdf2(
            password,
            saltBuffer,
            iterations,
            keyLength,
            digest,
        )

        // 3. 使用 timing-safe 比较方法比较生成的哈希和存储的哈希
        // 确保两个 Buffer 的长度相同才能进行 timingSafeEqual 比较
        if (derivedKeyBuffer.length !== storedHashBuffer.length) {
            // 长度不一致直接返回 false
            return false
        }

        const isMatch = timingSafeEqual(derivedKeyBuffer, storedHashBuffer)

        return isMatch
    } catch (error) {
        console.error("密码校验失败:", error)
        // 对于校验过程中的错误，通常也返回 false，避免暴露内部错误信息
        return false
    }
}
