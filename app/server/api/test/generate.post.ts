const bodySchema = z.object({
    topic: z.string().min(1),
})

export default defineEventHandler(async (event) => {
    const { topic } = await readValidatedBody(event, bodySchema.parse)

    const { object } = await generateObject({
        model: gemini,
        prompt: prompt(
            "# 角色",
            "你是一位经验丰富的心理学家和创意内容设计师，擅长将复杂概念转化为有趣且引人入胜的测试问卷。",
            "",
            "# 任务",
            "根据用户提供的主题，设计一份高质量的单项选择题测试问卷。",
            "",
            "# 规则",
            "1.  问卷可以包含不少于8个问题，最好有10个以上问题，用于从不同维度探索该主题。",
            "2.  每个问题提供任意个选项，选项需要风格统一，且具有区分度。",
            "3.  问题设计应避免诱导性，让用户能根据真实想法选择。",
            "4.  整个问卷的标题 (title) 应该根据主题自动生成，使其更具吸引力。",
            "5.  最终输出必须是纯粹的、格式严格的 JSON 对象，不能包含任何 Markdown 标记、注释或在 JSON 之外的任何文本。",
            "6.  如果无法为该主题生成测试（比如用户输入内容无意义），返回的结果中使用error字段说明情况。",
            "",
            "# 用户输入",
            `用户提供的测试主题是："${topic}"`,
        ),
        schema: z.object({
            error: z
                .string()
                .optional()
                .describe("如果无法生成测试，返回错误信息"),
            title: z.string().describe("测试问卷的标题"),
            questions: z
                .array(
                    z.object({
                        question: z.string().describe("问题文本"),
                        options: z
                            .array(z.string().describe("选项文本"))
                            .describe("问题的选项"),
                    }),
                )
                .describe("测试问卷的问题列表"),
        }),
    })

    return object
})
