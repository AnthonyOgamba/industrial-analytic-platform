type Entry = { count: number; resetAt: number };
const attempts = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}
