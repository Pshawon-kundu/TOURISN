# ✅ Pre-Deployment Checklist

Use this checklist before deploying to Netlify:

## 📋 Backend Deployment

- [ ] Supabase account created
- [ ] Database migrations run (all 6 SQL files)
- [ ] Default admin account exists in database
- [ ] Backend deployed to Railway/Render/Heroku
- [ ] Backend URL is accessible (test with curl or browser)
- [ ] Environment variables set in backend hosting platform
- [ ] CORS_ORIGIN includes your Netlify domain

## 📋 Netlify Deployment

- [ ] GitHub repository is up to date
- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Build settings configured correctly:
  - Base directory: `admin-web`
  - Build command: `npm install && npm run build`
  - Publish directory: `admin-web/dist`
- [ ] Environment variables added in Netlify:
  - `VITE_API_URL` set to backend URL
  - `NODE_VERSION` set to 18

## 📋 Testing

- [ ] Admin panel loads at `/admin`
- [ ] Login page displays correctly
- [ ] Can login with default credentials
- [ ] Dashboard shows statistics
- [ ] User list loads
- [ ] Booking list loads
- [ ] No console errors
- [ ] No CORS errors
- [ ] API calls go to correct backend

## 📋 Security

- [ ] Changed default admin password
- [ ] .env files not committed to Git
- [ ] .env files in .gitignore
- [ ] HTTPS enabled on Netlify
- [ ] SSL certificate active
- [ ] Security headers configured

## 📋 Documentation

- [ ] README.md reviewed
- [ ] DEPLOYMENT.md read completely
- [ ] Team has access to deployment URLs
- [ ] Environment variables documented
- [ ] Backup of .env files stored securely

## 📋 Post-Deployment

- [ ] Custom domain configured (if applicable)
- [ ] DNS records updated
- [ ] Monitoring enabled
- [ ] Error tracking setup
- [ ] Team members notified
- [ ] Documentation updated with live URLs

---

## 🆘 If Something Goes Wrong

1. Check browser console for errors
2. Verify environment variables in Netlify
3. Check backend is running
4. Review DEPLOYMENT.md troubleshooting section
5. Check build logs in Netlify dashboard

---

**Last Updated**: January 18, 2026
