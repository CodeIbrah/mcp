export { sendEmailTool } from "./send";

import type { ToolDefinition } from "../../core/handler";
import { sendEmailTool } from "./send";

export const emailTools: ToolDefinition[] = [sendEmailTool];
