const bodySchema = z.object({
    topic: z.string(),
    title: z.string(),
    questions: z.array(
        z.object({
            question: z.string(),
            options: z.array(z.string()),
            selection: z.string().nullish(),
        }),
    ),
})

export default defineEventHandler(async (event) => {
    const { topic, title, questions } = await readValidatedBody(
        event,
        bodySchema.parse,
    )

    const questionsText = questions
        .map((q) =>
            prompt(
                `- ${q.question}`,
                "",
                q.options.map((o, i) => `${i + 1}. ${o}`).join("\n"),
                "",
                `用户的选择: ${q.selection}`,
            ),
        )
        .join("\n\n")

    const { textStream } = streamText({
        model: gemini,
        prompt: prompt(
            "# 角色",
            "你是一位富有同理心和洞察力的行为分析专家和人生导师。你的任务是基于用户完成的测试，为他们提供一份具有参考价值的个性化分析报告。",
            "",
            "# 任务",
            "分析用户提供的测试主题及他们的全部作答，生成一份结构化的综合评估报告。",
            "",
            "# 报告要求",
            "1.  **犀利**：使用简洁易懂的语言，直接陈述你的观点，避免冗长的解释。",
            "2.  **结构化**：使用 Markdown 输出",
            "3.  **个性化**：报告内容必须紧密结合用户的每一个答案，而不是泛泛而谈。",
            "4.  **评测结果**：报告的第一项内容，先直接展示评测内容的结果，对于可以数值化的评测结果，可以用分数、等级、百分比等形式展示。",
            "5.  **字数**：尽可能简单，不要超过 500 字。",
            "",
            "# 用户数据",
            "",
            `用户想要的测试主题是："${topic}"`,
            "",
            `测试的标题是："${title}"`,
            "",
            `问题列表及用户的选择：`,
            "",
            questionsText,
            "----",
            "请根据以上信息，开始撰写你的分析报告。",
        ),
    })

    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const text of textStream) {
                    if (text) controller.enqueue(new TextEncoder().encode(text))
                }
            } catch (error: any) {
                console.error("AI stream error:", error)
                const errorMessage = `\n\n[AI Error]: ${error?.message || "Unknown error"}`
                controller.enqueue(new TextEncoder().encode(errorMessage))
            } finally {
                controller.close()
            }
        },
    })

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "Transfer-Encoding": "chunked",
        },
    })
})
