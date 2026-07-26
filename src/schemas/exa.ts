import { z } from "zod";

export const WebSearchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(512),
  numResults: z.number().int().min(1).max(25).default(8),
});

export const WebFetchSchema = z.object({
  url: z.string().url("A valid URL is required"),
  format: z.enum(["markdown", "text", "html"]).default("markdown"),
});

export const CodeSearchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(256),
  language: z.string().optional(),
  numResults: z.number().int().min(1).max(25).default(8),
});

export const ResearchBriefSchema = z.object({
  topic: z.string().min(1, "Research topic is required").max(256),
  depth: z.enum(["quick", "standard", "deep"]).default("standard"),
  maxSources: z.number().int().min(1).max(20).default(5),
});

export type WebSearchInput = z.infer<typeof WebSearchSchema>;
export type WebFetchInput = z.infer<typeof WebFetchSchema>;
export type CodeSearchInput = z.infer<typeof CodeSearchSchema>;
export type ResearchBriefInput = z.infer<typeof ResearchBriefSchema>;
