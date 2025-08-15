<template>
    <editor-content class="flex flex-col border-primary" :editor="editor" />
</template>

<script setup lang="ts">
    import { Editor, EditorContent } from "@tiptap/vue-3"
    import StarterKit from "@tiptap/starter-kit"
    import Image from "@tiptap/extension-image"
    import FileHandler from "@tiptap/extension-file-handler"
    import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
    import { all, createLowlight } from "lowlight"
    import "highlight.js/styles/github-dark.css"

    const { operate } = useFeedback()

    const modelValue = defineModel<string>()
    const props = defineProps<{
        editorClass?: string
        editable?: boolean
        onUpload?: (file: File) => Promise<string>
    }>()
    const editor = ref<Editor>()
    const editorClass = computed(
        () =>
            `max-w-none grow prose dark:prose-invert outline-none ${props.editorClass ?? ""}`,
    )

    watch(modelValue, (v) => {
        if (!editor.value) return
        if (v === editor.value.getHTML()) return
        editor.value?.commands.setContent(v || "", { emitUpdate: false })
    })

    watch(editorClass, (c) => {
        if (!editor.value) return
        editor.value.setOptions({ editorProps: { attributes: { class: c } } })
    })

    watch(
        () => props.editable,
        (editable) => {
            if (!editor.value) return
            editor.value.setOptions({ editable })
        },
    )

    function fileToURL(file: File) {
        if (props.onUpload) {
            return operate(props.onUpload(file))
        } else {
            return new Promise<string>((r) => {
                const fileReader = new FileReader()
                fileReader.readAsDataURL(file)
                fileReader.onload = () => {
                    r(fileReader.result as string)
                }
            })
        }
    }

    onMounted(() => {
        editor.value = new Editor({
            editable: props.editable,
            content: modelValue.value,
            extensions: [
                StarterKit.configure({
                    codeBlock: false,
                }),
                CodeBlockLowlight.configure({ lowlight: createLowlight(all) }),
                Image,
                FileHandler.configure({
                    allowedMimeTypes: [
                        "image/png",
                        "image/jpeg",
                        "image/gif",
                        "image/webp",
                    ],
                    onDrop: (currentEditor, files, pos) => {
                        files.forEach((file) => {
                            fileToURL(file).then((url) => {
                                currentEditor
                                    .chain()
                                    .insertContentAt(pos, {
                                        type: "image",
                                        attrs: {
                                            src: url,
                                        },
                                    })
                                    .focus()
                                    .run()
                            })
                        })
                    },
                    onPaste: (currentEditor, files) => {
                        files.forEach((file) => {
                            fileToURL(file).then((url) => {
                                currentEditor
                                    .chain()
                                    .insertContentAt(
                                        currentEditor.state.selection.anchor,
                                        {
                                            type: "image",
                                            attrs: {
                                                src: url,
                                            },
                                        },
                                    )
                                    .focus()
                                    .run()
                            })
                        })
                    },
                }),
            ],
            editorProps: {
                attributes: {
                    class: editorClass.value,
                },
            },
            onUpdate(e) {
                modelValue.value = e.editor.getHTML()
            },
        })
    })

    onBeforeUnmount(() => {
        editor.value?.destroy()
    })

    const getHTML = () => editor.value?.getHTML()
    const getText = () => editor.value?.getText()
    const getJSON = () => editor.value?.getJSON()

    defineExpose({
        editor,
        getHTML,
        getText,
        getJSON,
    })
</script>

<style>
    .ProseMirror img.ProseMirror-selectednode {
        outline: 1px solid var(--ui-primary);
    }
</style>
