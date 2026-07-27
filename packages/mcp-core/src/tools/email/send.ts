/**
 * @module tools/email/send — Send email via SMTP.
 * Wraps nodemailer with the env-configured SMTP credentials.
 */

import { z } from "zod";
import nodemailer from "nodemailer";
import { wrapTool } from "../../core/handler";
import { getEnv } from "../../config/env";
import { IntegrationError } from "../../utils/errors";

// ── Schema ─────────────────────────────────────────

const SendEmailSchema = z.object({
  to: z.string().email("Recipient email is required").describe("Recipient email address"),
  subject: z.string().min(1, "Subject is required").describe("Email subject line"),
  text: z.string().optional().describe("Plain text body"),
  html: z.string().optional().describe("HTML body (optional, preferred over text)"),
});

export type SendEmailInput = z.infer<typeof SendEmailSchema>;

// ── Client factory ─────────────────────────────────

function createTransport(): nodemailer.Transporter {
  const env = getEnv();
  if (!env.SMTP_HOST) {
    throw new IntegrationError("SMTP not configured — set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS");
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: (env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: env.SMTP_USER ?? "",
      pass: env.SMTP_PASS ?? "",
    },
  });
}

// ── Tool ──────────────────────────────────────────

export const sendEmailTool = wrapTool(
  "email.send",
  "Send an email via SMTP. Requires SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to be configured.",
  SendEmailSchema,
  async (input: SendEmailInput) => {
    const env = getEnv();
    const transporter = createTransport();

    try {
      const info = await transporter.sendMail({
        from: env.SMTP_FROM || env.SMTP_USER || "noreply@dev-mcp.local",
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      throw new IntegrationError(
        `Failed to send email: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      transporter.close();
    }
  }
);
