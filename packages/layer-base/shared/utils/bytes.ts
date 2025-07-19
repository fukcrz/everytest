/*!
 * bytes
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015 Jed Watson
 * MIT Licensed
 *
 * copy for https://github.com/visionmedia/bytes.js
 */

const formatThousandsRegExp = /\B(?=(\d{3})+(?!\d))/g

const formatDecimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/

const map = {
    b: 1,
    kb: 1 << 10,
    mb: 1 << 20,
    gb: 1 << 30,
    tb: Math.pow(1024, 4),
    pb: Math.pow(1024, 5),
} as const

const parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i

/**
 * Convert the given value in bytes into a string or parse to string to an integer in bytes.
 */
export function bytes<T extends string | number>(
    value: T,
    options?: Parameters<typeof format>["1"],
): T extends string ? number | null : T extends number ? string : null {
    if (typeof value === "string") {
        return parse(value) as any
    }
    if (typeof value === "number") {
        return format(value, options) as any
    }
    return null as any
}

/**
 * Format the given value in bytes into a string.
 *
 * If the value is negative, it is kept as such. If it is a float,
 * it is rounded.
 *
 */
function format(
    value: number,
    options?: {
        decimalPlaces?: number
        fixedDecimals?: boolean
        thousandsSeparator?: string
        unit?: string
        unitSeparator?: string
    },
) {
    if (!Number.isFinite(value)) {
        throw "Number not finite."
    }

    var mag = Math.abs(value)
    var thousandsSeparator = (options && options.thousandsSeparator) || ""
    var unitSeparator = (options && options.unitSeparator) || ""
    var decimalPlaces =
        options && options.decimalPlaces !== undefined
            ? options.decimalPlaces
            : 2
    var fixedDecimals = Boolean(options && options.fixedDecimals)
    var unit = (options && options.unit) || ""

    if (!unit || !(map as any)[unit.toLowerCase()]) {
        if (mag >= map.pb) {
            unit = "PB"
        } else if (mag >= map.tb) {
            unit = "TB"
        } else if (mag >= map.gb) {
            unit = "GB"
        } else if (mag >= map.mb) {
            unit = "MB"
        } else if (mag >= map.kb) {
            unit = "KB"
        } else {
            unit = "B"
        }
    }

    var val = value / (map as any)[unit.toLowerCase()]
    var str = val.toFixed(decimalPlaces)

    if (!fixedDecimals) {
        str = str.replace(formatDecimalsRegExp, "$1")
    }

    if (thousandsSeparator) {
        str = str
            .split(".")
            .map(function (s, i) {
                return i === 0
                    ? s.replace(formatThousandsRegExp, thousandsSeparator)
                    : s
            })
            .join(".")
    }

    return str + unitSeparator + unit
}

/**
 * Parse the string value into an integer in bytes.
 *
 * If no unit is given, it is assumed the value is in bytes.
 *
 */

function parse(val: string | number) {
    if (typeof val === "number" && !isNaN(val)) {
        return val
    }

    if (typeof val !== "string") {
        return null
    }

    // Test if the string passed is valid
    var results = parseRegExp.exec(val)
    var floatValue
    var unit = "b"

    if (!results) {
        // Nothing could be extracted from the given string
        floatValue = parseInt(val, 10)
        unit = "b"
    } else {
        // Retrieve the value and the unit
        floatValue = parseFloat(results[1]!)
        unit = results[4]!.toLowerCase()
    }

    if (isNaN(floatValue)) {
        return null
    }

    return Math.floor((map as any)[unit] * floatValue)
}
