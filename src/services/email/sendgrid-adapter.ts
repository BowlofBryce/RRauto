import { EmailProvider } from "./types.js";

export class SendGridAdapter implements EmailProvider {
  async sendEmail(input: { to: string; subject: string; html: string; businessId: string }): Promise<void> {
    // Placeholder: wire SendGrid API key per business.
    console.log("[SendGridAdapter] sending email", input);
  }
}
