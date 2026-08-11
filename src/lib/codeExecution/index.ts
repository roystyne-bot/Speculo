
import { runJavaScript } from "./jsRunner";
import { runPython } from "./pythonRunner";
import type { ExecutionResult } from "./jsRunner";

export type SupportedLanguage = "javascript" | "typescript" | "python";

export async function runCode(
  language: SupportedLanguage,
  code: string
): Promise<ExecutionResult> {
  switch (language) {
    case "javascript":
    case "typescript":
      // TS runs as JS here — for real type-checking you'd need
      // to transpile first (e.g. with a bundled `typescript` package),
      // but for interview-answer execution, running as JS is enough.
      return runJavaScript(code);
    case "python":
      return runPython(code);
    default:
      return {
        output: "",
        error: `Execution not yet supported for ${language}. You can still write and review your code.`,
        executionTimeMs: 0,
      };
  }
}