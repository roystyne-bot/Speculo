

export interface ExecutionResult {
  output: string;
  error: string | null;
  executionTimeMs: number;
}

const WORKER_SCRIPT = `
self.onmessage = function (e) {
  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => {
    logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
  };

  try {
    const userFn = new Function(e.data);
    userFn();
    self.postMessage({ output: logs.join('\\n'), error: null });
  } catch (err) {
    self.postMessage({ output: logs.join('\\n'), error: err.message });
  } finally {
    console.log = originalLog;
  }
};
`;

export async function runJavaScript(
  code: string,
  timeoutMs = 5000
): Promise<ExecutionResult> {
  const start = performance.now();
  const blob = new Blob([WORKER_SCRIPT], { type: "application/javascript" });
  const worker = new Worker(URL.createObjectURL(blob));

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      worker.terminate();
      resolve({
        output: "",
        error: "Execution timed out (possible infinite loop)",
        executionTimeMs: performance.now() - start,
      });
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve({
        output: e.data.output,
        error: e.data.error,
        executionTimeMs: performance.now() - start,
      });
    };

    worker.onerror = (err) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve({
        output: "",
        error: err.message,
        executionTimeMs: performance.now() - start,
      });
    };

    worker.postMessage(code);
  });
}