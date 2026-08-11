
import { runJavaScript } from "./jsRunner";
import { runPython } from "./pythonRunner";
import { transpileTypeScript } from "./tsTranspile";
import type { ExecutionResult } from "./jsRunner";

export type SupportedLanguage = "javascript" | "typescript" | "python";

export async function runCode(
  language: SupportedLanguage,
  code: string
): Promise<ExecutionResult> {
  switch (language) {
    case "javascript":
    case "typescript":
      try {
        const jsCode = await transpileTypeScript(code);
        return runJavaScript(jsCode);
      } catch (err: any) {
        return {
          output: "",
          error: `TypeScript compile error: ${err.message}`,
          executionTimeMs: 0,
        };
      }
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