生成
用户输入 帮我生成 100 字的文档 => LLM 通过 Function Calling 调用 createDocument 工具 => createDocument 工具里会继续请求模型( "撰写关于给定主题的内容。支持 Markdown。适当使用标题。")
=> 自定义数据流式输出 dataStream.write({type: "data-textDelta",data: text}) => prosemirror 渲染 => 之后将生成的文档存库

修改
用户输入 请提出您认为可以改进写作的建议 => LLM 通过 Function Calling 调用 requestSuggestions 工具 => requestSuggestions 工具里会继续请求模型(你是一个写作辅助助手。给定一篇文章，请提供改进文章的建议并描述具体的修改。
修改时非常重要的一点是，修改内容应包含完整的句子，而不仅仅是单个词汇。
最多提供五条建议。请用 JSON 格式回答：{\"originalSentence\":..., \"suggestedSentence\":..., \"description\":...}，
其中 originalSentence 是原句，suggestedSentence 是建议修改后的句子，description 是针对原句建议的描述")
=> 自定义数据流式输出 dataStream.write({type: "data-suggestion",data: text}) => prosemirror 渲染 => 用户可以根据原文和建议自行修改,将建议替换完原文后，会把文档(原文)存库 => 之后将生成的建议存库

最后润色
用户输入 请进行最后的润色并检查语法，为更好的结构添加章节标题，并确保内容阅读流畅。=> LLM 通过 Function Calling 调用 updateDocument 工具 => updateDocument 工具里会继续请求模型，根据文档内容 + 原句建议的描述 => 提示词：根据给定的提示改进以下${文档内容}的内容发给大模型+原句建议的描述=>
发给大模型=> 自定义数据流式输出 dataStream.write({type: "data-textDelta",data: text}) => prosemirror 渲染 => 之后将生成的文档存库
