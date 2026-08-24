export interface FetchJsonOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 6_000);
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json", ...options.headers },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}:${url}`);
    return await response.json() as T;
  } finally {
    clearTimeout(timer);
  }
}
