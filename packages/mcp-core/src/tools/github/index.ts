export { repoSearchTool, repoReadTool } from "./repo";
export { fileReadTool } from "./file";
export { issuesListTool, issueGetTool } from "./issues";
export { prsListTool, prDiffTool } from "./prs";
export { commitSearchTool } from "./commits";

import type { ToolDefinition } from "../../core/handler";
import { repoSearchTool, repoReadTool } from "./repo";
import { fileReadTool } from "./file";
import { issuesListTool, issueGetTool } from "./issues";
import { prsListTool, prDiffTool } from "./prs";
import { commitSearchTool } from "./commits";

export const githubTools: ToolDefinition[] = [
  repoSearchTool,
  repoReadTool,
  fileReadTool,
  issuesListTool,
  issueGetTool,
  prsListTool,
  prDiffTool,
  commitSearchTool,
];
