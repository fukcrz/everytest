<template>
    <div class="mt-auto flex gap-4 justify-center items-center">
        <PageSize
            :sizes
            :disabled
            :model-value="size"
            @update:modelValue="onSizeUpdate"
        />
        <UPagination
            v-model:page="page"
            :items-per-page="size"
            :total="total"
            :disabled
        ></UPagination>
    </div>
</template>

<script setup lang="ts">
    const page = defineModel<number>("page", { default: 1 })

    const props = defineProps<{
        size?: number
        "onUpdate:size"?: (size: number) => void
        total?: number
        sizes?: number[]
        disabled?: boolean
    }>()

    function onSizeUpdate(size: number) {
        if (props["onUpdate:size"]) {
            page.value = 1
            props["onUpdate:size"](size)
        }
    }
</script>
