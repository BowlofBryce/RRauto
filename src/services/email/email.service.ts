export interface EmailMessage { to: string; from: string; subject: string; html: string; text?: string }
export interface EmailResult { success: boolean; messageId?: string; error?: string }
export interface EmailAdapter { send(m: EmailMessage): Promise<EmailResult> }

class MockEmailAdapter implements EmailAdapter {
  async send(m: EmailMessage): Promise<EmailResult> {
    console.log('[Email]', m.to, ':', m.subject)
    return { success: true, messageId: `mock_email_${Date.now()}` }
  }
}

let _adapter: EmailAdapter = new MockEmailAdapter()

export function configureEmailAdapter(adapter: EmailAdapter) { _adapter = adapter }
export async function sendEmail(m: EmailMessage): Promise<EmailResult> { return _adapter.send(m) }
