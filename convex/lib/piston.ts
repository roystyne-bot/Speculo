// Public Piston API — free, no API key required.
// https://github.com/engineer-man/piston

const LANGUAGE_VERSIONS: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "cpp", version: "10.2.0" },
  typescript: { language: "typescript", version: "5.0.3" },
};

export async function runCode(
  languageKey: string,
  code: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const config = LANGUAGE_VERSIONS[languageKey];
  if (!config) {
    throw new Error(`Unsupported language: ${languageKey}`);
  }

  const res = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: config.language,
      version: config.version,
      files: [{ content: code }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Piston failed: ${await res.text()}`);
  }

  const data = await res.json();
  return {
    stdout: data.run?.stdout ?? "",
    stderr: data.run?.stderr ?? "",
    exitCode: data.run?.code ?? 0,
  };
}