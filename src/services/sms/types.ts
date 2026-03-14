export interface SMSProvider {
  sendSMS(input: { to: string; message: string; businessId: string }): Promise<void>;
}
