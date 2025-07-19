import type { Serialize, Simplify } from "nitropack/types"

export type ApiResult<T> = Simplify<Serialize<T>>
