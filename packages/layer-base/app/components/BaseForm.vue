<template>
    <UForm ref="form" :state :schema :onSubmit="onFormSubmit">
        <slot :state="state" :reset></slot>
    </UForm>
</template>

<script setup lang="ts" generic="S extends FormSchema">
    import type { PartialDeep } from "type-fest"
    import type {
        FormSchema,
        InferInput,
        InferOutput,
        FormSubmitEvent,
    } from "@nuxt/ui"

    const { schema, initial, onSubmit } = defineProps<{
        schema: S
        initial?: PartialDeep<InferInput<S>>
        onSubmit?: (data: InferOutput<S>) => void | Promise<void>
    }>()

    const form = useTemplateRef("form")
    const state = ref(structuredClone(toRaw(initial) ?? {})) as Ref<
        Partial<InferInput<S>>
    >

    function onFormSubmit({ data }: FormSubmitEvent<S>) {
        return onSubmit?.(data)
    }

    function reset() {
        state.value = structuredClone(toRaw(initial) ?? {})
        form.value?.clear()
    }

    defineExpose({
        state,
        reset,
        validate: computed(() => form.value?.validate!),
        clear: computed(() => form.value?.clear!),
        errors: computed(() => form.value?.errors!),
        getErrors: computed(() => form.value?.getErrors!),
        setErrors: computed(() => form.value?.setErrors!),
        submit: computed(() => form.value?.submit!),
        disabled: computed(() => form.value?.disabled!),
        dirty: computed(() => form.value?.dirty!),
        loading: computed(() => form.value?.loading!),
        dirtyFields: computed(() => form.value?.dirtyFields!),
        touchedFields: computed(() => form.value?.touchedFields!),
        blurredFields: computed(() => form.value?.blurredFields!),
    })
</script>
