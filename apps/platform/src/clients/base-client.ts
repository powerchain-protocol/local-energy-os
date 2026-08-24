export interface ClientOptions { baseUrl: string; apiKey?: string; timeoutMs?: number; }
export class ApiClient {
  constructor(private readonly options: ClientOptions) {}
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController(); const timeout = setTimeout(()=>controller.abort(), this.options.timeoutMs ?? 10000);
    try {
      const response = await fetch(new URL(path, this.options.baseUrl), { ...init, signal: controller.signal, headers: { accept: "application/json", ...(this.options.apiKey ? { authorization: `Bearer ${this.options.apiKey}` } : {}), ...init.headers } });
      if (!response.ok) throw new Error(`Upstream request failed (${response.status})`);
      return await response.json() as T;
    } finally { clearTimeout(timeout); }
  }
}
