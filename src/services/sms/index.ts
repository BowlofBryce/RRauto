import { TwilioAdapter } from "./twilio-adapter.js";
import { SMSProvider } from "./types.js";

let provider: SMSProvider = new TwilioAdapter();

export function configureSMSProvider(nextProvider: SMSProvider): void {
  provider = nextProvider;
}

export function sendSMS(input: { to: string; message: string; businessId: string }): Promise<void> {
  return provider.sendSMS(input);
}
