const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_CANDIDATES = [
  process.env.OPENROUTER_MODEL,
  "nousresearch/hermes-4-70b",
  "nousresearch/hermes-3-llama-3.1-70b",
  "neversleep/llama-3-lumimaid-70b",
].filter((value): value is string => Boolean(value));

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function hasOpenRouterKey() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export async function completeChat(
  messages: ChatMessage[],
  jsonOrOptions: boolean | { json?: boolean; maxTokens?: number } = false,
) {
  const options =
    typeof jsonOrOptions === "boolean" ? { json: jsonOrOptions } : jsonOrOptions;
  const json = options.json ?? false;
  const maxTokens = options.maxTokens ?? 1400;
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  let lastError = "OpenRouter request failed.";

  for (const model of MODEL_CANDIDATES) {
    for (const useJson of json ? [true, false] : [false]) {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
          "X-Title": "Vesper",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.95,
          max_tokens: maxTokens,
          ...(useJson ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content?.trim();
        if (!content) {
          throw new Error("The model returned an empty reply.");
        }
        return content;
      }

      const body = await response.text();
      lastError = `OpenRouter ${response.status}: ${body.slice(0, 240)}`;
      if (response.status !== 404 && response.status !== 400) {
        throw new Error(lastError);
      }
    }
  }

  throw new Error(lastError);
}
