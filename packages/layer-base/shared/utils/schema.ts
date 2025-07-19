import z from "zod"

export const integerValue = z.coerce.number().int()
export const idSchema = integerValue
export const notEmptyString = z.string().nonempty()
export const haveIdObject = z.object({ id: idSchema })
export const haveWordObject = z.object({ word: notEmptyString })

export const pagingQuerySchema = z.object({
    page: z.coerce
        .number()
        .min(1)
        .default(1)
        .transform((v) => v - 1),
    size: z.coerce.number().min(1).default(20),
})

export type SortField<FIELD extends string> = {
    field: FIELD
    order: "asc" | "desc"
}

export function sortSchema<FS extends [string, ...string[]]>(
    fields: FS,
    defaultSort: SortField<FS[number]>[] = [],
) {
    return z
        .string()
        .refine(
            (val) =>
                val.split(",").some((v) => {
                    if (v.startsWith("asc "))
                        return !fields.includes(v.slice(4))
                    else if (v.startsWith("desc "))
                        return !fields.includes(v.slice(5))
                    return false
                }),
            { message: "Invalid sort value" },
        )
        .transform((val) => {
            return val.split(",").map((v) => {
                if (v.startsWith("asc ")) {
                    return {
                        field: v.slice(4) as FS[number],
                        order: "asc" as "asc" | "desc",
                    } satisfies SortField<FS[number]>
                } else if (v.startsWith("desc ")) {
                    return {
                        field: v.slice(5) as FS[number],
                        order: "desc" as "asc" | "desc",
                    } satisfies SortField<FS[number]>
                } else {
                    throw new Error("Invalid sort value")
                }
            })
        })
        .nullish()
        .transform((v) => v ?? defaultSort)
}
