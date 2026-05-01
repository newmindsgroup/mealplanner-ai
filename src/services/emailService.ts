import type { SMTPSettings, EmailNotification } from '../types/notifications';
import { decryptPassword, validateEmail } from '../utils/emailEncryption';

/**
 * Email Service
 * 
 * Note: Direct SMTP from browser is not possible due to security restrictions.
 * This service prepares email data and validates settings.
 * 
 * For production deployment, you'll need a backend service that:
 * 1. Receives email data from this service
 * 2. Connects to SMTP server
 * 3. Sends emails securely
 * 
 * Recommended solutions:
 * - SendGrid API
 * - Mailgun API
 * - AWS SES
 * - Custom Node.js backend with nodemailer
 */

export class EmailService {
  private smtpSettings: SMTPSettings;
  
  constructor(smtpSettings: SMTPSettings) {
    this.smtpSettings = smtpSettings;
  }

  /**
   * Validate SMTP settings
   */
  validateSettings(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.smtpSettings.enabled) {
      errors.push('Email notifications are disabled');
    }

    if (!this.smtpSettings.host) {
      errors.push('SMTP host is required');
    }

    if (!this.smtpSettings.port || this.smtpSettings.port < 1 || this.smtpSettings.port > 65535) {
      errors.push('Valid SMTP port is required (1-65535)');
    }

    if (!this.smtpSettings.username) {
      errors.push('SMTP username is required');
    }

    if (!this.smtpSettings.password) {
      errors.push('SMTP password is required');
    }

    if (!this.smtpSettings.fromEmail) {
      errors.push('From email is required');
    } else if (!validateEmail(this.smtpSettings.fromEmail)) {
      errors.push('Invalid from email address');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Prepare email notification
   * This creates the email object but doesn't send it
   */
  prepareEmail(
    to: string,
    subject: string,
    body: string,
    htmlBody?: string,
    scheduledFor?: Date
  ): EmailNotification {
    if (!validateEmail(to)) {
      throw new Error(`Invalid recipient email address: ${to}`);
    }

    return {
      id: crypto.randomUUID(),
      type: 'custom',
      to,
      subject,
      body,
      htmlBody,
      scheduledFor: scheduledFor?.toISOString(),
      status: 'pending',
    };
  }

  /**
   * Queue email for sending
   * In a real implementation, this would send to a backend API
   */
  async queueEmail(notification: EmailNotification): Promise<{ success: boolean; message: string }> {
    const validation = this.validateSettings();
    
    if (!validation.valid) {
      return {
        success: false,
        message: `Invalid SMTP settings: ${validation.errors.join(', ')}`,
      };
    }

    // In production, this would call your backend API:
    // const response = await fetch('/api/email/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     smtp: this.getSMTPConfig(),
    //     notification,
    //   }),
    // });

    console.log('📧 Email queued for sending:', {
      to: notification.to,
      subject: notification.subject,
      smtp: this.smtpSettings.host,
    });

    return {
      success: true,
      message: 'Email queued successfully (backend integration required for actual sending)',
    };
  }

  /**
   * Get SMTP configuration with decrypted password
   * Use this to send to backend (never expose decrypted password in frontend logs)
   */
  private getSMTPConfig() {
    return {
      host: this.smtpSettings.host,
      port: this.smtpSettings.port,
      secure: this.smtpSettings.secure,
      auth: {
        user: this.smtpSettings.username,
        pass: decryptPassword(this.smtpSettings.password),
      },
      from: {
        name: this.smtpSettings.fromName,
        address: this.smtpSettings.fromEmail,
      },
    };
  }

  /**
   * Test SMTP connection
   * In production, this would call backend to test connection
   */
  async testConnection(testEmail: string): Promise<{ success: boolean; message: string }> {
    const validation = this.validateSettings();
    
    if (!validation.valid) {
      return {
        success: false,
        message: validation.errors.join('\n'),
      };
    }

    if (!validateEmail(testEmail)) {
      return {
        success: false,
        message: 'Invalid test email address',
      };
    }

    // Simulate async test
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production, call backend:
    // const response = await fetch('/api/email/test', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     smtp: this.getSMTPConfig(),
    //     testEmail,
    //   }),
    // });

    console.log('✅ SMTP settings validated:', {
      host: this.smtpSettings.host,
      port: this.smtpSettings.port,
      secure: this.smtpSettings.secure,
      from: this.smtpSettings.fromEmail,
    });

    return {
      success: true,
      message: 'SMTP settings validated successfully. Backend integration required for actual email sending.',
    };
  }

  /**
   * Send bulk emails (batch processing)
   */
  async sendBulkEmails(notifications: EmailNotification[]): Promise<{
    success: number;
    failed: number;
    results: { id: string; success: boolean; message: string }[];
  }> {
    const results: { id: string; success: boolean; message: string }[] = [];
    let success = 0;
    let failed = 0;

    for (const notification of notifications) {
      try {
        const result = await this.queueEmail(notification);
        results.push({
          id: notification.id,
          success: result.success,
          message: result.message,
        });
        
        if (result.success) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        results.push({
          id: notification.id,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        failed++;
      }
    }

    return { success, failed, results };
  }

  /**
   * Retry failed email
   */
  async retryEmail(notification: EmailNotification): Promise<{ success: boolean; message: string }> {
    return this.queueEmail({ ...notification, status: 'pending' });
  }
}

/**
 * Create email service instance
 */
export function createEmailService(smtpSettings: SMTPSettings): EmailService {
  return new EmailService(smtpSettings);
}

/**
 * Backend API endpoint examples for reference
 * 
 * 1. Send Email Endpoint:
 *    POST /api/email/send
 *    Body: { smtp: SMTPConfig, notification: EmailNotification }
 * 
 * 2. Test Connection Endpoint:
 *    POST /api/email/test
 *    Body: { smtp: SMTPConfig, testEmail: string }
 * 
 * 3. Get Email Status:
 *    GET /api/email/status/:id
 * 
 * 4. Webhook for email events:
 *    POST /api/email/webhook
 *    For delivery status, bounces, opens, clicks
 */

