// Judge0 CE via RapidAPI — free Basic plan (50 executions/day).
// Piston's public API went whitelist-only as of Feb 2026, hence this switch.
// https://judge0.com/

const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63, // Node.js
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
};

const RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com";

export async function runCode(
  languageKey: string,
  code: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const languageId = LANGUAGE_IDS[languageKey];
  if (!languageId) {
    throw new Error(`Unsupported language: ${languageKey}`);
  }

  // wait=true makes this a single synchronous call instead of
  // submit-then-poll, simplest option for our use case.
  const res = await fetch(
    `https://${RAPIDAPI_HOST}/submissions?base64_encoded=false&wait=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.JUDGE0_API_KEY as string,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Judge0 failed: ${await res.text()}`);
  }

  const data = await res.json();
  return {
    stdout: data.stdout ?? "",
    stderr: data.stderr ?? data.compile_output ?? "",
    exitCode: data.status?.id ?? 0,
  };
}