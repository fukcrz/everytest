import type { TableColumn } from "@nuxt/ui"
import { UCheckbox, UButton } from "#components"

export type { TableColumn } from "@nuxt/ui"

export function selectionTableColumn<T = any>(): TableColumn<T> {
    return {
        id: "selection",
        header: ({ table }) =>
            h(UCheckbox, {
                modelValue: table.getIsSomePageRowsSelected()
                    ? "indeterminate"
                    : table.getIsAllPageRowsSelected(),
                "onUpdate:modelValue": (value: boolean | "indeterminate") =>
                    table.toggleAllPageRowsSelected(!!value),
                "aria-label": "Select all",
            }),
        cell: ({ row }) =>
            h(UCheckbox, {
                modelValue: row.getIsSelected(),
                "onUpdate:modelValue": (value: boolean | "indeterminate") =>
                    row.toggleSelected(!!value),
                "aria-label": "Select row",
            }),
    }
}

export function sortableHeader<T = any>(
    label: string,
): TableColumn<T>["header"] {
    return ({ column }) => {
        const isSorted = column.getIsSorted()

        return h(UButton, {
            color: "neutral",
            variant: "ghost",
            label,
            icon: isSorted
                ? isSorted === "asc"
                    ? "i-lucide-arrow-up-narrow-wide"
                    : "i-lucide-arrow-down-wide-narrow"
                : "i-lucide-arrow-up-down",
            class: "-mx-2.5",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        })
    }
}
