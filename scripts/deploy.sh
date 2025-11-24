#!/bin/bash

# Talos Price Alerts - Vercel Deployment Script

echo "🚀 Deploying Talos Price Alerts to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Build the project locally first to catch any errors
echo "🔨 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Local build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "  1. Verify all environment variables are set"
    echo "  2. Test the admin login"
    echo "  3. Check database connectivity"
    echo "  4. Test the scraper functionality"
    echo "  5. Verify email alerts work"
    echo ""
    echo "🔗 Don't forget to:"
    echo "  - Update NEXTAUTH_URL to your production domain"
    echo "  - Set up cron jobs for automated alerts"
    echo "  - Configure your custom domain (optional)"
else
    echo "❌ Deployment failed. Check the logs above."
    exit 1
fi
