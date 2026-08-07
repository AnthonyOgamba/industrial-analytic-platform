export async function timedRequest<T>(name: string, operation: () => Promise<T>): Promise<T> {
  if (process.env.NODE_ENV !== "development") return operation();
  const started = performance.now();
  const startTime = new Date().toISOString();
  let status = "success";
  let aborted = false;
  try {
    return await operation();
  } catch (cause) {
    aborted = cause instanceof DOMException && cause.name === "AbortError";
    status = aborted ? "aborted" : "failed";
    throw cause;
  } finally {
    const endTime = new Date().toISOString();
    console.info("[request-timing]", { name, startTime, endTime, durationMs: Math.round(performance.now() - started), status, aborted });
  }
}
