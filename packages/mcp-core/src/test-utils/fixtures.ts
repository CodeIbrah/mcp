/**
 * @module test-utils/fixtures — Reusable fixture data for all tool tests.
 *
 * These fixtures mirror the shape of what external APIs return,
 * so tests can focus on the tool's transformation logic rather
 * than mocking network calls.
 */
/* ── GitHub fixtures ──────────────────────────────────── */

export const mockRepoSearchResult = {
  total_count: 42,
  incomplete_results: false,
  items: [
    {
      id: 1,
      full_name: "vercel/turbo",
      description: "Turborepo — monorepo build system",
      html_url: "https://github.com/vercel/turbo",
      stargazers_count: 30_000,
      language: "Rust",
      topics: ["monorepo", "build", "rust"],
      updated_at: "2025-01-01T00:00:00Z",
      name: "turbo",
      node_id: "MDEwOlJlcG9zaXRvcnkx",
      private: false,
      owner: { login: "vercel", id: 1, node_id: "a", avatar_url: "", url: "" },
    },
  ],
} as Record<string, unknown>;

export const mockRepoReadResult = {
  id: 1,
  full_name: "vercel/turbo",
  description: "Turborepo — monorepo build system",
  html_url: "https://github.com/vercel/turbo",
  stargazers_count: 30_000,
  forks_count: 500,
  open_issues_count: 42,
  language: "Rust",
  topics: ["monorepo"],
  default_branch: "main",
  license: { spdx_id: "MIT", key: "mit", name: "MIT License", url: "", node_id: "a" },
  created_at: "2020-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  name: "turbo",
  node_id: "a",
  private: false,
  owner: { login: "vercel", id: 1, node_id: "a", avatar_url: "", url: "" },
  size: 100,
  watchers_count: 100,
  has_issues: true,
  has_projects: true,
  has_downloads: true,
  has_wiki: true,
  has_pages: false,
  has_discussions: true,
  forks: 500,
  archived: false,
  disabled: false,
  visibility: "public",
  pushed_at: "2025-01-01T00:00:00Z",
  subscribers_count: 100,
  temp_clone_token: null,
  allow_squash_merge: true,
  allow_merge_commit: true,
  allow_rebase_merge: true,
  allow_auto_merge: true,
  network_count: 500,
} as Record<string, unknown>;

export const mockFileResult = {
  type: "file" as const,
  name: "README.md",
  path: "README.md",
  content: Buffer.from("# Turbo\n\nBuild system").toString("base64"),
  encoding: "base64",
  size: 64,
  sha: "abc123",
  url: "",
  git_url: "",
  html_url: "",
  download_url: "",
  _links: { git: "", html: "", self: "" },
};

export const mockIssueResult = {
  number: 42,
  title: "Bug: something broke",
  state: "open" as const,
  body: "Description of the bug",
  html_url: "https://github.com/vercel/turbo/issues/42",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-02T00:00:00Z",
  labels: [{ name: "bug", color: "red", default: true, description: "", id: 1, node_id: "a", url: "" }],
  user: { login: "user1", id: 1, node_id: "a", avatar_url: "", url: "", type: "User" },
  assignees: [],
  comments: 3,
  pull_request: undefined,
  locked: false,
  active_lock_reason: null,
  author_association: "CONTRIBUTOR",
  closed_at: null,
  milestone: null,
  draft: false,
  state_reason: null,
  reactions: { "+1": 0, "-1": 0, laugh: 0, hooray: 0, confused: 0, heart: 0, rocket: 0, eyes: 0, url: "" },
  node_id: "a",
  repository_url: "",
  labels_url: "",
  comments_url: "",
  events_url: "",
  timeline_url: "",
};

export const mockCommitResult = {
  sha: "abc123",
  commit: {
    message: "Fix: resolve timeout issue",
    author: { name: "Alice", email: "alice@example.com", date: "2025-01-01T00:00:00Z" },
    committer: { name: "Alice", email: "alice@example.com", date: "2025-01-01T00:00:00Z" },
  },
  author: { login: "alice", id: 1, node_id: "a", avatar_url: "", url: "", type: "User" },
  committer: { login: "alice", id: 1, node_id: "a", avatar_url: "", url: "", type: "User" },
  html_url: "https://github.com/vercel/turbo/commit/abc123",
  stats: { total: 10, additions: 7, deletions: 3 },
  files: [
    {
      sha: "f1",
      filename: "src/main.ts",
      status: "modified",
      additions: 7,
      deletions: 3,
      changes: 10,
      raw_url: "",
      blob_url: "",
      contents_url: "",
      patch: "--- a/src/main.ts\n+++ b/src/main.ts\n...",
    },
  ],
  parents: [{ sha: "parent1", url: "", html_url: "" }],
  node_id: "a",
  url: "",
  comments_url: "",
};

export const mockPullRequestResult = {
  number: 99,
  title: "Feature: add new API",
  state: "open" as const,
  body: "Implements the new API endpoint",
  html_url: "https://github.com/vercel/turbo/pull/99",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-02T00:00:00Z",
  closed_at: null,
  merged_at: null,
  user: { login: "author1", id: 1, node_id: "a", avatar_url: "", url: "", type: "User" },
  head: {
    ref: "feat/new-api",
    sha: "abc123",
    label: "author1:feat/new-api",
    repo: { full_name: "vercel/turbo", name: "turbo", owner: { login: "vercel", id: 1, node_id: "a", avatar_url: "", url: "" }, private: false, html_url: "", description: "", fork: false, url: "", created_at: "", updated_at: "", pushed_at: "", git_url: "", ssh_url: "", clone_url: "", svn_url: "", size: 0, stargazers_count: 0, watchers_count: 0, language: null, has_issues: false, has_projects: false, has_downloads: false, has_wiki: false, has_pages: false, has_discussions: false, forks_count: 0, mirror_url: null, archived: false, disabled: false, open_issues_count: 0, license: null, allow_forking: false, is_template: false, web_commit_signoff_required: false, topics: [], visibility: "public", forks: 0, open_issues: 0, watchers: 0, default_branch: "main" },
  },
  base: {
    ref: "main",
    sha: "def456",
    label: "vercel:main",
    repo: { full_name: "vercel/turbo", name: "turbo", owner: { login: "vercel", id: 1, node_id: "a", avatar_url: "", url: "" }, private: false, html_url: "", description: "", fork: false, url: "", created_at: "", updated_at: "", pushed_at: "", git_url: "", ssh_url: "", clone_url: "", svn_url: "", size: 0, stargazers_count: 0, watchers_count: 0, language: null, has_issues: false, has_projects: false, has_downloads: false, has_wiki: false, has_pages: false, has_discussions: false, forks_count: 0, mirror_url: null, archived: false, disabled: false, open_issues_count: 0, license: null, allow_forking: false, is_template: false, web_commit_signoff_required: false, topics: [], visibility: "public", forks: 0, open_issues: 0, watchers: 0, default_branch: "main" },
  },
  mergeable: true,
  merged: false,
  mergeable_state: "clean",
  draft: false,
  labels: [],
  node_id: "a",
  diff_url: "",
  patch_url: "",
  issue_url: "",
  commits_url: "",
  review_comments_url: "",
  review_comment_url: "",
  comments_url: "",
  statuses_url: "",
  requested_reviewers: [],
  requested_teams: [],
  assignees: [],
  locked: false,
  active_lock_reason: null,
  author_association: "CONTRIBUTOR",
  milestone: null,
  rebaseable: true,
  maintainer_can_modify: false,
  additions: 10,
  deletions: 3,
  changed_files: 2,
};

/* ── Context7 fixtures ────────────────────────────────── */

export const mockResolveLibraryResult = [
  {
    libraryId: "/vercel/next.js",
    name: "Next.js",
    description: "The React framework for production",
    snippetCount: 150,
    reputation: "High" as const,
    benchmarkScore: 95,
  },
];

export const mockQueryDocsResult = {
  content: "Next.js is a React framework for building full-stack web applications.",
  sources: [
    { title: "Next.js Docs", url: "https://nextjs.org/docs" },
  ],
};

/* ── Exa fixtures ─────────────────────────────────────── */

export const mockExaSearchResult = {
  results: [
    {
      title: "Getting Started with React",
      url: "https://react.dev/learn",
      text: "React is a JavaScript library for building user interfaces...",
      score: 0.95,
      publishedDate: "2025-01-01",
    },
  ],
  requestId: "req_abc",
  autopromptString: null,
  resolvedSearchType: "keyword",
};

export const mockExaFetchResult = {
  title: "React Docs",
  url: "https://react.dev/learn",
  text: "React is a JavaScript library for building user interfaces...",
  textLength: 72,
  publishedDate: "2025-01-01",
};

export const mockExaCodeResult = {
  results: [
    {
      title: "useState example",
      url: "https://github.com/facebook/react/blob/main/packages/react/src/useState.js",
      text: "function useState(initialState) { ... }",
      score: 0.85,
      extra: { github: { stars: 200_000 } },
    },
  ],
  requestId: "req_def",
  autopromptString: null,
  resolvedSearchType: "keyword",
};
