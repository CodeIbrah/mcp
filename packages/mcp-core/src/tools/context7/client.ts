import { getEnv } from "../../config/env";
import { IntegrationError, AuthenticationError } from "../../utils/errors";

const CONTEXT7_API = "https://context7.com/api/v1";

interface Context7Result {
  libraryId: string;
  name: string;
  description: string;
  snippetCount: number;
  reputation?: string;
  benchmarkScore?: number;
}


export async function resolveLibrary(libraryName: string): Promise<Context7Result[]> {
  const apiKey = getEnv().CONTEXT7_API_KEY;

  try {
    const response = await fetch(`${CONTEXT7_API}/search/libraries?name=${encodeURIComponent(libraryName)}`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });

    if (response.status === 401) {
      throw new AuthenticationError("Invalid Context7 API key", "context7");
    }

    if (!response.ok) {
      throw new IntegrationError(
        `Context7 API error: ${response.status} ${response.statusText}`,
        "context7"
      );
    }

    return response.json() as Promise<Context7Result[]>;
  } catch (err) {
    if (err instanceof IntegrationError || err instanceof AuthenticationError) throw err;
    throw new IntegrationError(
      `Failed to connect to Context7: ${(err as Error).message}`,
      "context7",
      err
    );
  }
}

export async function queryDocs(libraryId: string, query: string): Promise<string> {
  const apiKey = getEnv().CONTEXT7_API_KEY;

  try {
    const response = await fetch(`${CONTEXT7_API}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ libraryId, query }),
    });

    if (response.status === 401) {
      throw new AuthenticationError("Invalid Context7 API key", "context7");
    }

    if (!response.ok) {
      throw new IntegrationError(
        `Context7 query error: ${response.status} ${response.statusText}`,
        "context7"
      );
    }

    const data = (await response.json()) as { result?: string; content?: string };
    return data.result ?? data.content ?? "No results found";
  } catch (err) {
    if (err instanceof IntegrationError || err instanceof AuthenticationError) throw err;
    throw new IntegrationError(
      `Failed to query Context7: ${(err as Error).message}`,
      "context7",
      err
    );
  }
}
