# Email Templates

This folder contains HTML email templates for the UniAct system.

## Available Templates

### email_confirmation.html

A professional email confirmation template that is automatically sent when certain users sign in.

**Features:**
- Clean, modern design with gradient blue header
- Responsive layout that works on all devices
- Professional branding with QuickCart theme
- Call-to-action button for email confirmation
- Security notice with 24-hour expiration
- Support contact information

**Usage:**

This template is triggered when `arsanyosama3@gmail.com` signs in for the first time. The email includes:
- Welcome message
- Email confirmation button linking to: `https://quickcart.com/verify?token=123456`
- 24-hour expiration notice
- Support email: markgeforce4080@gmail.com
- Company footer with location

**Template Variables:**

When implementing in your backend, replace these placeholders:
- `{{USER_NAME}}` - The user's name (currently shows "Hi there!")
- `{{CONFIRMATION_LINK}}` - The actual confirmation URL with token
- `{{EXPIRY_TIME}}` - Time until link expires (default: 24 hours)

**Backend Integration:**

1. Read the HTML file from `/email_templates/email_confirmation.html`
2. Replace template variables with actual values
3. Send via your email service (SendGrid, AWS SES, etc.)
4. Track confirmation status in your database

**Testing:**

Open `email_confirmation.html` in any browser to preview the email design.

## Design Specifications

- **Color Palette:**
  - Primary Blue: #5b7ce6 to #6b8af0 (gradient)
  - Accent Orange: #ff9500 (QuickCart brand)
  - Text: #333333 (headers), #666666 (body)
  - Background: #f5f5f5

- **Typography:**
  - Font Family: System fonts (San Francisco, Segoe UI, Roboto)
  - Header: 32px, semi-bold
  - Subheader: 24px, semi-bold
  - Body: 15px, regular

- **Responsive Breakpoints:**
  - Desktop: 600px max-width
  - Mobile: Adjusted padding and font sizes below 600px
