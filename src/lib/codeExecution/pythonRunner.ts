
import type { ExecutionResult } from "./jsRunner";

let pyodideInstance: any = null;
let pyodideLoading: Promise<any> | null = null;

export type PyodideStatus = "idle" | "loading" | "ready" | "error";

// Simple subscribable status so the UI can react without prop drilling
type StatusListener = (status: PyodideStatus) => void;
const listeners = new Set<StatusListener>();
let currentStatus: PyodideStatus = "idle";

function setStatus(status: PyodideStatus) {
  currentStatus = status;
  listeners.forEach((l) => l(status));
}

export function subscribePyodideStatus(listener: StatusListener): () => void {
  listeners.add(listener);
  listener(currentStatus); // immediately push current state
  return () => listeners.delete(listener);
}

export function getPyodideStatus(): PyodideStatus {
  return currentStatus;
}

async function loadPyodideOnce() {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoading) return pyodideLoading;

  setStatus("loading");

  pyodideLoading = (async () => {
    try {
      if (!(window as any).loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Pyodide"));
          document.head.appendChild(script);
        });
      }
      pyodideInstance = await (window as any).loadPyodide();
      setStatus("ready");
      return pyodideInstance;
    } catch (err) {
      setStatus("error");
      pyodideLoading = null; // allow retry
      throw err;
    }
  })();

  return pyodideLoading;
}

export async function runPython(code: string): Promise<ExecutionResult> {
  const start = performance.now();
  try {
    const pyodide = await loadPyodideOnce();

    pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
    `);

    let error: string | null = null;
    try {
      await pyodide.runPythonAsync(code);
    } catch (err: any) {
      error = err.message;
    }

    const output = pyodide.runPython("sys.stdout.getvalue()");

    return { output, error, executionTimeMs: performance.now() - start };
  } catch (err: any) {
    return {
      output: "",
      error: `Failed to initialize Python runtime: ${err.message}`,
      executionTimeMs: performance.now() - start,
    };
  }
}

// Preload Python quietly as soon as the user selects it, so by the time
// they hit "Run" it's already warm (or at least further along).
export function preloadPython() {
  loadPyodideOnce().catch(() => {
    // swallow — runPython will surface the error properly on actual run
  });
}