# 🚀 Vercel Environment Variables Setup Guide

## ⚠️ IMPORTANT: This is why your build is failing!

Your build is failing because **required environment variables are missing** in Vercel. Follow these steps to fix it.

---

## 📋 Required Environment Variables

You **MUST** add these environment variables in Vercel for your app to work:

### 1. **MONGODB_URI** (REQUIRED)
- **What it is**: Your MongoDB database connection string
- **How to get it**: 
  - If using MongoDB Atlas: Go to your cluster → Connect → Get connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/proptoken`
- **Where to add**: Vercel Dashboard → Your Project → Settings → Environment Variables

### 2. **JWT_SECRET** (REQUIRED)
- **What it is**: Secret key for signing JWT tokens (authentication)
- **How to generate**: 
  ```bash
  openssl rand -base64 32
  ```
  Or use any long random string (at least 32 characters)
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

### 3. **ALLOWED_ORIGINS** (REQUIRED for Production)
- **What it is**: Comma-separated list of allowed frontend URLs (CORS)
- **Format**: `https://yourapp.vercel.app,https://www.yourapp.com`
- **Example**: `https://proptoken.vercel.app`

### 4. **VITE_API_URL** (Optional but Recommended)
- **What it is**: API URL for your frontend
- **Format**: `https://yourapp.vercel.app/api`
- **Example**: `https://proptoken.vercel.app/api`

---

## 🔧 Step-by-Step: How to Add Environment Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in to your account
   - Select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add Each Variable**
   - Click **Add New**
   - Enter the variable name (e.g., `MONGODB_URI`)
   - Enter the value
   - Select environments: **Production**, **Preview**, and **Development** (or just Production if you only want it there)
   - Click **Save**

4. **Repeat for all required variables:**
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS`
   - `VITE_API_URL` (optional)

5. **Redeploy**
   - After adding all variables, go to **Deployments** tab
   - Click the **⋯** (three dots) on the latest deployment
   - Click **Redeploy**

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add ALLOWED_ORIGINS
vercel env add VITE_API_URL

# Pull environment variables (optional, for local development)
vercel env pull .env.local
```

---

## ✅ Verification Checklist

After adding environment variables, verify:

- [ ] `MONGODB_URI` is set and valid
- [ ] `JWT_SECRET` is set (not empty, not default value)
- [ ] `ALLOWED_ORIGINS` includes your Vercel app URL
- [ ] All variables are set for **Production** environment
- [ ] You've **redeployed** after adding variables

---

## 🐛 Common Issues & Solutions

### Issue 1: "MONGODB_URI is not set"
**Solution**: Add `MONGODB_URI` in Vercel Environment Variables

### Issue 2: "JWT_SECRET is not set"
**Solution**: Add `JWT_SECRET` in Vercel Environment Variables

### Issue 3: "CORS policy violation"
**Solution**: 
- Add `ALLOWED_ORIGINS` with your Vercel app URL
- Make sure the URL matches exactly (including https://)

### Issue 4: Build succeeds but API doesn't work
**Solution**: 
- Check that variables are set for **Production** environment
- Redeploy after adding variables
- Check Vercel function logs for errors

### Issue 5: Variables not updating
**Solution**: 
- Variables are only available after redeploy
- Go to Deployments → Redeploy the latest deployment

---

## 📝 Example Environment Variables

Here's what your Vercel Environment Variables should look like:

```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/proptoken?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
ALLOWED_ORIGINS=https://proptoken.vercel.app
VITE_API_URL=https://proptoken.vercel.app/api
NODE_ENV=production
```

---

## 🔒 Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong JWT_SECRET** - At least 32 characters, random
3. **Protect MONGODB_URI** - Don't share it publicly
4. **Use different values** for development and production

---

## 📞 Still Having Issues?

1. Check Vercel deployment logs for specific error messages
2. Verify all environment variables are set correctly
3. Make sure you've redeployed after adding variables
4. Check that your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) or Vercel IPs

---

## 🎯 Quick Fix Summary

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these 3 required variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS`
3. Redeploy your project
4. ✅ Build should now succeed!

