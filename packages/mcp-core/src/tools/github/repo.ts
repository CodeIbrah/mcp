import { wrapTool } from "../../core/handler";
import { getGitHubClient, handleGitHubError } from "./client";
import { RepoSearchSchema, RepoReadSchema } from "../../schemas/github";
import type { RepoSearchInput, RepoReadInput } from "../../schemas/github";

export const repoSearchTool = wrapTool(
  "github.repo_search",
  "Search GitHub repositories by query. Returns matching repos with key metadata.",
  RepoSearchSchema,
  async (input: RepoSearchInput) => {
    const octokit = getGitHubClient();

    try {
      const { data } = await octokit.search.repos({
        q: input.query,
        per_page: input.perPage,
        page: input.page,
      });

      const repos = data.items.map((r) => ({
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        topics: r.topics,
        updatedAt: r.updated_at,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ totalCount: data.total_count, repos }, null, 2),
          },
        ],
      };
    } catch (err) {
      return handleGitHubError(err, "github.repo_search");
    }
  }
);

export const repoReadTool = wrapTool(
  "github.repo_read",
  "Get detailed information about a specific GitHub repository.",
  RepoReadSchema,
  async (input: RepoReadInput) => {
    const octokit = getGitHubClient();

    try {
      const { data } = await octokit.repos.get({ owner: input.owner, repo: input.repo });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                fullName: data.full_name,
                description: data.description,
                url: data.html_url,
                defaultBranch: data.default_branch,
                stars: data.stargazers_count,
                forks: data.forks_count,
                openIssues: data.open_issues_count,
                language: data.language,
                topics: data.topics,
                license: data.license?.spdx_id ?? null,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return handleGitHubError(err, "github.repo_read");
    }
  }
);
