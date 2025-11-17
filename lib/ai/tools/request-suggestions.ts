import { streamObject, tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getDocumentById, saveSuggestions } from "@/lib/db/queries";
import type { Suggestion } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { myProvider } from "../providers";

type RequestSuggestionsProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: "请求文档的建议",
    inputSchema: z.object({
      documentId: z
        .string()
        .describe("请求编辑的文档ID"),
    }),
    execute: async ({ documentId }) => {
      const document = await getDocumentById({ id: documentId });

      if (!document || !document.content) {
        return {
          error: "文档没有找到！",
        };
      }
      
      const suggestions: Omit<
        Suggestion,
        "userId" | "createdAt" | "documentCreatedAt"
      >[] = [];

      const result = streamObject({
        model: myProvider.languageModel("artifact-model"),
        system:
           `你是一个写作辅助助手。给定一篇文章，请提供改进文章的建议并描述具体的修改。
            修改时非常重要的一点是，修改内容应包含完整的句子，而不仅仅是单个词汇。
            最多提供五条建议。请用 JSON 格式回答：{\"originalSentence\":..., \"suggestedSentence\":..., \"description\":...}，
            其中originalSentence是原句，suggestedSentence是建议修改后的句子，description是针对原句建议的描述`,
        prompt: document.content,
        schema: z.object({
          originalSentence: z.string().describe("原句"),
          suggestedSentence: z.string().describe("建议的句子"),
          description: z.string().describe("建议的描述"),
        }),
      });
      let allStreamRes = [] as any;
      for await (const chunk of result.partialObjectStream) {
        allStreamRes = chunk
      }
      for (const item of allStreamRes) {
        const suggestion = {
            originalText: item.originalSentence || '',
            suggestedText: item.suggestedSentence || '',
            description: item.description || '',
            id: generateUUID(),
            documentId,
            isResolved: false,
          };

        dataStream.write({
          type: "data-suggestion",
          data: suggestion as any,
          transient: true,
        });

        suggestions.push(suggestion);
      }

      if (session.user?.id) {
        const userId = session.user.id;

        await saveSuggestions({
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId,
            createdAt: new Date(),
            documentCreatedAt: document.createdAt,
          })),
        });
      }

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: "建议已添加到文档中",
      };
    },
  });
