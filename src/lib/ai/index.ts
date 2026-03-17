import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type AIModel = "gpt-4o-mini" | "gpt-4o";

interface ChatOptions {
  model?: AIModel;
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
}

export async function chat({ model = "gpt-4o-mini", systemPrompt, messages, maxTokens = 1024 }: ChatOptions) {
  const response = await openai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  return {
    content: response.choices[0]?.message?.content ?? "",
    inputTokens: response.usage?.prompt_tokens ?? 0,
    outputTokens: response.usage?.completion_tokens ?? 0,
    model,
  };
}

export async function chatStream({ model = "gpt-4o-mini", systemPrompt, messages, maxTokens = 1024 }: ChatOptions) {
  const stream = await openai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    stream_options: { include_usage: true },
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  return stream;
}

export function estimateCost(inputTokens: number, outputTokens: number, model: AIModel): number {
  const pricing = {
    "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
    "gpt-4o": { input: 2.5 / 1_000_000, output: 10 / 1_000_000 },
  };

  const p = pricing[model];
  return inputTokens * p.input + outputTokens * p.output;
}
