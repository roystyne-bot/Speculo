// convex/lib/groq.ts
// Thin wrapper around Groq's chat completions endpoint. Both prompt files
// expect a JSON object back, so this always requests JSON mode and parses
// the result, throwing a clear error if the model didn't return valid JSON
// rather than letting a malformed response silently corrupt a DB write.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

type CallOptions = {
  model?: string;
  temperature?: number;
};

export async function callGroqJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  options: CallOptions = {},
): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set on the Convex deployment");
  }

  const model = options.model ?? DEFAULT_MODEL;
  const temperature = options.temperature ?? 0.7;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed (${response.status}) using model "${model}": ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq response had no content");
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error(`Groq did not return valid JSON: ${content}`);
  }
}