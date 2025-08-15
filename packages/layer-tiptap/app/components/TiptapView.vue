<template>
    <div
        class="max-w-none prose dark:prose-invert outline-none"
        v-html="htmlContent"
    ></div>
</template>

<script setup lang="ts">
    import hljs from "highlight.js"
    import "highlight.js/styles/github-dark.css"

    const { htmlContent } = defineProps<{ htmlContent: any }>()

    onMounted(() => {
        hljs.highlightAll()
    })
</script>

<style>
    .prose .hljs {
        background-color: transparent !important;
    }
</style>
