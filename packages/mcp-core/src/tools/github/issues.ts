import { wrapTool } from "../../core/handler";
import { getGitHubClient, handleGitHubError } from "./client";
import { IssuesListSchema, IssueGetSchema } from "../../schemas/github";
import type { IssuesListInput, IssueGetInput } from "../../schemas/github";

export const issuesListTool = wrapTool(
  "github.issues_list",
  "List issues from a GitHub repository. Supports filtering by state and labels.",
  IssuesListSchema,
  async (input: IssuesListInput) => {
    const octokit = getGitHubClient();

    try {
      const { data } = await octokit.issues.listForRepo({
        owner: input.owner,
        repo: input.repo,
        state: input.state,
        labels: input.labels?.join(","),
        per_page: input.perPage,
        page: input.page,
      });

      const issues = data.map((i) => ({
        number: i.number,
        title: i.title,
        state: i.state,
        author: i.user?.login ?? "unknown",
        labels: i.labels.map((l) => (typeof l === "string" ? l : l.name)),
        createdAt: i.created_at,
        updatedAt: i.updated_at,
        comments: i.comments,
        url: i.html_url,
        body: i.body?.slice(0, 2000) ?? null,
      }));

      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ count: issues.length, issues }, null, 2) },
        ],
      };
    } catch (err) {
      return handleGitHubError(err, "github.issues_list");
    }
  }
);

export const issueGetTool = wrapTool(
  "github.issue_get",
  "Get a single issue from a GitHub repository by number.",
  IssueGetSchema,
  async (input: IssueGetInput) => {
    const octokit = getGitHubClient();

    try {
      const { data } = await octokit.issues.get({
        owner: input.owner,
        repo: input.repo,
        issue_number: input.issueNumber,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                number: data.number,
                title: data.title,
                state: data.state,
                author: data.user?.login ?? "unknown",
                labels: data.labels.map((l) => (typeof l === "string" ? l : l.name)),
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                comments: data.comments,
                body: data.body,
                url: data.html_url,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return handleGitHubError(err, "github.issue_get");
    }
  }
);
