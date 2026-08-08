"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

const LANGUAGES = [
  { key: "javascript", label: "JavaScript" },
  { key: "typescript", label: "TypeScript" },
  { key: "python", label: "Python" },
  { key: "java", label: "Java" },
  { key: "cpp", label: "C++" },
];

export const DEFAULT_SNIPPETS: Record<string, string> = {
  javascript: "console.log('Hello, Speculo');",
  typescript: "const greet = (name: string): string => `Hello, ${name}`;\nconsole.log(greet('Speculo'));",
  python: "print('Hello, Speculo')",
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Speculo");\n  }\n}',
  cpp: '#include <iostream>\nint main() {\n  std::cout << "Hello, Speculo" << std::endl;\n  return 0;\n}',
};

type CodeEditorProps = {
  language: string;
  code: string;
  onLanguageChange: (lang: string) => void;
  onCodeChange: (code: string) => void;
};

export default function CodeEditor({ language, code, onLanguageChange, onCodeChange }: CodeEditorProps) {
  const [output, setOutput] = useState<{ stdout: string; stderr: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const executeCode = useAction(api.codeRun.executeCode);

  function handleLanguageChange(newLang: string) {
    onLanguageChange(newLang);
    onCodeChange(DEFAULT_SNIPPETS[newLang]);
    setOutput(null);
  }

  async function handleRun() {
    setIsRunning(true);
    setOutput(null);
    try {
      const result = await executeCode({ language, code });
      setOutput({ stdout: result.stdout, stderr: result.stderr });
    } catch (err) {
      setOutput({ stdout: "", stderr: "Execution failed. Try again." });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
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
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="px-4 py-1.5 bg-spring text-spring-deep text-sm font-semibold rounded-lg hover:bg-spring-pale transition-colors duration-150 disabled:opacity-60"
        >
          {isRunning ? "Running..." : "Run Code"}
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

      {output && (
        <div className="px-4 py-3 border-t border-border bg-background text-sm max-h-40 overflow-auto">
          {output.stdout && (
            <pre className="text-foreground whitespace-pre-wrap">{output.stdout}</pre>
          )}
          {output.stderr && (
            <pre className="text-red-400 whitespace-pre-wrap">{output.stderr}</pre>
          )}
          {!output.stdout && !output.stderr && (
            <span className="text-muted-foreground">No output</span>
          )}
        </div>
      )}
    </div>
  );
}