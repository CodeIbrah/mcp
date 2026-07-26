import { wrapTool } from "../../core/handler";
import { getGitHubClient, handleGitHubError } from "./client";
import { PrsListSchema, PrDiffSchema } from "../../schemas/github";
import type { PrsListInput, PrDiffInput } from "../../schemas/github";

export const prsListTool = wrapTool(
  "github.prs_list",
  "List pull requests from a GitHub repository. Supports filtering by state.",
  PrsListSchema,
  async (input: PrsListInput) => {
    const octokit = getGitHubClient();

    try {
      const { data } = await octokit.pulls.list({
        owner: input.owner,
        repo: input.repo,
        state: input.state,
        per_page: input.perPage,
        page: input.page,
      });

      const prs = data.map((pr) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        author: pr.user?.login ?? "unknown",
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        draft: pr.draft ?? false,
        url: pr.html_url,
        body: pr.body?.slice(0, 2000) ?? null,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ count: prs.length, pullRequests: prs }, null, 2),
          },
        ],
      };
    } catch (err) {
      return handleGitHubError(err, "github.prs_list");
    }
  }
);

export const prDiffTool = wrapTool(
  "github.pr_diff",
  "Get the diff of a specific pull request.",
  PrDiffSchema,
  async (input: PrDiffInput) => {
    const octokit = getGitHubClient();

    try {
      const { data } = await octokit.pulls.get({
        owner: input.owner,
        repo: input.repo,
        pull_number: input.pullNumber,
        mediaType: { format: "diff" },
      });

      const diff = typeof data === "string" ? data : JSON.stringify(data, null, 2);

      return {
        content: [
          {
            type: "text" as const,
            text: diff.length > 50000
              ? diff.slice(0, 50000) + "\n\n... [diff truncated at 50000 chars]"
              : diff,
          },
        ],
      };
    } catch (err) {
      return handleGitHubError(err, "github.pr_diff");
    }
  }
);
