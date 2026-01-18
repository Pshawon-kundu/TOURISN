# Netlify Deployment Guide - Admin Panel

## Quick Setup

### 1. Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub → Select `Pshawon-kundu/TOURISN`
4. **Configuration is already in netlify.toml** - just verify:
   - Base directory: `admin-web`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

### 2. Environment Variables

Add these in Netlify Dashboard → Site settings → Environment variables:

```bash
NODE_VERSION=18
NODE_ENV=production
VITE_API_URL=https://your-backend.onrender.com
```

**Important:** Replace `https://your-backend.onrender.com` with your actual Render backend URL

### 3. After Deployment

1. Note your Netlify URL (e.g., `https://tourisn.netlify.app`)
2. Update CORS in Render:
   - Go to Render Dashboard → Your Backend Service
   - Environment → Edit `CORS_ORIGIN`
   - Set to your Netlify URL: `https://tourisn.netlify.app`
   - Save changes (will trigger redeploy)

### 4. Test Admin Panel

1. Visit your Netlify URL
2. Login with:
   - Email: `admin@tourisn.com`
   - Password: `Admin@123456`
3. **Change the password immediately** in Settings

## Update Backend URL

After getting your Render backend URL, update `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-actual-backend.onrender.com/api/:splat"
  status = 200
```

Then commit and push to trigger redeploy.

## Admin Panel Routes

The admin panel will be accessible at:

- Root: `https://your-site.netlify.app/`
- Login: `https://your-site.netlify.app/login`
- Dashboard: `https://your-site.netlify.app/dashboard`
- Users: `https://your-site.netlify.app/users`
- Guides: `https://your-site.netlify.app/guides`
- Bookings: `https://your-site.netlify.app/bookings`

## Troubleshooting

### Build Fails

- Check that Node version is 18
- Verify all dependencies are in `admin-web/package.json`
- Check build logs for TypeScript errors

### API Calls Fail

- Verify `VITE_API_URL` is set correctly
- Check CORS settings in Render backend
- Verify backend is running and accessible

### Routes Not Working

- Ensure redirect rules are in `netlify.toml`
- Check that base path in `vite.config.ts` is `/`
- Clear browser cache and try again
