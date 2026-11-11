const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

// shortcut: kept in memory, so limits reset on restart and are per process;
// move to the database when the app runs as more than one instance.
const failures = new Map<string, { count: number; resetAt: number }>();

export function isBlocked(key: string): boolean {
  const entry = failures.get(key);
  if (entry && entry.resetAt < Date.now()) failures.delete(key);
  return (failures.get(key)?.count ?? 0) >= MAX_FAILURES;
}

export function recordFailure(key: string): void {
  const entry = failures.get(key);
  if (entry) entry.count++;
  else failures.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
}

export const clearFailures = (key: string) => void failures.delete(key);
