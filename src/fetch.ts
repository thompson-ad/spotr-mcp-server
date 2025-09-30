export interface FetchConfig {
  baseUrl: string;
  apiKey: string;
}

export function createFetchClient(config: FetchConfig) {
  function getAuthHeaders() {
    return {
      "X-Spotr-Api-Key": `${config.apiKey}`,
    };
  }

  function buildUrl(path: string, qs: Record<string, any> = {}): string {
    const url = new URL(path, config.baseUrl);
    for (const [k, v] of Object.entries(qs)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
    return url.toString();
  }

  async function fetchJSON<T = any>(
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

  async function postJSON<T = any>(
    path: string,
    body: unknown
  ): Promise<T> {
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
    return (await resp.json()) as T;
  }

  async function deleteJSON(path: string) {
    const url = buildUrl(path);
    const resp = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!resp.ok) {
      throw new Error(`Fetch error [${resp.status}] ${resp.statusText}`);
    }
  }

  async function putJSON<T = any>(
    path: string,
    body: unknown
  ): Promise<T> {
    const url = buildUrl(path);
    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      throw new Error(`Fetch error [${resp.status}] ${resp.statusText}`);
    }
    return (await resp.json()) as T;
  }

  return {
    buildUrl,
    fetchJSON,
    postJSON,
    deleteJSON,
    putJSON,
  };
}
