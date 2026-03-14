import { SendGridAdapter } from "./sendgrid-adapter.js";
import { EmailProvider } from "./types.js";

let provider: EmailProvider = new SendGridAdapter();

export function configureEmailProvider(nextProvider: EmailProvider): void {
  provider = nextProvider;
}

export function sendEmail(input: { to: string; subject: string; html: string; businessId: string }): Promise<void> {
  return provider.sendEmail(input);
}
