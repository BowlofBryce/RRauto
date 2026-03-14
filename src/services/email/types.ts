export interface EmailProvider {
  sendEmail(input: { to: string; subject: string; html: string; businessId: string }): Promise<void>;
}
