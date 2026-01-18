# ⚡ Quick Setup Guide - Netlify Environment Variables

## 🎯 Required Environment Variables in Netlify

When deploying to Netlify, you MUST add these environment variables in the Netlify dashboard:

### How to Add in Netlify

1. Go to: **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add each variable below:

---

## 📋 Variables to Add

### 1. API URL

```
Key: VITE_API_URL
Value: https://your-backend-url.com/api
```

**Where to get it**: Your backend deployment URL (Railway/Render/Heroku)

**Examples**:

- Railway: `https://tourisn-backend.up.railway.app/api`
- Render: `https://tourisn-backend.onrender.com/api`
- Heroku: `https://tourisn-backend.herokuapp.com/api`

### 2. Node Version

```
Key: NODE_VERSION
Value: 18
```

**Why**: Ensures Netlify uses Node.js 18 for building

---

## 🚨 Important Notes

1. **Must start with VITE\_**:
   - Vite only exposes variables starting with `VITE_`
   - Other variables are ignored

2. **Must trigger new deploy**:
   - After adding variables, click **"Trigger deploy"**
   - Don't use "Redeploy" - it uses old environment

3. **Check in browser console**:
   - After deploy, open `/admin` in browser
   - Press F12 → Console tab
   - Look for API call URLs to verify

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Can access `https://yoursite.netlify.app/admin`
- [ ] Login page loads without errors
- [ ] Can login with admin credentials
- [ ] Dashboard shows data (not "Loading..." forever)
- [ ] No CORS errors in browser console
- [ ] API calls go to correct backend URL

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to API"

**Solution**: Check VITE_API_URL is set correctly and includes `/api` at the end

### Problem: "CORS error"

**Solution**: Update backend CORS_ORIGIN to include your Netlify URL

### Problem: "404 on /admin route"

**Solution**: Verify `netlify.toml` exists in root with redirect rules

---

## 📞 Need Help?

Refer to the complete guide: **DEPLOYMENT.md**
