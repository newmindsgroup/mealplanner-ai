# Email Notifications System - Complete Guide

## 🎉 Overview

The Meal Plan Assistant now includes a comprehensive email notification system with 30+ notification types organized into 8 categories. Users can configure their own SMTP settings and customize which notifications they want to receive.

---

## 📧 Features

### Notification Categories

1. **Meal Planning (5 types)**
   - Weekly plan ready
   - Meal plan expiring soon
   - Daily meal summary
   - Meal prep reminders
   - Next meal reminders

2. **Grocery & Shopping (4 types)**
   - Grocery list generated
   - Shopping day reminders
   - Low stock alerts
   - Grocery list updates

3. **Health & Nutrition (5 types)**
   - Blood type food tips
   - Nutritional goal progress
   - Supplement reminders
   - Hydration reminders
   - Meal balance alerts

4. **Progress & Gamification (4 types)**
   - Level up achievements
   - Badge earned
   - Streak milestones
   - Weekly progress reports

5. **Family & Collaboration (2 types)**
   - Family profile updates
   - Shared recipe suggestions

6. **Smart Recommendations (4 types)**
   - Seasonal recipe suggestions
   - Leftover recipe ideas
   - Favorite meal reminders
   - New recipe matches

7. **System & Maintenance (4 types)**
   - Knowledge base upload complete
   - Label analysis complete
   - Data backup reminders
   - App updates

8. **Scheduling & Calendar (3 types)**
   - Weekly meal plan schedule
   - Prep schedule
   - Shopping optimization

---

## 🎨 User Interface

### SMTP Settings
- **Location**: Settings → Email & SMTP Configuration
- **Features**:
  - Email provider presets (Gmail, Outlook, Yahoo, SendGrid, Mailgun, Custom)
  - SMTP host, port, security configuration
  - Encrypted password storage
  - From email and name customization
  - Test connection functionality
  - Security warnings and best practices

### Notification Preferences
- **Location**: Settings → Notification Preferences
- **Features**:
  - 30+ toggle switches organized by category
  - Time pickers for scheduled notifications
  - Frequency selectors (daily/weekly/hourly)
  - Day-of-week selectors for recurring notifications
  - Reminder timing options

### Notification History
- **Features**:
  - View all sent and scheduled notifications
  - Status indicators (sent, pending, failed)
  - Error messages for failed notifications
  - Clear history functionality

---

## 🛠️ Technical Implementation

### Files Created

#### Type Definitions
- **`src/types/notifications.ts`**
  - `SMTPSettings` interface
  - `NotificationPreferences` interface
  - `EmailNotification` interface
  - `NotificationType` enum
  - Default settings
  - SMTP provider presets

#### Services
- **`src/services/emailService.ts`**
  - Email preparation
  - SMTP validation
  - Queue management
  - Test connection
  - Bulk email sending

- **`src/services/notificationService.ts`**
  - Notification orchestration
  - Preference checking
  - Template selection
  - Trigger methods for all notification types

#### Utilities
- **`src/utils/emailEncryption.ts`**
  - Password encryption (XOR + Base64)
  - Password decryption
  - Password masking
  - Email validation
  - Security warnings

- **`src/utils/emailTemplates.ts`**
  - Base responsive HTML template
  - Weekly plan ready template
  - Daily meal summary template
  - Grocery list generated template
  - Level up achievement template
  - Weekly progress report template
  - Plain text generation

#### Components
- **`src/components/SMTPSettings.tsx`**
  - SMTP configuration UI
  - Provider selection
  - Password field with show/hide
  - Test connection button
  - Security warnings

- **`src/components/NotificationPreferences.tsx`**
  - 30+ notification toggles
  - Organized by 8 categories
  - Time and frequency pickers
  - Day-of-week selectors

- **`src/components/NotificationHistory.tsx`**
  - Notification list display
  - Status indicators
  - Clear history button
  - Empty state

### Files Modified

- **`src/types/index.ts`**
  - Added SMTP and notification fields to Settings interface

- **`src/store/useStore.ts`**
  - Added email notification state
  - Added notification history state
  - Added CRUD methods for notifications
  - Updated default settings

- **`src/components/SettingsPanel.tsx`**
  - Integrated SMTPSettings component
  - Integrated NotificationPreferences component

---

## 🔐 Security Features

### Password Encryption
- Client-side XOR encryption with Base64 encoding
- Encrypted storage in localStorage
- Show/hide password toggle
- Password masking in display

### Security Warnings
- Displayed on first SMTP configuration
- Recommendations for app-specific passwords
- 2FA enablement reminder
- Dedicated email service suggestions

### Email Validation
- RFC-compliant email validation
- Validation on test email
- Validation on from email

### Best Practices
- Never log decrypted passwords
- Use app-specific passwords
- Enable 2-factor authentication
- Consider dedicated email services

---

## 🚀 Production Deployment

### Important: Backend Required

**⚠️ Browsers cannot send SMTP emails directly due to security restrictions.**

The current implementation prepares emails and validates settings, but actual sending requires a backend service.

### Recommended Solutions

#### 1. SendGrid API (Easiest)
```javascript
// Backend endpoint example
app.post('/api/email/send', async (req, res) => {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: req.body.to,
    from: req.body.from,
    subject: req.body.subject,
    text: req.body.text,
    html: req.body.html,
  };
  
  await sgMail.send(msg);
  res.json({ success: true });
});
```

#### 2. Mailgun API
```javascript
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

app.post('/api/email/send', async (req, res) => {
  const data = {
    from: req.body.from,
    to: req.body.to,
    subject: req.body.subject,
    text: req.body.text,
    html: req.body.html,
  };
  
  await mailgun.messages().send(data);
  res.json({ success: true });
});
```

#### 3. AWS SES
```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

app.post('/api/email/send', async (req, res) => {
  const params = {
    Source: req.body.from,
    Destination: { ToAddresses: [req.body.to] },
    Message: {
      Subject: { Data: req.body.subject },
      Body: {
        Text: { Data: req.body.text },
        Html: { Data: req.body.html },
      },
    },
  };
  
  await ses.sendEmail(params).promise();
  res.json({ success: true });
});
```

#### 4. Custom SMTP (Nodemailer)
```javascript
const nodemailer = require('nodemailer');

app.post('/api/email/send', async (req, res) => {
  const transporter = nodemailer.createTransport({
    host: req.body.smtp.host,
    port: req.body.smtp.port,
    secure: req.body.smtp.secure,
    auth: {
      user: req.body.smtp.username,
      pass: req.body.smtp.password,
    },
  });
  
  await transporter.sendMail({
    from: req.body.from,
    to: req.body.to,
    subject: req.body.subject,
    text: req.body.text,
    html: req.body.html,
  });
  
  res.json({ success: true });
});
```

### Backend API Endpoints

The frontend expects these endpoints:

1. **POST `/api/email/send`**
   - Body: `{ smtp, notification }`
   - Returns: `{ success: boolean, message: string }`

2. **POST `/api/email/test`**
   - Body: `{ smtp, testEmail }`
   - Returns: `{ success: boolean, message: string }`

3. **GET `/api/email/status/:id`** (optional)
   - Returns: `{ id, status, error? }`

---

## 📝 Usage Examples

### Configure SMTP Settings

```typescript
// User navigates to Settings → Email & SMTP Configuration
// 1. Select email provider (e.g., Gmail)
// 2. Enter SMTP credentials
// 3. Click "Test Connection"
// 4. Enable email notifications
```

### Configure Notification Preferences

```typescript
// User navigates to Settings → Notification Preferences
// 1. Toggle notification types on/off
// 2. Set delivery times for scheduled notifications
// 3. Select frequency (daily/weekly/hourly)
// 4. Choose delivery days for recurring notifications
```

### Trigger Notifications Programmatically

```typescript
import { createNotificationService } from '../services/notificationService';
import { useStore } from '../store/useStore';

const { settings } = useStore();
const notificationService = createNotificationService(
  settings.notifications,
  settings.smtp
);

// Trigger weekly plan ready notification
await notificationService.notifyWeeklyPlanReady(
  plan,
  'user@example.com'
);

// Trigger level up notification
await notificationService.notifyLevelUp(
  5,
  100,
  ['Chef Master', '7-Day Streak'],
  'user@example.com'
);
```

---

## 🎨 Email Template Customization

### Template Structure

All email templates follow this structure:
- Responsive HTML design
- Mobile-friendly
- Consistent branding
- Plain text fallback
- Call-to-action buttons
- Unsubscribe link
- Professional styling

### Customizing Templates

Edit `src/utils/emailTemplates.ts` to customize:
- Colors and branding
- Content layout
- Button styles
- Footer text
- Personalization

---

## 📊 Monitoring & Analytics

### Recommended Tracking

1. **Delivery Rates**
   - Track successful/failed sends
   - Monitor bounce rates
   - Track spam complaints

2. **Engagement Metrics**
   - Open rates
   - Click-through rates
   - Conversion rates

3. **User Preferences**
   - Most enabled notification types
   - Most disabled notification types
   - Average notifications per user

### Integration with Analytics Services

Consider integrating with:
- Google Analytics (for link clicks)
- Mixpanel (for user events)
- Segment (for unified analytics)

---

## 🐛 Troubleshooting

### Common Issues

**1. Test Connection Fails**
- Verify SMTP host and port
- Check username/password
- Ensure app-specific password for Gmail
- Try different security settings (TLS vs SSL)

**2. Emails Not Sending**
- Remember: Browser cannot send emails directly
- Backend service required for production
- Check browser console for errors

**3. Encrypted Password Issues**
- Clear browser localStorage
- Re-enter password
- Verify encryption utilities are working

**4. Missing Notifications**
- Check notification preferences
- Verify SMTP settings are enabled
- Check notification history for errors

---

## 🔮 Future Enhancements

### Potential Additions

1. **SMS Notifications** (via Twilio)
2. **Push Notifications** (Web Push API)
3. **Webhook Support** (Zapier, IFTTT)
4. **Calendar Integration** (Google Calendar, iCal)
5. **Slack/Discord Integration**
6. **Multi-language Templates**
7. **A/B Testing**
8. **Analytics Dashboard**
9. **Email Preview Before Sending**
10. **Template Editor UI**

---

## 📚 Related Documentation

- [API Setup Guide](API_SETUP.md)
- [Settings Panel](src/components/SettingsPanel.tsx)
- [Email Service](src/services/emailService.ts)
- [Notification Service](src/services/notificationService.ts)
- [Email Templates](src/utils/emailTemplates.ts)

---

## ✅ Testing Checklist

- [ ] Configure SMTP settings
- [ ] Test connection with valid credentials
- [ ] Enable email notifications
- [ ] Configure notification preferences
- [ ] Test notification triggers
- [ ] Verify notification history
- [ ] Check email deliverability
- [ ] Test on mobile devices
- [ ] Verify unsubscribe link
- [ ] Test with different email providers

---

## 🎓 Best Practices

### For Users
1. Use app-specific passwords
2. Enable 2-factor authentication
3. Use dedicated email services for production
4. Monitor delivery rates
5. Respect user preferences
6. Provide clear unsubscribe options

### For Developers
1. Never log decrypted passwords
2. Implement rate limiting
3. Handle bounces and spam complaints
4. Use templates for consistency
5. Test across email clients
6. Monitor deliverability metrics
7. Follow email best practices (SPF, DKIM, DMARC)

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify SMTP settings
3. Review notification preferences
4. Check notification history
5. Review this documentation

---

**© 2024 Meal Plan Assistant. All rights reserved.**

