const config = {
  baseUrl: process.env.SPOTR_BASE_URL,
  apiKey: process.env.SPOTR_API_KEY,
};

if (!config.baseUrl || !config.apiKey) {
  throw new Error("SPOTR_BASE_URL and SPOTR_API_KEY must be set");
}

function getAuthHeaders() {
  return {
    "X-Spotr-Api-Key": `${config.apiKey}`,
  };
}

export function buildUrl(path: string, qs: Record<string, any> = {}): string {
  const url = new URL(path, config.baseUrl);
  for (const [k, v] of Object.entries(qs)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export async function fetchJSON<T = any>(
  path: string,
  qs: Record<string, any> = {}
): Promise<T> {
  const url = buildUrl(path, qs);
  const resp = await fetch(url, { headers: getAuthHeaders() });
  if (!resp.ok) {
    throw new Error(`Fetch error [${resp.status}] ${resp.statusText}`);
  }
  return (await resp.json()) as T;
}

export async function postJSON(path: string, body: unknown) {
  const url = buildUrl(path);
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    throw new Error(`Fetch error [${resp.status}] ${resp.statusText}`);
  }
  return await resp.json();
}
