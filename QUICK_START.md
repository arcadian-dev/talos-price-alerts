# 🚀 Quick Start Guide

## Phase 1 Complete! Here's what you need to do next:

### 1. Create Environment File (REQUIRED)

Create `.env.local` in the project root:

```bash
# Copy this content to .env.local and update the values

# 🔧 REQUIRED: Your MongoDB connection
MONGODB_URI=mongodb://localhost:27017/talos_price_alerts

# 🔧 REQUIRED: Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=replace-with-32-char-random-string

# 🔧 REQUIRED: Your domain (localhost for development)
NEXTAUTH_URL=http://localhost:3000

# 🔧 REQUIRED: Set your admin password
ADMIN_PASSWORD=your-secure-admin-password

# Optional (for later phases)
GROK_API_KEY=your-grok-api-key
SENDGRID_API_KEY=your-sendgrid-key
CRON_SECRET=another-random-string
```

### 2. Generate Secrets

Run these commands to generate secure secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CRON_SECRET  
openssl rand -base64 32
```

### 3. Database Options

**Option A: Local MongoDB**
```bash
# Install and start MongoDB locally
brew install mongodb-community
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Replace `MONGODB_URI` in `.env.local`

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access the Application

- **Main Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin (use your ADMIN_PASSWORD)

## ✅ What's Working Now

- ✅ Dark art-deco theme with bronze & malachite colors
- ✅ Responsive homepage with hero section
- ✅ Admin authentication system
- ✅ Admin dashboard layout
- ✅ MongoDB schemas for products, vendors, pricing, subscriptions
- ✅ Component library (buttons, cards, inputs, modals)
- ✅ Header and footer components

## 🔄 Next Phase (Phase 2)

Once you have the basic setup running:

1. **Product Management**: Add products through admin panel
2. **Vendor Management**: Add vendor URLs for scraping
3. **Grok API Integration**: Set up price extraction
4. **Scraper Implementation**: Automated price collection

## 🎨 Theme Preview

The app features a sophisticated dark art-deco design with:
- Bronze (#a86332) and Malachite (#0d9488) accent colors
- Geometric patterns and gradients
- Art-deco inspired borders and cards
- Smooth hover animations and transitions

## 🔧 Configuration Values Needed

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | ✅ | Database connection | `mongodb://localhost:27017/talos_price_alerts` |
| `NEXTAUTH_SECRET` | ✅ | Auth encryption key | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | App URL | `http://localhost:3000` |
| `ADMIN_PASSWORD` | ✅ | Admin login password | `your-secure-password` |
| `GROK_API_KEY` | ⏳ | For Phase 2 scraping | Get from Grok API |
| `SENDGRID_API_KEY` | ⏳ | For Phase 3 emails | Get from SendGrid |

Ready to start? Create your `.env.local` file and run `npm run dev`! 🎉
