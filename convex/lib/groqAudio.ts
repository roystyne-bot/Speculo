// convex/lib/groqAudio.ts
// Calls Groq's Whisper transcription endpoint. Kept separate from groq.ts's
// callGroqJSON because this is a multipart/form-data upload with a plain
// text response, not a JSON-in/JSON-out chat completion — different enough
// shape that merging them would make both harder to read.

const GROQ_TRANSCRIPTION_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const WHISPER_MODEL = "whisper-large-v3-turbo";

export async function transcribeAudio(audioBytes: ArrayBuffer, mimeType: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set on the Convex deployment");
  }

  const extension = mimeType.includes("webm") ? "webm" : mimeType.includes("mp4") ? "mp4" : "wav";

  const formData = new FormData();
  formData.append("file", new Blob([audioBytes], { type: mimeType }), `answer.${extension}`);
  formData.append("model", WHISPER_MODEL);
  formData.append("response_format", "json");

  const response = await fetch(GROQ_TRANSCRIPTION_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq transcription failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (typeof data.text !== "string") {
    throw new Error("Groq transcription response had no text");
  }

  return data.text;
}