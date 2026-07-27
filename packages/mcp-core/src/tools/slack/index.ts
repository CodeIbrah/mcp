export { sendSlackMessageTool } from "./message";

import type { ToolDefinition } from "../../core/handler";
import { sendSlackMessageTool } from "./message";

export const slackTools: ToolDefinition[] = [sendSlackMessageTool];
