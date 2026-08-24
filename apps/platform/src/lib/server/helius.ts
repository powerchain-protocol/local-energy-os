export async function heliusRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.HELIUS_API_KEY;
  if (!key) throw new Error("HELIUS_API_KEY is not configured");
  const response = await fetch(`https://api.helius.xyz/v0/${path}${path.includes("?") ? "&" : "?"}api-key=${key}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error(`Helius request failed: ${response.status}`);
  return response.json() as Promise<T>;
}
