import { z } from "zod";

export const DocsSearchSchema = z.object({
  libraryName: z.string().min(1, "Library name is required").max(128),
  query: z.string().min(1, "Search query is required").max(256),
});

export const DocsGetSchema = z.object({
  libraryId: z.string().min(1, "Library ID is required"),
  query: z.string().min(1, "Documentation query is required").max(256),
});

export const ExamplesGetSchema = z.object({
  libraryId: z.string().min(1, "Library ID is required"),
  query: z.string().min(1, "Example query is required").max(256),
});

export const ApiLookupSchema = z.object({
  libraryId: z.string().min(1, "Library ID is required"),
  symbol: z.string().min(1, "Symbol name is required").max(128),
});

export type DocsSearchInput = z.infer<typeof DocsSearchSchema>;
export type DocsGetInput = z.infer<typeof DocsGetSchema>;
export type ExamplesGetInput = z.infer<typeof ExamplesGetSchema>;
export type ApiLookupInput = z.infer<typeof ApiLookupSchema>;
