<template>
    <UModal
        :title
        :description
        :dismissible="!confirm"
        :close="{ onClick: () => emit('close', undefined) }"
    >
        <template #body>
            {{ message }}
        </template>

        <template v-if="!description" #description></template>

        <template #footer>
            <div v-if="confirm" class="ml-auto flex gap-4">
                <UButton
                    @click="emit('close', false)"
                    variant="soft"
                    color="neutral"
                    size="lg"
                    >{{ cancelText }}</UButton
                >
                <UButton
                    @click="emit('close', true)"
                    variant="soft"
                    size="lg"
                    >{{ enterText }}</UButton
                >
            </div>

            <UButton
                v-else
                class="ml-auto"
                @click="emit('close', true)"
                variant="soft"
                size="lg"
                color="neutral"
            >
                {{ enterText }}
            </UButton>
        </template>
    </UModal>
</template>

<script lang="ts">
    export interface BaseDialogProps {
        title?: string
        description?: string
        message?: string
        confirm?: boolean
        enterText?: string
        cancelText?: string
    }
</script>

<script setup lang="ts">
    const emit = defineEmits<{ close: [boolean | undefined] }>()

    const {
        title = "提示",
        description,
        message,
        confirm,
        enterText = "确定",
        cancelText = "取消",
    } = defineProps<BaseDialogProps>()
</script>
