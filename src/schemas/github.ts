import { z } from "zod";

export const RepoSearchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(256),
  perPage: z.number().int().min(1).max(100).default(10),
  page: z.number().int().min(1).default(1),
});

export const RepoReadSchema = z.object({
  owner: z.string().min(1, "Repository owner is required"),
  repo: z.string().min(1, "Repository name is required"),
});

export const FileReadSchema = z.object({
  owner: z.string().min(1, "Repository owner is required"),
  repo: z.string().min(1, "Repository name is required"),
  path: z.string().min(1, "File path is required"),
  ref: z.string().optional(),
});

export const IssuesListSchema = z.object({
  owner: z.string().min(1, "Repository owner is required"),
  repo: z.string().min(1, "Repository name is required"),
  state: z.enum(["open", "closed", "all"]).default("open"),
  labels: z.array(z.string()).optional(),
  perPage: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(1).default(1),
});

export const PrsListSchema = z.object({
  owner: z.string().min(1, "Repository owner is required"),
  repo: z.string().min(1, "Repository name is required"),
  state: z.enum(["open", "closed", "all"]).default("open"),
  perPage: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(1).default(1),
});

export const PrDiffSchema = z.object({
  owner: z.string().min(1, "Repository owner is required"),
  repo: z.string().min(1, "Repository name is required"),
  pullNumber: z.number().int().positive("Pull request number must be positive"),
});

export const IssueGetSchema = z.object({
  owner: z.string().min(1, "Repository owner is required"),
  repo: z.string().min(1, "Repository name is required"),
  issueNumber: z.number().int().positive("Issue number must be positive"),
});

export const CommitSearchSchema = z.object({
  owner: z.string().min(1, "Repository owner is required"),
  repo: z.string().min(1, "Repository name is required"),
  query: z.string().min(1, "Search query is required").max(256),
  perPage: z.number().int().min(1).max(100).default(10),
});

export type RepoSearchInput = z.infer<typeof RepoSearchSchema>;
export type RepoReadInput = z.infer<typeof RepoReadSchema>;
export type FileReadInput = z.infer<typeof FileReadSchema>;
export type IssuesListInput = z.infer<typeof IssuesListSchema>;
export type PrsListInput = z.infer<typeof PrsListSchema>;
export type PrDiffInput = z.infer<typeof PrDiffSchema>;
export type IssueGetInput = z.infer<typeof IssueGetSchema>;
export type CommitSearchInput = z.infer<typeof CommitSearchSchema>;
