export interface SMSMessage { to: string; from: string; body: string }
export interface SMSResult { success: boolean; messageId?: string; error?: string }
export interface SMSAdapter { send(m: SMSMessage): Promise<SMSResult> }

class MockSMSAdapter implements SMSAdapter {
  async send(m: SMSMessage): Promise<SMSResult> {
    console.log('[SMS]', m.to, ':', m.body)
    return { success: true, messageId: `mock_${Date.now()}` }
  }
}

let _adapter: SMSAdapter = new MockSMSAdapter()

export function configureSMSAdapter(adapter: SMSAdapter) { _adapter = adapter }
export async function sendSMS(m: SMSMessage): Promise<SMSResult> { return _adapter.send(m) }

export async function sendMissedCallTextBack(to: string, from: string, bizName: string): Promise<SMSResult> {
  return sendSMS({ to, from, body: `Hi! Sorry we missed your call from ${bizName}. How can we help? Reply here and we'll get right back to you.` })
}
