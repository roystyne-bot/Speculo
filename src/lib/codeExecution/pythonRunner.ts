
import type { ExecutionResult } from "./jsRunner";

const PYODIDE_VERSION = "0.26.1";
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodideInstance: any = null;
let pyodideLoading: Promise<any> | null = null;

export type PyodideStatus = "idle" | "loading" | "ready" | "error";

type StatusListener = (status: PyodideStatus, elapsedMs: number) => void;
const listeners = new Set<StatusListener>();
let currentStatus: PyodideStatus = "idle";
let loadStartTime = 0;
let progressInterval: ReturnType<typeof setInterval> | null = null;

function setStatus(status: PyodideStatus) {
  currentStatus = status;
  const elapsed = loadStartTime ? Date.now() - loadStartTime : 0;
  listeners.forEach((l) => l(status, elapsed));
}

export function subscribePyodideStatus(listener: StatusListener): () => void {
  listeners.add(listener);
  listener(currentStatus, loadStartTime ? Date.now() - loadStartTime : 0);
  return () => listeners.delete(listener);
}

async function loadPyodideOnce() {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoading) return pyodideLoading;

  loadStartTime = Date.now();
  setStatus("loading");

  // Tick every 500ms purely so the UI can show elapsed seconds while loading
  progressInterval = setInterval(() => setStatus("loading"), 500);

  pyodideLoading = (async () => {
    try {
      if (!(window as any).loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `${PYODIDE_BASE_URL}pyodide.js`;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Pyodide script"));
          document.head.appendChild(script);
        });
      }

      // Explicit indexURL fixes "K.default.parse is not a function" —
      // without it, loadPyodide sometimes can't resolve its own asset path
      // correctly inside bundled/Next.js apps, and loads mismatched files.
      pyodideInstance = await (window as any).loadPyodide({
        indexURL: PYODIDE_BASE_URL,
      });

      if (progressInterval) clearInterval(progressInterval);
      setStatus("ready");
      return pyodideInstance;
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      setStatus("error");
      pyodideLoading = null; // allow retry
      throw err;
    }
  })();

  return pyodideLoading;
}

export function preloadPython() {
  loadPyodideOnce().catch(() => {});
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