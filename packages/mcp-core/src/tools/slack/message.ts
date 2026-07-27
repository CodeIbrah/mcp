/**
 * @module tools/slack/message — Send messages to Slack via Incoming Webhook.
 */

import { z } from "zod";
import { wrapTool } from "../../core/handler";
import { getEnv } from "../../config/env";
import { IntegrationError } from "../../utils/errors";

// ── Schema ─────────────────────────────────────────

const SendSlackMessageSchema = z.object({
  channel: z.string().optional().describe("Slack channel (e.g. #general). Overrides webhook default."),
  text: z.string().min(1, "Message text is required").describe("Message text (supports Markdown-like formatting)"),
});

export type SendSlackMessageInput = z.infer<typeof SendSlackMessageSchema>;

// ── Tool ──────────────────────────────────────────

export const sendSlackMessageTool = wrapTool(
  "slack.send_message",
  "Send a message to a Slack channel via an Incoming Webhook URL. Requires SLACK_WEBHOOK_URL to be configured.",
  SendSlackMessageSchema,
  async (input: SendSlackMessageInput) => {
    const env = getEnv();
    if (!env.SLACK_WEBHOOK_URL) {
      throw new IntegrationError("Slack not configured — set SLACK_WEBHOOK_URL");
    }

    const payload: Record<string, unknown> = { text: input.text };
    if (input.channel) {
      payload.channel = input.channel;
    }

    try {
      const response = await fetch(env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "no body");
        throw new IntegrationError(`Slack webhook returned ${response.status}: ${body}`);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                channel: input.channel ?? "webhook default",
                text: input.text,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      if (err instanceof IntegrationError) throw err;
      throw new IntegrationError(
        `Failed to send Slack message: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
);
