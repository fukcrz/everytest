<template>
    <USelect
        class="w-[fit-content] min-w-24"
        v-model="modelValue"
        :items="sizes"
        :disabled
    >
        <template #default="{ modelValue }"> {{ modelValue }} 条/页 </template>
    </USelect>
</template>

<script setup lang="ts">
    const modelValue = defineModel<number>({ default: 10 })
    const props = defineProps<{
        sizes?: number[]
        disabled?: boolean
    }>()

    const defaultSizes = [10, 50, 100, 500]

    const sizes = computed(() => {
        const sizes = [...(props.sizes || defaultSizes)]
        if (modelValue.value && !sizes.includes(modelValue.value)) {
            sizes.push(modelValue.value)
            return sizes.sort((a, b) => a - b)
        }
        return sizes
    })
</script>
