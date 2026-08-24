export function env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
