<template>
    <div class="grow flex flex-col justify-center items-center">
        <div class="w-full max-w-2xl mx-auto p-4 md:p-6 relative z-10">
            <div
                class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg transition-all duration-500 p-6 md:p-10 border border-gray-200 dark:border-slate-700"
            >
                <div v-if="state == 'init'">
                    <div class="text-center mb-8">
                        <h1
                            class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500"
                        >
                            Every Test
                        </h1>
                        <p
                            class="text-gray-600 dark:text-gray-300 mt-3 md:text-lg"
                        >
                            输入任何主题，让 AI 为你生成专属趣味测试
                        </p>
                    </div>

                    <BaseForm
                        :schema="formSchema"
                        @submit="generateTest"
                        v-slot="{ state }"
                    >
                        <UFormField name="topic">
                            <div class="relative">
                                <input
                                    v-model="state.topic"
                                    name="topic"
                                    placeholder="例如：测试我的MBTI人格倾向"
                                    class="w-full px-3 md:px-5 py-2 md:py-4 text-xs md:text-base lg:text-lg bg-gray-100 dark:bg-slate-700 border-2 border-transparent rounded-full focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 focus:border-purple-500 dark:focus:border-purple-500 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                                />
                                <button
                                    type="submit"
                                    class="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-4 md:px-6 py-1.5 md:py-2.5 text-xs md:text-base rounded-full hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transform hover:scale-105 transition-all duration-300"
                                >
                                    生成测试
                                </button>
                            </div>
                        </UFormField>
                    </BaseForm>
                </div>

                <div v-if="state == 'loading'" class="text-center py-10">
                    <Icon
                        name="eos-icons:loading"
                        class="text-5xl mx-auto mb-6"
                    />
                    <p
                        id="loading-text"
                        class="text-gray-600 dark:text-gray-400 text-xl animate-pulse"
                    >
                        正在为您生成测试题...
                    </p>
                </div>

                <div v-if="state == 'answer'">
                    <h2
                        id="test-title"
                        class="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white"
                    >
                        {{ test.title }}
                    </h2>
                    <div id="questions-container" class="space-y-8">
                        <div
                            v-for="(item, i) of test.questions"
                            class="bg-white/50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 p-6 rounded-lg transition-colors"
                        >
                            <p
                                class="font-semibold text-lg mb-4 text-gray-900 dark:text-white"
                            >
                                {{ i + 1 }}. {{ item.question }}
                            </p>
                            <div class="space-y-2">
                                <label
                                    v-for="option of item.options"
                                    @click="item.selection = option"
                                    class="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-200/50 dark:hover:bg-slate-600/50 cursor-pointer transition-colors duration-200"
                                >
                                    <div
                                        class="shrink-0 custom-radio"
                                        :class="{
                                            checked: option == item.selection,
                                        }"
                                    ></div>

                                    <span
                                        class="text-gray-700 dark:text-gray-300"
                                        >{{ option }}</span
                                    >
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="text-center mt-10">
                        <button
                            @click="evaluating"
                            class="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-10 py-4 rounded-full text-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transform hover:scale-105 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            完成！查看结果
                        </button>
                    </div>
                </div>

                <div v-if="state == 'result'">
                    <h2
                        class="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white b-b"
                    >
                        你的专属评测报告
                    </h2>

                    <div
                        class="prose lg:prose-lg dark:prose-invert max-w-none"
                        v-html="
                            result
                                ? parseMarkdown(result)
                                : '正在生成报告，请稍等...'
                        "
                    ></div>

                    <div
                        v-if="showRetryButton"
                        class="flex justify-around text-center mt-8"
                    >
                        <button
                            v-if="shared"
                            @click="sharedTest"
                            class="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transform hover:scale-105 transition-all duration-300"
                        >
                            测试题目
                        </button>

                        <template v-else>
                            <button
                                @click="shareResult"
                                class="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transform hover:scale-105 transition-all duration-300"
                            >
                                分享
                            </button>

                            <button
                                @click="state = 'init'"
                                class="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transform hover:scale-105 transition-all duration-300"
                            >
                                再试一次
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { parse as parseMarkdown } from "marked"

    const route = useRoute()
    const id = route.query.id as string | undefined
    const { dialog, operate } = useFeedback()

    const state = ref("init" as "init" | "loading" | "answer" | "result")
    const result = ref("")
    const shared = ref(false)
    const showRetryButton = ref(false)
    const test = ref(
        {} as {
            topic: string
            title: string
            questions: {
                question: string
                options: string[]
                selection?: string
            }[]
        },
    )

    if (typeof id == "string") {
        await $fetch(`/api/result/${id}`)
            .then((res: any) => {
                result.value = res.result
                test.value = {
                    topic: res.topic,
                    title: res.title,
                    questions: res.questions,
                }
                shared.value = true
                showRetryButton.value = true
                state.value = "result"
            })
            .catch(() => {
                dialog({
                    title: "无效的分享链接",
                    message: "请检查链接是否正确，或重新生成分享链接。",
                })
            })
    }

    const formSchema = z.object({
        topic: z
            .string("请输入主题")
            .min(2, "主题至少需要2个字符")
            .max(50, "主题不能超过50个字符"),
    })

    async function generateTest(data: ZodOutput<typeof formSchema>) {
        state.value = "loading"
        const res = await operate(
            // @ts-ignore
            $fetch("/api/test/generate", {
                method: "POST",
                body: { topic: data.topic },
            }),
        )
        if (res.error) {
            state.value = "init"
            dialog({ title: "生成失败", message: res.error })
        } else {
            state.value = "answer"
            test.value = {
                topic: data.topic,
                title: res.title,
                questions: res.questions,
            }
        }
    }

    async function evaluating() {
        result.value = ""
        showRetryButton.value = false
        state.value = "result"

        const res = (await operate(
            $fetch("/api/test/evaluating", {
                method: "POST",
                body: test.value,
                responseType: "stream",
            }),
        )) as unknown as ReadableStream

        const reader = res.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) {
                break
            }
            const v = decoder.decode(value, { stream: true })
            result.value += v
        }

        showRetryButton.value = true
    }

    async function shareResult() {
        const { id } = await operate(
            $fetch("/api/result/share", {
                method: "POST",
                body: {
                    topic: test.value.topic,
                    title: test.value.title,
                    result: result.value,
                    questions: test.value.questions,
                },
            }),
        )

        await navigator.clipboard
            .writeText(`${window.location.origin}?id=${id}`)
            .then(() => {
                dialog({
                    title: "分享链接已复制到剪贴板",
                    message: "你可以将链接发送给朋友，让他们查看你的测试结果。",
                })
            })
            .catch(() => {
                dialog({
                    title: "复制失败",
                    message:
                        "请手动复制链接：" +
                        `${window.location.origin}?id=${id}`,
                })
            })
    }

    function sharedTest() {
        shared.value = false
        state.value = "answer"
        nextTick(() => {
            document
                .getElementById("__nuxt")
                ?.scrollTo({ top: 0, behavior: "smooth" })
        })
    }
</script>

<style>
    /* 自定义单选按钮样式 */
    .custom-radio {
        appearance: none;
        -webkit-appearance: none;
        width: 1.25rem;
        height: 1.25rem;
        border: 2px solid #d1d5db; /* gray-300 */
        border-radius: 50%;
        display: inline-block;
        position: relative;
        cursor: pointer;
        transition:
            background-color 0.2s,
            border-color 0.2s;
    }
    .dark .custom-radio {
        border-color: #4b5563; /* gray-600 */
    }
    .custom-radio.checked {
        border-color: #3b82f6; /* blue-500 */
        background-color: #3b82f6; /* blue-500 */
    }
    .dark .custom-radio.checked {
        border-color: #60a5fa; /* blue-400 */
        background-color: #60a5fa; /* blue-400 */
    }
    .custom-radio.checked::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: white;
        transform: translate(-50%, -50%);
    }
</style>
