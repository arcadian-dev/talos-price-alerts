// Environment Configuration Example
// Copy this to .env.local and fill in your values

export const ENV_EXAMPLE = `
# Database Configuration
# 🔧 REQUIRED: Replace with your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/talos_price_alerts

# Authentication Configuration
# 🔧 REQUIRED: Generate a secure random string (32+ characters)
NEXTAUTH_SECRET=your-nextauth-secret-here-replace-with-random-string

# 🔧 REQUIRED: Set to your domain in production
NEXTAUTH_URL=http://localhost:3000

# Admin Configuration
# 🔧 REQUIRED: Set your admin password (will be hashed)
ADMIN_PASSWORD=your-admin-password-here

# Grok API Configuration
# 🔧 REQUIRED: Add your Grok API key when ready to implement scraping
GROK_API_KEY=your-grok-api-key-here

# 🔧 OPTIONAL: Specify Grok model (defaults to grok-2-1212)
GROK_MODEL=grok-2-1212

# Email Configuration (Choose one)
# Option 1: SendGrid
# 🔧 OPTIONAL: Add SendGrid API key for email functionality
SENDGRID_API_KEY=your-sendgrid-api-key-here

# Option 2: SMTP (Alternative to SendGrid)
# 🔧 OPTIONAL: Configure SMTP settings for email functionality
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cron Job Security
# 🔧 REQUIRED: Generate a secure random string for cron job authentication
CRON_SECRET=your-cron-secret-here-replace-with-random-string

# Development Settings
NODE_ENV=development
`;

// Configuration validation
export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/talos_price_alerts',
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    adminPassword: process.env.ADMIN_PASSWORD,
  },
  grok: {
    apiKey: process.env.GROK_API_KEY,
  },
  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  cron: {
    secret: process.env.CRON_SECRET,
  },
} as const;
