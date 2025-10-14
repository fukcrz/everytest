<template>
    <div
        class="grow flex flex-col relative bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 transition-colors duration-500"
    >
        <!-- 背景渐变装饰  -->
        <div class="absolute overflow-hidden size-full">
            <div
                class="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[800px] h-[800px] bg-gradient-to-tr from-purple-100 via-blue-100 to-transparent dark:from-purple-900/50 dark:via-blue-900/50 rounded-full blur-3xl opacity-50"
            ></div>
            <div
                class="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[800px] h-[800px] bg-gradient-to-bl from-pink-100 via-red-100 to-transparent dark:from-pink-900/50 dark:via-red-900/50 rounded-full blur-3xl opacity-50"
            ></div>
        </div>

        <main class="grow flex flex-col">
            <slot></slot>
        </main>

        <footer class="mt-auto text-center p-4">
            <p class="text-gray-500 dark:text-gray-400 text-sm">
                免责声明：本测试由 AI
                生成，结果仅供娱乐和参考，不构成任何专业建议。
            </p>
        </footer>
    </div>
</template>
