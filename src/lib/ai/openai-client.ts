import { z } from "zod";

import {
  getAiEmbeddingConfig,
  getAiEvaluationConfig,
  getAiGenerationConfig,
  type AiProviderConfig,
} from "@/lib/platform/env";

const embeddingResponseSchema = z.object({
  data: z.array(
    z.object({
      embedding: z.array(z.number()),
      index: z.number().int().nonnegative(),
    }),
  ),
});

type OpenAiMessageContent =
  | string
  | Array<{ type?: string; text?: string }>
  | undefined;

type OpenAiCompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: OpenAiMessageContent;
    };
  }>;
};

function trimBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizeMessageContent(content: OpenAiMessageContent) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }

  return "";
}

async function requestChatCompletion(config: AiProviderConfig, payload: Record<string, unknown>) {
  const response = await fetch(`${trimBaseUrl(config.baseUrl)}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`AI provider request failed with status ${response.status}.`);
  }

  return (await response.json()) as OpenAiCompatibleResponse;
}

export async function requestStructuredJson<T>(params: {
  config: AiProviderConfig;
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  temperature?: number;
}) {
  const payload = await requestChatCompletion(params.config, {
    model: params.config.model,
    temperature: params.temperature ?? 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: params.systemPrompt,
      },
      {
        role: "user",
        content: params.userPrompt,
      },
    ],
  });

  const content = normalizeMessageContent(payload.choices?.[0]?.message?.content);

  if (!content) {
    throw new Error("AI provider returned an empty completion.");
  }

  return params.schema.parse(JSON.parse(content) as unknown);
}

export async function createEmbeddings(input: string[]) {
  const config = getAiEmbeddingConfig();
  const response = await fetch(`${trimBaseUrl(config.baseUrl)}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      input,
      encoding_format: "float",
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed with status ${response.status}.`);
  }

  const parsed = embeddingResponseSchema.parse(await response.json());
  return parsed.data
    .sort((left, right) => left.index - right.index)
    .map((item) => item.embedding);
}

export function getGenerationProviderConfig() {
  return getAiGenerationConfig();
}

export function getEvaluationProviderConfig() {
  return getAiEvaluationConfig();
}