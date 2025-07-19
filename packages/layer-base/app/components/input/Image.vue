<template>
    <div
        class="relative inline-flex flex-col border border-dashed has-focus:border-primary rounded-md overflow-clip"
        :class="{
            [sizeClass]: true,
            'border-muted': !error,
            'border-error': error,
            'border-primary!': draging && !disabled,
            'hover:border-primary!': !modelValue && !disabled,
        }"
        @dragenter="onDragenter"
        @dragover.prevent="onDragover"
        @drop.prevent.stop="onDrop"
        @dragleave="draging = false"
    >
        <input
            ref="inputRef"
            :id
            :name
            class="size-0"
            type="file"
            :accept
            v-bind="ariaAttrs"
            :readonly="disabled"
            title=""
            @change="onChange"
            @focus="emitFormFocus"
            @blur="emitFormBlur"
        />

        <div
            v-if="draging && !disabled"
            class="z-1 pointer-events-none absolute size-full flex justify-center items-center bg-black/30"
        >
            <Icon
                name="material-symbols-light:image-outline-rounded"
                class="text-3xl"
            />
        </div>

        <div v-if="modelValue" class="grow relative">
            <slot name="img" :url="modelValue" :imageClass>
                <img
                    :src="modelValue"
                    class="absolute size-full rounded-md"
                    :class="`${fitMap[fit]} ${imageClass}`"
                />
            </slot>

            <div
                v-if="!draging"
                class="absolute size-full flex justify-center items-center bg-black/30 opacity-0 hover:opacity-100"
            >
                <div class="flex gap-2">
                    <UButton
                        @click="modelValue = null"
                        icon="fluent:delete-28-regular"
                        variant="ghost"
                        class="rounded-full"
                        size="xl"
                        color="neutral"
                        :disabled="disabled"
                    />
                </div>
            </div>
        </div>

        <div
            v-else-if="!disabled"
            @click="inputRef?.click()"
            class="select-none grow flex flex-col gap-2 justify-center items-center"
        >
            <slot name="icon">
                <Icon name="uim:image-v" class="text-2xl text-muted"></Icon>
            </slot>
            <slot name="tip">
                <span class="text-xs text-muted">点击或拖拽上传</span>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
    const { operate, showFetchError } = useFeedback()

    // TODO: 图片预览

    const modelValue = defineModel<string | null>()

    const props = withDefaults(
        defineProps<{
            /** 默认 image/* */
            accept?: string
            /** 单位: byte */
            sizeLimit?: number
            /** 覆盖默认的大小类 */
            sizeClass?: string
            imageClass?: string
            fit?: "fill" | "cover" | "contain" | "scale-down" | "none"

            id?: string
            name?: string
            error?: boolean
            disabled?: boolean

            onUpload: (file: File) => Promise<string>
        }>(),
        {
            accept: "image/*",
            sizeClass: "size-32",
            imageClass: "",
            fit: "contain",
        },
    )

    const {
        id,
        name,
        color,
        disabled,
        emitFormChange,
        emitFormFocus,
        emitFormBlur,
        ariaAttrs,
    } = useFormField(props)
    watch(modelValue, emitFormChange)

    const error = computed(() => {
        return color.value === "error" || props.error
    })

    const inputRef = useTemplateRef("inputRef")
    const loading = ref(false)

    const fitMap = {
        none: "object-none",
        fill: "object-fill",
        cover: "object-cover",
        contain: "object-contain",
        "scale-down": "object-scale-down",
    }

    // 上传

    const acceptTypes = computed(() => {
        return props.accept.split(",").map((item) => item.trim())
    })

    function checkType(type: string, extName: string) {
        const types = acceptTypes.value
        if (types.length === 0) return true
        if (types.includes("*/*")) return true
        if (types.includes(type)) return true
        if (types.includes(extName)) return true
        const t = type.slice(0, type.indexOf("/"))
        return t && types.includes(`${t}/*`)
    }

    async function upload(file: File) {
        if (!checkType(file.type, file.name)) {
            showFetchError("不支持的文件类型")
            return
        }
        if (props.sizeLimit && file.size > props.sizeLimit) {
            showFetchError("文件大小超出限制, 最大 " + bytes(props.sizeLimit))
            return
        }
        loading.value = true
        await operate(props.onUpload(file))
            .then((url) => {
                modelValue.value = url
            })
            .finally(() => {
                loading.value = false
            })
    }

    // input 上传

    async function onChange() {
        if (disabled.value) return
        const file = inputRef.value?.files?.[0]
        if (!file) return
        inputRef.value.value = ""
        await upload(file)
    }

    // 拖拽上传

    const draging = ref(false)

    function onDragenter() {
        if (disabled.value) return
        draging.value = true
    }

    function onDragover(e: DragEvent) {
        if (disabled.value) return
        draging.value = true
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy"
    }

    async function onDrop(e: DragEvent) {
        draging.value = false
        const file = e.dataTransfer?.files[0]
        if (!file) return
        await upload(file)
    }
</script>
