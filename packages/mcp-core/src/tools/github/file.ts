import { wrapTool } from "../../core/handler";
import { getGitHubClient, handleGitHubError } from "./client";
import { FileReadSchema } from "../../schemas/github";
import type { FileReadInput } from "../../schemas/github";

export const fileReadTool = wrapTool(
  "github.file_read",
  "Read a file from a GitHub repository. Returns the decoded content and metadata.",
  FileReadSchema,
  async (input: FileReadInput) => {
    const octokit = getGitHubClient();

    try {
      const { data } = await octokit.repos.getContent({
        owner: input.owner,
        repo: input.repo,
        path: input.path,
        ...(input.ref ? { ref: input.ref } : {}),
      });

      if (Array.isArray(data)) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  type: "directory",
                  path: input.path,
                  entries: data.map((e) => ({
                    name: e.name,
                    path: e.path,
                    type: e.type,
                    size: "size" in e ? e.size : undefined,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      if (data.type !== "file") {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  type: data.type,
                  path: data.path,
                  name: data.name,
                  size: data.size,
                  sha: data.sha,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const content = data.content
        ? Buffer.from(data.content, "base64").toString("utf-8")
        : null;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                type: "file",
                path: data.path,
                name: data.name,
                size: data.size,
                sha: data.sha,
                encoding: data.encoding,
                content,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return handleGitHubError(err, "github.file_read");
    }
  }
);
