export { docsSearchTool } from "./search";
export { docsGetTool } from "./docs";
export { examplesGetTool } from "./examples";
export { apiLookupTool } from "./api";

import type { ToolDefinition } from "../../core/handler";
import { docsSearchTool } from "./search";
import { docsGetTool } from "./docs";
import { examplesGetTool } from "./examples";
import { apiLookupTool } from "./api";

export const context7Tools: ToolDefinition[] = [
  docsSearchTool,
  docsGetTool,
  examplesGetTool,
  apiLookupTool,
];
