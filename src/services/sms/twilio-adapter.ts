import { SMSProvider } from "./types.js";

export class TwilioAdapter implements SMSProvider {
  async sendSMS(input: { to: string; message: string; businessId: string }): Promise<void> {
    // Placeholder: wire Twilio SDK credentials per business.
    console.log("[TwilioAdapter] sending sms", input);
  }
}
