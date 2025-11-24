# 🐛 Debugging Product Creation Issue

## Issue Description
Getting "Unexpected token '<', "<!DOCTYPE"... is not valid JSON" when creating products, which means the API is returning HTML instead of JSON.

## Debugging Steps

### 1. Check Environment Variables
First, make sure your `.env.local` file exists and contains:

```bash
# Required for database connection
MONGODB_URI=mongodb://localhost:27017/talos_price_alerts
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/talos_price_alerts

# Required for authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
ADMIN_PASSWORD=your-password-here
```

### 2. Test Database Connection
Visit: http://localhost:3000/api/test/db

This will test if the MongoDB connection is working.

### 3. Check Server Logs
Look at your terminal where `npm run dev` is running for error messages when you try to create a product.

### 4. Test API Directly
You can test the API directly using curl or a tool like Postman:

```bash
# First login to get session cookie, then:
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","category":"Peptides","unit":"mg","description":"Test"}'
```

### 5. Common Issues & Solutions

#### Issue: MONGODB_URI not set
**Solution**: Create `.env.local` file with proper MongoDB connection string

#### Issue: MongoDB not running (local setup)
**Solution**: Start MongoDB service:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

#### Issue: MongoDB Atlas connection
**Solution**: 
1. Whitelist your IP address in MongoDB Atlas
2. Check username/password in connection string
3. Ensure database name is correct

#### Issue: Authentication problems
**Solution**: Make sure you're logged in to admin panel first

### 6. Enable Detailed Logging
The API now has detailed console logging. Check your server terminal for step-by-step execution logs.

### 7. Quick Fix Steps
1. Restart the development server: `npm run dev`
2. Clear browser cache and cookies
3. Try logging out and back into admin panel
4. Check browser network tab for actual HTTP response

## Expected Behavior
When working correctly:
1. Form submission should show success
2. Modal should close
3. Product should appear in the list
4. No console errors

## If Still Having Issues
1. Check the server terminal for detailed error logs
2. Visit `/api/test/db` to verify database connection
3. Ensure `.env.local` file exists and has correct values
4. Try creating a simple product with minimal data first
