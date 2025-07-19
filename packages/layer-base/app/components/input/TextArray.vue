<template>
    <UFormField :name>
        <div
            class="grid gap-2"
            style="
                grid-template-columns: repeat(
                    auto-fit,
                    minmax(min(7rem, 100%), 1fr)
                );
            "
        >
            <UFormField
                v-for="i of indexList"
                :key="i"
                :name="`${name}.${i}`"
                class="w-full"
            >
                <template #default="{ error }">
                    <UInput
                        class="w-full"
                        ref="inputRefs"
                        :model-value="getValue(i)"
                        size="sm"
                        :modelModifiers
                        @update:model-value="setValue(i, $event)"
                        @keydown="onKeydown(i, $event)"
                        @blur="onBlur"
                    >
                        <template v-if="error" #trailing>
                            <Icon
                                v-if="i < indexList.length - 1"
                                @click="delValue(i)"
                                name="mdi:delete"
                                class="opacity-60 hover:text-error"
                            />
                        </template>
                    </UInput>
                </template>

                <template #error="{ error }">
                    <UTooltip
                        v-if="typeof error == 'string'"
                        :text="error"
                        :delay-duration="0"
                    >
                        <div class="line-clamp-1 text-xs">{{ error }}</div>
                    </UTooltip>
                </template>
            </UFormField>
        </div>
    </UFormField>
</template>

<script setup lang="ts">
    import type { Form } from "@nuxt/ui"
    import type { ShallowUnwrapRef } from "vue"

    const emit = defineEmits<{ "update:modelValue": [modelValue: string[]] }>()

    const { name, modelValue, form } = defineProps<{
        name: string
        modelValue?: string[]
        form?: ShallowUnwrapRef<Form<any>> | null
    }>()

    const modelModifiers = { trim: true }

    const indexList = computed(() => {
        if (modelValue) {
            const arr = modelValue.map((_, i) => i)
            arr.push(arr.length)
            return arr
        }
        return [0]
    })

    function getValue(index: number) {
        return modelValue && modelValue[index]
    }

    function setValue(index: number, value: string) {
        const arr = [...(modelValue ?? [])]
        arr[index] = value
        emit("update:modelValue", arr)
    }

    function delValue(index: number) {
        if (!modelValue) return
        emit("update:modelValue", modelValue.toSpliced(index, 1))
        const names: string[] = []
        for (let i = index; i < modelValue.length; i++) {
            names.push(`${name}.${i}`)
        }
        form?.validate({ name: names, silent: true, nested: true })
    }

    const inputRefs = ref<{ inputRef: HTMLInputElement }[]>()

    function onKeydown(index: number, e: KeyboardEvent) {
        if (e.key == "Backspace" || e.key == "Delete") {
            if (!modelValue || !modelValue.length) return

            if (index == modelValue.length) {
                e.preventDefault()
                delValue(index - 1)
                nextTick(() => {
                    const lastInput =
                        inputRefs.value?.[inputRefs.value.length - 1]?.inputRef
                    lastInput?.focus()
                })
                return
            }

            if (modelValue[index] == "") {
                e.preventDefault()
                delValue(index)
                return
            }
        }
    }

    function onBlur() {
        form?.validate({ name, silent: true })
    }
</script>
