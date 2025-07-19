import { PgColumn } from "drizzle-orm/pg-core"

export function columnsToSortSchema<T extends Record<string, PgColumn>>(
    columns: T,
    defaultSort: SortField<keyof T & string>[] = [],
) {
    const keys = Object.keys(columns) as [
        keyof T & string,
        ...(keyof T & string)[],
    ]
    if (keys.length === 0) throw new Error("No columns provided for sorting")

    return sortSchema(keys, defaultSort).transform((sort) => {
        return sort.map((s) => {
            const column = columns[s.field]
            if (s.order == "asc") return asc(column)
            else return desc(column)
        })
    })
}

export function sortablePagingQuerySchema<T extends Record<string, PgColumn>>(
    columns: T,
    defaultSort: SortField<keyof T & string>[] = [],
) {
    return pagingQuerySchema.extend({
        sort: columnsToSortSchema(columns, defaultSort),
    })
}
