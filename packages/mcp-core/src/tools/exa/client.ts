import { getEnv } from "../../config/env";
import { IntegrationError, AuthenticationError } from "../../utils/errors";

const EXA_API = "https://api.exa.ai";

interface ExaSearchResult {
  title?: string;
  url: string;
  text?: string;
  score?: number;
  publishedDate?: string;
  author?: string;
}

interface ExaResponse {
  results: ExaSearchResult[];
}

export async function exaSearch(
  query: string,
  options: {
    numResults?: number;
    type?: "search" | "keyword" | "neural";
    includeText?: boolean;
  } = {}
): Promise<ExaSearchResult[]> {
  const apiKey = getEnv().EXA_API_KEY;
  if (!apiKey) {
    throw new AuthenticationError("EXA_API_KEY is not configured", "exa");
  }

  try {
    const response = await fetch(`${EXA_API}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        query,
        numResults: options.numResults ?? 8,
        type: options.type ?? "neural",
        contents: options.includeText ? { text: true } : undefined,
      }),
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError("Invalid Exa API key", "exa");
    }

    if (response.status === 429) {
      throw new IntegrationError("Exa rate limit exceeded", "exa");
    }

    if (!response.ok) {
      throw new IntegrationError(
        `Exa API error: ${response.status} ${response.statusText}`,
        "exa"
      );
    }

    const data = (await response.json()) as ExaResponse;
    return data.results ?? [];
  } catch (err) {
    if (err instanceof IntegrationError || err instanceof AuthenticationError) throw err;
    throw new IntegrationError(
      `Failed to connect to Exa: ${(err as Error).message}`,
      "exa",
      err
    );
  }
}

export async function exaFetch(url: string): Promise<string> {
  const apiKey = getEnv().EXA_API_KEY;
  if (!apiKey) {
    throw new AuthenticationError("EXA_API_KEY is not configured", "exa");
  }

  try {
    const response = await fetch(`${EXA_API}/contents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        urls: [url],
        text: true,
      }),
    });

    if (!response.ok) {
      throw new IntegrationError(
        `Exa fetch error: ${response.status} ${response.statusText}`,
        "exa"
      );
    }

    const data = (await response.json()) as { results?: Array<{ text?: string }> };
    return data.results?.[0]?.text ?? "No content fetched";
  } catch (err) {
    if (err instanceof IntegrationError || err instanceof AuthenticationError) throw err;
    throw new IntegrationError(
      `Failed to fetch URL via Exa: ${(err as Error).message}`,
      "exa",
      err
    );
  }
}
