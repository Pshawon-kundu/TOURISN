# 🚀 Netlify Deployment Guide - TOURISN Platform

## 📋 Overview

This guide will help you deploy the TOURISN admin panel to Netlify with proper configuration for the `/admin` route.

---

## 🎯 Deployment Architecture

```
Netlify (Frontend)
├── /admin/*          → Admin Panel (Vite + React)
└── /api/*            → Proxied to Backend API

Backend (Railway/Render/Heroku)
├── Express API
└── PostgreSQL (Supabase)
```

---

## 📝 Pre-Deployment Checklist

### ✅ Required Before Deployment

- [ ] Supabase database is setup and migrations are run
- [ ] Backend is deployed and accessible via HTTPS
- [ ] You have your Supabase credentials
- [ ] You have a GitHub account
- [ ] Code is pushed to GitHub repository

---

## 🔧 Step-by-Step Deployment

### Step 1: Setup Backend First

#### Option A: Deploy to Railway

1. **Install Railway CLI**

```bash
npm i -g @railway/cli
```

2. **Login to Railway**

```bash
railway login
```

3. **Navigate to backend folder**

```bash
cd backend
```

4. **Initialize Railway project**

```bash
railway init
```

5. **Add environment variables**

```bash
railway variables set PORT=5001
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=your_supabase_url
railway variables set SUPABASE_ANON_KEY=your_anon_key
railway variables set SUPABASE_SERVICE_KEY=your_service_key
railway variables set JWT_SECRET=your_jwt_secret_min_32_chars
railway variables set CORS_ORIGIN=https://your-site.netlify.app
```

6. **Deploy backend**

```bash
railway up
```

7. **Get your Railway URL**

```bash
railway domain
```

Save this URL - you'll need it for Netlify!

#### Option B: Deploy to Render

1. Go to [Render Dashboard](https://render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `tourisn-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add all environment variables from `backend/.env.example`
6. Click **"Create Web Service"**
7. Copy your service URL (e.g., `https://tourisn-backend.onrender.com`)

---

### Step 2: Deploy Admin Panel to Netlify

#### Method A: Netlify Dashboard (Recommended for beginners)

1. **Go to Netlify Dashboard**
   - Visit [https://app.netlify.com](https://app.netlify.com)
   - Sign up or log in with GitHub

2. **Create New Site**
   - Click **"Add new site"**
   - Select **"Import an existing project"**
   - Choose **GitHub** as your Git provider
   - Authorize Netlify to access your repositories

3. **Select Repository**
   - Find and select your `TOURISN` repository
   - Click on it to continue

4. **Configure Build Settings**

   ```
   Base directory: admin-web
   Build command: npm install && npm run build
   Publish directory: admin-web/dist
   ```

5. **Add Environment Variables**
   - Click **"Show advanced"**
   - Click **"New variable"**
   - Add:

     ```
     Key: VITE_API_URL
     Value: https://your-backend-url.com/api

     Key: NODE_VERSION
     Value: 18
     ```

6. **Deploy**
   - Click **"Deploy site"**
   - Wait 2-3 minutes for build to complete
   - Your site will be live at `https://random-name-12345.netlify.app`

#### Method B: Netlify CLI (For advanced users)

1. **Install Netlify CLI**

```bash
npm install -g netlify-cli
```

2. **Login to Netlify**

```bash
netlify login
```

3. **Navigate to project root**

```bash
cd c:\Users\PK\TOURISN_SW
```

4. **Initialize Netlify**

```bash
netlify init
```

- Choose **"Create & configure a new site"**
- Select your team
- Enter site name: `tourisn-platform`

5. **Set environment variables**

```bash
netlify env:set VITE_API_URL https://your-backend-url.com/api
netlify env:set NODE_VERSION 18
```

6. **Deploy to production**

```bash
netlify deploy --prod
```

---

### Step 3: Configure Custom Domain (Optional)

1. **In Netlify Dashboard**
   - Go to **Site settings** → **Domain management**
   - Click **"Add custom domain"**
   - Enter your domain: `yourdomain.com`

2. **Configure DNS**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add DNS records as shown in Netlify
   - Usually:

     ```
     Type: A
     Name: @
     Value: 75.2.60.5

     Type: CNAME
     Name: www
     Value: your-site.netlify.app
     ```

3. **Wait for DNS propagation** (can take up to 48 hours)

4. **Enable HTTPS**
   - Netlify automatically provisions SSL certificate
   - Your site will be available at `https://yourdomain.com`

---

## 🔐 Environment Variables Setup in Netlify

### Required Variables

| Variable       | Value                          | Where to Get It                      |
| -------------- | ------------------------------ | ------------------------------------ |
| `VITE_API_URL` | `https://your-backend.com/api` | Your backend URL from Railway/Render |
| `NODE_VERSION` | `18`                           | Fixed value                          |

### How to Add Variables in Netlify

1. Go to **Site settings**
2. Click **"Environment variables"** in left sidebar
3. Click **"Add a variable"**
4. Select **"Add a single variable"**
5. Enter key and value
6. Click **"Create variable"**
7. Trigger a new deploy for changes to take effect

---

## 🧪 Testing Your Deployment

### 1. Test Admin Panel

```
Open: https://your-site.netlify.app/admin
```

### 2. Test Admin Login

```
Email: admin@tourisn.com
Password: Admin@123456
```

### 3. Verify API Connection

- Login should work
- Dashboard should load stats
- Users page should show data

### 4. Check Browser Console

- Open DevTools (F12)
- Look for any errors
- API calls should go to your backend URL

---

## 🐛 Troubleshooting

### Issue: "404 Not Found" on /admin route

**Solution:**
Check your `netlify.toml` file has:

```toml
[[redirects]]
  from = "/admin/*"
  to = "/admin/:splat"
  status = 200
```

### Issue: "API connection failed"

**Solutions:**

1. Check backend is running: `curl https://your-backend.com/health`
2. Verify `VITE_API_URL` environment variable is correct
3. Check CORS settings in backend allow your Netlify domain
4. Redeploy after fixing

### Issue: "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"

**Solution:**

- Disable browser ad-blockers
- Check for CORS errors in Network tab
- Update CORS_ORIGIN in backend to include Netlify URL

### Issue: Build fails with "command not found"

**Solution:**

1. Go to **Site settings** → **Build & deploy**
2. Set Node version to 18:
   ```
   NODE_VERSION=18
   ```
3. Clear cache and retry deploy

### Issue: Environment variables not working

**Solution:**

1. Add variables in Netlify dashboard (not in code)
2. Trigger a new deploy (not redeploy)
3. Variables must start with `VITE_` prefix for Vite apps

---

## 📊 Monitoring Your Site

### Netlify Analytics

- Go to **Analytics** tab in Netlify dashboard
- View page views, load times, errors
- Check bandwidth usage

### Error Tracking

- Check **Deploys** tab for build logs
- Check **Functions** tab for serverless function logs (if used)
- Use browser DevTools Console for client-side errors

---

## 🔄 Continuous Deployment

### Auto-Deploy from GitHub

1. **In Netlify Dashboard**
   - Go to **Site settings** → **Build & deploy**
   - Under **Build settings**, ensure:
     ```
     Branch: main (or your default branch)
     Auto publishing: Enabled
     ```

2. **Now every time you push to GitHub:**

   ```bash
   git add .
   git commit -m "Update admin panel"
   git push origin main
   ```

   - Netlify automatically builds and deploys
   - Takes 2-3 minutes
   - You get email notification when done

### Deploy Previews for Pull Requests

- Create a PR on GitHub
- Netlify automatically creates a preview deployment
- Test changes before merging
- Share preview URL with team

---

## 🎯 Performance Optimization

### Enable Netlify CDN

- Automatically enabled for all sites
- Assets served from nearest edge location
- Improves load times globally

### Asset Optimization

- Vite automatically minifies JS/CSS
- Images are optimized during build
- Enable Netlify Image CDN for better image delivery

### Enable Caching

Already configured in `netlify.toml`:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 🔒 Security Best Practices

### 1. Change Default Admin Password

```
IMMEDIATELY after first login, go to:
Settings → Change Password
```

### 2. Enable Branch Protection on GitHub

- Require PR reviews before merging
- Require status checks to pass
- Prevent force pushes

### 3. Set Up Webhooks

- Configure Netlify to notify your team on deployments
- Set up Slack/Discord notifications

### 4. Regular Security Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Commit and push
git commit -am "Update dependencies"
git push
```

---

## 💰 Cost Estimation

### Netlify (Admin Panel)

- **Free Tier**: 100 GB bandwidth/month, 300 build minutes
- **Pro Tier**: $19/month - 400 GB bandwidth, unlimited builds
- **Recommended**: Start with Free tier

### Railway (Backend)

- **Free Tier**: $5 credit/month (usually enough for small apps)
- **Developer Plan**: $10/month
- **Recommended**: Start with Free tier

### Supabase (Database)

- **Free Tier**: 500 MB database, 2 GB storage, 50 MB file uploads
- **Pro Tier**: $25/month - 8 GB database, 100 GB storage
- **Recommended**: Start with Free tier

**Total Starting Cost**: $0/month (all free tiers)

---

## 📞 Support

### Getting Help

- **Netlify Support**: [docs.netlify.com](https://docs.netlify.com)
- **Railway Support**: [docs.railway.app](https://docs.railway.app)
- **Supabase Support**: [supabase.com/docs](https://supabase.com/docs)

### Community

- Netlify Community Forum
- Railway Discord
- Supabase Discord

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Admin panel is accessible at `/admin`
- [ ] Backend API is responding
- [ ] Database connection is working
- [ ] Admin login works
- [ ] Dashboard loads data correctly
- [ ] User management functions work
- [ ] Booking system is operational
- [ ] Default admin password is changed
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] Environment variables are set
- [ ] Monitoring is enabled
- [ ] Team members have access
- [ ] Documentation is updated
- [ ] Backup strategy is in place

---

## 🎉 You're Done!

Your TOURISN platform is now live on Netlify! 🚀

**Admin Panel URL**: `https://your-site.netlify.app/admin`

**Next Steps:**

1. Share the URL with your team
2. Monitor initial usage
3. Set up analytics
4. Plan feature releases

---

**Need help? Contact the development team or create an issue on GitHub.**

🌟 **Don't forget to star the repository!**
