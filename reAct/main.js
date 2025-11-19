//TODO: AGENT
import { stepCountIs, streamText, tool } from 'ai';
import { z } from 'zod';
import * as fsTools from './file-system-functionality.js';
import { createDeepSeek } from '@ai-sdk/deepseek';

const deepSeekmodel = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,

});

const model = deepSeekmodel('deepseek-reasoner');

const PROMPT = `
  写一个html,里面包含一个div,背景是红色。
`;

const result = streamText({
  model: model,
  system: `
    需要解决一个问题。
    为此，你需要将问题分解为多个步骤。
    对于每个步骤，首先使用 <thought> 思考要做什么，然后使用可用工具之一决定一个 <action>。
    接着，你将根据你的行动从环境/工具中收到一个 <observation>。持续这个思考和行动的过程，直到你有足够的信息来提供 <final_answer>。

    ⸻

    例子 1:

    <question>埃菲尔铁塔有多高？</question>
    <thought>我需要找到埃菲尔铁塔的高度。可以使用搜索工具。</thought>
    <action>get_height("埃菲尔铁塔")</action>
    <observation>埃菲尔铁塔的高度约为330米（包含天线）。</observation>
    <thought>搜索结果显示了高度。我已经得到答案了。</thought>
    <final_answer>埃菲尔铁塔的高度约为330米。</final_answer>

    ⸻

    例子 2:

    <question>帮我找一个简单的番茄炒蛋食谱，并看看家里的冰箱里有没有西红柿。</question>
    <thought>这个任务分两步。第一步，找到番茄炒蛋的食谱。第二步，检查冰箱里是否有西红柿。我先用 find_recipe 工具找食谱。</thought>
    <action>find_recipe(dish="番茄炒蛋")</action>
    <observation>简单的番茄炒蛋食谱：将2个鸡蛋打散，2个番茄切块。热油，先炒鸡蛋，盛出。再热油，炒番茄至软烂，加入鸡蛋，放盐调味即可。</observation>
    <thought>好的，我已经有食谱了。食谱需要西红柿。现在我需要用 check_fridge 工具看看冰箱里有没有西红柿。</thought>
    <action>check_fridge(item="西红柿")</action>
    <observation>冰箱检查结果：有3个西红柿。</observation>
    <thought>我找到了食谱，并且确认了冰箱里有西红柿。可以回答问题了。</thought>
    <final_answer>简单的番茄炒蛋食谱是：鸡蛋打散，番茄切块。先炒鸡蛋，再炒番茄，混合后加盐调味。冰箱里有3个西红柿。</final_answer>

    ⸻

    本次任务可用工具：
    - writeFile
    - readFile
    - deletePath
    - listDirectory
    - createDirectory
    - exists
    - searchFiles
    使用这些工具为用户创建目录、创建文件。
    `,
  prompt: PROMPT,
  tools: {
    writeFile: tool({
      description: 'Write to a file',
      inputSchema: z.object({
        path: z
          .string()
          .describe('The path to the file to create'),
        content: z
          .string()
          .describe('The content of the file to create'),
      }),
      execute: async ({ path, content }) => {
        return fsTools.writeFile(path, content);
      },
    }),
    readFile: tool({
      description: 'Read a file',
      inputSchema: z.object({
        path: z
          .string()
          .describe('The path to the file to read'),
      }),
      execute: async ({ path }) => {
        return fsTools.readFile(path);
      },
    }),
    deletePath: tool({
      description: 'Delete a file or directory',
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            'The path to the file or directory to delete',
          ),
      }),
      execute: async ({ path }) => {
        return fsTools.deletePath(path);
      },
    }),
    listDirectory: tool({
      description: 'List a directory',
      inputSchema: z.object({
        path: z
          .string()
          .describe('The path to the directory to list'),
      }),
      execute: async ({ path }) => {
        return fsTools.listDirectory(path);
      },
    }),
    createDirectory: tool({
      description: 'Create a directory',
      inputSchema: z.object({
        path: z
          .string()
          .describe('The path to the directory to create'),
      }),
      execute: async ({ path }) => {
        return fsTools.createDirectory(path);
      },
    }),
    exists: tool({
      description: 'Check if a file or directory exists',
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            'The path to the file or directory to check',
          ),
      }),
      execute: async ({ path }) => {
        return fsTools.exists(path);
      },
    }),
    searchFiles: tool({
      description: 'Search for files',
      inputSchema: z.object({
        pattern: z
          .string()
          .describe('The pattern to search for'),
      }),
      execute: async ({ pattern }) => {
        return fsTools.searchFiles(pattern);
      },
    }),
  },
  stopWhen: [stepCountIs(10)],
});

const stream = result.toUIMessageStream({
  onFinish: ({ messages }) => {
    console.log('--- ON FINISH ---');
    console.dir(messages, { depth: null });
  },
});

// console.log('--- STREAM ---');

for await (const message of stream) {
  // console.log(message);
}
