export async function generateWithGemini(prompt: string): Promise<string> {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY as string,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9 },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini failed: ${await res.text()}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}