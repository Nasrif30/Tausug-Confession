# Vercel Deployment Setup

## Environment Variables

To fix the CORS error, you need to set these environment variables in your Vercel project:

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following:

```
REACT_APP_API_URL=https://tausug-confession.onrender.com
```

### Alternative: Create .env.production file
Create a file called `.env.production` in your frontend directory with:

```
REACT_APP_API_URL=https://tausug-confession.onrender.com
```

## What We Fixed

1. **Backend CORS Configuration**: Updated to allow all Vercel domains
2. **Frontend API URLs**: Changed from localhost to production backend
3. **Environment Variables**: Set up proper production configuration

## Next Steps

1. **Commit and push** these changes to GitHub
2. **Redeploy** your backend on Render (it will automatically pick up the CORS changes)
3. **Redeploy** your frontend on Vercel (or it will auto-deploy from GitHub)

## Testing

After deployment:
1. Try logging in from your Vercel frontend
2. Check the browser console for any remaining CORS errors
3. Verify that API calls are going to `https://tausug-confession.onrender.com`

The CORS error should now be resolved! 🎉
