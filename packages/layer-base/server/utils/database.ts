import * as schema from "#schema"
import { SQL } from "drizzle-orm"
import { PgTable } from "drizzle-orm/pg-core"
import { drizzle } from "drizzle-orm/postgres-js"

export const db = drizzle((process.env as any).DATABASE_URL, { schema })

export type Transaction =
    | typeof db
    | Parameters<Parameters<(typeof db)["transaction"]>["0"]>["0"]

export async function isExists(
    table: PgTable,
    where: SQL,
    tx: Transaction = db,
) {
    const r = await tx.select({}).from(table).where(where).limit(1)
    return r.length > 0
}

export type { SQL } from "drizzle-orm"
export type { PgTable, PgColumn } from "drizzle-orm/pg-core"
export {
    aliasedRelation,
    aliasedTable,
    aliasedTableColumn,
    and,
    arrayContained,
    arrayContains,
    arrayOverlaps,
    asc,
    avg,
    avgDistinct,
    between,
    bindIfParam,
    cosineDistance,
    count,
    countDistinct,
    desc,
    eq,
    exists,
    getTableColumns,
    gt,
    gte,
    hammingDistance,
    ilike,
    inArray,
    innerProduct,
    isNotNull,
    isNull,
    jaccardDistance,
    l1Distance,
    l2Distance,
    like,
    lt,
    lte,
    max,
    min,
    ne,
    not,
    notBetween,
    notExists,
    notIlike,
    notInArray,
    notLike,
    or,
    sql,
    sum,
    sumDistinct,
} from "drizzle-orm"
