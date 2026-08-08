export async function generateWithGemini(prompt: string, retries = 2): Promise<string> {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
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

  if (res.status === 429 && retries > 0) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5s
    return generateWithGemini(prompt, retries - 1);
  }

  if (!res.ok) {
    throw new Error(`Gemini failed: ${await res.text()}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}