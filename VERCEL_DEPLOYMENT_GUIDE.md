# 🚀 Vercel Deployment Guide for Talos Price Alerts

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repo
3. **MongoDB Atlas**: Set up a cloud MongoDB database
4. **Email Service**: SendGrid account or SMTP credentials

## Step 1: Prepare Your Environment Variables

Create a `.env.production` file (don't commit this) with all your production values:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/talos_price_alerts?retryWrites=true&w=majority

# Authentication
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secure-random-string-here
ADMIN_PASSWORD=your-secure-admin-password

# Email Service (choose one)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=alerts@yourdomain.com

# OR SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=alerts@yourdomain.com

# Grok API
GROK_API_KEY=your-grok-api-key
GROK_MODEL=grok-2-1212

# Cron Jobs (optional)
CRON_SECRET=your-secure-cron-secret
```

## Step 2: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**: Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create a Cluster**: Choose the free tier
3. **Create Database User**: 
   - Go to Database Access
   - Add new user with read/write permissions
4. **Whitelist IP Addresses**:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows all IPs - for Vercel)
5. **Get Connection String**:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Connect GitHub**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables**:
   - In project settings → Environment Variables
   - Add all variables from your `.env.production` file
   - Make sure to set them for **Production**, **Preview**, and **Development**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (run from your project root)
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: talos-price-alerts
# - Directory: ./
# - Override settings? N

# Add environment variables
vercel env add MONGODB_URI
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
# ... add all other variables

# Deploy to production
vercel --prod
```

## Step 4: Configure Domain & Environment Variables

1. **Set NEXTAUTH_URL**:
   ```bash
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```

2. **Generate NEXTAUTH_SECRET**:
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```

3. **Configure Email Service**:
   - **SendGrid**: Get API key from SendGrid dashboard
   - **Gmail SMTP**: Use app-specific password, not your regular password

## Step 5: Database Seeding (Optional)

After deployment, you can seed your database with sample data:

1. **Create a seed API endpoint** (already created in the project):
   ```
   https://your-app.vercel.app/api/admin/seed
   ```

2. **Or run the seed script locally** pointing to production DB:
   ```bash
   MONGODB_URI="your-production-uri" node scripts/seed-sample-data.js
   ```

## Step 6: Set Up Cron Jobs (Optional)

For automated price checking and alerts:

1. **Add Cron Secret** to environment variables:
   ```bash
   CRON_SECRET=your-secure-random-string
   ```

2. **Set up external cron service** (like cron-job.org):
   - URL: `https://your-app.vercel.app/api/cron/check-alerts`
   - Method: POST
   - Headers: `Authorization: Bearer your-cron-secret`
   - Schedule: Every hour or as needed

## Step 7: Verify Deployment

### Test These URLs:

1. **Homepage**: `https://your-app.vercel.app`
2. **Products**: `https://your-app.vercel.app/products`
3. **Admin Login**: `https://your-app.vercel.app/admin/login`
4. **API Health**: `https://your-app.vercel.app/api/test/db`

### Check Vercel Logs:

```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

## Step 8: Custom Domain (Optional)

1. **Buy a domain** or use existing one
2. **Add domain in Vercel**:
   - Project Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions
3. **Update NEXTAUTH_URL**:
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   ```

## Troubleshooting Common Issues

### 1. MongoDB Connection Issues
```bash
# Check if your IP is whitelisted in MongoDB Atlas
# Verify connection string format
# Ensure database user has correct permissions
```

### 2. Environment Variables Not Working
```bash
# Verify variables are set in Vercel dashboard
# Check variable names match exactly
# Redeploy after adding variables
```

### 3. Build Failures
```bash
# Check build logs in Vercel dashboard
# Ensure all dependencies are in package.json
# Verify TypeScript types are correct
```

### 4. API Routes Not Working
```bash
# Check function logs in Vercel
# Verify API routes are in correct directories
# Check for async/await issues
```

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] All environment variables added to Vercel
- [ ] NEXTAUTH_URL points to production domain
- [ ] Email service configured and tested
- [ ] Admin password is secure
- [ ] Database seeded with initial data (optional)
- [ ] Cron jobs configured (optional)
- [ ] Custom domain configured (optional)
- [ ] All pages load correctly
- [ ] Admin panel accessible
- [ ] Price scraping works
- [ ] Email alerts work

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for admin and database
3. **Rotate secrets regularly**
4. **Monitor Vercel usage** to avoid unexpected charges
5. **Set up MongoDB Atlas alerts** for unusual activity

## Performance Optimization

1. **Enable Vercel Analytics** in project settings
2. **Monitor function execution times**
3. **Optimize database queries** if needed
4. **Consider upgrading Vercel plan** for higher limits

Your Talos Price Alerts app should now be live on Vercel! 🎉

## Next Steps

- Set up monitoring and alerts
- Configure automated backups
- Add more products and vendors
- Monitor user engagement
- Scale based on usage patterns
