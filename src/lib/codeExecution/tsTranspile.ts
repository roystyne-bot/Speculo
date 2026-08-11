
export async function transpileTypeScript(code: string): Promise<string> {
  const { transform } = await import("sucrase"); // lazy-loaded, only when TS is run
  const result = transform(code, {
    transforms: ["typescript"],
  });
  return result.code;
}