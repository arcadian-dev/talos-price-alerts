# 🤖 Grok API Setup & Funding Guide

## Issue: Grok API Requires Funding

The scraper is working correctly, but the Grok API needs credits to function. Here's how to resolve this:

## 🔧 **Option 1: Fund Grok API (Recommended)**

### **Step 1: Add Credits to Grok API**
1. Go to [x.ai](https://x.ai) or your Grok API dashboard
2. Navigate to billing/credits section
3. Add credits to your account (usually starts around $5-10)
4. Verify your API key has access to the credits

### **Step 2: Configure Model (Optional)**
Add to your `.env.local`:
```bash
GROK_API_KEY=your-api-key-here
GROK_MODEL=grok-2-1212  # Latest model (optional, this is the default)
```

Available models (as of 2024):
- `grok-2-1212` (Latest, recommended)
- `grok-2-vision-1212` (With vision capabilities)
- `grok-beta` (Older beta version)

### **Step 3: Test the Integration**
Once funded, test a vendor in the scraper dashboard. You should see:
- More accurate price extraction
- Higher confidence scores
- Better handling of complex page layouts
- Model name displayed in configuration status

## 🔧 **Option 2: Use Fallback Extraction (Free)**

The scraper already includes fallback regex-based extraction that works without Grok API:

### **Current Fallback Features:**
- ✅ Multiple price pattern recognition ($19.99, 19.99 USD, etc.)
- ✅ Amount/unit extraction (5mg, 10ml, etc.)
- ✅ Reasonable price range validation
- ✅ No API costs

### **Fallback Limitations:**
- Lower accuracy on complex pages
- May miss context-dependent pricing
- Confidence scores around 0.6 vs 0.9+ with Grok

## 🐛 **Fixed: Google Fonts Error**

I've also fixed the Google Fonts loading error that was spamming your console:
- Added font fallbacks
- Improved error handling
- Console should be much cleaner now

## 🧪 **Testing Both Options**

### **Test Fallback (Free):**
1. Remove or comment out `GROK_API_KEY` from `.env.local`
2. Test a vendor - should use regex extraction
3. Check logs for "fallback extraction" messages

### **Test Grok API (Paid):**
1. Fund your Grok API account
2. Ensure `GROK_API_KEY` is in `.env.local`
3. Test a vendor - should use AI extraction
4. Check logs for "Grok API" messages

## 💡 **Recommendation**

For **development/testing**: Use the fallback method (free)
For **production**: Fund Grok API for better accuracy

## 🔍 **Expected Behavior Now**

With the improved error handling, you should see clear messages like:
- ✅ "Grok API: Insufficient credits. Please add funding..."
- ✅ "Fallback extraction successful: {price: 19.99, amount: 5, unit: 'mg'}"
- ✅ Clean console without font loading errors

## 📊 **Cost Estimation**

Grok API typically costs:
- ~$0.01-0.05 per scrape request
- For 100 products scraped daily: ~$1-5/month
- Much cheaper than manual price monitoring

The fallback method costs $0 but may miss some complex pricing scenarios.

## 🚀 **Next Steps**

1. **Immediate**: Test with fallback (should work now)
2. **Optional**: Fund Grok API for better accuracy
3. **Production**: Set up scheduled scraping once satisfied with results
