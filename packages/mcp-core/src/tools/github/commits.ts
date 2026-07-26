import { wrapTool } from "../../core/handler";
import { getGitHubClient, handleGitHubError } from "./client";
import { CommitSearchSchema } from "../../schemas/github";
import type { CommitSearchInput } from "../../schemas/github";

export const commitSearchTool = wrapTool(
  "github.commit_search",
  "Search commits in a GitHub repository by message or author.",
  CommitSearchSchema,
  async (input: CommitSearchInput) => {
    const octokit = getGitHubClient();

    try {
      const { data } = await octokit.search.commits({
        q: `repo:${input.owner}/${input.repo} ${input.query}`,
        per_page: input.perPage,
      });

      const commits = data.items.map((c) => ({
        sha: c.sha,
        message: c.commit.message.split("\n")[0],
        author: c.commit.author?.name ?? "unknown",
        date: c.commit.author?.date ?? null,
        url: c.html_url,
      }));

      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ totalCount: data.total_count, commits }, null, 2) },
        ],
      };
    } catch (err) {
      return handleGitHubError(err, "github.commit_search");
    }
  }
);
