# Talos Price Alerts - Setup Instructions

## Phase 1 Implementation Complete ✅

This document outlines the configuration values you need to provide to complete the setup.

## 🔧 Required Configuration

### 1. Install Dependencies

First, install all the required dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Database Configuration
# 🔧 REQUIRED: Replace with your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/talos_price_alerts
# For production, use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/talos_price_alerts

# Authentication Configuration
# 🔧 REQUIRED: Generate a secure random string (32+ characters)
NEXTAUTH_SECRET=your-nextauth-secret-here-replace-with-random-string
# Generate with: openssl rand -base64 32

# 🔧 REQUIRED: Set to your domain in production
NEXTAUTH_URL=http://localhost:3000
# For production: NEXTAUTH_URL=https://yourdomain.com

# Admin Configuration
# 🔧 REQUIRED: Set your admin password
ADMIN_PASSWORD=your-admin-password-here

# Grok API Configuration (for Phase 2)
# 🔧 REQUIRED: Add your Grok API key when ready to implement scraping
GROK_API_KEY=your-grok-api-key-here

# Email Configuration (for Phase 3)
# Option 1: SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key-here

# Option 2: SMTP (Alternative to SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cron Job Security (for Phase 2)
# 🔧 REQUIRED: Generate a secure random string for cron job authentication
CRON_SECRET=your-cron-secret-here-replace-with-random-string

# Development Settings
NODE_ENV=development
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/talos_price_alerts`

#### Option B: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get connection string and replace in `MONGODB_URI`

### 4. Generate Secure Secrets

Generate secure random strings for authentication:

```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For CRON_SECRET
openssl rand -base64 32
```

### 5. Admin Password

Set a strong password for admin access in the `ADMIN_PASSWORD` variable.

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at:
- **Main site**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin

### Production Build

```bash
npm run build
npm start
```

## 🔐 Admin Access

1. Navigate to http://localhost:3000/admin
2. Enter the password you set in `ADMIN_PASSWORD`
3. You'll be redirected to the admin dashboard

## 📁 Project Structure

```
talos_price_alerts/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles with art-deco theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── layout/           # Layout components (Header, Footer)
│   └── ui/               # Reusable UI components
├── config/               # Configuration files
├── lib/                  # Utility libraries
├── models/               # MongoDB schemas
├── types/                # TypeScript type definitions
└── middleware.ts         # Route protection middleware
```

## 🎨 Theme Features

The application includes a custom dark art-deco theme with:
- **Bronze & Malachite color palette**
- **Geometric patterns and gradients**
- **Responsive design**
- **Art-deco inspired components**

## 🔄 Next Steps (Phase 2)

After completing Phase 1 setup:

1. **Add Products**: Use admin panel to add products to track
2. **Configure Vendors**: Add vendor URLs for each product
3. **Set up Grok API**: Add API key for price extraction
4. **Test Scraping**: Use admin tools to test price scraping

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify `MONGODB_URI` is correct
   - Ensure MongoDB is running (local) or accessible (Atlas)
   - Check network connectivity

2. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain
   - Clear browser cookies and try again

3. **Admin Login Issues**
   - Verify `ADMIN_PASSWORD` is set correctly
   - Check browser console for errors

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal/server logs
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

## 📝 Development Notes

- The project uses Next.js 16 with the App Router
- Authentication is handled by NextAuth.js
- Database operations use Mongoose ODM
- Styling uses Tailwind CSS with custom CSS variables
- TypeScript is used throughout for type safety

## 🔒 Security Considerations

- Never commit `.env.local` to version control
- Use strong, unique passwords for admin access
- Generate secure random strings for secrets
- Use HTTPS in production
- Regularly update dependencies
