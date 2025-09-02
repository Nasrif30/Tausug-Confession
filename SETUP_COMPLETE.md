# 🚀 Complete Setup Guide - Tausug Confession Platform

## ✅ What We've Fixed

1. **CORS Configuration**: Updated backend to allow all Vercel domains
2. **API URLs**: Set frontend to use production backend by default
3. **Environment Variables**: Prepared configuration for production deployment

## 🔧 Backend Environment Setup (.env file)

Create a file called `.env` in your `backend` directory with this content:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=Xk7tNHMC2Qv4W+PeUgyl2ApLoTze7GKQgdVV1i3N1fP2CUuIzvjZ/+ePlKau2LsK6IeyqANoC8+2aDI+Hoa7fg==
JWT_EXPIRE=3600

# Supabase Configuration
SUPABASE_URL=https://ibdsxlxqgwkelqcvlegb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZHN4bHhxZ3drZWxxY3ZsZWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NjAxMjEsImV4cCI6MjA3MjIzNjEyMX0.bkLSTzkd_7B-l7RRKVBGZdXKU2AoLGk3gLHKCFUmpwg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZHN4bHhxZ3drZWxxY3ZsZWdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY2MDEyMSwiZXhwIjoyMDcyMjM2MTIxfQ.Q5ggqgL9b15taHy5izbvgr_T9qYHaBYcC8EHxlXjtCE

# Frontend URL for CORS
FRONTEND_URL=https://tausug-confession.vercel.app
```

## 🌐 Vercel Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add this variable:
   ```
   REACT_APP_API_URL=https://tausug-confession.onrender.com
   ```

## 📋 Deployment Steps

### 1. Backend (Render)
```bash
# Commit and push changes
git add .
git commit -m "Fix CORS configuration and add Supabase credentials"
git push origin main

# Render will automatically redeploy with the new CORS settings
```

### 2. Frontend (Vercel)
```bash
# Vercel will auto-deploy from GitHub
# Make sure the environment variable is set in Vercel dashboard
```

## 🔍 Testing the Fix

After deployment:

1. **Check Backend Health**: Visit `https://tausug-confession.onrender.com/api/health`
2. **Test Login**: Try logging in from your Vercel frontend
3. **Check Console**: No more CORS errors should appear
4. **Verify API Calls**: All requests should go to the production backend

## 🎯 Expected Results

- ✅ No more CORS preflight errors (204 responses)
- ✅ Login functionality works properly
- ✅ All API calls connect to `https://tausug-confession.onrender.com`
- ✅ Frontend and backend communicate successfully

## 🚨 Troubleshooting

If you still see CORS errors:

1. **Check Render logs** for any deployment issues
2. **Verify environment variables** are set correctly in Vercel
3. **Clear browser cache** and try again
4. **Check network tab** to see where requests are going

## 📞 Support

The CORS issue should now be completely resolved! Your Tausug Confession Platform will work seamlessly between Vercel and Render. 🎉
