"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { runCode, type SupportedLanguage } from "@/lib/codeExecution";
import {
  subscribePyodideStatus,
  preloadPython,
  type PyodideStatus,
} from "@/lib/codeExecution/pythonRunner";
import { shouldWarnBeforePythonLoad } from "@/lib/codeExecution/shouldWarnMobile";

const LANGUAGES = [
  { key: "javascript", label: "JavaScript" },
  { key: "typescript", label: "TypeScript" },
  { key: "python", label: "Python" },
  { key: "java", label: "Java" },
  { key: "cpp", label: "C++" },
];

export const DEFAULT_SNIPPETS: Record<string, string> = {
  javascript: "console.log('Hello, Speculo');",
  typescript:
    "const greet = (name: string): string => `Hello, ${name}`;\nconsole.log(greet('Speculo'));",
  python: "print('Hello, Speculo')",
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Speculo");\n  }\n}',
  cpp: '#include <iostream>\nint main() {\n  std::cout << "Hello, Speculo" << std::endl;\n  return 0;\n}',
};

// Languages we can actually execute client-side right now
const EXECUTABLE_LANGUAGES = new Set(["javascript", "typescript", "python"]);

type CodeEditorProps = {
  language: string;
  code: string;
  onLanguageChange: (lang: string) => void;
  onCodeChange: (code: string) => void;
};

export default function CodeEditor({
  language,
  code,
  onLanguageChange,
  onCodeChange,
}: CodeEditorProps) {
  const [output, setOutput] = useState<{
    stdout: string;
    stderr: string;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideStatus, setPyodideStatus] = useState<PyodideStatus>("idle");
  const [pyodideElapsedSec, setPyodideElapsedSec] = useState(0);
  const [showPythonWarning, setShowPythonWarning] = useState(false);
  const [pythonConfirmed, setPythonConfirmed] = useState(false);

  // Track Pyodide's global load status so the button/badge can react
  useEffect(() => {
    return subscribePyodideStatus((status, elapsedMs) => {
      setPyodideStatus(status);
      setPyodideElapsedSec(Math.floor(elapsedMs / 1000));
    });
  }, []);

  useEffect(() => {
    if (language === "python" && !pythonConfirmed) {
      if (shouldWarnBeforePythonLoad()) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowPythonWarning(true);
        // don't preload yet — wait for user confirmation
      } else {
        preloadPython();
      }
    }
  }, [language, pythonConfirmed]);

  function confirmPythonLoad() {
    setShowPythonWarning(false);
    setPythonConfirmed(true);
    preloadPython();
  }

  // Start warming up Python the moment it's selected, not on first Run
  useEffect(() => {
    if (language === "python") {
      preloadPython();
    }
  }, [language]);

  const isPreparingRuntime =
    language === "python" && pyodideStatus === "loading";
  const isPythonReady = language === "python" && pyodideStatus === "ready";
  const canExecute = EXECUTABLE_LANGUAGES.has(language);

  function handleLanguageChange(newLang: string) {
    onLanguageChange(newLang);
    onCodeChange(DEFAULT_SNIPPETS[newLang]);
    setOutput(null);
  }

  async function handleRun() {
    if (!canExecute) {
      setOutput({
        stdout: "",
        stderr: `Running ${language} isn't supported yet — you can still write and review your code.`,
      });
      return;
    }

    setIsRunning(true);
    setOutput(null);
    try {
      const result = await runCode(language as SupportedLanguage, code);
      setOutput({ stdout: result.output, stderr: result.error ?? "" });
    } catch (err) {
      setOutput({ stdout: "", stderr: "Execution failed. Try again." });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        {showPythonWarning && (
          <div className="px-4 py-2 border-t border-border bg-background text-xs text-muted-foreground flex items-center justify-between gap-2">
            <span>Python runtime is ~10MB — recommended on Wi-Fi.</span>
            <button
              onClick={confirmPythonLoad}
              className="text-spring font-medium hover:underline whitespace-nowrap"
            >
              Load anyway
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-secondary text-foreground text-sm rounded-lg px-3 py-1.5 outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </select>
          {isPythonReady && (
            <span className="text-xs text-spring font-medium">
              Python ready ✓
            </span>
          )}
        </div>
        <button
          onClick={handleRun}
          disabled={isRunning || isPreparingRuntime}
          className="px-4 py-1.5 bg-spring text-spring-deep text-sm font-semibold rounded-lg hover:bg-spring-pale transition-colors duration-150 disabled:opacity-60"
        >
          {isPreparingRuntime
            ? "Loading Python runtime..."
            : isRunning
              ? "Code Executing..."
              : "Run Code"}
        </button>
      </div>

      <Editor
        height="320px"
        language={language}
        value={code}
        onChange={(value) => onCodeChange(value ?? "")}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 12 },
        }}
      />

      {isPreparingRuntime && (
        <div className="px-4 py-2 border-t border-border bg-background text-xs text-muted-foreground">
          Loading Python runtime
          {pyodideElapsedSec > 0 ? ` (${pyodideElapsedSec}s)` : ""}... first run
          only, cached after.
        </div>
      )}

      {output && (
        <div className="px-4 py-3 border-t border-border bg-background text-sm max-h-40 overflow-auto">
          {output.stdout && (
            <pre className="text-foreground whitespace-pre-wrap">
              {output.stdout}
            </pre>
          )}
          {output.stderr && (
            <pre className="text-red-400 whitespace-pre-wrap">
              {output.stderr}
            </pre>
          )}
          {!output.stdout && !output.stderr && (
            <span className="text-muted-foreground">No output</span>
          )}
        </div>
      )}
    </div>
  );
}
